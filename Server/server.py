import os
from flask import Flask, jsonify, send_file
from flask_cors import CORS
import sys

app = Flask(__name__)
CORS(app)

'''
recursively build the folder list by going through files of each folder 
scan folder, create tree of that folder
bring the initial folder back

'''
def build_tree(directory):
    entries = os.scandir(directory)
    tree = {
        "name": os.path.basename(directory),
        "type": "directory",
        "path": {
            "absolute": directory,
            "relative": os.path.relpath(directory, app.config['base_dir'])
        },
        "files": [],
        "folders": []
    }
    
    for entry in entries:
        if entry.is_file() and entry.name.endswith('.mrc'):
            file = {
                "name": entry.name,
                "type": "file",
                "path": {
                    "absolute": entry.path,
                    "relative": os.path.relpath(entry.path, app.config['base_dir'])
                }
            }
            tree["files"].append(file)
        elif entry.is_dir() and not entry.name.startswith('.'):
            folder = {
                "name": entry.name,
                "type": "directory",
                "path": {
                    "absolute": entry.path,
                    "relative": os.path.relpath(entry.path, app.config['base_dir'])
                }
            }
            tree["folders"].append(folder)
    return tree

'''
Description: Dynamic route for either home directory or whatever folder path has been chooosen

If (/) or home directory is called, return for base directory files

If(/custom-path) or any file's file and folder are requested then do as follows:
Go to the directory provided.
Call the build tree function to recursively procure 
files and folders from directory

Return a json response of the tree to the frontend
'''
@app.route('/')
@app.route('/<path:directory>')
def serve_files(directory=""):
    if directory == "":
        directory = app.config['base_dir']
    else:
        directory = os.path.abspath(os.path.join(app.config['base_dir'], directory))
    tree = build_tree(directory)
    return jsonify(tree)
'''
Description: Route for serving files through the flask server hosted locally
When a filepath is sent, check for the file in the directory
Check if it is a .mrc file, 
If yes, then return the file using flask's inbuilt file sending function
send_file()

This file can be downloaded or served by the browser in the frontend
'''
@app.route('/file/<path:filename>')
def serve_file(filename):
    if filename.endswith('.mrc'):
        filepath = os.path.abspath(os.path.join(app.config['base_dir'], filename))
        return send_file(filepath)
    else:
        return "Invalid file type."


if __name__ == '__main__':
    #base_dir = "/Users/shibasisswarnakar/Downloads/r4" # Modify this line to specify the base directory
    '''
    As per requirement, the base directory may change from time to time depending upn 
    which folders are to be needed. Hence, no static folders or hard-coded folder cannot be used
    in the code.

    Using arguments, we can pass the folder's absolute path while starting the flask server
    The server will consider the base_dir as the folder path that is passed during starting the server

    The code also provides a simple documentation stating how to provide the base_dir path along with the 
    code to start the program

    example: 

    python3 -m server.py /Users/shibasisswarnakar/Downloads/r4
    '''
    if len(sys.argv) < 2:
        print("Usage: python3 -m server.py <base_dir>")
        sys.exit(1)

    base_dir = sys.argv[1]
    app.config['base_dir'] = base_dir
    os.environ['FLASK_APP'] = __file__
    app.run()
