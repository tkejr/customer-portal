console.log("This is a test script!");

function isThankYouPage(path) {
  return path.includes("/checkout/thank_you") || path.includes("/orders/");
}

function addContentBoxToOrderStatus(data) {
  if (data) {
    Shopify.Checkout.OrderStatus.addContentBox(data);
  }
}

function fetchAndAddContentBox(baseurl, params) {
  // Add a content box with a loading indicator
  const loadingContent = `
    <div id="loadingIndicator" style="text-align: center;">
      <div class="dot" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #000; animation: bounce 0.6s infinite alternate;"></div>
      <div class="dot" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #000; animation: bounce 0.6s 0.2s infinite alternate;"></div>
      <div class="dot" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #000; animation: bounce 0.6s 0.4s infinite alternate;"></div>
    </div>
    <style>
      @keyframes bounce {
        0% { transform: translateY(0); }
        100% { transform: translateY(-10px); }
      }
    </style>
  `;
  Shopify.Checkout.OrderStatus.addContentBox(loadingContent);

  const request = new Request(
    `http://${baseurl}/customer_portal/status_page_button?${params}`,
    {
      method: "GET",
      mode: "cors",
    }
  );

  fetch(request)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((data) => {
      // Replace the content of the loading indicator div with the fetched data
      // and remove the 'text-align: center;' style
      const loadingIndicator = document.getElementById("loadingIndicator");
      if (loadingIndicator) {
        loadingIndicator.style.textAlign = "";
        loadingIndicator.innerHTML = data;
      }
    })
    .catch((error) => {
      // Handle error
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    });
}

function initialize() {
  const timestamp = new Date().getTime();
  var orderId = Shopify.checkout.order_id;
  if (orderId == null || orderId == "" || orderId == undefined) {
    const parsedUrl = new URL(window.location.href);
    orderId = parsedUrl.searchParams.get("order_id");
  }
  const params = new URLSearchParams({
    id: orderId,
    shop: Shopify.shop,
    t: timestamp,
  });

  const baseurl = "editify-cportal-api.shopvana.io";
  fetchAndAddContentBox(baseurl, params);
}

var path = window.location.pathname;
if (isThankYouPage(path)) {
  console.log("This is the Thank You page!");
  initialize();
}
