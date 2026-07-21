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
  Snackbar,
  Chip
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
  Password,
  LocalShipping,
  ConfirmationNumber,
  ArrowBack,
  FileDownloadOutlined
} from "@mui/icons-material";
import AxiosClient from "../AxiosClient";
import { generateBookingConfirmationPDF } from "./generateQuotationPDF";
import { sendBookingConfirmationEmail } from "./EmailService";
import { add } from "date-fns/add";

// ---- Design tokens (kept local so this component stays visually consistent
// wherever it's dropped in, without depending on a shared theme file) ----
const ink = "#16233B";      // primary navy - headings / high-emphasis text
const inkSoft = "#4B5A73";  // secondary navy-grey text
const amber = "#E0872A";    // moving-truck amber - primary accent / CTA
const amberDark = "#C06E17";
const paper = "#FBF8F3";    // warm paper background for panels
const line = "#E7E0D3";     // hairline / divider on warm paper
const success = "#1F8A57";

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

    // Phone is optional for now
    // if (!customerPhone.trim()) {
    //   newErrors.phone = "Phone number is required";
    // } else if (!/^\d{10}$/.test(customerPhone)) {
    //   newErrors.phone = "Phone number must be 10 digits";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


// const handlePayment = async () => {
//   if (!validateForm()) {
//     setEmailError("Please fix the errors in the form");
//     setSnackbarOpen(true);
//     return;
//   }

//   setLoading(true);
//   setEmailError(null);
  
//   try {
//     const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
//     const userId = parseInt(localStorage.getItem("userID"), 10);
    
//     // Step 1: Prepare all data
//     const paymentDetails = {
//       userID: userId,
//       bookingID: bookingData.bookingId,
//       amount: parseFloat(tokenAmount.toFixed(2)),
//       paymentStatus: "Partial Paid",
//       transactionID: transactionId,
//       paymentDate: new Date().toISOString(),
//       paymentMethod: paymentMethod
//     };

//     const updateBookingData = {
//       bookingID: bookingData.bookingId,
//       bookingAmountPaid: tokenAmount,
//       status: "Partially Paid",
//       totalAmount: bookingData.price
//     };

//     const userUpdateData = {
//       name: customerName,
//       phoneNumber: customerPhone,
//       email: customerEmail,
//       password: "",
//       Address: {
//         fromAddress: bookingData.fromAddress || "",
//         toAddress: bookingData.toAddress || ""  
//       }
//     };

//     // Step 2: Execute critical operations in parallel
//     const [paymentResult, bookingUpdateResult, userUpdateResult] = await Promise.allSettled([
//       // 1. Process Payment (most critical)
//       AxiosClient.post("/booking/ProcessPayment", paymentDetails, { 
//         headers: { "Content-Type": "application/json" } 
//       }),
      
//       // 2. Update Booking (secondary)
//       AxiosClient.put(`/booking/Update/${bookingData.bookingId}`, updateBookingData),
      
//       // 3. Update User (optional - can fail)
//       userId && customerName && customerEmail 
//         ? AxiosClient.put(`/User/Update/${userId}`, userUpdateData)
//         : Promise.resolve({ status: 'skipped' })
//     ]);

//     // Step 3: Check results
//     const paymentResponse = paymentResult.value;
    
//     if (paymentResult.status === 'fulfilled' && paymentResponse.status === 200) {
//       console.log("✅ Payment processed successfully");
//       console.log("✅ Booking update:", bookingUpdateResult);
//       console.log("✅ User update:", userUpdateResult);
      
//       // Step 4: Generate PDF and send email (non-critical)
//       const timeSlotName = timeSlots.find(s => s.timeSlotID === bookingData.selectedTimeSlot)?.timeSlotName || "Selected";
      
//       try {
//         const confirmationPdf = await generateBookingConfirmationPDF({
//           ...bookingData,
//           transactionId,
//           customerName,
//           customerEmail,
//           customerPhone,
//           shiftingDate: bookingData.shiftingDate,
//           selectedTimeSlot: bookingData.selectedTimeSlot,
//           timeSlots: timeSlots
//         });

//         if (confirmationPdf) {
//           // Send email in background (don't wait for it)
//           sendBookingConfirmationEmail({
//             recipientEmail: customerEmail,
//             customerName: customerName,
//             bookingId: bookingData.bookingId,
//             transactionId: transactionId,
//             pickupDate: new Date(bookingData.shiftingDate).toLocaleDateString('en-IN'),
//             pickupTime: timeSlotName,
//             totalAmount: bookingData.price,
//             paidAmount: tokenAmount,
//             balanceAmount: balanceAmount,
//             pdfBlob: confirmationPdf,
//             type: 'booking_confirmation',
//             fromAddress: bookingData.fromAddress || '',
//             toAddress: bookingData.toAddress || '',
//             distance: bookingData.distance || 0,
//             totalCFT: bookingData.totalCFT || 0,
//             totalItems: bookingData.selectedItems?.length || 0
//           }).catch(emailError => {
//             console.error("Email sending failed (non-critical):", emailError);
//           });

//           // Update local state
//           onUpdate({
//             transactionId: transactionId,
//             customerName,
//             customerEmail,
//             customerPhone,
//             bookingConfirmed: true,
//             confirmationPdfBlob: confirmationPdf,
//             quotationSent: true
//           });

//           // Success
//           setSuccessDialogOpen(true);
          
//           setTimeout(() => {
//             setSuccessDialogOpen(false);
//             onNext();
//           }, 3000);
//         }
//       } catch (pdfError) {
//         console.error("PDF generation failed:", pdfError);
//         // Still proceed since payment was successful
//         onUpdate({
//           transactionId: transactionId,
//           customerName,
//           customerEmail,
//           customerPhone,
//           bookingConfirmed: true,
//           quotationSent: false
//         });
        
//         setSuccessDialogOpen(true);
//         setTimeout(() => {
//           setSuccessDialogOpen(false);
//           onNext();
//         }, 3000);
//       }
//     } else {
//       throw new Error(paymentResult.reason?.message || "Payment processing failed");
//     }
//   } catch (error) {
//     console.error("Payment error:", error);
//     setEmailError(error.message || "Payment failed. Please try again.");
//     setSnackbarOpen(true);
//   } finally {
//     setLoading(false);
//   }
// };
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
  try {
    const timeSlotName =
      timeSlots.find(s => s.timeSlotID === bookingData.selectedTimeSlot)
        ?.timeSlotName || "Selected";

    const confirmationPdf = await generateBookingConfirmationPDF({
      ...bookingData,
      transactionId: `TEMP-${Date.now()}`,
      customerName: customerName || "Customer",
      //customerEmail: customerEmail || "",
      //customerPhone: customerPhone || "",
      shiftingDate: bookingData.shiftingDate,
      selectedTimeSlot: timeSlotName,
      timeSlots: timeSlots,
      fromAddress: bookingData.fromAddress || "",
      toAddress: bookingData.toAddress || "",
      totalCFT: bookingData.totalCFT || 0,
      serviceLift: bookingData.serviceLift,
      serviceLiftdrop : bookingData.serviceLiftdrop
    });

    if (confirmationPdf) {
      const url = URL.createObjectURL(confirmationPdf);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Booking_Confirmation_QM-${bookingData.bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          variant="filled"
          sx={{ width: '100%', borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}
        >
          {emailError}
        </Alert>
      </Snackbar>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={() => {}}
        PaperProps={{ sx: { borderRadius: 3, px: 1, py: 1.5, minWidth: 320 } }}
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'rgba(31,138,87,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5
            }}
          >
            <CheckCircle sx={{ fontSize: 38, color: success }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: ink }}>
            Payment successful
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ textAlign: 'center', mb: 1.5, color: inkSoft }}>
            Confirmation email sent to <strong>{customerEmail}</strong>
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: inkSoft }}>
            Redirecting to your confirmation…
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={22} sx={{ color: amber }} />
          </Box>
        </DialogContent>
      </Dialog>

      <Box sx={{ bgcolor: paper, borderRadius: 3, p: { xs: 2, md: 3 } }}>
        {/* Step header */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              bgcolor: ink,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <LocalShipping sx={{ color: amber, fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="overline"
              sx={{ color: amberDark, fontWeight: 700, letterSpacing: '0.1em', lineHeight: 1 }}
            >
              Step 4 of 4
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: ink, letterSpacing: '-0.01em' }}>
              Confirm your pickup
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={3}>
          {/* Left Column - Customer Details */}
          <Grid item xs={12} lg={6}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                border: `1px solid ${line}`,
                mb: 3
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: inkSoft, fontWeight: 700, letterSpacing: '0.08em' }}
              >
                Customer details
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: ink, mb: 2.5 }}>
                Who should we contact?
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  label="Full name"
                  placeholder="e.g. Ananya Roy"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: amberDark }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: amber, borderWidth: 2 }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: amberDark }
                  }}
                />

                <TextField
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email || "Your booking confirmation goes here"}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: amberDark }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: amber, borderWidth: 2 }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: amberDark }
                  }}
                />
              </Stack>

              {/* Payment Method (kept hidden — logic/markup preserved for future use) */}
              <Box sx={{ mt: 4, display: 'none' }}>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: ink }}>
                  <Payment /> Payment method
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
                          control={<Radio sx={{ color: line, '&.Mui-checked': { color: amber } }} />}
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
                            borderColor: paymentMethod === method.value ? amber : line,
                            bgcolor: paymentMethod === method.value ? 'rgba(224,135,42,0.08)' : 'transparent'
                          }}
                        />
                      </Fade>
                    ))}
                  </RadioGroup>
                </FormControl>
              </Box>
            </Paper>

            {/* Ticket-stub style booking summary */}
            <Box
              sx={{
                position: 'sticky',
                top: 20,
                borderRadius: 3,
                border: `1px solid ${line}`,
                bgcolor: '#fff',
                boxShadow: '0 12px 30px rgba(22,35,59,0.08)',
                overflow: 'hidden'
              }}
            >
              {/* stub header */}
              <Box
                sx={{
                  bgcolor: ink,
                  px: { xs: 2.5, md: 3 },
                  py: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <ConfirmationNumber sx={{ color: amber, fontSize: 20 }} />
                  <Typography sx={{ color: '#fff', fontWeight: 700, letterSpacing: '0.02em' }}>
                    Booking summary
                  </Typography>
                </Stack>
                <Chip
                  label="Pending payment"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(224,135,42,0.18)',
                    color: amber,
                    fontWeight: 700,
                    border: `1px solid ${amber}`
                  }}
                />
              </Box>

              <Box sx={{ px: { xs: 2.5, md: 3 }, py: 2.5 }}>
                <Typography variant="caption" sx={{ color: inkSoft, letterSpacing: '0.06em' }}>
                  BOOKING ID
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: ink,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: '0.03em',
                    mb: 2
                  }}
                >
                  QM-{bookingData.bookingId}
                </Typography>

                <Stack spacing={1.25}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: inkSoft }}>Total amount</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: ink }}>
                      ₹{bookingData.price?.toLocaleString('en-IN') || 0}
                    </Typography>
                  </Box>

                  {/* <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Token Amount (10%)</Typography>
                    <Typography variant="body2" color="success.main" fontWeight={600}>
                      ₹{tokenAmount.toLocaleString('en-IN')}
                    </Typography>
                  </Box> */}

                  {/* <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Balance Payable (90%)</Typography>
                    <Typography variant="body2">
                      ₹{balanceAmount.toLocaleString('en-IN')}
                    </Typography>
                  </Box> */}
                </Stack>

                {/* <Divider sx={{ my: 2 }} /> */}

                {/* <Box sx={{ 
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
                </Box> */}
              </Box>

              {/* perforated tear line */}
              <Box sx={{ position: 'relative', height: 0 }}>
                <Box
                  sx={{
                    position: 'absolute',
                    left: -10,
                    top: -10,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: paper,
                    border: `1px solid ${line}`
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    right: -10,
                    top: -10,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: paper,
                    border: `1px solid ${line}`
                  }}
                />
              </Box>
              <Box
                sx={{
                  mx: 2.5,
                  borderTop: `2px dashed ${line}`
                }}
              />

              {/* <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  • Pay 10% token amount to confirm booking<br/>
                  • Balance 90% payable at pickup<br/>
                  • Confirmation email with PDF will be sent instantly
                </Typography>
              </Alert> */}

              {/* Action Buttons */}
              <Stack spacing={1.5} sx={{ px: { xs: 2.5, md: 3 }, py: 3 }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handlePayment}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <Payment />}
                  sx={{
                    bgcolor: amber,
                    color: '#fff',
                    fontWeight: 700,
                    borderRadius: 2,
                    py: 1.4,
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 8px 20px rgba(224,135,42,0.35)',
                    '&:hover': { bgcolor: amberDark, boxShadow: '0 10px 24px rgba(192,110,23,0.4)' },
                    '&.Mui-disabled': { bgcolor: 'rgba(224,135,42,0.5)', color: '#fff' }
                  }}
                >
                  {loading ? "Processing…" : `Confirm pickup — Pay ₹${tokenAmount.toLocaleString('en-IN')}`}
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleDownloadPDF}
                  startIcon={<FileDownloadOutlined />}
                  sx={{
                    borderRadius: 2,
                    borderColor: line,
                    color: ink,
                    fontWeight: 600,
                    textTransform: 'none',
                    py: 1.1,
                    '&:hover': { borderColor: ink, bgcolor: 'rgba(22,35,59,0.04)' }
                  }}
                >
                  Download estimated quotation
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={onBack}
                  disabled={loading}
                  startIcon={<ArrowBack fontSize="small" />}
                  sx={{
                    color: inkSoft,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'rgba(22,35,59,0.04)' }
                  }}
                >
                  Back to review booking
                </Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Step4_Payment;