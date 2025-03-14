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

    // Update the carousel indicator (if needed)
    currentIndexElement.textContent = activeIndex + 1;

    // Highlight the active thumbnail
    const thumbnails = document.querySelectorAll('.thumbnail-container');
    thumbnails.forEach((thumbnail, index) => {
        if (index === activeIndex) {
            thumbnail.classList.add('active'); // Add border to the active thumbnail
        } else {
            thumbnail.classList.remove('active'); // Remove border from other thumbnails
        }
    });
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

// Capture Button Functionality
const captureButton = document.getElementById('captureButton');
const buttonIcon = document.getElementById('buttonIcon');
const buttonText = document.getElementById('buttonText');
const loadingSpinner = document.getElementById('loadingSpinner');
const captureToast = new bootstrap.Toast(document.getElementById('captureToast'));
const toastBody = document.querySelector('.toast-body');

// Change the font of the button to match the header font and make it bold
captureButton.style.fontFamily = "'Doto', sans-serif";
captureButton.style.fontWeight = 'bold';

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

// Function to display a new toast message
function showToast(message, type = 'default') {
    const toastElement = document.createElement('div');
    toastElement.classList.add('toast');

    // Add class based on message type (error or success)
    if (type === 'error') {
        toastElement.classList.add('error');
    } else if (type === 'success') {
        toastElement.classList.add('success');
    }

    // Set the toast message content
    const toastBody = document.createElement('div');
    toastBody.classList.add('toast-body');
    toastBody.textContent = message;
    toastElement.appendChild(toastBody);

    // Add the toast to the toast container
    toastContainer.appendChild(toastElement);

    // Initialize and show the toast using Bootstrap
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000, // Hide the toast after 3 seconds
    });
    toast.show();
}

// Function to display a placeholder thumbnail when no images are found
function displayPlaceholderThumbnail() {
    const thumbnailGallery = document.querySelector('.thumbnail-gallery');

    // Clear existing thumbnails
    thumbnailGallery.innerHTML = '';

    // Create a placeholder thumbnail
    const placeholderThumbnail = document.createElement('div');
    placeholderThumbnail.classList.add('thumbnail-container', 'placeholder-thumbnail');

    // Add text explaining the issue
    const placeholderText = document.createElement('p');
    placeholderText.textContent = "No images found. Please add images to the Output folder.";
    placeholderThumbnail.appendChild(placeholderText);

    // Add the placeholder to the thumbnail gallery
    thumbnailGallery.appendChild(placeholderThumbnail);
}

// Function to load images from the Output folder
async function loadImages() {
    try {
        // Fetch the list of images from the server
        const response = await fetch('/get-images');
        const photoFiles = await response.json();

        if (photoFiles.length === 0) {
            // If no images are found, display the placeholder thumbnail
            displayPlaceholderThumbnail();
        } else {
            // Otherwise, load the images into the carousel and thumbnails
            loadCarouselAndThumbnails(photoFiles);
        }
    } catch (error) {
        console.error("Error loading images:", error);
        displayPlaceholderThumbnail(); // Show placeholder in case of an error
    }
}

// Function to load images into the carousel and thumbnails
function loadCarouselAndThumbnails(photoFiles) {
    const carouselInner = document.querySelector('.carousel-inner');
    const thumbnailGallery = document.querySelector('.thumbnail-gallery');

    // Clear existing content
    carouselInner.innerHTML = '';
    thumbnailGallery.innerHTML = '';

    // Load each image into the carousel and thumbnails
    photoFiles.forEach((file, index) => {
        // Add image to carousel
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (index === 0) carouselItem.classList.add('active'); // Set first item as active

        const carouselImage = document.createElement('img');
        carouselImage.src = `/output/${file}`;
        carouselImage.classList.add('d-block', 'w-100', 'carousel-image');
        carouselItem.appendChild(carouselImage);

        // Add file type indicator to carousel image
        const carouselFileType = document.createElement('div');
        carouselFileType.classList.add('file-type');
        carouselFileType.textContent = file.split('.').pop(); // Extract file extension
        carouselItem.appendChild(carouselFileType);

        carouselInner.appendChild(carouselItem);

        // Add image to thumbnail gallery
        const thumbnailContainer = document.createElement('div');
        thumbnailContainer.classList.add('thumbnail-container');
        thumbnailContainer.setAttribute('data-bs-target', '#carouselExample');
        thumbnailContainer.setAttribute('data-bs-slide-to', index);

        const thumbnailImage = document.createElement('img');
        thumbnailImage.src = `/output/${file}`;
        thumbnailImage.classList.add('thumbnail');
        thumbnailContainer.appendChild(thumbnailImage);

        // Add file type indicator to thumbnail
        const thumbnailFileType = document.createElement('div');
        thumbnailFileType.classList.add('file-type');
        thumbnailFileType.textContent = file.split('.').pop(); // Extract file extension
        thumbnailContainer.appendChild(thumbnailFileType);

        // Add trashbin icon to thumbnail
        const thumbnailTrashbin = document.createElement('span');
        thumbnailTrashbin.classList.add('material-symbols-outlined', 'trashbin-icon');
        thumbnailTrashbin.textContent = 'delete'; // Trashbin icon
        thumbnailContainer.appendChild(thumbnailTrashbin);

        thumbnailGallery.appendChild(thumbnailContainer);
    });

    // Reattach event listeners for thumbnails
    const thumbnails = document.querySelectorAll('.thumbnail-container');
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', () => {
            const carousel = new bootstrap.Carousel('#carouselExample');
            carousel.to(index); // Navigate to the corresponding slide
        });
    });

    // Add event listeners for trashbin icons
    addTrashbinEventListeners();
}

// Function to handle trashbin icon clicks
function addTrashbinEventListeners() {
    const trashbinIcons = document.querySelectorAll('.trashbin-icon');

    trashbinIcons.forEach((icon) => {
        icon.addEventListener('click', async (event) => {
            event.stopPropagation(); // Prevent thumbnail click event from firing

            // Get the corresponding file name
            const container = icon.closest('.carousel-container, .thumbnail-container');
            const imageElement = container.querySelector('.carousel-image, .thumbnail');
            const fileName = imageElement.src.split('/').pop(); // Extract file name from src

            // Ask for confirmation before deletion
            const confirmDelete = confirm(`Are you sure you want to delete "${fileName}"?`);
            if (confirmDelete) {
                try {
                    // Send a request to delete the file
                    const response = await fetch(`/delete-file/${fileName}`, {
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

// Call the function to load images when the page loads
document.addEventListener('DOMContentLoaded', loadImages);