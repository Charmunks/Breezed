
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

async function createContainer(name, ip) {
    const password = generatePassword();
    const hostPort = await getPort();
    await ensureImage();
    
    const container = await docker.createContainer({
        Image: imageName,
        name,
        Env: [`SSH_PASSWORD=${password}`],
        ExposedPorts: { '22/tcp': {} },
        HostConfig: {
            PortBindings: { '22/tcp': [{ HostPort: String(hostPort) }] }
        }
    });
    await container.start();
    
    await db('containers').insert({
        container_id: container.id,
        name,
        password,
        port: hostPort,
        creator_ip: ip
    });
    
    return {
        id: container.id,
        name,
        port: hostPort,
        password
    };
}

async function startContainer(name) {
    const container = docker.getContainer(name);
    await container.start();
    await db('containers').where({ name }).update({ sleeping: false, last_started_at: new Date() });
    return name;
}

async function stopContainer(name) {
    const container = docker.getContainer(name);
    await container.stop();
    await db('containers').where({ name }).update({ sleeping: true });
    return name;
}

async function removeContainer(name) {
    const container = docker.getContainer(name);
    await container.remove({ force: true });
    await db('containers').where({ name }).del();
    return name;
}

async function getContainerStatus(name) {
    const container = docker.getContainer(name);
    const info = await container.inspect();
    return info.State.Status;
}

async function listContainers() {
    return db('containers').select('*');
}

async function getContainerByName(name) {
    return db('containers').where({ name }).first();
}

async function getContainersByIp(creatorIp) {
    return db('containers').where({ creator_ip: creatorIp });
}

export {
    createContainer,
    startContainer,
    stopContainer,
    removeContainer,
    getContainerStatus,
    listContainers,
    getContainerByName,
    getContainersByIp
};
