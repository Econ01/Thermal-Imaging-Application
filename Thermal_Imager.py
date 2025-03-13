from flask import Flask, render_template, send_from_directory, jsonify, Response
import os
import subprocess

app = Flask(__name__)

# Define the directory where photos are stored
APPS_DIRECTORY = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIRECTORY = os.path.join(APPS_DIRECTORY, 'Output')

@app.route('/')
def index():
    try:
        # Check if the Output directory exists
        if not os.path.exists(OUTPUT_DIRECTORY):
            return render_template('index.html', photo_files=[])  # Return empty list if directory doesn't exist

        # Get all image files in the Output directory, excluding .raw files
        photo_files = [f for f in os.listdir(OUTPUT_DIRECTORY) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))]
        if not photo_files:
            return render_template('index.html', photo_files=[])  # Return empty list if no images are found

        return render_template('index.html', photo_files=photo_files)
    except Exception as e:
        return f"Error: {str(e)}"

# Route to serve images from the Output directory
@app.route('/output/<filename>')
def output_file(filename):
    try:
        return send_from_directory(OUTPUT_DIRECTORY, filename)
    except FileNotFoundError:
        return "File not found", 404

# Route to fetch the list of images
@app.route('/get-images')
def get_images():
    try:
        # Check if the Output directory exists
        if not os.path.exists(OUTPUT_DIRECTORY):
            return jsonify([])  # Return empty list if directory doesn't exist

        # Get all image files in the Output directory, excluding .raw files
        photo_files = [f for f in os.listdir(OUTPUT_DIRECTORY) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))]
        return jsonify(photo_files)
    except Exception as e:
        return jsonify([])  # Return empty list in case of any error

# Route to run PC_capture.py and stream its output in real time
@app.route('/run-pc-capture')
def run_pc_capture():
    def generate():
        # Run PC_capture.py and stream its output
        process = subprocess.Popen(
            ['python', 'PC_capture.py'],  # Run PC_capture.py
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,  # Line-buffered output
            universal_newlines=True
        )

        # Stream stdout and stderr
        for line in iter(process.stdout.readline, ''):
            yield f"data: {line}\n\n"
        for line in iter(process.stderr.readline, ''):
            yield f"data: {line}\n\n"

        process.stdout.close()
        process.stderr.close()
        process.wait()

    return Response(generate(), mimetype='text/event-stream')

# Route to delete a file
@app.route('/delete-file/<filename>', methods=['DELETE'])
def delete_file(filename):
    try:
        file_path = os.path.join(OUTPUT_DIRECTORY, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            return '', 200  # Success
        else:
            return 'File not found', 404
    except Exception as e:
        return str(e), 500  # Internal server error

if __name__ == '__main__':
    app.run(debug=True)