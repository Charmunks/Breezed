
import crypto from 'crypto';
import getPort from 'get-port';
import Docker from 'dockerode';
import { fileURLToPath } from 'url';
import db from './db.util.js';

const docker = new Docker();
const dockerfilePath = fileURLToPath(new URL('../container', import.meta.url));
const imageName = 'breezed-ssh';

function generatePassword(length = 16) {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}

function formatContainerName(userId, name) {
    return `${userId}-${name}`;
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

async function createContainer(name, userId) {
    const fullName = formatContainerName(userId, name);
    
    if (await containerExists(fullName)) {
        throw new Error(`Container with name "${name}" already exists`);
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

async function startContainer(name, userId) {
    const fullName = formatContainerName(userId, name);
    const container = docker.getContainer(fullName);
    await container.start();
    await db('containers').where({ name: fullName }).update({ sleeping: false, last_started_at: new Date() });
    return name;
}

async function stopContainer(name, userId) {
    const fullName = formatContainerName(userId, name);
    const container = docker.getContainer(fullName);
    await container.stop();
    await db('containers').where({ name: fullName }).update({ sleeping: true });
    return name;
}

async function removeContainer(name, userId) {
    const fullName = formatContainerName(userId, name);
    const container = docker.getContainer(fullName);
    await container.remove({ force: true });
    await db('containers').where({ name: fullName }).del();
    return name;
}

async function getContainerStatus(name, userId) {
    const fullName = formatContainerName(userId, name);
    const container = docker.getContainer(fullName);
    const info = await container.inspect();
    return info.State.Status;
}

async function listContainers() {
    return db('containers').select('*');
}

async function getContainerByName(name, userId) {
    const fullName = formatContainerName(userId, name);
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
