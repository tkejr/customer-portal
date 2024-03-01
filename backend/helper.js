const { getCustomPreferences } = require("./db_connection");

const getEnabled = async (shop) => {
  const pref = await getCustomPreferences(shop);
  return pref.enable;
};

const getTimeLeft = async (shop, currentTime, order) => {
  console.log("Order: ", order);
  const orderTime = new Date(order.order.created_at).getTime(); // Convert to milliseconds
  const currentDateTime = currentTime; // Already in milliseconds

  console.log("Order time: ", orderTime);
  console.log("Current time: ", currentDateTime);

  const timeSinceOrder = (currentDateTime - orderTime) / 1000; // Convert to seconds
  const pref = await getCustomPreferences(shop);

  const timetoEditAllowedInSeconds = pref.time_to_edit;
  const timeLeft = timetoEditAllowedInSeconds - timeSinceOrder;

  // Return 0 if the time has already elapsed
  return Math.max(timeLeft, 0);
};

const formatDuration = (seconds) => {
  if (seconds < 0) {
    return "Invalid duration";
  }

  // Less than a minute
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  }

  // Less than an hour
  let minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  // Less than a day
  let hours = Math.floor(minutes / 60);
  minutes %= 60;
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${
      minutes !== 1 ? "s" : ""
    }`;
  }

  // More than a day
  let days = Math.floor(hours / 24);
  hours %= 24;
  return `${days} day${days !== 1 ? "s" : ""} ${hours} hour${
    hours !== 1 ? "s" : ""
  } ${minutes} minute${minutes !== 1 ? "s" : ""}`;
};

module.exports = {
  getTimeLeft: getTimeLeft,
  getEnabled: getEnabled,
  formatDuration: formatDuration,
};
