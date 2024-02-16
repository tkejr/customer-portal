const { getCustomPreferences } = require("./db_connection");

const getEnabled = async (shop) => {
  const pref = await getCustomPreferences(shop);
  return pref.enable;
};

const getTimeLeft = async (shop, currentTime, order) => {
  const orderTime = new Date(order.order.created_at).getTime(); // Convert to milliseconds
  const currentDateTime = new Date(currentTime * 1000).getTime(); // Convert to milliseconds

  const timeSinceOrder = (currentDateTime - orderTime) / 1000; // Convert to seconds
  const pref = await getCustomPreferences(shop);

  const timetoEditAllowedInSeconds = pref.time_to_edit;
  const timeLeft = timetoEditAllowedInSeconds - timeSinceOrder;

  // Return 0 if the time has already elapsed
  return Math.max(timeLeft, 0);
};

module.exports = {
  getTimeLeft: getTimeLeft,
  getEnabled: getEnabled,
};
