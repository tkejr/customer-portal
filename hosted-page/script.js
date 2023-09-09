(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const scriptId = "customer-portal_button";
    const script = document.querySelector("#" + scriptId);
    const { timestamp, token, baseurl } = script.dataset;
    const params = new URLSearchParams({
      id: Shopify.checkout.order_id,
      shop: Shopify.shop,
      t: timestamp,
      key: token,
    });
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
          return;
        }

        return response.text();
      })
      .then((data) => {
        if (!data) {
          return;
        }
        Shopify.Checkout.OrderStatus.addContentBox(data);
      });
  });
})();
