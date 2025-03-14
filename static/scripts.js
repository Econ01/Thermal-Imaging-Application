// Dark/Light Mode Toggle
const modeToggle = document.querySelector('.mode-toggle');
const modeIcon = document.getElementById('modeIcon');
const body = document.body;

// Initialize theme based on system preference
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
if (systemTheme === 'dark') {
    body.classList.add('dark-mode');
} else {
    body.classList.add('light-mode');
}

modeToggle.addEventListener('click', () => {
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        modeIcon.textContent = 'dark_mode'; // Change icon to dark mode
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        modeIcon.textContent = 'light_mode'; // Change icon to light mode
    }
});

// Update Carousel Indicator and Highlight Active Thumbnail
const carousel = document.querySelector('#carouselExample');
const currentIndexElement = document.getElementById('currentIndex');
const totalImagesElement = document.getElementById('totalImages');
const thumbnails = document.querySelectorAll('.thumbnail-container');

// Add event listener for carousel slide events
carousel.addEventListener('slid.bs.carousel', (event) => {
    // Get the index of the active carousel item
    const activeIndex = Array.from(carousel.querySelectorAll('.carousel-item')).indexOf(carousel.querySelector('.carousel-item.active'));

    // Update the carousel indicator
    currentIndexElement.textContent = activeIndex + 1;

    // Highlight the active thumbnail
    thumbnails.forEach((thumbnail, index) => {
        if (index === activeIndex) {
            thumbnail.classList.add('active'); // Add border to the active thumbnail
        } else {
            thumbnail.classList.remove('active'); // Remove border from other thumbnails
        }
    });

    // Show trashbin icon for the active thumbnail
    const activeThumbnail = document.querySelector('.thumbnail-container.active');
    if (activeThumbnail) {
        activeThumbnail.querySelector('.trashbin-icon').style.display = 'block';
    }

    // Show trashbin icon for the active carousel item
    const activeCarouselItem = document.querySelector('.carousel-item.active');
    if (activeCarouselItem) {
        activeCarouselItem.querySelector('.carousel-trashbin').style.display = 'block';
    }
});

// Initialize total images count
totalImagesElement.textContent = document.querySelectorAll('.carousel-item').length;

// Add smooth transition to Bootstrap Carousel
carousel.addEventListener('slide.bs.carousel', (event) => {
    const carouselInner = carousel.querySelector('.carousel-inner');
    carouselInner.style.transition = 'transform 0.5s ease-in-out';
});

// Thumbnail Navigation
thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener('click', () => {
        const carousel = new bootstrap.Carousel('#carouselExample');
        carousel.to(index); // Navigate to the corresponding slide
    });
});

// Multi-Select Functionality
let isCtrlPressed = false;
const selectedThumbnails = new Set(); // Track selected thumbnails

// Track Ctrl key press
document.addEventListener('keydown', (event) => {
    if (event.key === 'Control') {
        isCtrlPressed = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'Control') {
        isCtrlPressed = false;
    }
});

// Add click event listeners to thumbnails
const thumbnailContainers = document.querySelectorAll('.thumbnail-container');
thumbnailContainers.forEach((container) => {
    container.addEventListener('click', () => {
        if (isCtrlPressed) {
            // Toggle selection
            container.classList.toggle('selected');
            const filename = container.querySelector('.thumbnail').src.split('/').pop();

            if (container.classList.contains('selected')) {
                selectedThumbnails.add(filename); // Add to selected set
            } else {
                selectedThumbnails.delete(filename); // Remove from selected set
            }

            // Show/hide batch delete button
            const batchDeleteButton = document.getElementById('batchDeleteButton');
            if (selectedThumbnails.size > 0) {
                batchDeleteButton.style.display = 'flex';
            } else {
                batchDeleteButton.style.display = 'none';
            }

            // Hide default trashbin icons when multiple thumbnails are selected
            const defaultTrashbinIcons = document.querySelectorAll('.thumbnail-container .trashbin-icon');
            defaultTrashbinIcons.forEach((icon) => {
                if (selectedThumbnails.size > 0) {
                    icon.style.display = 'none'; // Hide default trashbin icons
                } else {
                    icon.style.display = 'block'; // Show default trashbin icons
                }
            });
        }
    });
});

// Clear selection when clicking outside the thumbnails without holding Ctrl
document.addEventListener('click', (event) => {
    if (!isCtrlPressed && !event.target.closest('.thumbnail-container')) {
        // Clear all selections
        thumbnailContainers.forEach((container) => {
            container.classList.remove('selected');
        });

        // Clear the selected thumbnails set
        selectedThumbnails.clear();

        // Hide the batch delete button
        const batchDeleteButton = document.getElementById('batchDeleteButton');
        batchDeleteButton.style.display = 'none';

        // Show default trashbin icons
        const defaultTrashbinIcons = document.querySelectorAll('.thumbnail-container .trashbin-icon');
        defaultTrashbinIcons.forEach((icon) => {
            icon.style.display = 'block';
        });
    }
});

// Batch Delete Functionality
const batchDeleteButton = document.getElementById('batchDeleteButton');
batchDeleteButton.addEventListener('click', async () => {
    if (selectedThumbnails.size === 0) return; // No files selected

    // Ask for confirmation
    const confirmDelete = confirm(`Are you sure you want to delete ${selectedThumbnails.size} selected files?`);
    if (!confirmDelete) return;

    try {
        // Send a request to delete each selected file
        for (const filename of selectedThumbnails) {
            const response = await fetch(`/delete-file/${filename}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Failed to delete file: ${filename}`);
            }
        }

        // Refresh the page to reflect the changes
        window.location.reload();
    } catch (error) {
        console.error('Error deleting files:', error);
        alert('An error occurred while deleting the files.');
    }
});

// Capture Button Functionality
const captureButton = document.getElementById('captureButton');
const buttonIcon = document.getElementById('buttonIcon');
const buttonText = document.getElementById('buttonText');
const loadingSpinner = document.getElementById('loadingSpinner');
const captureToast = new bootstrap.Toast(document.getElementById('captureToast'));
const toastBody = document.querySelector('.toast-body');

captureButton.addEventListener('click', async () => {
    // Show loading state
    buttonIcon.style.display = 'none';
    buttonText.style.display = 'none';
    loadingSpinner.style.display = 'inline-block';

    // Show initial toast message
    toastBody.textContent = "Capturing Image Please Wait...";
    captureToast.show();

    try {
        // Run PC_capture.py and stream its output
        const response = await fetch('/run-pc-capture');

        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Decode the output and remove the "data:" prefix
            const output = decoder.decode(value).trim();
            const message = output.replace(/^data:\s*/, ''); // Remove "data:" prefix

            // Display each line of output as a separate toast message
            toastBody.textContent = message;

            // Check for "error", "finish", or "success" in the message (case insensitive)
            const toastElement = document.getElementById('captureToast');
            if (message.toLowerCase().includes('error')) {
                toastElement.classList.add('error'); // Add error class
                toastElement.classList.remove('success'); // Ensure success class is removed
            } else if (message.toLowerCase().includes('finish') || message.toLowerCase().includes('success')) {
                toastElement.classList.add('success'); // Add success class
                toastElement.classList.remove('error'); // Ensure error class is removed
            } else {
                // Reset toast to default state (no error or success classes)
                toastElement.classList.remove('error', 'success');
            }

            // Show the updated toast message
            captureToast.show();

            // If the message contains "finish" or "success", refresh the page after a delay
            if (message.toLowerCase().includes('finish') || message.toLowerCase().includes('success')) {
                setTimeout(() => {
                    window.location.reload(); // Refresh the page
                }, 2000); // Wait 2 seconds before refreshing
            }
        }
    } catch (error) {
        console.error("Error running PC_capture.py:", error);
        toastBody.textContent = "Error running PC_capture.py. Please try again.";
        document.getElementById('captureToast').classList.add('error'); // Show error toast
        captureToast.show();
    } finally {
        // Restore button to default state
        buttonIcon.style.display = 'inline-block';
        buttonText.style.display = 'inline-block';
        loadingSpinner.style.display = 'none';
    }
});

// Function to handle trashbin icon clicks
function addTrashbinEventListeners() {
    const trashbinIcons = document.querySelectorAll('.trashbin-icon, .carousel-trashbin');
    trashbinIcons.forEach((icon) => {
        icon.addEventListener('click', async (event) => {
            event.stopPropagation(); // Prevent thumbnail or carousel click event from firing

            // Get the corresponding file name
            const container = icon.closest('.carousel-item, .thumbnail-container');
            const imageElement = container.querySelector('.carousel-image, .thumbnail');
            const filename = imageElement.src.split('/').pop(); // Extract file name from src

            // Ask for confirmation before deletion
            const confirmDelete = confirm(`Are you sure you want to delete "${filename}"?`);
            if (confirmDelete) {
                try {
                    // Send a request to delete the file
                    const response = await fetch(`/delete-file/${filename}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        // Reload the page to reflect the changes
                        window.location.reload();
                    } else {
                        alert('Failed to delete the file. Please try again.');
                    }
                } catch (error) {
                    console.error('Error deleting file:', error);
                    alert('An error occurred while deleting the file.');
                }
            }
        });
    });
}

// Initialize trashbin event listeners
document.addEventListener('DOMContentLoaded', () => {
    addTrashbinEventListeners();
});