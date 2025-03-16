#!/bin/bash
set -ev

HOST="localhost"
PORT="8085"
TRACK="ecowitt/gw1200_ws90_wh51_wh40_wn30_lds"
DIR=`pwd`

DATA=$(cat "$DIR/tests/synthetic/data/$TRACK.json")

# ecowitt protocol uses POST request with data sent in body
curl -X POST "http://$HOST:$PORT/data/report" -H "Content-Type: application/json" -d "$DATA"
echo $?
