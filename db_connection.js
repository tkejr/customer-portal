require("dotenv").config();
const { Client } = require("pg");

// Function to connect to the PostgreSQL database
const connectToDB = () => {
  const db = new Client({
    connectionString: process.env.DB_URL,
    ssl: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });
  console.log(db);
  return db;
};

// Function to fetch data from the "users" table based on the provided URL and shop
const getUserFromDB = async (shop) => {
  const db = connectToDB();
  try {
    await db.connect();
    let query = "SELECT * FROM users WHERE url = $1";
    let values = [shop];
    const result = await db.query(query, values);
    return result.rows;
  } catch (error) {
    throw new Error("Error executing query: " + error.message);
  } finally {
    await db.end(); // Close the PostgreSQL client connection
  }
};

// Function to fetch custom preferences from the "custom_preferences" table based on the provided user_id
const getCustomPreferencesFromDB = async (userId) => {
  const db = connectToDB();
  try {
    await db.connect();
    let query = "SELECT * FROM custom_preferences WHERE user_id = $1";
    let values = [userId];
    const result = await db.query(query, values);
    return result.rows;
  } catch (error) {
    throw new Error("Error executing query: " + error.message);
  } finally {
    await db.end(); // Close the PostgreSQL client connection
  }
};

const getCustomPreferences = async (shop) => {
  console.log("In getCustomPreferences function");
  try {
    // First, get the user_id from the users table based on the shop
    const userData = await getUserFromDB(shop);
    if (userData.length === 0) {
      console.log("User not found for the given shop.");
      return null;
    }

    const user = userData[0]; // Assuming it's the first and only record in the array
    const userId = user.id;

    // Now, get the custom preferences for the user_id from the custom_preferences table
    const preferencesData = await getCustomPreferencesFromDB(userId);
    if (preferencesData.length === 0) {
      console.log("Custom preferences not found for the given user.");
      return null;
    }

    const preferences = preferencesData[0]; // Assuming it's the first and only record in the array

    console.log("Custom Preferences Data:");
    console.log(preferences);
    return preferences;
  } catch (error) {
    console.error("Error fetching custom preferences:", error.message);
    return null;
  }
};

module.exports = {
  getUserFromDB,
  getCustomPreferences,
};
