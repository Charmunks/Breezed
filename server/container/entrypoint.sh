#!/bin/bash
echo "root:${SSH_PASSWORD:-changeme}" | chpasswd
exec /usr/sbin/sshd -D
apt install sudo -y