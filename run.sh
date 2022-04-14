#!/bin/bash

cd ./docker/compose
if [ $# -eq 0 ]; then
    echo "Running local up -d --build"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build 
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs --follow bot 
elif [ $1 == "db" ]; then
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build db
elif [ $1 == "prod" ]; then
    echo "Running prod up"
    docker-compose up -d --build 
elif [ $1 == "down" ]; then
    echo "Running local down"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down ${@:2}
elif [ $1 == "logs" ]; then
	echo "Attaching to bot logs"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f bot
else
    echo "Invalid args."
fi
exit 0