#! /bin/bash

docker compose start db

docker compose up -d --remove-orphans

while ! nc -z localhost 5173; do
  sleep 0.1
done

while ! nc -z localhost 80; do
  sleep 0.1
done

npx playwright test

docker compose stop