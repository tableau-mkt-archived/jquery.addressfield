#!/bin/bash
echo "This is a temporary workaround until bower package publishing is a thing."
echo "If you run into problems, just build addressfield.json."
sleep 5

# Build addressfield.json
cd libs/addressfield.json
npm install
grunt
