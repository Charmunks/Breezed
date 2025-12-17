import db from './db.util.js';
import { sendAutoStopNotification } from './email.util.js';
import { stopContainer } from './containers.util.js';

const threeHoursMs = 3 * 60 * 60 * 1000;
const oneHourMs = 60 * 60 * 1000;

async function stopStaleContainers() {
    const threeHoursAgo = new Date(Date.now() - threeHoursMs);
    
    const staleContainers = await db('containers')
        .where('sleeping', false)
        .where('last_started_at', '<', threeHoursAgo)
        .select('*');

    for (const containerRecord of staleContainers) {
        try {
            const displayName = containerRecord.name.split('-').slice(1).join('-');
            await stopContainer(displayName, containerRecord.user_id);

            const user = await db('users')
                .where({ user_id: containerRecord.user_id })
                .first();

            if (user?.email) {
                await sendAutoStopNotification(user.email, displayName);
            }

            console.log(`Auto-stopped container: ${containerRecord.name}`);
        } catch (err) {
            console.error(`Failed to auto-stop container ${containerRecord.name}:`, err.message);
        }
    }
}

function startAutoStopScheduler() {
    console.log('Auto-stop scheduler started (runs every hour)');
    stopStaleContainers();
    setInterval(stopStaleContainers, oneHourMs);
}

export { startAutoStopScheduler, stopStaleContainers };
