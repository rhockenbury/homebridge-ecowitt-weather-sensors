#!/bin/bash
set -ev

HOST="localhost"
PORT="8085"

# cases no ?, ?&

curl -X POST "http://$HOST:$PORT/data/report&PASSKEY=xxxxxxxxxxxxxxxxx&stationtype=WS1965B_V1.3.1&dateutc=2024-09-25+14:40:58&tempf=69.44&humidity=93&windspeedmph=1.79&windgustmph=2.24&maxdailygust=5.82&winddir=35&winddir_avg10m=36&hourlyrainin=0.000&eventrainin=0.693&dailyrainin=0.350&weeklyrainin=0.693&monthlyrainin=1.941ba&yearlyrainin=22.563&totalrainin=22.563&battout=1&tempinf=69.98&humidityin=61&baromrelin=29.988&baromabsin=28.278"
echo $?
