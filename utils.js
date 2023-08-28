// shopifyAPI.js
const axios = require("axios");
const getShopifyOrder = async (shop, id, accessToken) => {
  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://${shop}/admin/api/2023-07/orders/${id}.json`,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
  };

  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error("Error fetching data from Shopify API:", error.message);
    throw error;
  }
};

const editShopifyOrder = async (
  shop,
  id,
  lineItemId,
  quantity,
  accessToken
) => {
  const apiVersion = "2023-07"; // Replace with your desired API version
  const url = `https://${shop}/admin/api/${apiVersion}/graphql.json`;

  try {
    const beginEditMutation = `mutation beginEdit {
      orderEditBegin(id: "gid://shopify/Order/${id}") {
        calculatedOrder {
          id
        }
      }
    }`;

    const beginEditResponse = await axios.post(
      url,
      { query: beginEditMutation },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );

    // Extract the calculated order ID from the response
    const calculatedOrderId =
      beginEditResponse.data.data.orderEditBegin.calculatedOrder.id;

    let setQuantityMutation = `
  mutation increaseLineItemQuantity {
    orderEditSetQuantity(id: "${calculatedOrderId}", lineItemId: "gid://shopify/CalculatedLineItem/${lineItemId}", quantity: ${quantity}) {
      calculatedOrder {
        id
        addedLineItems(first: 5) {
          edges {
            node {
              id
              quantity
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
  
  `;
    const setQuantityResponse = await axios.post(
      url,
      {
        query: setQuantityMutation,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );
    let commitEditMutation = `
    mutation commitEdit {
      orderEditCommit(id: "${calculatedOrderId}", notifyCustomer: true, staffNote: "I edited the order! It was me!") {
        order {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
    `;
    const commiteOrderEdit = await axios.post(
      url,
      {
        query: commitEditMutation,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );
    // Handle the setQuantityResponse data here if needed
    return {};
  } catch (error) {
    // Handle any errors that occurred during the request
    console.error("Error:", error.message);
    throw error;
  }
};

const getProductDetails = async (shop, id, accessToken) => {
  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://${shop}/admin/api/2023-07/products/${id}.json`,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
  };

  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error("Error fetching data from Shopify API:", error.message);
    throw error;
  }
};

const editShippingAddress = async (
  shop,
  orderId,
  shippingAddress,
  accessToken
) => {
  try {
    const url = `https://${shop}/admin/api/2023-04/orders/${orderId}.json`;
    const headers = {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    };

    const requestBody = {
      order: {
        id: orderId,
        shipping_address: {
          first_name: shippingAddress.first_name,
          last_name: shippingAddress.last_name,
          address1: shippingAddress.address1,
          phone: shippingAddress.phone,
          city: shippingAddress.city,
          province: shippingAddress.province,
          country: shippingAddress.country,
          zip: shippingAddress.zip,
        },
      },
    };

    console.log("Request body:", requestBody);

    const response = await axios.put(url, requestBody, { headers });

    // Handle the response as per your requirements
    console.log(
      "Updated shipping address:",
      response.data.order.shipping_address
    );
    return response.data; // You can return the updated order data if needed
  } catch (error) {
    // Handle error
    console.error("Error editing shipping address:", error);
    throw error; // You can rethrow the error or handle it as needed
  }
};

module.exports = {
  getShopifyOrder,
  getProductDetails,
  editShopifyOrder,
  editShippingAddress,
};
