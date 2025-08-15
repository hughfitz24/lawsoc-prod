// Calendar Page JavaScript
// Enhanced version of the original calendarevents.js with additional features

// Your Google Calendar ID (public information)
const CALENDAR_ID = 'c_273faa41315d4c8fbeadb338d4d8d6d08edad9814e7ba417d0b408e1cc565f56@group.calendar.google.com';

// Backend endpoint to retrieve the API key
const API_KEY_ENDPOINT = 'https://us-central1-lawsocie-prod.cloudfunctions.net/get-secret';

// Global variables
let allEvents = [];
let currentView = 'upcoming';
let currentFilter = 'all';

// DOM Elements
const loadingSection = document.getElementById('loading-section');
const eventsContainer = document.getElementById('calendar-events-container');
const noEventsMessage = document.getElementById('no-events-message');
const eventsTitle = document.getElementById('events-title');
const eventsSubtitle = document.getElementById('events-subtitle');

// Initialize the calendar page
document.addEventListener('DOMContentLoaded', function() {
    initializeEventHandlers();
    loadCalendarEvents();
});

// Initialize event handlers
function initializeEventHandlers() {
    // View selector buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            switchView(view);
        });
    });

    // Category filter
    const categoryFilter = document.getElementById('event-category');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            currentFilter = this.value;
            filterAndDisplayEvents();
        });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadCalendarEvents);
    }
}

// Switch between views
function switchView(view) {
    currentView = view;
    
    // Update active button
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-view') === view) {
            btn.classList.add('active');
        }
    });

    // Update titles and filter events
    updateViewTitles();
    filterAndDisplayEvents();
}

// Update view titles based on current view
function updateViewTitles() {
    switch (currentView) {
        case 'upcoming':
            eventsTitle.textContent = 'Upcoming Events';
            eventsSubtitle.textContent = 'Don\'t miss out on what\'s happening at Law Society';
            break;
        case 'all':
            eventsTitle.textContent = 'All Events';
            eventsSubtitle.textContent = 'Complete calendar of Law Society events';
            break;
    }
}

// Get API key from backend
async function getApiKey() {
    try {
        const response = await fetch(API_KEY_ENDPOINT);
        if (!response.ok) {
            throw new Error('Failed to fetch API key from backend');
        }
        const { secret } = await response.json();
        return secret;
    } catch (error) {
        console.error('Error fetching API key:', error);
        throw error;
    }
}

// Format date for display
function formatReadableDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const ordinalSuffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };
    return `${month} ${day}${ordinalSuffix(day)}, ${year}`;
}

// Format date for badge display
function formatDateBadge(dateString) {
    const date = new Date(dateString);
    return {
        day: date.getDate(),
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear()
    };
}

// Format time for display
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
}

// Generate calendar link for Google Calendar
function generateCalendarLink(event) {
    const baseUrl = "https://calendar.google.com/calendar/render";
    const start = event.start.dateTime || event.start.date;
    const end = event.end.dateTime || event.end.date;

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: event.summary,
        details: event.description || "More details coming soon!",
        dates: `${start.replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')}/${end.replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')}`,
    });
    return `${baseUrl}?${params.toString()}`;
}

// Categorize event based on title and description
function categorizeEvent(event) {
    const title = (event.summary || '').toLowerCase();
    const description = (event.description || '').toLowerCase();
    const text = title + ' ' + description;

    if (text.includes('debate') || text.includes('moot') || text.includes('competition')) {
        return 'debate';
    }
    if (text.includes('social') || text.includes('party') || text.includes('ball') || text.includes('mixer')) {
        return 'social';
    }
    if (text.includes('career') || text.includes('internship') || text.includes('job') || text.includes('firm')) {
        return 'career';
    }
    if (text.includes('lecture') || text.includes('academic') || text.includes('seminar') || text.includes('workshop')) {
        return 'academic';
    }
    if (text.includes('meeting') || text.includes('committee') || text.includes('agm')) {
        return 'meeting';
    }
    
    return 'other';
}

// Show loading state
function showLoading() {
    loadingSection.style.display = 'block';
    eventsContainer.style.display = 'none';
    noEventsMessage.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    loadingSection.style.display = 'none';
}

// Show events
function showEvents() {
    eventsContainer.style.display = 'grid';
    noEventsMessage.style.display = 'none';
}

// Show no events message
function showNoEvents() {
    eventsContainer.style.display = 'none';
    noEventsMessage.style.display = 'block';
}

// Load events from Google Calendar
async function loadCalendarEvents() {
    try {
        showLoading();
        
        // Fetch the API key from backend
        const API_KEY = await getApiKey();

        // Get date range based on current view
        const now = new Date();
        let timeMin, timeMax;

        if (currentView === 'upcoming') {
            timeMin = now.toISOString();
            const nextMonth = new Date();
            nextMonth.setMonth(now.getMonth() + 1);
            timeMax = nextMonth.toISOString();
        } else {
            // For 'all' view, get events from 3 months ago to 6 months ahead
            const pastDate = new Date();
            pastDate.setMonth(now.getMonth() - 3);
            timeMin = pastDate.toISOString();
            
            const futureDate = new Date();
            futureDate.setMonth(now.getMonth() + 6);
            timeMax = futureDate.toISOString();
        }

        // URL to fetch events within the date range
        const API_URL = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&orderBy=startTime&singleEvents=true&maxResults=50`;

        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        allEvents = data.items || [];
        
        console.log('Fetched events:', allEvents);

        hideLoading();
        filterAndDisplayEvents();

    } catch (error) {
        console.error('Error fetching Google Calendar events:', error);
        hideLoading();
        showErrorState();
    }
}

// Show error state
function showErrorState() {
    noEventsMessage.style.display = 'block';
    noEventsMessage.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Events</h3>
        <p>We're having trouble loading the calendar. Please try again later.</p>
        <button onclick="loadCalendarEvents()" class="retry-btn">
            <i class="fas fa-refresh"></i> Try Again
        </button>
    `;
}

// Filter and display events
function filterAndDisplayEvents() {
    let filteredEvents = allEvents.filter(event => event.start);

    // Apply category filter
    if (currentFilter !== 'all') {
        filteredEvents = filteredEvents.filter(event => 
            categorizeEvent(event) === currentFilter
        );
    }

    if (filteredEvents.length === 0) {
        showNoEvents();
        return;
    }

    // Generate HTML for events
    const eventsHTML = filteredEvents.map(event => {
        const start = event.start.dateTime || event.start.date;
        const end = event.end.dateTime || event.end.date;
        const dateBadge = formatDateBadge(start);
        const category = categorizeEvent(event);
        const hasTime = event.start.dateTime; // Check if it's a timed event
        
        return `
            <div class="calendar-event-card" data-category="${category}">
                <div class="event-date-badge">
                    <div class="day">${dateBadge.day}</div>
                    <div class="month-year">${dateBadge.month} ${dateBadge.year}</div>
                    ${hasTime ? `<div class="event-time">${formatTime(start)}</div>` : ''}
                </div>
                <div class="event-content">
                    <h3 class="event-title">${event.summary || 'No Title'}</h3>
                    <p class="event-description">${event.description || 'More details coming soon!'}</p>
                    <div class="event-actions">
                        <a href="${generateCalendarLink(event)}" target="_blank" class="event-btn primary">
                            <i class="far fa-calendar-plus"></i> Add to Calendar
                        </a>
                        ${event.location ? `<a href="https://maps.google.com/?q=${encodeURIComponent(event.location)}" target="_blank" class="event-btn secondary">
                            <i class="fas fa-map-marker-alt"></i> Location
                        </a>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    eventsContainer.innerHTML = eventsHTML;
    showEvents();

    // Add staggered animation
    const eventCards = eventsContainer.querySelectorAll('.calendar-event-card');
    eventCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Export function for global access
window.loadCalendarEvents = loadCalendarEvents;
