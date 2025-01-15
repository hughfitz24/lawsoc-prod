// Your Google Calendar API key
const API_KEY = 'AIzaSyAmjPc3wm6He1cu6qj-SkRea93zZywdc_0';
// Your Google Calendar ID
const CALENDAR_ID = 'c_273faa41315d4c8fbeadb338d4d8d6d08edad9814e7ba417d0b408e1cc565f56@group.calendar.google.com';

function formatReadableDate(dateString) {
    const date = new Date(dateString);

    // Extract components
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    // Determine ordinal suffix
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

function generateCalendarLink(event) {
    const baseUrl = "https://calendar.google.com/calendar/render";
    const start = event.start.dateTime || event.start.date; // Use dateTime or date for all-day events
    const end = event.end.dateTime || event.end.date;

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: event.summary,
        details: event.description || "More details coming soon!",
        dates: `${start.replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')}/${end.replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')}`,
    });
    return `${baseUrl}?${params.toString()}`;
}

// Function to fetch and display events for the next week
async function loadGoogleCalendarEvents() {
    try {
        // Get the current date and the date three weeks from now
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 21);

        // Format dates to ISO 8601 format
        const timeMin = now.toISOString();
        const timeMax = nextWeek.toISOString();

        // URL to fetch events within the date range
        const API_URL = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&orderBy=startTime&singleEvents=true`;

        const response = await fetch(API_URL);
        const data = await response.json();

        const events = data.items || [];
        const eventsContainer = document.getElementById('events-container');

        // Debugging: Log events to verify structure
        console.log('Fetched events:', events);

        // Populate the events
        eventsContainer.innerHTML = events
            .filter(event => event.start) // Ensure event has a start time or date
            .map(event => {
                const start = event.start.dateTime || event.start.date; // Handle all-day events
                const end = event.end.dateTime || event.end.date; // Handle all-day events

                // Debugging: Log each event to verify data
                console.log('Processing event:', { summary: event.summary, start, end });

                return `
                    <div class="event-card">
                        <div class="event-header">
                            <h3>${event.summary || 'No Title'}</h3>
                        </div>
                        <p class="event-date">${formatReadableDate(start)}</p>
                        <p class="event-description">${event.description || 'More Details Coming Soon!'}</p>
                        <a class="gcal-button" href="${generateCalendarLink(event)}" target="_blank">
                            <i class="far fa-calendar-alt"></i> Add to Google Calendar
                        </a>
                    </div>
                `;
            })
            .join('');
    } catch (error) {
        console.error('Error fetching Google Calendar events:', error);
    }
}

// Call the function to load events
loadGoogleCalendarEvents();
