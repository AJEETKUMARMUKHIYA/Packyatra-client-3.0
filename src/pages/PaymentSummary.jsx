import React, { useState } from "react";
import axiosClient from "../AxiosClient";
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  IconButton,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentSummary = ({ price, userId, bookingId, fromLocation, toLocation }) => {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [confirmationDetails, setConfirmationDetails] = useState(null);
  const navigate = useNavigate();

  // Mock partial payment amount
  const bookingAmount = 5000; // ₹5000 partial payment
  const amountAtUnloading = Math.round(price - bookingAmount);
  const totalAmount = price;

  const handleContinueToPayment = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const paymentDetails = {
        BookingID: bookingId,
        UserID: userId,
        Amount: bookingAmount,
        PaymentStatus: "Completed",
        TransactionID: `TXN-${Date.now()}`,
        PaymentDate: new Date().toISOString(),
        FromLocation: fromLocation,
        ToLocation: toLocation,
      };

      // const response = await axios.post(
      //   `https://localhost:7148/api/booking/ConfirmPayment/${bookingId}`,
      //   paymentDetails,
      //   {
      //     headers: { "Content-Type": "application/json" },
      //   }

           const response = await axiosClient.post(
        `/booking/ConfirmPayment/${bookingId}`,
        paymentDetails,
        {
          headers: { "Content-Type": "application/json" },
        }
      ).then((response)=>{

        const { Ticket } = response.data;
        setConfirmationDetails({
          payment: paymentDetails,
          ticket: response.data,
        });
        setOpenPopup(true); // Open the popup
      });

      
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to process payment or generate ticket.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
    // navigate("/", {
    //   state: {
    //     ticketNo: confirmationDetails?.ticket.TicketNo,
    //     bookingId,
    //     userId,
    //   },
    // });
  };

  const handleViewTicket = () => {
    setOpenPopup(false);
    navigate(`/ticket/${confirmationDetails?.ticket.TicketNo}`);
  };

  const charges = [
    { label: "Base Price", amount: Math.round(price * 0.5) },
    { label: "Single-Layer Packing", amount: Math.round(price * 0.2) },
    { label: "Unpacking All The Packed Items", amount: Math.round(price * 0.15) },
    { label: "Dismantling & Reassembly Of Basic Furniture", amount: Math.round(price * 0.1) },
    { label: "Cartons (5)", amount: "Free", crossed: true },
  ];

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", p: 2 }}>
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Typography
          variant="h6"
          sx={{ textAlign: "center", fontWeight: "bold", color: "green" }}
        >
          Pay ₹{bookingAmount} to confirm your booking
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Box textAlign="center">
            <CheckCircleIcon color="success" />
            <Typography variant="body2">Booking Amount</Typography>
            <Typography variant="subtitle2">₹{bookingAmount}</Typography>
          </Box>

          <Box textAlign="center">
            <CheckCircleIcon color="disabled" />
            <Typography variant="body2">At time of unloading</Typography>
            <Typography variant="subtitle2">₹{amountAtUnloading}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {charges.map((item, index) => (
          <Grid container key={index} justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography
              variant="body2"
              sx={{ textDecoration: item.crossed ? "line-through" : "none" }}
            >
              {item.label}
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: "bold", color: item.crossed ? "green" : "black" }}
            >
              {item.amount}
            </Typography>
          </Grid>
        ))}

        <Divider sx={{ my: 2 }} />

        <Grid container justifyContent="space-between">
          <Typography variant="body1" fontWeight="bold">Total Amount to be Paid</Typography>
          <Typography variant="body1" fontWeight="bold">₹{totalAmount}</Typography>
        </Grid>

        <Typography
          variant="body2"
          sx={{ mt: 2, color: "gray", textAlign: "center" }}
        >
          Free rescheduling till 24 hours before the pickup time.
        </Typography>

        <Button
          variant="contained"
          fullWidth
          sx={{
            mt: 3,
            backgroundColor: "blue",
            color: "white",
            "&:hover": { backgroundColor: "darkblue" },
          }}
          onClick={handleContinueToPayment}
          disabled={loading}
        >
          {loading ? "Processing..." : "Confirm Booking"}
        </Button>
      </Paper>

      {/* Payment Confirmation Popup */}
      <Dialog
        open={openPopup}
        onClose={handleClosePopup}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 400 }}
        maxWidth="sm"
        fullWidth
        sx={{ "& .MuiDialog-paper": { borderRadius: 2, p: 2 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 30 }} />
          <Typography variant="h5" fontWeight="bold">
            Payment Confirmed
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClosePopup}
            sx={{ position: "absolute", right: 8, top: 8, color: "grey.500" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary" mb={2}>
            Your payment was successful, and a ticket has been generated!
          </Typography>
          <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 2, mb: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={1}>
              Payment Details
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Amount Paid
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  ₹{confirmationDetails?.payment.Amount}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Transaction ID
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {confirmationDetails?.payment.TransactionID}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Payment Status
                </Typography>
                <Typography variant="body1" fontWeight="medium" color="success.main">
                  {confirmationDetails?.payment.PaymentStatus}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Payment Date
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {new Date(confirmationDetails?.payment.PaymentDate).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={1}>
              Ticket Details
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Ticket No
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {confirmationDetails?.ticket.ticket.ticketNo}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Booking ID
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {confirmationDetails?.ticket.ticket.bookingID}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  From
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {confirmationDetails?.ticket.ticket.fromLocation}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  To
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {confirmationDetails?.ticket.ticket.toLocation}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body1" fontWeight="medium" color="success.main">
                  {confirmationDetails?.ticket.ticket.status}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {new Date(confirmationDetails?.ticket.ticket.createdAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={handleClosePopup}
            sx={{
              borderColor: "grey.400",
              color: "grey.700",
              "&:hover": { borderColor: "grey.600", bgcolor: "grey.100" },
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handleViewTicket}
            sx={{
              bgcolor: "blue",
              color: "white",
              "&:hover": { bgcolor: "darkblue" },
            }}
          >
            View Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentSummary;