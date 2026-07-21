import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
  Chip,
  Grid,
  IconButton,
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
  Receipt,
  LocalShipping,
  CalendarToday,
  AccessTime,
  LocationOn
} from "@mui/icons-material";

const Step5_Confirmation = ({ bookingData, onBack,   timeSlots }) => {
  const {
    bookingId,
    transactionId,
    price,
    customerName,
    customerEmail,
    customerPhone,
    selectedTimeSlot
  
  } = bookingData;

  const tokenAmount = price * 0.1;

// Add this function to handle PDF download
const handleDownloadReceipt = () => {
  if (bookingData.confirmationPdfBlob) {
    const url = URL.createObjectURL(bookingData.confirmationPdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Booking_Confirmation_QM-${bookingId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }
};

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Booking Confirmation',
        text: `My booking with Packyatra is confirmed! Booking ID: QM-${bookingId}`,
        url: window.location.href,
      });
    }
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      {/* Success Icon */}
      <Box sx={{ mb: 4 }}>
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
          Booking Confirmed!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Your booking has been successfully confirmed
        </Typography>
      </Box>

      {/* Booking Ticket */}
      <Card sx={{ 
        maxWidth: 800, 
        mx: 'auto', 
        mb: 4,
        border: '2px solid',
        borderColor: 'success.main',
        background: 'linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%)'
      }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
              color: 'success.main',
              mb: 1
            }}>
              🎫 BOOKING CONFIRMATION TICKET
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Keep this ticket handy for pickup
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Booking Info */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  BOOKING DETAILS
                </Typography>
                
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Booking ID</Typography>
                    <Typography variant="body1" fontWeight={600} color="primary.main">
                      QM-{bookingId}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Transaction ID</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {transactionId}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Customer Name</Typography>
                    <Typography variant="body1">{customerName}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Email</Typography>
                    <Typography variant="body1">{customerEmail}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Payment Info */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  PAYMENT DETAILS
                </Typography>
                
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total Amount</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      ₹{price?.toLocaleString('en-IN') || 0}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Token Paid (10%)</Typography>
                    <Typography variant="body1" color="success.main" fontWeight={600}>
                      ₹{tokenAmount.toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Balance Payable</Typography>
                    <Typography variant="body1">
                      ₹{(price - tokenAmount).toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Payment Status</Typography>
                    <Chip label="PARTIAL PAID" size="small" color="success" />
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Pickup Details */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  PICKUP INFORMATION
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday fontSize="small" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Date
                        </Typography>
                        <Typography variant="body2">
                          {bookingData.shiftingDate ? 
                            new Date(bookingData.shiftingDate).toLocaleDateString('en-IN') : 
                            "Not set"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime fontSize="small" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Time
                        </Typography>
                        <Typography variant="body2">
                         {selectedTimeSlot && Array.isArray(timeSlots)
  ? timeSlots.find(s => s.timeSlotID === selectedTimeSlot)?.timeSlotName || "Not set"
  : "Not set"}

                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalShipping fontSize="small" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Status
                        </Typography>
                        <Typography variant="body2">
                          <Chip label="SCHEDULED" size="small" color="primary" />
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          {/* Success Message */}
          <Alert 
            severity="success" 
            icon={<CheckCircle />}
            sx={{ mt: 3, textAlign: 'left' }}
          >
            <Typography variant="body2">
              ✅ Your booking is confirmed! A confirmation email has been sent to {customerEmail}. 
              Please keep this booking reference and ID proof during pickup.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        justifyContent="center"
        sx={{ mb: 4 }}
      >
        <Button
  variant="contained"
  startIcon={<Download />}
  onClick={handleDownloadReceipt}
  sx={{ px: 4 }}
  disabled={!bookingData.confirmationPdfBlob}
>
  {bookingData.confirmationPdfBlob ? "Download Receipt" : "Generating Receipt..."}
</Button>
        
        <Button
          variant="outlined"
          startIcon={<Print />}
          onClick={handlePrint}
          sx={{ px: 4 }}
        >
          Print Ticket
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Email />}
          onClick={() => window.location.href = `mailto:${customerEmail}`}
          sx={{ px: 4 }}
        >
          Email Receipt
        </Button>
        
        {navigator.share && (
          <Button
            variant="outlined"
            startIcon={<Share />}
            onClick={handleShare}
            sx={{ px: 4 }}
          >
            Share
          </Button>
        )}
      </Stack>
{bookingData.quotationSent && (
  <Alert severity="success" sx={{ mt: 2 }}>
    <Typography variant="body2">
      ✅ Confirmation email sent to {bookingData.customerEmail}
    </Typography>
  </Alert>
)}
      {/* QR Code for Mobile */}
      <Paper sx={{ p: 3, maxWidth: 400, mx: 'auto', mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          <QrCode sx={{ mr: 1, verticalAlign: 'middle' }} />
          Quick Booking QR
        </Typography>
        <Box sx={{ 
          width: 200, 
          height: 200, 
          bgcolor: 'grey.200', 
          mx: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2
        }}>
          {/* QR Code would go here */}
          <Typography variant="caption" color="text.secondary">
            QR Code: QM-{bookingId}
          </Typography>
        </Box>
      </Paper>

      {/* Additional Info */}
      <Alert severity="info" sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography variant="body2">
          <strong>Next Steps:</strong> Our team will contact you 24 hours before pickup. 
          Please keep your ID proof and this booking reference ready. For any queries, 
          contact support@packyatra.in or call +91 XXXXX XXXXX.
        </Typography>
      </Alert>

      {/* Back Button */}
      <Button
        variant="text"
        onClick={onBack}
        sx={{ mt: 4 }}
      >
        ← Back to Home
      </Button>
    </Box>
  );
};

export default Step5_Confirmation;