const { getCustomPreferences } = require("./db_connection");

const getTimeLeft = async (shop, currentTime, order) => {
  const orderTime = new Date(order.order.created_at);
  const currentDateTime = new Date(currentTime * 1000);
  const timeAllowedInMinutes = await getCustomPreferences(shop);
  const editEndTime = new Date(
    orderTime.getTime() + timeAllowedInMinutes * 60 * 1000
  );

  // Calculate the time left in milliseconds
  const timeLeftInMilliseconds = editEndTime - currentDateTime;

  // Convert the time left from milliseconds to minutes and round down
  let timeLeftInMinutes = Math.floor(timeLeftInMilliseconds / (1000 * 60));

  // If timeLeftInMinutes is negative, set it to 0
  timeLeftInMinutes = Math.max(timeLeftInMinutes, 0);

  console.log("Time left in minutes:", timeLeftInMinutes);
  return timeLeftInMinutes;
};

module.exports = getTimeLeft;
