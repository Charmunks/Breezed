
import crypto from 'crypto';
import getPort from 'get-port';
import Docker from 'dockerode';
import { fileURLToPath } from 'url';

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

async function createContainer(name) {
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
    return name;
}

async function stopContainer(name) {
    const container = docker.getContainer(name);
    await container.stop();
    return name;
}

async function removeContainer(name) {
    const container = docker.getContainer(name);
    await container.remove({ force: true });
    return name;
}

async function getContainerStatus(name) {
    const container = docker.getContainer(name);
    const info = await container.inspect();
    return info.State.Status;
}

async function listContainers() {
    const containers = await docker.listContainers({
        all: true,
        filters: { ancestor: [imageName] }
    });
    return containers.map(c => ({
        name: c.Names[0].replace(/^\//, ''),
        status: c.Status,
        ports: c.Ports.map(p => `${p.PublicPort}:${p.PrivatePort}`).join(', ')
    }));
}

export {
    createContainer,
    startContainer,
    stopContainer,
    removeContainer,
    getContainerStatus,
    listContainers
};
