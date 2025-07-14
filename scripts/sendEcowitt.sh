#!/bin/bash
set -ev

HOST="localhost"
PORT="8085"
TRACK="ecowitt/gw2000_ws90_wh65_wh51"
#TRACK="ecowitt/ws3800_ws85_ws80_wh65_wh57_wh55_wh51multi_wh45_wh41multi_wn35_wn34multi_wn31multi_wn30_wh26_wh25"
DIR=`pwd`

DATA=$(cat "$DIR/tests/synthetic/data/$TRACK.json")

# ecowitt protocol uses POST request with data sent in body
curl -X POST "http://$HOST:$PORT/data/report" -H "Content-Type: application/json" -d "$DATA"
echo $?
