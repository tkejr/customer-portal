import React, { useEffect, useState } from "react";
import Product from "./Product";
import axios from "axios";
import AlertComponent from "./AlertComponent";

import {
  Button,
  Card,
  CardContent,
  Grid,
  Box,
  CardActions,
  Typography,
  CardMedia,
  CardActionArea,
  Divider,
  Paper,
  CircularProgress,
  Modal,
} from "@mui/material/";
import TextField from "@mui/material/TextField";

import { styled } from "@mui/material/styles";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "30%",
  bgcolor: "background.paper",
  border: "2px solid #ffffff",
  boxShadow: 24,
  borderRadius: "10px",
  pt: 2,
  px: 4,
  pb: 3,
};
var currency_symbols = {
  USD: "$", // US Dollar
  EUR: "€", // Euro
  CRC: "₡", // Costa Rican Colón
  GBP: "£", // British Pound Sterling
  ILS: "₪", // Israeli New Sheqel
  INR: "₹", // Indian Rupee
  JPY: "¥", // Japanese Yen
  KRW: "₩", // South Korean Won
  NGN: "₦", // Nigerian Naira
  PHP: "₱", // Philippine Peso
  PLN: "zł", // Polish Zloty
  PYG: "₲", // Paraguayan Guarani
  THB: "฿", // Thai Baht
  UAH: "₴", // Ukrainian Hryvnia
  VND: "₫", // Vietnamese Dong
};

const CustomerPortal = () => {
  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";
  console.log("======= This is the backend url ===========");
  console.log(backendUrl);
  const [orderDetails, setOrderDetails] = useState({});
  const [products, setProducts] = useState([]);
  const [shop, setShop] = useState("");
  const [orderId, setOrderId] = useState("");
  const [updated, setUpdated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = React.useState(false);
  const [shippingDetails, setShippingDetails] = useState({});
  const [isAlertVisible, setAlertVisible] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const changeAddress = async () => {
    console.log("change quantity");
    let config = {
      method: "put",
      maxBodyLength: Infinity,
      url: `${backendUrl}/orders/${orderDetails.id}?shop=${shop}&action=changeShippingAddress`,
      headers: {},
      data: {
        shippingDetails,
      },
    };
    console.log(config);

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        setAlertVisible(true);
        setTimeout(() => {
          setAlertVisible(false);
        }, 3000);
        setUpdated(!updated);
      })
      .catch((error) => {
        console.log(error);
      });
    handleClose();
  };

  useEffect(() => {
    const currentURL = window.location.href;
    const searchParams = new URLSearchParams(new URL(currentURL).search);
    const shop = searchParams.get("shop");
    const orderId = searchParams.get("orderId");
    setShop(shop);
    const fetchData = async () => {
      try {
        const response = await axios.get(`${backendUrl}/${orderId}`, {
          params: {
            shop: shop,
          },
        });
        // Handle the response here, e.g., update state with the data
        const orderDetails = response.data.data;
        const productIds = orderDetails.line_items.map(
          (item) => item.product_id
        );
        let products_array = [];
        for (let i = 0; i < productIds.length; i++) {
          const productId = productIds[i];
          if (productId != null) {
            const productResponse = await axios.get(
              `${backendUrl}/${productId}`,
              {
                params: {
                  shop: shop,
                },
              }
            );
            const product = productResponse.data.data;
            products_array.push(product);
          }
        }
        const line_items = response.data.data.line_items;
        const cleaned_up_line_items = [];
        for (let i = 0; i < line_items.length; i++) {
          const product = products_array[i];
          const line_item = line_items[i];
          if (line_item.fulfillable_quantity === 0) continue;
          const cleaned_up_line_item = {
            id: line_item.id,
            img: product?.image.src,
            title: line_item.title,
            price:
              currency_symbols[response.data.data.currency] + line_item.price,
            quantity: line_item.fulfillable_quantity,
          };
          cleaned_up_line_items.push(cleaned_up_line_item);
        }
        setProducts(cleaned_up_line_items);
        setOrderId(response.data.data.name);
        setOrderDetails(response.data.data);
        setShippingDetails(response.data.data.shipping_address);
        setIsLoading(false);
      } catch (error) {
        // Handle any errors that occurred during the request
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, [updated]);

  return (
    <>
      {isLoading ? (
        <div>
          {" "}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: "50vh",
            }}
          >
            <CircularProgress />
          </Box>
        </div>
      ) : (
        <div>
          <Grid container>
            <Grid
              item
              xs={7}
              sx={{
                height: "100vh",
              }}
            >
              <Box mt={5} ml={5} pl={2}>
                <Typography variant="body1" align="left" component="div" mb={1}>
                  {shop}
                </Typography>
                <Typography
                  variant="h5"
                  color="#4287f5"
                  component="div"
                  align="left"
                >
                  Editing Order {orderId}
                </Typography>
              </Box>
              <Box mt={5} ml={5} mr={5}>
                <Card variant="outlined">
                  <Grid container spacing={2}>
                    <Grid item xs={9}>
                      <CardContent>
                        <Typography
                          variant="body1"
                          align="left"
                          component="div"
                        >
                          SHIPPING ADDRESS
                        </Typography>
                        <Typography
                          variant="body2"
                          align="left"
                          component="div"
                        >
                          {orderDetails.shipping_address.first_name}{" "}
                          {orderDetails.shipping_address.last_name}
                        </Typography>
                        <Typography
                          variant="body2"
                          align="left"
                          component="div"
                        >
                          {orderDetails.shipping_address.address1}
                        </Typography>
                        <Typography
                          variant="body2"
                          align="left"
                          component="div"
                        >
                          {orderDetails.shipping_address.city},{" "}
                          {orderDetails.shipping_address.province_code}{" "}
                          {orderDetails.shipping_address.zip}
                        </Typography>
                        <Typography
                          variant="body2"
                          align="left"
                          component="div"
                        >
                          {orderDetails.shipping_address.country}
                        </Typography>
                        <Typography
                          variant="body2"
                          align="left"
                          component="div"
                        >
                          {orderDetails.shipping_address.phone}
                        </Typography>
                      </CardContent>
                    </Grid>
                    <Grid item xs={3}>
                      <CardActions>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          sx={{
                            width: "100%",
                          }}
                          onClick={() => {
                            handleOpen();
                          }}
                        >
                          Change
                        </Button>
                      </CardActions>
                    </Grid>
                  </Grid>
                  <Box padding={1}>
                    <Divider />
                  </Box>
                  <CardContent>
                    <Typography variant="body1" align="left" component="div">
                      SHIIPING METHOD
                    </Typography>
                    <Typography variant="body2" align="left" component="div">
                      {orderDetails.shipping_lines[0]?.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Product
                products={products}
                orderId={orderDetails.id}
                shop={shop}
                updated={updated}
                setUpdated={setUpdated}
              />
            </Grid>

            <Grid item xs={5}>
              <Box bgcolor="lightgray" height="100%" pt={20}>
                <Typography
                  variant="body1"
                  pt={2}
                  align="left"
                  pl={4}
                  fontWeight="bold"
                >
                  PAYMENT METHOD
                </Typography>
                <Typography variant="body2" align="left" pl={4}>
                  {orderDetails.payment_gateway_names} -{" "}
                  {currency_symbols[orderDetails.currency]}
                  {orderDetails.current_total_price}
                </Typography>
                <Typography
                  variant="body1"
                  align="left"
                  mt={3}
                  pl={4}
                  fontWeight="medium"
                >
                  BILLING ADDRESS
                </Typography>
                <Typography variant="body2" align="left" pl={4}>
                  {orderDetails.billing_address.first_name}{" "}
                  {orderDetails.billing_address.last_name}
                </Typography>
                <Typography variant="body2" align="left" pl={4}>
                  {orderDetails.billing_address.address1}
                </Typography>
                <Typography variant="body2" align="left" pl={4}>
                  {orderDetails.billing_address.city},{" "}
                  {orderDetails.billing_address.province_code}{" "}
                  {orderDetails.billing_address.zip}
                </Typography>
                <Typography variant="body2" align="left" pl={4}>
                  {orderDetails.billing_address.country}
                </Typography>
                <Typography variant="body2" align="left" pl={4}>
                  {orderDetails.billing_address.phone}
                </Typography>
                <Box padding={3}>
                  <Divider />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <Typography variant="body2" align="left" pl={4}>
                      Subtotal
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" align="left" pl={4}>
                      {currency_symbols[orderDetails.currency]}{" "}
                      {orderDetails.current_subtotal_price}
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2" align="left" pl={4}>
                      Discount
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" align="left" pl={4}>
                      {currency_symbols[orderDetails.currency]}{" "}
                      {orderDetails.current_total_discounts}
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2" align="left" pl={4}>
                      Shipping
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" align="left" pl={4}>
                      {currency_symbols[orderDetails.currency]}{" "}
                      {orderDetails.total_shipping_price_set.shop_money.amount}
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2" align="left" pl={4}>
                      Taxes
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" align="left" pl={4}>
                      {currency_symbols[orderDetails.currency]}{" "}
                      {orderDetails.current_total_tax}
                    </Typography>
                  </Grid>
                </Grid>
                <Box padding={3}>
                  <Divider />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <Typography variant="body2" align="left" pl={4}>
                      Total
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" align="left" pl={4}>
                      {currency_symbols[orderDetails.currency]}{" "}
                      {orderDetails.current_total_price}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="child-modal-title"
            aria-describedby="child-modal-description"
          >
            <Box sx={{ ...style }}>
              <h3 id="child-modal-title">Shipping Details</h3>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    id="outlined-basic"
                    label="First Name"
                    variant="outlined"
                    fullWidth
                    value={shippingDetails.first_name}
                    onChange={(e) => {
                      setShippingDetails({
                        ...shippingDetails,
                        first_name: e.target.value,
                      });
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="outlined-basic"
                    label="Last Name"
                    variant="outlined"
                    fullWidth
                    value={shippingDetails.last_name}
                    onChange={(e) => {
                      setShippingDetails({
                        ...shippingDetails,
                        last_name: e.target.value,
                      });
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="outlined-basic"
                    label="Address"
                    variant="outlined"
                    fullWidth
                    value={shippingDetails.address1}
                    onChange={(e) => {
                      setShippingDetails({
                        ...shippingDetails,
                        address1: e.target.value,
                      });
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="outlined-basic"
                    label="City"
                    variant="outlined"
                    fullWidth
                    value={shippingDetails.city}
                    onChange={(e) => {
                      setShippingDetails({
                        ...shippingDetails,
                        city: e.target.value,
                      });
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="outlined-basic"
                    label="State"
                    variant="outlined"
                    fullWidth
                    value={shippingDetails.province}
                    onChange={(e) => {
                      setShippingDetails({
                        ...shippingDetails,
                        province: e.target.value,
                      });
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="outlined-basic"
                    label="Zip"
                    variant="outlined"
                    fullWidth
                    value={shippingDetails.zip}
                    onChange={(e) => {
                      setShippingDetails({
                        ...shippingDetails,
                        zip: e.target.value,
                      });
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="outlined-basic"
                    label="Country"
                    variant="outlined"
                    fullWidth
                    value={shippingDetails.country}
                    onChange={(e) => {
                      setShippingDetails({
                        ...shippingDetails,
                        country: e.target.value,
                      });
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="outlined-basic"
                    label="Phone"
                    variant="outlined"
                    fullWidth
                    value={shippingDetails.phone}
                    onChange={(e) => {
                      setShippingDetails({
                        ...shippingDetails,
                        phone: e.target.value,
                      });
                    }}
                  />
                </Grid>
                <Grid item xs={6}></Grid>
                <Grid item xs={6} align="right">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      changeAddress();
                    }}
                  >
                    Save
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Modal>
          {isAlertVisible && <AlertComponent text="Shipping Address Changed" />}
        </div>
      )}
    </>
  );
};

export default CustomerPortal;
