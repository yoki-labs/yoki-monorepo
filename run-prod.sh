#!/bin/bash

cd ./docker/compose
if [ $# -eq 0 ]; then
    echo "Running prod up"
    docker-compose up -d --build 
elif [ $1 == "down" ]; then
    echo "Running local down"
    docker-compose down
elif [ $1 == "logs" ]; then
	echo "Attaching to bot logs"
    docker-compose logs bot
else
    echo "Invalid args."
fi
exit 0