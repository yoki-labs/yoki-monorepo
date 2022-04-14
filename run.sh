#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Running local up -d --build"
    docker-compose up -d --build 
    docker-compose logs --follow bot 
elif [ $1 == "db" ]; then
	docker-compose up -d --build db
elif [ $1 == "down" ]; then
    echo "Running local down"
    docker-compose down ${@:2}
elif [ $1 == "logs" ]; then
	echo "Attaching to bot logs"
    docker-compose logs -f bot
else
    echo "Invalid args."
fi
exit 0