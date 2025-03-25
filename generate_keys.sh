#! /bin/bash

ssh-keygen -o -t ed25519 -a 128 -C "backend" -f ./backend/key

cat ./backend/key.pub | dc exec -T git bash -c 'echo >> /home/git/.ssh/authorized_keys'