// Empty string for inputs
export const validateNonEmptyString = (
  value: string,
  fieldName: string
): string | null => {
  if (!value || !value.trim()) {
    return `${fieldName} is required.`;
  }
  return null;
};

// Negative numbers
export const validateNonNegativeNumber = (
  value: number,
  fieldName: string
): string | null => {
  if (value === undefined || value === null) {
    return `${fieldName} is required.`;
  }
  if (value < 0) {
    return `${fieldName} cannot be less than 0.`;
  }
  return null;
};

// Zip code - only digits
export const validateZipCode = (zip: string): string | null => {
  if (!zip || !zip.trim()) {
    return "Zip code is required.";
  }
  const zipRegex = /^\d+$/;
  if (!zipRegex.test(zip)) {
    return "Please enter a valid zip code (digits only).";
  }
  return null;
};

// Validate start time is less than end time
export const validateTimeOrder = (
  startTime: string,
  endTime: string
): string | null => {
  if (!startTime || !endTime) return "Start time and End time are required.";
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  if (start >= end) {
    return "Start time must be before End time.";
  }
  return null;
};

// Total tickets should be less than or equal to venue capacity
export const validateTicketsCapacity = (
  tickets: { ticketCount: number }[],
  capacity: number
): string | null => {
  const totalTickets = tickets.reduce(
    (sum, ticket) => sum + (ticket.ticketCount || 0),
    0
  );
  if (totalTickets > capacity) {
    return "Total number of tickets cannot exceed Total Tickets available.";
  }
  return null;
};

// Ticket price and count must be non-negative and type non-empty
export const validateTickets = (
  tickets: { ticketType: string; ticketPrice: number; ticketCount: number }[]
): string | null => {
  for (let i = 0; i < tickets.length; i++) {
    const { ticketType, ticketPrice, ticketCount } = tickets[i];
    if (!ticketType || !ticketType.trim()) {
      return `Ticket type for ticket ${i + 1} is required.`;
    }
    if (ticketPrice < 0) {
      return `Ticket price for ticket ${i + 1} cannot be less than 0.`;
    }
    if (ticketCount < 0) {
      return `Ticket count for ticket ${i + 1} cannot be less than 0.`;
    }
  }
  return null;
};

// Main event form validator
export const validateEventForm = (
  title: string,
  date: string,
  startTime: string,
  endTime: string,
  venueName: string,
  venueCity: string,
  venueState: string,
  venueZip: string,
  venueCapacity: number,
  categoryId: string,
  artist: string,
  description: string,
  tickets: { ticketType: string; ticketPrice: number; ticketCount: number }[]
): { [key: string]: string | null } => {
  return {
    title: validateNonEmptyString(title, "Title"),
    date: validateNonEmptyString(date, "Date"),
    startTime: validateNonEmptyString(startTime, "Start time"),
    endTime:
      validateNonEmptyString(endTime, "End time") ||
      validateTimeOrder(startTime, endTime),
    venueName: validateNonEmptyString(venueName, "Venue Name"),
    venueCity: validateNonEmptyString(venueCity, "City"),
    venueState: validateNonEmptyString(venueState, "State"),
    venueZip: validateZipCode(venueZip),
    venueCapacity: validateNonNegativeNumber(venueCapacity, "Venue capacity"),
    categoryId: validateNonEmptyString(categoryId, "Category"),
    artist: validateNonEmptyString(artist, "Artist"),
    description: validateNonEmptyString(description, "Description"),
    tickets:
      validateTicketsCapacity(tickets, venueCapacity) ||
      validateTickets(tickets),
  };
};
