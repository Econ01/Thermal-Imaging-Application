# **Thermal Imaging Application**

![Thermal Imager 3000](https://img.shields.io/badge/Thermal-Imager%203000-blue)  
![Python](https://img.shields.io/badge/Python-3.x-green)  
![Flask](https://img.shields.io/badge/Flask-2.x-red)  
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.x-purple)  
![MLX90640](https://img.shields.io/badge/MLX90640-Thermal%20Camera-orange)

This repository contains a **Thermal Imaging Application** that captures and displays thermal images using a **BeagleBone Black (BBB)** connected to a **Grove Thermal Camera (MLX90640)**. The application provides a user-friendly web interface to capture, view, and manage thermal images.

---

## **Table of Contents**
1. [Overview](#overview)
2. [Features](#features)
3. [System Architecture](#system-architecture)
4. [Dependencies](#dependencies)
5. [Installation](#installation)
6. [Usage](#usage)
7. [Troubleshooting](#troubleshooting)
8. [Future Enhancements](#future-enhancements)
9. [License](#license)

---

## **Overview**
The Thermal Imaging Application is a web-based system that captures thermal data using a **Grove Thermal Camera (MLX90640)** connected to a **BeagleBone Black (BBB)**. The application processes the raw thermal data and generates a visual representation (thermal image) using **Matplotlib**. The web interface, built with **Bootstrap**, allows users to capture, view, and delete thermal images.

---

## **Features**
- **Thermal Image Capture**: Capture thermal images using the MLX90640 sensor.
- **Web Interface**: A responsive web interface built with **Bootstrap** for viewing and managing thermal images.
- **Dark/Light Mode**: Toggle between dark and light modes for better user experience.
- **Image Management**: Delete captured images directly from the web interface.
- **Real-Time Output**: Stream real-time output from the thermal camera during the capture process.

---

## **System Architecture**
The application consists of the following components:

### **1. Hardware Components**
- **BeagleBone Black (BBB)**: A single-board computer used to interface with the thermal camera.
- **Grove Thermal Camera (MLX90640)**: A 24x32 pixel infrared thermal sensor that captures thermal data.

### **2. Software Components**
- **Flask**: A Python web framework used to create the backend server.
- **Bootstrap**: A frontend framework for building the responsive web interface.
- **Paramiko**: A Python library for SSH communication with the BBB.
- **Matplotlib**: A Python library for generating thermal images from raw data.
- **Seeed_mlx9064x**: A Python library for interfacing with the MLX90640 sensor.

---

## **Dependencies**
### **Python Libraries**
- Flask
- Paramiko
- Matplotlib
- Numpy
- Seeed_mlx9064x
- Subprocess

### **Frontend Libraries**
- Bootstrap 5
- Material Icons
- JavaScript

---

## **Installation**
### **1. Prerequisites**
- **Python 3.x**: Ensure Python 3.x is installed on both the host machine and the BBB.
- **SSH Access**: Ensure SSH access to the BBB is configured with the correct IP address, username, and password.
- **Network Configuration**: Ensure the BBB and the host machine are on the same network.

### **2. Installing Dependencies**
On the host machine, install the required Python libraries using pip:
```bash
pip install flask paramiko matplotlib numpy seeed_mlx9064x
```
On the BBB, install the seeed_mlx9064x library:
```bash
pip install seeed_mlx9064x
```

### **Important Note for I2C Bus Configuration**  
<span style="color:red">**If the device is not using I2C Bus 1 (for example, the BeagleBone Black uses Bus 2), you must manually configure the I2C bus in the library.**</span>  

To do this:  
1. Navigate to the `seeed_mlx9064x.py` file located in your Python site-packages directory. The path is typically:  
   ```terminal
   ~/.local/lib/python3.7/site-packages/seeed_mlx9064x.py
   ```
2. Open the file and locate the __init__ function.
3. Find the line:
   ```python
   self.bus = Bus()
   ```
4. Change it to:
   ```python
   self.bus = Bus(correct_bus_number)
   ```
   Replace correct_bus_number with the appropriate bus number for your device. For the BeagleBone Black, this is 2.

### **3. Running the Application**
- **Windows**: Double-click the `Run_Thermal_Imager(Windows).bat` file to start the Flask server and open the web interface.
- **Linux**: Run the `Run_Thermal_Imager(Linux).sh` script to start the Flask server and open the web interface.

---

## **Usage**
1. **Capturing Thermal Images**: Click the "Capture" button on the web interface to initiate the thermal image capture process.
2. **Viewing Images**: The captured images are displayed in a Bootstrap carousel. Users can navigate through the images using the carousel controls or the thumbnail gallery.
3. **Deleting Images**: Users can delete images by clicking the trashbin icon on the thumbnail or carousel image.
4. **Dark/Light Mode**: Toggle between dark and light modes using the icon in the header.

---

## **Troubleshooting**
### **1. SSH Connection Issues**
- Ensure the BBB is powered on and connected to the network.
- Verify the IP address, username, and password in the `PC_capture.py` script.

### **2. Thermal Camera Not Detected**
- Ensure the Grove Thermal Camera is properly connected to the BBB via I2C.
- Verify that the `seeed_mlx9064x` library is installed on the BBB.

### **3. Flask Server Not Starting**
- Ensure all dependencies are installed on the host machine.
- Check for port conflicts (default port is 5000).

---

## **Future Enhancements**
- **Real-Time Streaming**: Implement real-time streaming of thermal data for live monitoring.
- **Image Annotation**: Allow users to annotate thermal images with temperature values.
- **Advanced Analytics**: Add features for analyzing thermal data, such as temperature trends and hotspots.

---

## **License**
This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## **Acknowledgments**
- **Melexis**: For providing the MLX90640 thermal sensor and its documentation.
- **BeagleBoard.org**: For the BeagleBone Black hardware.
- **Seeed Studio**: For the Grove Thermal Camera and Python library.

---

**Happy Thermal Imaging!** 🔥📷
