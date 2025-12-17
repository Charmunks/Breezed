
import crypto from 'crypto';
import getPort from 'get-port';
import Docker from 'dockerode';
import { fileURLToPath } from 'url';
import db from './db.util.js';
import { isAdmin } from './auth.util.js';

const docker = new Docker();
const dockerfilePath = fileURLToPath(new URL('../container', import.meta.url));
const imageName = 'breezed-ssh';

function generatePassword(length = 16) {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}

function formatContainerName(userId, name) {
    return `${userId}-${name}`;
}

async function resolveTargetUserId(requesterId, targetUserId) {
    if (targetUserId && targetUserId !== requesterId) {
        const admin = await isAdmin(requesterId);
        if (!admin) {
            throw new Error('Permission denied. Only admins can manage other users\' containers.');
        }
        return targetUserId;
    }
    return requesterId;
}

async function containerExists(fullName) {
    try {
        const container = docker.getContainer(fullName);
        await container.inspect();
        return true;
    } catch (err) {
        if (err.statusCode === 404) return false;
        throw err;
    }
}

async function ensureImage() {
    const images = await docker.listImages({ filters: { reference: [imageName] } });
    if (images.length === 0) {
        const stream = await docker.buildImage(
            { context: dockerfilePath, src: ['Dockerfile', 'entrypoint.sh'] },
            { t: imageName }
        );
        return new Promise((resolve, reject) => {
            docker.modem.followProgress(stream, (err, output) => {
                if (err) return reject(err);
                resolve(output);
            });
        });
    }
}

async function getUserLimits(userId) {
    const user = await db('users').where({ user_id: userId }).first();
    return {
        maxContainers: user?.max_containers ?? 5,
        maxActiveContainers: user?.max_active_containers ?? 1
    };
}

async function getActiveContainerCount(userId) {
    const containers = await db('containers').where({ user_id: userId, sleeping: false });
    return containers.length;
}

async function createContainer(name, userId) {
    const fullName = formatContainerName(userId, name);
    
    if (await containerExists(fullName)) {
        throw new Error(`Container with name "${name}" already exists`);
    }
    
    const userContainers = await db('containers').where({ user_id: userId });
    const limits = await getUserLimits(userId);
    
    if (userContainers.length >= limits.maxContainers) {
        throw new Error(`Container limit reached. You can only have ${limits.maxContainers} containers.`);
    }
    
    const activeCount = await getActiveContainerCount(userId);
    if (activeCount >= limits.maxActiveContainers) {
        throw new Error(`Active container limit reached. You can only have ${limits.maxActiveContainers} active container(s).`);
    }
    
    const password = generatePassword();
    const hostPort = await getPort();
    await ensureImage();
    
    const container = await docker.createContainer({
        Image: imageName,
        name: fullName,
        Env: [`SSH_PASSWORD=${password}`],
        ExposedPorts: { '22/tcp': {} },
        HostConfig: {
            PortBindings: { '22/tcp': [{ HostPort: String(hostPort) }] }
        }
    });
    await container.start();
    
    await db('containers').insert({
        container_id: container.id,
        name: fullName,
        password,
        port: hostPort,
        user_id: userId
    });
    
    return {
        id: container.id,
        name,
        port: hostPort,
        password
    };
}

async function startContainer(name, requesterId, targetUserId = null) {
    const ownerId = await resolveTargetUserId(requesterId, targetUserId);
    const fullName = formatContainerName(ownerId, name);
    
    const containerRecord = await db('containers').where({ name: fullName }).first();
    if (containerRecord && !containerRecord.sleeping) {
        return name;
    }
    
    const limits = await getUserLimits(ownerId);
    const activeCount = await getActiveContainerCount(ownerId);
    
    if (activeCount >= limits.maxActiveContainers) {
        throw new Error(`Active container limit reached. You can only have ${limits.maxActiveContainers} active container(s).`);
    }
    
    const container = docker.getContainer(fullName);
    await container.start();
    await db('containers').where({ name: fullName }).update({ sleeping: false, last_started_at: new Date() });
    return name;
}

async function stopContainer(name, requesterId, targetUserId = null) {
    const ownerId = await resolveTargetUserId(requesterId, targetUserId);
    const fullName = formatContainerName(ownerId, name);
    const container = docker.getContainer(fullName);
    await container.stop();
    await db('containers').where({ name: fullName }).update({ sleeping: true });
    return name;
}

async function removeContainer(name, requesterId, targetUserId = null) {
    const ownerId = await resolveTargetUserId(requesterId, targetUserId);
    const fullName = formatContainerName(ownerId, name);
    const container = docker.getContainer(fullName);
    await container.remove({ force: true });
    await db('containers').where({ name: fullName }).del();
    return name;
}

async function getContainerStatus(name, requesterId, targetUserId = null) {
    const ownerId = await resolveTargetUserId(requesterId, targetUserId);
    const fullName = formatContainerName(ownerId, name);
    const container = docker.getContainer(fullName);
    const info = await container.inspect();
    return info.State.Status;
}

async function listContainers() {
    return db('containers').select('*');
}

async function getContainerByName(name, requesterId, targetUserId = null) {
    const ownerId = await resolveTargetUserId(requesterId, targetUserId);
    const fullName = formatContainerName(ownerId, name);
    return db('containers').where({ name: fullName }).first();
}

async function getContainersByUserId(userId) {
    return db('containers').where({ user_id: userId });
}

export {
    createContainer,
    startContainer,
    stopContainer,
    removeContainer,
    getContainerStatus,
    listContainers,
    getContainerByName,
    getContainersByUserId
};
