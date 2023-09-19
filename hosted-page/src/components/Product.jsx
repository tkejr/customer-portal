import React, { useState } from "react";
import AlertComponent from "./AlertComponent";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Box,
  CardActions,
  Button,
  Divider,
  Modal,
  CircularProgress,
  Alert,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import MinimizeIcon from "@mui/icons-material/Minimize";
import axios from "axios";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  borderRadius: "10px",
  boxShadow: 24,
  height: 300,
  display: "flex",
  justifyContent: "space-between",
};

const Product = ({ products, orderId, shop, setUpdated, updated }) => {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
  const [open, setOpen] = useState(false);
  const [quantityOpen, setQuantityOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isAlertVisible, setAlertVisible] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleQuantityOpen = () => setQuantityOpen(true);
  const handleQuantityClose = () => setQuantityOpen(false);
  const handleIncrement = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    }
  };
  const handleRemove = (lineItemId) => {
    setLoading(true);
    console.log("remove");
    changeQuantity(lineItemId, 0);
    //remove the product from the list
    let newProducts = products.filter((product) => product.id !== lineItemId);
    //delay of 3 seconds so shopify can process the change
    setTimeout(() => {
      setUpdated(!updated);
      setLoading(false);
      handleClose();
      setAlertVisible(true);
      setTimeout(() => {
        setAlertVisible(false);
      }, 3000);
    }, 2000);
  };

  const handleUpdate = (lineItemId, quantity) => {
    setLoading(true);
    console.log("update");
    handleQuantityClose();
    changeQuantity(lineItemId, quantity);
    //delay of 3 seconds so shopify can process the change
    setTimeout(() => {
      setUpdated(!updated);
      setLoading(false);
      handleClose();
      setAlertVisible(true);
      setTimeout(() => {
        setAlertVisible(false);
      }, 3000);
    }, 2000);
  };

  const changeQuantity = (lineItemId, quantity) => {
    console.log("change quantity");
    let config = {
      method: "put",
      maxBodyLength: Infinity,
      url: `${backendUrl}/orders/${orderId}?shop=${shop}&lineItemId=${lineItemId}&quantity=${quantity}&action=changeQuantity`,
      headers: {},
    };
    console.log(config);

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <Box ml={5} mr={5} mt={2} sx={{ flexGrow: 1 }}>
      <Card>
        {products.map((product) => (
          <div key={product.id}>
            <Grid container spacing={2}>
              <Grid item xs={2}>
                <CardMedia
                  sx={{
                    width: 70,
                    height: 90,
                    objectFit: "contain",
                    padding: "2px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    margin: "10px",
                  }}
                  component="img"
                  height="140"
                  image={product.img}
                  alt={product.title}
                />
              </Grid>
              <Grid item xs={5}>
                <CardContent>
                  <Typography
                    gutterBottom
                    variant="body"
                    component="div"
                    align="left"
                  >
                    {product.title}
                  </Typography>
                  <Typography
                    gutterBottom
                    variant="body"
                    color="text.secondary"
                    component="div"
                    align="left"
                  >
                    Quantity: {product.quantity}
                  </Typography>
                  <Typography
                    variant="body"
                    color="text.secondary"
                    component="div"
                    align="left"
                  >
                    {product.price} each
                  </Typography>
                </CardContent>
              </Grid>
              <Grid item xs={5}>
                <CardActions
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    margin: "10px",
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSelectedProduct(product);
                      handleOpen();
                    }}
                  >
                    Change
                  </Button>
                </CardActions>
              </Grid>
            </Grid>
            <Box>
              <Divider />
            </Box>
          </div>
        ))}
      </Card>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box
            style={{
              flex: "1",
            }}
          >
            <Typography
              variant="body1"
              component="h2"
              sx={{
                margin: "10px",
              }}
              fontWeight="bold"
            >
              Change Item
            </Typography>
            <Typography
              paragraph={true}
              sx={{
                margin: "10px",
                fontSize: "12px",
              }}
            >
              What changes would you like to make to this item?
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <CardMedia
                sx={{
                  width: 70,
                  height: 90,
                  objectFit: "contain",
                  padding: "2px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  margin: "10px",
                }}
                component="img"
                height="140"
                image={selectedProduct?.img}
                alt={selectedProduct?.title}
              />
              <Typography
                variant="body1"
                component="h2"
                sx={{
                  margin: "10px",
                }}
                fontWeight="bold"
              >
                {selectedProduct?.title}
              </Typography>
            </Box>
          </Box>
          <Box
            style={{
              flex: "1",
              backgroundColor: "#a7ddeb",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 5,
            }}
          >
            <Button
              variant="contained"
              onClick={() => {
                handleQuantityOpen();
                setQuantity(selectedProduct?.quantity);
              }}
              style={{ width: "80%" }}
              size="small"
            >
              Change Quantity
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                handleRemove(selectedProduct?.id);
              }}
              size="small"
              style={{
                width: "80%",
                margin: "10px",
                backgroundColor: "white",
                color: "#blue",
              }}
            >
              Remove Item
            </Button>
            {loading && <CircularProgress />}
          </Box>
        </Box>
      </Modal>
      <Modal
        open={quantityOpen}
        onClose={handleQuantityClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "background.paper",
            border: "2px solid #ffffff",
            borderRadius: "10px",
            boxShadow: 24,
            p: 4,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton size="small" onClick={handleDecrement}>
              <MinimizeIcon />
            </IconButton>
            <TextField
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              style={{ width: 60, textAlign: "center" }}
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
                style: { textAlign: "center", appearance: "textfield" },
              }}
            />
            <IconButton size="small" onClick={handleIncrement}>
              <AddIcon />
            </IconButton>
            <Button
              variant="contained"
              style={{ marginLeft: "20%" }}
              onClick={() => {
                handleUpdate(selectedProduct?.id, quantity);
              }}
            >
              Save
            </Button>
          </div>
        </Box>
      </Modal>
      {isAlertVisible && <AlertComponent text="Order Edited Successfully" />}
    </Box>
  );
};

export default Product;
