import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  Close,
  CalendarToday,
  AccessTime,
  Email,
  PictureAsPdf,
  CheckCircle,
  Send,
  Download,
  ArrowBack,
  ArrowForward
} from "@mui/icons-material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import generateQuotationPDF from "./QuotationPDF";
import { sendQuotationEmail } from "./EmailService";
import PaymentSummary from "./PaymentSummary";

const EnhancedPopupModal = ({ isOpen, onClose, price, shiftingDate, userId, bookingId, userData, addressData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State Management
  const [selectedDate, setSelectedDate] = useState(new Date(shiftingDate));
  const [selectedSlot, setSelectedSlot] = useState("2:30 PM");
  const [totalPrice, setTotalPrice] = useState(price);
  const [activeStep, setActiveStep] = useState(0);
  const [customerEmail, setCustomerEmail] = useState(userData?.email || "");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");

  // Steps configuration
  const steps = [
    { label: "Date & Time", icon: <CalendarToday /> },
    { label: "Review & PDF", icon: <PictureAsPdf /> },
    { label: "Send Email", icon: <Email /> },
    { label: "Confirmation", icon: <CheckCircle /> }
  ];

  // Date slots
  const slots = ["9:30 AM", "2:30 PM", "5:00 PM"];

  // Generate dates
  const generateDates = (startDate) => {
    return Array.from({ length: 10 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const isWeekend = date.getDay() === 6 || date.getDay() === 0;
      const adjustedPrice = isWeekend ? price * 1.05 : price;
      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        dateText: date.toLocaleDateString("en-US", { day: "2-digit", month: "short" }),
        fullDate: date,
        basePrice: adjustedPrice,
        isWeekend
      };
    });
  };

  const [dates] = useState(generateDates(new Date(shiftingDate)));

  // Navigation functions
  const handleNext = async () => {
    if (activeStep === 0) {
      // Validate date selection
      if (!selectedDate) {
        showSnackbar("Please select a pickup date", "warning");
        return;
      }
    } else if (activeStep === 1) {
      // Generate PDF before proceeding
      await generatePDF();
    } else if (activeStep === 2) {
      // Validate email before sending
      if (!validateEmail(customerEmail)) {
        showSnackbar("Please enter a valid email address", "warning");
        return;
      }
      await sendEmail();
      return; // Don't proceed automatically after sending
    }
    
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // Generate PDF Function
  const generatePDF = async () => {
    setLoading(true);
    try {
      // Prepare quotation data
      const quotationData = {
        quotationNo: `QM-${bookingId}`,
        date: selectedDate.toLocaleDateString(),
        pickupTime: selectedSlot,
        totalAmount: totalPrice,
        customerName: userData?.name || "Customer",
        pickupDate: selectedDate.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
        bookingId: bookingId,
        price: totalPrice,
        distance: addressData?.distance,
        items: [] // Add your items array here
      };

      // Generate PDF blob
      const blob = await generateQuotationPDF(quotationData, userData, addressData);
      setPdfBlob(blob);
      
      // Create URL for preview/download
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfGenerated(true);
      
      showSnackbar("PDF generated successfully!", "success");
    } catch (error) {
      console.error("PDF generation error:", error);
      showSnackbar("Failed to generate PDF", "error");
    } finally {
      setLoading(false);
    }
  };

  // Send Email Function
  const sendEmail = async () => {
    if (!pdfBlob) {
      showSnackbar("Please generate PDF first", "warning");
      return;
    }

    setLoading(true);
    try {
      const emailData = {
        recipientEmail: customerEmail,
        quotationNumber: `QM-${bookingId}`,
        customerName: userData?.name || "Customer",
        pickupDate: selectedDate.toLocaleDateString(),
        pickupTime: selectedSlot,
        totalAmount: totalPrice.toLocaleString('en-IN'),
        pdfBlob: pdfBlob
      };

      const result = await sendQuotationEmail(emailData);
      
      if (result.success) {
        showSnackbar("Quotation sent successfully to your email!", "success");
        // Move to confirmation step
        setTimeout(() => setActiveStep(3), 1500);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Email sending error:", error);
      showSnackbar("Failed to send email. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDownloadPDF = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `Quotation_QM-${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSnackbar("PDF downloaded successfully!", "success");
    }
  };

  // Render step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Select Pickup Schedule
            </Typography>
            
            {/* Date Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Pickup Date
              </Typography>
              <DatePicker
                selected={selectedDate}
                onChange={setSelectedDate}
                minDate={new Date()}
                inline
                className="custom-datepicker"
              />
            </Box>
            
            {/* Time Slot Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Preferred Time Slot
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {slots.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedSlot === slot ? "contained" : "outlined"}
                    onClick={() => setSelectedSlot(slot)}
                    sx={{ mb: 1 }}
                  >
                    {slot}
                  </Button>
                ))}
              </Stack>
            </Box>
            
            {/* Price Display */}
            <Card sx={{ mt: 2, bgcolor: 'primary.50' }}>
              <CardContent>
                <Typography variant="h6" sx={{ textAlign: 'center', color: 'primary.main' }}>
                  Total Amount: ₹{totalPrice.toLocaleString('en-IN')}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Generate Quotation PDF
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Booking Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Quotation No</Typography>
                    <Typography variant="body1">QM-{bookingId}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Pickup Date</Typography>
                    <Typography variant="body1">{selectedDate.toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Time Slot</Typography>
                    <Typography variant="body1">{selectedSlot}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                    <Typography variant="h6" color="primary.main">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                startIcon={<PictureAsPdf />}
                onClick={generatePDF}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? 'Generating PDF...' : 'Generate Quotation PDF'}
              </Button>
              
              {pdfGenerated && (
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleDownloadPDF}
                  sx={{ ml: 2 }}
                >
                  Download PDF
                </Button>
              )}
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Send to Email
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enter email address to send quotation
                </Typography>
                
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  variant="outlined"
                  sx={{ mb: 3 }}
                  error={customerEmail && !validateEmail(customerEmail)}
                  helperText={customerEmail && !validateEmail(customerEmail) ? "Invalid email format" : ""}
                />
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  The quotation PDF will be attached to the email
                </Alert>
                
                {!pdfGenerated && (
                  <Alert severity="warning">
                    Please generate PDF first before sending email
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
              Quotation Sent Successfully!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Your quotation has been sent to <strong>{customerEmail}</strong>
            </Typography>
            
            <Card sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Booking Reference
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  QM-{bookingId}
                </Typography>
                
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleDownloadPDF}
                  >
                    Download Again
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => window.print()}
                  >
                    Print Copy
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog 
        open={isOpen} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Complete Your Booking
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>

        {/* Stepper */}
        <Box sx={{ px: 3, pt: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel 
                  icon={
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: activeStep >= index ? 'primary.main' : 'grey.300',
                      color: activeStep >= index ? 'white' : 'grey.700'
                    }}>
                      {step.icon}
                    </Box>
                  }
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <DialogContent>
          {renderStepContent(activeStep)}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            width: '100%',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 0
          }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              startIcon={<ArrowBack />}
              sx={{ visibility: activeStep === 0 ? 'hidden' : 'visible' }}
            >
              Back
            </Button>
            
            <Stack direction="row" spacing={2}>
              {activeStep === 3 ? (
                <Button
                  variant="contained"
                  onClick={onClose}
                  sx={{ 
                    bgcolor: 'success.main',
                    '&:hover': { bgcolor: 'success.dark' }
                  }}
                >
                  Done
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={
                    loading || 
                    (activeStep === 2 && (!pdfGenerated || !validateEmail(customerEmail)))
                  }
                  endIcon={activeStep === 2 ? <Send /> : <ArrowForward />}
                >
                  {loading ? 'Processing...' : 
                   activeStep === 2 ? 'Send Email' : 
                   activeStep === 1 ? 'Generate PDF' : 
                   'Continue'}
                </Button>
              )}
            </Stack>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EnhancedPopupModal;