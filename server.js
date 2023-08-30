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
const getTimeLeft = require("./helper");
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
  res.setHeader("Access-Control-Allow-Origin", "https://tama129.myshopify.com");
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
  const timeLeft = await getTimeLeft(shop, t, order);

  res.setHeader("Content-Type", "text/plain");
  const htmlContent = `
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
          ? `You have <b style="font-weight: bold;">${timeLeft} minutes</b> left to edit this order.`
          : `You can't edit this order as the time to edit has passed.`
      }
    </p>
  </div>
`;

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
