// Function to load external HTML content into a specified container
async function loadContent(targetId, fileName, callback) {
    try {
        const response = await fetch(fileName); // Fetch the content of the HTML file
        const data = await response.text(); // Convert response to text
        document.getElementById(targetId).innerHTML = data; // Insert the content into the target element
        
        if (callback) callback(); // Run callback function after content loads
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// Load header and footer content when the page loads
document.addEventListener("DOMContentLoaded", async function() {
    await loadContent('header', 'header.html', initializeMenu); // Load header and then run menu JS
    await loadContent('footer', 'footer.html');
});

// JavaScript to toggle the mobile menu (runs after header loads)
function initializeMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navList = document.querySelector(".nav-list");

    if (menuToggle && navList) {
        menuToggle.addEventListener("click", function () {
            navList.classList.toggle("active");
        });
    }
}
