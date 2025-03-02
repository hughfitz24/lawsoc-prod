// Function to load external HTML content into a specified container
async function loadContent(targetId, fileName) {
    try {
        const response = await fetch(fileName); // Fetch the content of the HTML file
        const data = await response.text(); // Convert response to text
        document.getElementById(targetId).innerHTML = data; // Insert the content into the target element
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// Load header and footer content when the page loads
document.addEventListener("DOMContentLoaded", async function() {
    // Load header and footer content
    await loadContent('header', 'header.html');
    await loadContent('footer', 'footer.html');
    });

// JavaScript to toggle the mobile menu
document.addEventListener("DOMContentLoaded", function () {
    const navbar = document.querySelector('.navbar');
    
    // Toggle the open class when clicking on any part of the navbar or the menu
    navbar.addEventListener('click', function() {
        navbar.classList.toggle('open');
    });
});