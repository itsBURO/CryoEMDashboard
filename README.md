# Project Setup Guide

## Backend Setup

1. **Starting the Virtual Environment**:
    - Open the project folder in a terminal.
    - Activate the virtual environment using the command:
      ```bash
      source venv/bin/activate 
      ```
    - Once the virtual environment is started, it should show the virtual environment name `venv` beside the terminal name.

2. **Starting the Flask Server**:
    - Run the following command to start the flask server:
      ```bash
      python3 server.py <base_dir>
      ```
    - Replace `<base_dir>` with the absolute path of the directory which will be the base directory.
    - To get the absolute path of the base directory:
      1. Open the suitable folder of choice in a terminal.
      2. Enter the `pwd` command to get the absolute path and copy it.
      3. Replace it with `<base_dir>` in the command, and run the command.

## Frontend Guide

1. **Setting up the Web Server**:
    - Open a terminal.
    - Navigate to the directory containing the HTML and JavaScript files.
    - Start a simple web server using:
      ```bash
      python -m http.server 
      ```
    - The web server will start on port `8000` by default. It can be accessed by opening a web browser and visiting `http://localhost:8000`.

