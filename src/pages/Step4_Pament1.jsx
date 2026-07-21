import React, { useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Stack,
  Paper,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Alert,
  CircularProgress,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from "@mui/material";
import {
  CreditCard,
  AccountBalance,
  Payment,
  QrCode,
  CheckCircle,
  Person,
  Email,
  Phone,
  Password
} from "@mui/icons-material";
import AxiosClient from "../AxiosClient";
import { generateBookingConfirmationPDF } from "./generateQuotationPDF";
import { sendBookingConfirmationEmail } from "./EmailService";
import { add } from "date-fns/add";

const Step4_Payment = ({ bookingData, onUpdate, onNext, onBack, timeSlots = [] }) => {
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [upiId, setUpiId] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const tokenAmount = bookingData.price * 0.1;
  const balanceAmount = bookingData.price * 0.9;

  const validateForm = () => {
    const newErrors = {};
    
    if (!customerName.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!customerEmail.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(customerEmail)) {
      newErrors.email = "Email is invalid";
    }   
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
const handlePayment = async () => {
  if (!validateForm()) {
    setEmailError("Please fix the errors in the form");
    setSnackbarOpen(true);
    return;
  }
  setLoading(true);
  setEmailError(null);

  try {
    const amountInPaise = Math.round(tokenAmount * 100);

    const res = await AxiosClient.post("/phonepe/pay", {
      amount: amountInPaise
    });

    const { merchantOrderId, redirectUrl } = res.data;

    // Save everything needed later
    localStorage.setItem("merchantTransactionId", merchantOrderId);
    localStorage.setItem(
      "postPaymentPayload",
      JSON.stringify({
        bookingData,
        customerName,
        customerEmail,
        customerPhone,
        paymentMethod,
        tokenAmount,
        balanceAmount,
        timeSlots
      })
    );

    // Redirect to PhonePe
    window.location.href = redirectUrl;

  } catch (err) {
    console.error(err);
    setEmailError("Unable to start PhonePe payment");
    setSnackbarOpen(true);
    setLoading(false);
  }
};

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleDownloadPDF = async () => {
    // Generate and download PDF immediately
    try {
      const timeSlotName = timeSlots.find(s => s.timeSlotID === bookingData.selectedTimeSlot)?.timeSlotName || "Selected";
      
      const confirmationPdf = await generateBookingConfirmationPDF({
        ...bookingData,
        transactionId: `TEMP-${Date.now()}`,
        customerName: customerName || "Customer",
        customerEmail: customerEmail || "",
        customerPhone: customerPhone || "",
        shiftingDate: bookingData.shiftingDate,
        selectedTimeSlot: bookingData.selectedTimeSlot,
        timeSlots: timeSlots
      });

      if (confirmationPdf) {
        const url = URL.createObjectURL(confirmationPdf);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Booking_Confirmation_QM-${bookingData.bookingId}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("PDF download error:", error);
    }
  };

  const paymentMethods = [
    { value: "UPI", label: "UPI", icon: <QrCode /> },
    { value: "Credit Card", label: "Credit Card", icon: <CreditCard /> },
    { value: "Debit Card", label: "Debit Card", icon: <CreditCard /> },
    { value: "Net Banking", label: "Net Banking", icon: <AccountBalance /> }
  ];

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {emailError}
        </Alert>
      </Snackbar>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onClose={() => {}}>
        <DialogTitle sx={{ textAlign: 'center', color: 'success.main' }}>
          <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2, display: 'block', mx: 'auto' }} />
          Payment Successful!
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ textAlign: 'center', mb: 2 }}>
            Confirmation email sent to {customerEmail}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Redirecting to confirmation...
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        </DialogContent>
      </Dialog>

      <Grid container spacing={3}>
        {/* Left Column - Customer Details */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person /> Customer Details
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                label="Full Name *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth
                required
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                }}
              />

              <TextField
                label="Email Address *"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                error={!!errors.email}
                helperText={errors.email || "Confirmation will be sent here"}
                fullWidth
                required
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                }}
              />

              {/* <TextField
                label="Phone Number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone || "Optional"}
                fullWidth
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                }}
              /> */}
            </Stack>

            {/* Payment Method */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Payment /> Payment Method
              </Typography>

              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {paymentMethods.map(method => (
                    <Fade in={true} key={method.value}>
                      <FormControlLabel
                        value={method.value}
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {method.icon}
                            {method.label}
                          </Box>
                        }
                        sx={{
                          mb: 2,
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: paymentMethod === method.value ? 'primary.main' : 'grey.300',
                          bgcolor: paymentMethod === method.value ? 'primary.50' : 'transparent'
                        }}
                      />
                    </Fade>
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Payment Summary */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 20 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle /> Payment Summary
            </Typography>

            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Booking Details
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">Booking ID</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    QM-{bookingData.bookingId}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1.5} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total Amount</Typography>
                    <Typography variant="body2">₹{bookingData.price?.toLocaleString('en-IN') || 0}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Token Amount (10%)</Typography>
                    <Typography variant="body2" color="success.main" fontWeight={600}>
                      ₹{tokenAmount.toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Balance Payable (90%)</Typography>
                    <Typography variant="body2">
                      ₹{balanceAmount.toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'primary.50', 
                  borderRadius: 1,
                  textAlign: 'center'
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Pay Now: ₹{tokenAmount.toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    10% token to confirm booking
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                • Pay 10% token amount to confirm booking<br/>
                • Balance 90% payable at pickup<br/>
                • Confirmation email with PDF will be sent instantly
              </Typography>
            </Alert>

            {/* Action Buttons */}
            <Stack spacing={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={onBack}
                disabled={loading}
              >
                Back to Review
              </Button>
              
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handlePayment}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
              >
                {loading ? "Processing..." : `Pay ₹${tokenAmount.toLocaleString('en-IN')}`}
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={handleDownloadPDF}
                startIcon={<Email />}
              >
                Download PDF Preview
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default Step4_Payment;