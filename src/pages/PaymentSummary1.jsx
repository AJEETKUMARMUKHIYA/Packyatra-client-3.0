import React, { useState } from "react";
import { Box, Button, Typography, Paper, Divider, Grid, Alert } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // For making API calls

const PaymentSummary = ({ price, userId, bookingId, fromLocation, toLocation }) => {
  const [message, setMessage] = useState(null); // For success/error messages
  const [loading, setLoading] = useState(false); // For button loading state

  // Mock partial payment amount
  const bookingAmount = 5000; // Fixed ₹5000 partial payment (mocked)
  const amountAtUnloading = Math.round(price - bookingAmount); // Remaining amount
  const totalAmount = price; // Total price remains the same
  const navigate = useNavigate();

  const handleContinueToPayment = async () => {
    //navigate("/payment-gateway", { state: {bookingId, bookingAmount,userId  } });
    setLoading(true);
    setMessage(null);

    try {
      // Mock PaymentDetails (no payment gateway)
      const paymentDetails = {
        BookingID: bookingId,
        UserID: userId,
        Amount: bookingAmount,
        PaymentStatus: "Completed",
        TransactionID: `TXN-${Date.now()}`, // Mock transaction ID
        FromLocation: fromLocation, // Required for ticket
        ToLocation: toLocation, // Required for ticket
      };

      // Call the ConfirmPayment endpoint
      const response = await axios.post(
        `https://localhost:7148/api/booking/ConfirmPayment/${bookingId}`,
        paymentDetails,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Extract ticket details from response
      const { Ticket } = response.data;
      setMessage({
        type: "success",
        text: `Ticket Generated! Ticket No: ${response.data.ticket.ticketNo}`,
      });

      // Navigate to a confirmation page (optional)
      setTimeout(() => {
        navigate("/booking-confirmation", {
          state: { ticketNo: response.data.ticket.ticketNo, bookingId, userId },
        });
      }, 2000);
    } catch (error) {
      // Handle errors
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to process payment or generate ticket. Please try again.",
      });
    } finally {
      setLoading(false);
    }
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
            "&:hover": { backgroundColor: "darkred" },
          }}
          onClick={handleContinueToPayment}
          disabled={loading}
        >
          {loading ? "Processing..." : "Confirm Booking"}
        </Button>
      </Paper>
    </Box>
  );
};

export default PaymentSummary;