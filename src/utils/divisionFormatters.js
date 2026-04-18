export function getGradeLabel(grade) {
  if (grade === "15") return "Middle School";
  if (grade === "0") return "JV";
  if (grade === "14") return "Varsity";
  // Split grades
  if (grade === "100") return "1st/2nd Grade";
  if (grade === "101") return "2nd/3rd Grade";
  if (grade === "102") return "3rd/4th Grade";
  if (grade === "103") return "4th/5th Grade";
  if (grade === "104") return "5th/6th Grade";
  if (grade === "105") return "6th/7th Grade";
  if (grade === "106") return "7th/8th Grade";
  if (grade === "107") return "8th/9th Grade";

  // Convert to number for proper ordinal suffix calculation
  const num = parseInt(grade);

  // Determine ordinal suffix
  let suffix = "th";
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;

  // Special cases: 11th, 12th, 13th
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    suffix = "th";
  }
  // 1st, 21st, 31st, etc.
  else if (lastDigit === 1) {
    suffix = "st";
  }
  // 2nd, 22nd, 32nd, etc.
  else if (lastDigit === 2) {
    suffix = "nd";
  }
  // 3rd, 23rd, 33rd, etc.
  else if (lastDigit === 3) {
    suffix = "rd";
  }

  return `${num}${suffix} Grade`;
}

export function getStatusLabel(status) {
  if (status === "completed") return "Final";
  if (status === "in_progress") return "In Progress";
  return "Scheduled";
}

export function getStatusColor(status) {
  if (status === "completed") return "#10b981";
  if (status === "in_progress") return "#f59e0b";
  return "#9ca3af";
}

export function formatGameTime(gameTime) {
  if (!gameTime) return null;

  // Convert Date objects to ISO string without timezone conversion
  let isoString = gameTime;
  if (gameTime instanceof Date) {
    const year = gameTime.getFullYear();
    const month = String(gameTime.getMonth() + 1).padStart(2, "0");
    const day = String(gameTime.getDate()).padStart(2, "0");
    const hour = String(gameTime.getHours()).padStart(2, "0");
    const minute = String(gameTime.getMinutes()).padStart(2, "0");
    const second = String(gameTime.getSeconds()).padStart(2, "0");
    isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  }

  // Parse the ISO string directly WITHOUT timezone conversion
  // Format: "2024-01-15T14:30:00" or "2024-01-15T14:30:00.000Z"
  const dateStr = isoString.split("T")[0]; // "2024-01-15"
  const timeStr =
    isoString.split("T")[1]?.split(".")[0] || isoString.split("T")[1]; // "14:30:00"

  if (!dateStr || !timeStr) return null;

  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour24, minute] = timeStr.split(":").map(Number);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Get day of week from the date (using local date construction to avoid timezone conversion)
  const d = new Date(year, month - 1, day);
  const dayName = days[d.getDay()];
  const monthName = months[month - 1];

  // Convert 24-hour to 12-hour format
  const ampm = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  const minuteStr = minute.toString().padStart(2, "0");

  return {
    date: `${dayName}, ${monthName} ${day}`,
    time: `${hour12}:${minuteStr} ${ampm}`,
  };
}

// Simple combined date + time formatter
export function formatGameDateTime(gameTime) {
  if (!gameTime) return "";

  // ALWAYS convert to string to avoid timezone issues with Date objects
  let isoString = gameTime;
  if (gameTime instanceof Date) {
    // Extract components directly from Date object WITHOUT timezone conversion
    // Using getFullYear/getMonth/etc instead of toISOString to avoid UTC conversion
    const year = gameTime.getFullYear();
    const month = String(gameTime.getMonth() + 1).padStart(2, "0");
    const day = String(gameTime.getDate()).padStart(2, "0");
    const hour = String(gameTime.getHours()).padStart(2, "0");
    const minute = String(gameTime.getMinutes()).padStart(2, "0");
    const second = String(gameTime.getSeconds()).padStart(2, "0");
    isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  } else if (typeof gameTime !== "string") {
    // Convert any other type to string
    isoString = String(gameTime);
  }

  // Parse ISO string directly WITHOUT Date constructor to prevent timezone conversion
  // Expected format: "2024-03-28T18:00:00" or "2024-03-28T18:00:00.000Z"
  const parts = isoString.split("T");
  if (parts.length < 2) return "";

  const dateStr = parts[0]; // "2024-03-28"
  const timePart = parts[1].split(".")[0]; // "18:00:00" (strip milliseconds/timezone)

  if (!dateStr || !timePart) return "";

  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour24, minute] = timePart.split(":").map(Number);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthName = months[month - 1];

  const ampm = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  const minuteStr = minute.toString().padStart(2, "0");

  return `${monthName} ${day}, ${hour12}:${minuteStr} ${ampm}`;
}

// Just date part
export function formatGameDate(gameTime) {
  if (!gameTime) return "";

  // Convert Date objects to ISO string without timezone conversion
  let isoString = gameTime;
  if (gameTime instanceof Date) {
    const year = gameTime.getFullYear();
    const month = String(gameTime.getMonth() + 1).padStart(2, "0");
    const day = String(gameTime.getDate()).padStart(2, "0");
    const hour = String(gameTime.getHours()).padStart(2, "0");
    const minute = String(gameTime.getMinutes()).padStart(2, "0");
    const second = String(gameTime.getSeconds()).padStart(2, "0");
    isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  }

  const dateStr = isoString.split("T")[0];
  if (!dateStr) return "";

  const [year, month, day] = dateStr.split("-").map(Number);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const d = new Date(year, month - 1, day);
  const dayName = days[d.getDay()];
  const monthName = months[month - 1];

  return `${dayName}, ${monthName} ${day}, ${year}`;
}

// Just time part
export function formatGameTimeOnly(gameTime) {
  if (!gameTime) return "";

  // Convert Date objects to ISO string without timezone conversion
  let isoString = gameTime;
  if (gameTime instanceof Date) {
    const year = gameTime.getFullYear();
    const month = String(gameTime.getMonth() + 1).padStart(2, "0");
    const day = String(gameTime.getDate()).padStart(2, "0");
    const hour = String(gameTime.getHours()).padStart(2, "0");
    const minute = String(gameTime.getMinutes()).padStart(2, "0");
    const second = String(gameTime.getSeconds()).padStart(2, "0");
    isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  }

  const timeStr =
    isoString.split("T")[1]?.split(".")[0] || isoString.split("T")[1];
  if (!timeStr) return "";

  const [hour24, minute] = timeStr.split(":").map(Number);

  const ampm = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  const minuteStr = minute.toString().padStart(2, "0");

  return `${hour12}:${minuteStr} ${ampm}`;
}
