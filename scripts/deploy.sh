#!/bin/bash
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker build -t registry.heroku.com/chatter/web .
docker push registry.heroku.com/chatter/web

