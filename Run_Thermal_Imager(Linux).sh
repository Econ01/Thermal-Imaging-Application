#!/bin/bash

# Start the Flask server in a new terminal window
gnome-terminal -- bash -c "python3 Thermal_Imager.py; exec bash"

# Wait for the server to start (adjust the delay if needed)
sleep 2

# Open the browser to the local server
xdg-open http://127.0.0.1:5000