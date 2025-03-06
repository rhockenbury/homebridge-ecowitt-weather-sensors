#!/bin/bash
set -ev

HOST="localhost"
PORT="8085"
TRACK="ambient/ws1965_wn67"
DIR=`pwd`

DATA=$(cat "$DIR/tests/synthetic/data/$TRACK.json" | jq -r '[to_entries[] | (@uri "\(.key)" + "=" + @uri "\(.value)")] | join("&")')

# ambient protocl uses GET request with data in query params
curl -X GET "http://$HOST:$PORT/data/report?$DATA"
echo $?
