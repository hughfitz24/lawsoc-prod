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
document.addEventListener("DOMContentLoaded", function() {
    loadContent('header', 'header.html');
    loadContent('footer', 'footer.html');
});
