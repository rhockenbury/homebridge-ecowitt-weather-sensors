#!/bin/bash
set -ev

HOST="localhost"
PORT="8085"
TRACK="gw2000_ws85_wh51"
DIR=`pwd`

curl -X POST "http://$HOST:$PORT/data/report" -H "Content-Type: application/json" -d "@$DIR/tests/synthetic/data/$TRACK.json"
echo $?
