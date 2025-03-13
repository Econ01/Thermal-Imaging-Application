import paramiko
import os
import time
import sys
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime  # Import datetime module for timestamp

# SSH connection details
BBB_IP = "192.168.7.2"  # Replace with your BBB's IP
BBB_USER = "debian"  # Replace with your BBB's username
BBB_PASSWORD = "temppwd"  # Replace with your BBB's password
REMOTE_DIR = "/home/debian"  # Directory on BBB where files will be stored

# Get the current program's directory
PROGRAM_DIR = os.path.dirname(os.path.abspath(__file__))

# Define paths relative to the program's directory
LOCAL_CAPTURE_PY_PATH = os.path.join(PROGRAM_DIR, "capture.py")  # Path to capture.py in the program's directory
LOCAL_OUTPUT_DIR = os.path.join(PROGRAM_DIR, "Output")  # Output directory in the program's directory

def copy_file_to_bbb(local_path, remote_path, ssh_client):
    """Copy a file to the BeagleBone Black."""
    try:
        sftp = ssh_client.open_sftp()
        sftp.put(local_path, remote_path)
        sftp.close()
        print(f"File {local_path} copied to {remote_path} on BeagleBone Black.")
    except Exception as e:
        print(f"Error copying file to BBB: {e}")
        raise

def run_remote_python_script(ssh_client, remote_dir, script_name):
    """Run a Python script on the BeagleBone Black and capture its output."""
    try:
        # Construct the full path to the Python script
        remote_script_path = f"{remote_dir}/{script_name}"
        
        # Run the Python script
        run_command = f"python3 {remote_script_path}"
        print("Running Python script on BBB...")
        stdin, stdout, stderr = ssh_client.exec_command(run_command, get_pty=True)

        # Capture the raw output (thermal data)
        raw_output = ""
        while True:
            # Read stdout
            if stdout.channel.recv_ready():
                output = stdout.channel.recv(65536).decode("utf-8")  # Increase buffer size to 65536
                raw_output += output

            # Read stderr
            if stderr.channel.recv_stderr_ready():
                error = stderr.channel.recv_stderr(65536).decode("utf-8")  # Increase buffer size to 65536
                sys.stderr.write(error)
                sys.stderr.flush()

            # Check if the script has finished
            if stdout.channel.exit_status_ready():
                break

            # Small delay to avoid busy-waiting
            time.sleep(0.1)

        # Print the final exit status
        exit_status = stdout.channel.recv_exit_status()
        print(f"Script exited with status: {exit_status}")

        return raw_output

    except Exception as e:
        print(f"Error running script on BBB: {e}")
        raise

def process_raw_data(raw_output, local_dir):
    """Process raw data into an image and save it."""
    try:
        # Create the output directory if it doesn't exist
        if not os.path.exists(local_dir):
            os.makedirs(local_dir)
            print(f"Created directory: {local_dir}")

        # Split the output into lines
        raw_output_lines = raw_output.strip().split("\n")

        # Extract the line containing the raw thermal data
        raw_data_line = None
        for line in raw_output_lines:
            if line.strip().startswith("["):  # Check if the line starts with '['
                raw_data_line = line.strip()
                break

        if raw_data_line is None:
            raise ValueError("No raw data found in the output.")

        # Generate a timestamp for the filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")  # Format: YYYYMMDD_HHMMSS

        # Save the raw data to a file with the timestamp and _raw suffix
        raw_data_filename = f"{timestamp}_raw.txt"
        raw_data_path = os.path.join(local_dir, raw_data_filename)
        with open(raw_data_path, "w") as raw_file:
            raw_file.write(raw_data_line)
        print(f"Raw data saved to {raw_data_path}")

        # Extract the raw data values
        raw_data = raw_data_line.strip("[]").split(", ")  # Split into individual values
        raw_data = [float(value) for value in raw_data]  # Convert to floats

        # Reshape the data into a 24x32 grid (for MLX90640)
        frame_array = np.array(raw_data).reshape(24, 32)

        # Create a heatmap using matplotlib
        plt.imshow(frame_array, cmap='inferno', interpolation='nearest')
        plt.colorbar(label='Temperature (°C)')
        plt.title('Thermal Image')

        # Save the image with the timestamp
        image_filename = f"{timestamp}.png"
        image_path = os.path.join(local_dir, image_filename)
        plt.savefig(image_path)
        print(f"Image saved to {image_path}")
        print("Finished!")

        # Clear the plot for the next frame
        plt.clf()

    except Exception as e:
        print(f"Error processing raw data: {e}")
        raise

def main():
    # Create an SSH client
    ssh_client = paramiko.SSHClient()
    ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        # Connect to the BeagleBone Black
        ssh_client.connect(BBB_IP, username=BBB_USER, password=BBB_PASSWORD)
        print("Connected to BeagleBone Black.")

        # Copy the capture.py file to the BeagleBone Black
        remote_capture_py_path = f"{REMOTE_DIR}/capture.py"
        copy_file_to_bbb(LOCAL_CAPTURE_PY_PATH, remote_capture_py_path, ssh_client)

        # Run the capture.py script on the BeagleBone Black and capture its output
        raw_output = run_remote_python_script(ssh_client, REMOTE_DIR, "capture.py")

        # Process raw data into an image
        process_raw_data(raw_output, LOCAL_OUTPUT_DIR)

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        ssh_client.close()
        print("SSH connection closed.")

if __name__ == "__main__":
    main()