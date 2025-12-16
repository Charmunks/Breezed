<div align="center">

# Breezed

![Hackatime Badge](https://hackatime-badge.hackclub.com/U07UV4R2G4T/breezed) ![Hack Club Badge](https://img.shields.io/badge/Hack%20Club-EC3750?logo=Hack%20Club&logoColor=white) ![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?logo=npm&logoColor=white)
</div>

Breezed is a CLI tool to quickly spin up and manage VPS's. Perfect for quick testing/iteration, rapid deployment, and people who are just at home in the terminal. 100% selfhostable and compatible with any existing hosting providers.

## Tech Stack

- ExpressJS backend (/server)
- Javascript CLI, distrubuted using NPM (/client)
- Postgres database using knex.js
- Actual VPSs are docker images (/utils/containers.util.js)

## Filesystem

### Server (/server)

- All route files in /routes
- All util files in /utils
- Docker container being used is in /container/Dockerfile
- All util files end in .util.js

### Client

Coming soon