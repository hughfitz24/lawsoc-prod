// Your Google Calendar API key
const API_KEY = 'AIzaSyCZQDfkaeojRYiHVN9Vx9NgLSNfGLJvMoM';
// Your Google Calendar ID
const CALENDAR_ID = 'c_273faa41315d4c8fbeadb338d4d8d6d08edad9814e7ba417d0b408e1cc565f56@group.calendar.google.com';

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

async function loadGoogleCalendarEvents() {
    try {
        // Get the current date and the date 8 days from now
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 8);

        // Format dates to ISO 8601 format
        const timeMin = now.toISOString();
        const timeMax = nextWeek.toISOString();

        // URL to fetch events within the date range using API key
        const API_URL = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&orderBy=startTime&singleEvents=true`;

        const response = await fetch(API_URL);
        const data = await response.json();

        const events = data.items || [];
        const eventsContainer = document.getElementById('events-container');

        console.log('Fetched events:', events);

        // Populate the events
        eventsContainer.innerHTML = events
            .filter(event => event.start)
            .map(event => {
                const start = event.start.dateTime || event.start.date;
                const end = event.end.dateTime || event.end.date;

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
