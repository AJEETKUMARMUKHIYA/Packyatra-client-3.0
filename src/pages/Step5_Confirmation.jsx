import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Grid,
  Alert,
  Paper
} from "@mui/material";
import {
  CheckCircle,
  Download,
  Print,
  Email,
  Share,
  QrCode,
  LocalShipping,
  CalendarToday,
  AccessTime
} from "@mui/icons-material";

const Step5_Confirmation = () => {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);

  // ✅ Load data from sessionStorage
  useEffect(() => {
    const storedData = sessionStorage.getItem("bookingConfirmationData");

    if (!storedData) {
      navigate("/");
      return;
    }

    setBookingData(JSON.parse(storedData));
  }, [navigate]);

  // ⏳ Prevent crash while loading
  if (!bookingData) return null;

  const {
    bookingId,
    transactionId,
    price,
    customerName,
    customerEmail,
    selectedTimeSlot,
    shiftingDate,
    confirmationPdfBlob,
    quotationSent,
    timeSlots = []
  } = bookingData;

  const tokenAmount = price * 0.1;

  // 📄 PDF Download
  const handleDownloadReceipt = () => {
    if (!confirmationPdfBlob) return;

    const url = URL.createObjectURL(confirmationPdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Booking_Confirmation_QM-${bookingId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Booking Confirmation",
        text: `Booking confirmed! Booking ID: QM-${bookingId}`,
        url: window.location.href
      });
    }
  };

  return (
    <Box sx={{ textAlign: "center" }}>
      {/* Success Header */}
      <Box sx={{ mb: 4 }}>
        <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
        <Typography variant="h3" fontWeight={700} color="success.main">
          Booking Confirmed!
        </Typography>
        <Typography color="text.secondary">
          Your booking has been successfully confirmed
        </Typography>
      </Box>

      {/* Ticket Card */}
      <Card sx={{ maxWidth: 800, mx: "auto", mb: 4, border: "2px solid", borderColor: "success.main" }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Booking Details */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  BOOKING DETAILS
                </Typography>

                <Stack spacing={1.2}>
                  <Typography>Booking ID: <b>QM-{bookingId}</b></Typography>
                  <Typography>Transaction ID: <b>{transactionId}</b></Typography>
                  <Typography>Name: {customerName}</Typography>
                  <Typography>Email: {customerEmail}</Typography>
                </Stack>
              </Paper>
            </Grid>

            {/* Payment Details */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  PAYMENT DETAILS
                </Typography>

                <Stack spacing={1.2}>
                  <Typography>Total: ₹{price.toLocaleString("en-IN")}</Typography>
                  <Typography color="success.main">
                    Token Paid: ₹{tokenAmount.toLocaleString("en-IN")}
                  </Typography>
                  <Typography>
                    Balance: ₹{(price - tokenAmount).toLocaleString("en-IN")}
                  </Typography>
                  <Chip label="PARTIAL PAID" size="small" color="success" />
                </Stack>
              </Paper>
            </Grid>

            {/* Pickup Info */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" color="text.secondary" mb={2}>
                  PICKUP INFORMATION
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <CalendarToday fontSize="small" />{" "}
                    {new Date(shiftingDate).toLocaleDateString("en-IN")}
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <AccessTime fontSize="small" />{" "}
                    {timeSlots.find(t => t.timeSlotID === selectedTimeSlot)?.timeSlotName || "Not set"}
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <LocalShipping fontSize="small" /> Scheduled
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          <Alert severity="success" sx={{ mt: 3 }}>
            Confirmation email sent to {customerEmail}
          </Alert>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleDownloadReceipt}
          disabled={!confirmationPdfBlob}
        >
          Download Receipt
        </Button>

        <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>
          Print
        </Button>

        <Button
          variant="outlined"
          startIcon={<Email />}
          onClick={() => (window.location.href = `mailto:${customerEmail}`)}
        >
          Email
        </Button>

        {navigator.share && (
          <Button variant="outlined" startIcon={<Share />} onClick={handleShare}>
            Share
          </Button>
        )}
      </Stack>

      {quotationSent && (
        <Alert severity="success" sx={{ mt: 3 }}>
          ✅ Email delivered successfully
        </Alert>
      )}

      {/* Back */}
      <Button sx={{ mt: 4 }} onClick={() => navigate("/")}>
        ← Back to Home
      </Button>
    </Box>
  );
};

export default Step5_Confirmation;
