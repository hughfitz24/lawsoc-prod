// Weekly Calendar JavaScript - Site Pattern Style
let currentWeekStart = new Date();
let events = [];

// Your Google Calendar API key
const API_KEY = 'AIzaSyCZQDfkaeojRYiHVN9Vx9NgLSNfGLJvMoM';
// Your Google Calendar ID
const CALENDAR_ID = 'c_273faa41315d4c8fbeadb338d4d8d6d08edad9814e7ba417d0b408e1cc565f56@group.calendar.google.com';

// Set to start of current week (Monday)
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

// Initialize calendar
document.addEventListener('DOMContentLoaded', function() {
  currentWeekStart = getWeekStart(new Date());
  setupEventListeners();
  loadCalendarWeek();
});

function setupEventListeners() {
  const prevBtn = document.getElementById('prev-week');
  const nextBtn = document.getElementById('next-week');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      const newDate = new Date(currentWeekStart);
      newDate.setDate(newDate.getDate() - 7);
      currentWeekStart = newDate;
      loadCalendarWeek();
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      const newDate = new Date(currentWeekStart);
      newDate.setDate(newDate.getDate() + 7);
      currentWeekStart = newDate;
      loadCalendarWeek();
    });
  }
}

async function loadCalendarWeek() {
  try {
    showLoadingState();
    await loadEvents();
    renderWeeklyCalendar();
  } catch (error) {
    console.error('Error loading calendar:', error);
    showErrorState();
  }
}

async function loadEvents() {
  try {
    // Calculate week range
    const weekStart = new Date(currentWeekStart);
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    // Build Google Calendar API URL with API key
    const eventsUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events` +
      `?key=${API_KEY}` +
      `&timeMin=${weekStart.toISOString()}` +
      `&timeMax=${weekEnd.toISOString()}` +
      `&singleEvents=true` +
      `&orderBy=startTime` +
      `&maxResults=50`;

    const eventsResponse = await fetch(eventsUrl);
    const eventsData = await eventsResponse.json();

    if (eventsData.error) {
      throw new Error(`API Error: ${eventsData.error.message}`);
    }

    events = (eventsData.items || []).map(event => ({
      id: event.id,
      title: event.summary || 'Untitled Event',
      description: event.description || '',
      start: event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date),
      end: event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date),
      allDay: !event.start.dateTime,
      location: event.location || '',
      category: categorizeEvent(event.summary || '')
    }));

  } catch (error) {
    console.error('Error loading events:', error);
    throw error;
  }
}

function categorizeEvent(title) {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('debate') || titleLower.includes('moot')) return 'debate';
  if (titleLower.includes('social') || titleLower.includes('ball') || titleLower.includes('party')) return 'social';
  if (titleLower.includes('career') || titleLower.includes('job') || titleLower.includes('internship')) return 'career';
  if (titleLower.includes('lecture') || titleLower.includes('seminar') || titleLower.includes('workshop')) return 'academic';
  if (titleLower.includes('meeting') || titleLower.includes('agm') || titleLower.includes('committee')) return 'meeting';
  return 'debate'; // Default category
}

function renderWeeklyCalendar() {
  updateWeekTitle();
  const calendarGrid = document.getElementById('weekly-calendar-grid');
  if (!calendarGrid) return;

  calendarGrid.innerHTML = '';
  
  // Day names
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Create headers
  dayNames.forEach(dayName => {
    const header = document.createElement('div');
    header.className = 'calendar-day-header';
    header.textContent = dayName;
    calendarGrid.appendChild(header);
  });
  
  // Create day cells
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(currentWeekStart);
    dayDate.setDate(dayDate.getDate() + i);
    
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day-cell';
    
    // Check if today
    const today = new Date();
    if (dayDate.toDateString() === today.toDateString()) {
      dayCell.classList.add('today');
    }
    
    // Day number
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = dayDate.getDate();
    dayCell.appendChild(dayNumber);
    
    // Events container
    const dayEvents = document.createElement('div');
    dayEvents.className = 'day-events';
    
    // Filter events for this day
    const dayEventsData = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === dayDate.toDateString();
    });
    
    // Add events to day
    dayEventsData.forEach(event => {
      const eventElement = createEventElement(event);
      dayEvents.appendChild(eventElement);
    });
    
    dayCell.appendChild(dayEvents);
    calendarGrid.appendChild(dayCell);
  }
  
  hideLoadingState();
  
  // Show/hide no events message
  const hasEvents = events.length > 0;
  const noEventsMsg = document.getElementById('no-events');
  if (noEventsMsg) {
    noEventsMsg.style.display = hasEvents ? 'none' : 'block';
  }
}

function updateWeekTitle() {
  const weekTitle = document.getElementById('current-week-title');
  if (!weekTitle) return;
  
  const weekStart = new Date(currentWeekStart);
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  const startStr = weekStart.toLocaleDateString('en-US', options);
  const endStr = weekEnd.toLocaleDateString('en-US', options);
  
  if (weekStart.getMonth() === weekEnd.getMonth() && weekStart.getFullYear() === weekEnd.getFullYear()) {
    // Same month
    weekTitle.textContent = `${weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
  } else if (weekStart.getFullYear() === weekEnd.getFullYear()) {
    // Same year, different months
    weekTitle.textContent = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endStr}`;
  } else {
    // Different years
    weekTitle.textContent = `${startStr} - ${endStr}`;
  }
}

function showEventDetails(event) {
  const startTime = event.allDay ? 'All Day' : event.start.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  let eventDetails = `📅 ${event.title}\n\n`;
  eventDetails += `🕒 ${startTime}\n`;
  
  if (event.location) {
    eventDetails += `📍 ${event.location}\n`;
  }
  
  if (event.description) {
    eventDetails += `\n${event.description}`;
  }
  
  alert(eventDetails);
}

function showLoadingState() {
  const loadingSection = document.getElementById('loading-message');
  const weeklyCalendar = document.getElementById('weekly-calendar-grid');
  const noEvents = document.getElementById('no-events');
  
  if (loadingSection) loadingSection.style.display = 'block';
  if (weeklyCalendar) weeklyCalendar.style.display = 'none';
  if (noEvents) noEvents.style.display = 'none';
}

function hideLoadingState() {
  const loadingSection = document.getElementById('loading-message');
  const weeklyCalendar = document.getElementById('weekly-calendar-grid');
  
  if (loadingSection) loadingSection.style.display = 'none';
  if (weeklyCalendar) weeklyCalendar.style.display = 'grid';
}

function showErrorState() {
  hideLoadingState();
  const noEventsMsg = document.getElementById('no-events');
  if (noEventsMsg) {
    noEventsMsg.style.display = 'block';
    const title = noEventsMsg.querySelector('h4');
    const description = noEventsMsg.querySelector('p');
    if (title) title.textContent = 'Error Loading Calendar';
    if (description) description.textContent = 'There was an error loading the calendar. Please try again.';
  }
}

/**
 * Create an enhanced HTML element for displaying an event in the calendar grid
 * @param {Object} event - The event object from Google Calendar
 * @returns {HTMLElement} - The event element
 */
function createEventElement(event) {
  const eventDiv = document.createElement('div');
  eventDiv.className = `calendar-event event-${event.category}`;
  
  // Create event content structure
  eventDiv.innerHTML = `
    <div class="event-content">
      <div class="event-header">
        <div class="event-time">${formatEventTime(event)}</div>
        <div class="event-title">${escapeHtml(event.title)}</div>
      </div>
      ${event.description ? `
        <div class="event-body">
          <div class="event-description">${escapeHtml(event.description)}</div>
        </div>
      ` : ''}
      <div class="event-actions">
        <a href="${generateCalendarLink(event)}" 
           target="_blank" 
           class="add-to-calendar-btn"
           onclick="event.stopPropagation();">
          <i class="fas fa-calendar-plus"></i>
          Add to Calendar
        </a>
      </div>
    </div>
  `;
  
  // Add click handler for event details (excluding the button)
  eventDiv.addEventListener('click', (e) => {
    if (!e.target.closest('.add-to-calendar-btn')) {
      showEventDetails(event);
    }
  });
  
  return eventDiv;
}

/**
 * Format event time for display
 * @param {Object} event - Event object with start/end times and allDay flag
 * @returns {string} - Formatted time string
 */
function formatEventTime(event) {
  if (event.allDay) {
    return 'All Day';
  }
  
  const options = { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  };
  
  const startTimeStr = event.start.toLocaleTimeString('en-US', options);
  const endTimeStr = event.end.toLocaleTimeString('en-US', options);
  
  // If same day, show time range
  if (event.start.toDateString() === event.end.toDateString()) {
    return `${startTimeStr} - ${endTimeStr}`;
  } else {
    return startTimeStr;
  }
}

/**
 * Generate Google Calendar link for adding event
 * @param {Object} event - The event object
 * @returns {string} - Google Calendar add link
 */
function generateCalendarLink(event) {
  const formatDateForGoogle = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title || 'UCD Law Society Event',
    dates: `${formatDateForGoogle(event.start)}/${formatDateForGoogle(event.end)}`,
    details: event.description || '',
    location: event.location || ''
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
