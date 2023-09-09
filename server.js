const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const { getCustomPreferences, getUserFromDB } = require("./db_connection");
const {
  getShopifyOrder,
  getProductDetails,
  editShopifyOrder,
  editShippingAddress,
} = require("./utils");
const { getTimeLeft, getEnabled } = require("./helper");

require("dotenv").config();
const app = express();
//Importing from .env file
const { FRONTEND_URL, BACKEND_URL } = process.env;
//Cors
app.use(cors());
//Body Parser
app.use(express.json());

app.use(express.static(path.join(__dirname, "build")));

//cors
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/accessToken", async (req, res) => {
  const id = req.query.id;
  const shop = req.query.shop;
  const t = req.query.t;
  const key = req.query.key;

  let accessToken;
  try {
    const data = await getUserFromDB(shop);
    if (data.length > 0) {
      const user = data[0]; // Assuming it's the first and only record in the array
      accessToken = user.access_token; // Assign the access_token to the variable
    } else {
      console.log("User not found for the given shop.");
    }
  } catch (error) {
    console.error(error);
  }

  res.send(`accessToken is ${accessToken}`);
});

app.get("/customer_portal/status_page_button", async (req, res) => {
  console.log("Button embed");
  const id = req.query.id;
  const shop = req.query.shop;
  const t = req.query.t;
  const key = req.query.key;
  let accessToken;
  try {
    const data = await getUserFromDB(shop);
    if (data.length > 0) {
      const user = data[0]; // Assuming it's the first and only record in the array
      accessToken = user.access_token; // Assign the access_token to the variable
    } else {
      console.log("User not found for the given shop.");
    }
  } catch (error) {
    console.error(error);
  }

  const order = await getShopifyOrder(shop, id, accessToken);
  var timeLeft = await getTimeLeft(shop, t, order);
  var enabled = await getEnabled(shop);

  var timeString = formatDuration(timeLeft);
  console.log("TimeString", timeLeft);

  res.setHeader("Content-Type", "text/plain");

  var htmlContent = `
  <h2>Edit Order</h2>
  <p>Need to make a change? You can change your shipping address, quantities, or options before your order ships.</p>
  <div style="display: flex; align-items: center; justify-content: flex-start;">
    ${
      timeLeft > 0
        ? `<a class="btn btn--size-small" href="${FRONTEND_URL}/orders?orderId=${id}&key=69b06e41078de98be12918a268e00fe7c4e6ac8c27f98feac2c20d8722f7eff9&amp;shop=${shop}&amp;t=1690308953">Edit order</a>`
        : `<button class="btn btn--size-small" style="background-color: grey;" disabled>Edit order</button>`
    }
    <p style="margin-left: 10px;">
      ${
        timeLeft > 0
          ? `You have <b style="font-weight: bold;">${timeString}</b> left to edit this order.`
          : `You can't edit this order as the time to edit has passed.`
      }
    </p>
  </div>
`;

  if (!enabled) {
    htmlContent = ``;
  }
  res.send(htmlContent);
});

app.get("/orders/:id/", async (req, res) => {
  const id = req.params.id;
  const shop = req.query.shop;
  let accessToken;
  try {
    const data = await getUserFromDB(shop);
    if (data.length > 0) {
      const user = data[0]; // Assuming it's the first and only record in the array
      accessToken = user.access_token; // Assign the access_token to the variable
    } else {
      console.log("User not found for the given shop.");
    }
  } catch (error) {
    console.error(error);
  }

  const data = await getShopifyOrder(shop, id, accessToken);
  console.log("In the orders route");
  res.json({
    data: data.order,
  });
});

app.put("/orders/:id/", async (req, res) => {
  const id = req.params.id;
  const shop = req.query.shop;
  const lineItemId = req.query.lineItemId;
  const quantity = req.query.quantity;
  const action = req.query.action;
  console.log("In the orders put route");
  let accessToken;
  try {
    const data = await getUserFromDB(shop);
    if (data.length > 0) {
      const user = data[0]; // Assuming it's the first and only record in the array
      accessToken = user.access_token; // Assign the access_token to the variable
    } else {
      console.log("User not found for the given shop");
    }
  } catch (error) {
    console.error(error);
  }
  if (action === "changeQuantity") {
    const response = await editShopifyOrder(
      shop,
      id,
      lineItemId,
      quantity,
      accessToken
    );
  } else if (action === "changeShippingAddress") {
    console.log("In the change shipping address route");
    const shippingDetails = req.body.shippingDetails;
    const response = await editShippingAddress(
      shop,
      id,
      shippingDetails,
      accessToken
    );
  }
  // console.log(response);
  res.json({
    test: "test",
  });
});

app.get("/products/:id/", async (req, res) => {
  const id = req.params.id;
  const shop = req.query.shop;
  let accessToken;
  try {
    const data = await getUserFromDB(shop);
    if (data.length > 0) {
      const user = data[0]; // Assuming it's the first and only record in the array
      accessToken = user.access_token; // Assign the access_token to the variable
    } else {
      console.log("User not found for the given shop.");
    }
  } catch (error) {
    console.error(error);
  }
  console.log(id, shop, accessToken);

  const data = await getProductDetails(shop, id, accessToken);

  res.json({
    data: data.product,
  });
});

app.get("/getScript", (req, res) => {
  // res.send("Hello Test");
  console.log("Sending Script");
  res.sendFile(path.join(__dirname, "build", "script.js"));
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const port = process.env.PORT || 3000; // Replace with the desired port number
app.listen(port, () => {
  console.log(`Express server is running on ${BACKEND_URL}:${port}`);
});

function formatDuration(seconds) {
  console.log(seconds);
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
}
