import React, { useEffect, useState } from "react";
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
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar
} from "@mui/material";
import {
  CheckCircle,
  CalendarToday,
  AccessTime,
  LocationOn,
  LocalShipping,
  Elevator,
  DirectionsCar,
  Receipt,
  CurrencyRupee,
  Email,
  Download,
  Inventory2,
  Route as RouteIcon,
  ArrowForward,
  VerifiedUser
} from "@mui/icons-material";
import AxiosClient from "../AxiosClient";
import {generateBookingConfirmationPDF as GenerateQuotationPDF } from "./generateQuotationPDF";
import { sendQuotationEmail } from "./EmailService";
import ValidationDialog from "../pages/ValidationDialog";
import { Volume } from "lucide-react";

const Step3_ReviewBooking = ({
  bookingData,
  onUpdate,
  onNext,
  onBack,
  distance,
  shiftingDate,
  fromAddress,
  toAddress,
  userId,
  addressId,
  timeSlots = [],
  priceCalculateCitywise  ,
}) => {
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [priceBreakdown, setPriceBreakdown] = useState({
    basePrice: 0,
    floorCharge: 0,
    roadCharge: 0,
    total: 0
  });
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [quotationDialogOpen, setQuotationDialogOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [sendingQuotation, setSendingQuotation] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  // Calculate total CFT from selected items
  const totalCFT = bookingData.selectedItems.reduce(
    (sum, item) => sum + (item.quantity * (item.sizeCFT || 0)),
    0
  );

  useEffect(() => {
    calculatePrice();
  }, [distance, totalCFT, bookingData.serviceLift, bookingData.selectedFloor, bookingData.vanAccessible, bookingData.roadDistance, priceCalculateCitywise]);

  const calculatePrice = async () => {
    const { serviceLift,serviceLiftdrop, selectedFloor, vanAccessible, roadDistance } = bookingData;
    
    if (!distance || distance <= 0 || totalCFT <= 0 || bookingData.selectedItems.length === 0) {
  setPriceLoading(false);
  setValidationMessage("Please contact support team at +91 90715 35535.");
  setValidationOpen(true);
  return;
}
    setPriceLoading(true);
    setError(null);
    
    try {
      const dist = parseInt(distance, 10) || 0;
      const cft = parseInt(totalCFT, 10) || 0;
      const response = await AxiosClient.get(
        `/Price/GetPrice?distance=${dist}&cftTotal=${cft}&activeTab=${priceCalculateCitywise }`
      );
      
  if (response.status === 200) {

        //  ADDED: handle failed / zero price from backend
  if (!response.data || !response.data.price || response.data.price <= 0) {
      setPriceLoading(false);
      setValidationMessage("Please contact support team at +91 90715 35535.");
      setValidationOpen(true);
    return;
    }

        let basePrice = response.data.price || 0;
        let floorCharge = 0;
        let roadCharge = 0;

        const calculateExtraCharge = (distance) => {
                if (!distance) return 0;
              return (distance / 50) * 200;
         };

  
          floorCharge =  selectedFloor===0 ? selectedFloor * 200 : 0;    
    
        // if (vanAccessible === "no" && roadDistance) {
        //   roadCharge =  vanAccessible === "no"
        //             ? calculateExtraCharge(roadDistance): 0;
        //}
        const pickupLiftCharge =  serviceLift === "no" ? 500 : 0;

        const dropLiftCharge = serviceLiftdrop === "no" ? 500 : 0;

        const totalPrice = basePrice + floorCharge + roadCharge + pickupLiftCharge + dropLiftCharge;
        
        setCalculatedPrice(totalPrice);
        setPriceBreakdown({
          basePrice: basePrice,
          floorCharge,
          roadCharge,
          total: totalPrice
        });

        onUpdate({ 
          price: totalPrice,
          totalCFT: totalCFT 
        });
      }

    } catch (error) {
      console.error("Price calculation error:", error);
      //setError("Failed to calculate price. Please try again.");
       setValidationOpen(true);
       setValidationMessage(" Please contact support team at +91 9071535535.");
      //setSnackbarOpen(true);
    } finally {
      setPriceLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    if (calculatedPrice <= 0) {
      setError("Please wait for price calculation or check your selections.");
      setSnackbarOpen(true);
      return;
    }
    
    if (bookingData.selectedItems.length === 0) {
      setError("Please select at least one item.");
      setSnackbarOpen(true);
      return;
    }
    
    if (!bookingData.selectedTimeSlot) {
      setError("Please select a pickup time slot.");
      setSnackbarOpen(true);
      return;
    }

    createBooking();
  };

  const createBooking = async () => {
    const { selectedItems, selectedTimeSlot, serviceLift, selectedFloor, vanAccessible, roadDistance, roadDetails } = bookingData;

    const bookingDetails = {
      userID: parseInt(userId, 10),
      sourceAddressID: addressId,
      destinationAddressID: addressId,
      pickupDate: new Date(shiftingDate).toISOString(),
      pickupTimeSlotID: selectedTimeSlot || 1,
      status: "Pending",
      totalAmount: calculatedPrice,
      bookingAmountPaid: 0.0,
      quotationNumber :"",
      totalVolume: totalCFT,
      bookingItemList: selectedItems.map(item => ({
        itemID: item.itemID,
        quantity: item.quantity
       
      })),
      additionalServices: {
        serviceLift: serviceLift === "yes",
        floorNumber: selectedFloor || 0,
        vanAccessible: vanAccessible === "yes",
        roadDistance: roadDistance || "",
        roadDetails: roadDetails || ""
      }
    };

    try {
      setLoading(true);
      const response = await AxiosClient.post(
        "/booking/CreateBooking",
        bookingDetails,
        { headers: { "Content-Type": "application/json" } }
      );
      
      if (response.status === 200) {
        onUpdate({ bookingId: response.data.bookingID,quotationNumber:response.data.quotationNumber });
        onNext();
      }
    } catch (error) {
      // console.error("Booking creation error:", error);
      setError("Failed to create booking. Please try again.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGetQuotation = () => {
    setQuotationDialogOpen(true);
  };

  const handleSendQuotation = async () => {
    if (!customerEmail || !customerEmail.includes('@')) {
      setError("Please enter a valid email address.");
      setSnackbarOpen(true);
      return;
    }

    if (!customerName.trim()) {
      setError("Please enter your name.");
      setSnackbarOpen(true);
      return;
    }

    setSendingQuotation(true);
    
    try {
      // Generate PDF
      const pdfBlob = await GenerateQuotationPDF({
        ...bookingData,
        price: calculatedPrice,
        bookingId: bookingData.bookingId || `PACKY-${Date.now()}`,
        shiftingDate,
        fromAddress,
        toAddress,
        distance,
        serviceLift,
        serviceLiftdrop,
      }, customerName, customerEmail);

      if (!pdfBlob) {
        throw new Error("Failed to generate PDF");
      }

      // Send email
      const result = await sendQuotationEmail({
        recipientEmail: customerEmail,
        customerName: customerName,
        quotationNumber: bookingData.quotationNumber ,// `PACKY${bookingData.bookingId || Date.now()}`,
        pickupDate: new Date(shiftingDate).toLocaleDateString('en-IN'),
        pickupTime: timeSlots.find(s => s.timeSlotID === bookingData.selectedTimeSlot)?.timeSlotName || "Not specified",
        totalAmount: `₹${calculatedPrice.toLocaleString('en-IN')}`,
        pdfBlob: pdfBlob,
        bookingId: bookingData.bookingId || Date.now(),
        userId: userId,
        customerPhone: "",
        fromAddress: fromAddress || '',
        toAddress: toAddress || '',
        distance: distance || 0,
        totalCFT: totalCFT,
        totalItems: bookingData.selectedItems.length,
        type: 'quotation'
      });

      if (result.success) {
        setError("✅ Quotation sent to your email!");
        setSnackbarOpen(true);
        setQuotationDialogOpen(false);
        
        // Download PDF as backup
        handleDownloadPDF(pdfBlob, `Quotation_QM-${bookingData.bookingId || Date.now()}.pdf`);
      } else {
        setError(`⚠️ ${result.error || "Failed to send email"}`);
        setSnackbarOpen(true);
        // Download PDF as fallback
        handleDownloadPDF(pdfBlob, `Quotation_QM-${bookingData.bookingId || Date.now()}.pdf`);
      }
    } catch (error) {
      console.error("Quotation error:", error);
      setError("Failed to send quotation. Please try again.");
      setSnackbarOpen(true);
    } finally {
      setSendingQuotation(false);
    }
  };

  const handleDownloadPDF = (pdfBlob, filename) => {
    if (!pdfBlob) return false;
    
    try {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      return false;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getTimeSlotName = () => {
    if (!bookingData.selectedTimeSlot) return "Not selected";
    
    if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
      return "Selected";
    }
    
    const slot = timeSlots.find(s => s.timeSlotID === bookingData.selectedTimeSlot);
    return slot ? slot.timeSlotName : "Selected";
  };

  const formatAddress = (address) => {
    if (!address) return "Not specified";
    const parts = address.split(',');
    return parts.slice(0, 2).join(',') + (parts.length > 2 ? '...' : '');
  };

  const formattedShiftingDate = shiftingDate
    ? new Date(shiftingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : "Not selected";

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={error?.startsWith('✅') ? "success" : "error"} sx={{ width: '100%', borderRadius: 2 }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Quotation Dialog */}
      <Dialog
        open={quotationDialogOpen}
        onClose={() => setQuotationDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, minWidth: { xs: 'auto', sm: 420 } } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
          <Email color="primary" /> Get quotation by email
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Your Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            fullWidth
            margin="normal"
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            label="Email Address"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            Quotation PDF will be sent to your email. No payment required.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setQuotationDialogOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button 
            onClick={handleSendQuotation} 
            variant="contained"
            disabled={sendingQuotation}
            startIcon={sendingQuotation ? <CircularProgress size={20} /> : <Email />}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {sendingQuotation ? "Sending..." : "Send Quotation"}
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>

            {/* Route card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, rgba(25,118,210,0.06) 0%, rgba(25,118,210,0.01) 100%)'
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <RouteIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Your route
                </Typography>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <Box sx={{ flex: 1, p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <LocationOn color="success" fontSize="small" sx={{ mt: 0.3 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
                        PICKUP
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatAddress(fromAddress)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', color: 'text.disabled' }}>
                  <ArrowForward sx={{ transform: { xs: 'rotate(90deg)', sm: 'none' } }} />
                </Box>

                <Box sx={{ flex: 1, p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <LocationOn color="error" fontSize="small" sx={{ mt: 0.3 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
                        DROP-OFF
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatAddress(toAddress)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>

              {distance ? (
                <Chip
                  size="small"
                  icon={<DirectionsCar sx={{ fontSize: 16 }} />}
                  label={`${distance} km distance`}
                  sx={{ mt: 2, fontWeight: 600, bgcolor: 'primary.50', color: 'primary.main' }}
                />
              ) : null}
            </Paper>

            {/* Schedule + items row */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={0}
                  sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                      <CalendarToday sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Schedule
                    </Typography>
                  </Stack>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Pickup date</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{formattedShiftingDate}</Typography>
                    </Box>
                    <Divider />
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTime fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Time slot</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{getTimeSlotName()}</Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={0}
                  sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                      <Inventory2 sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Items & volume
                    </Typography>
                  </Stack>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Selected items</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {bookingData.selectedItems.length} item{bookingData.selectedItems.length === 1 ? '' : 's'}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Total volume</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{totalCFT} CFT</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>

            {/* Additional services */}
            <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                  <LocalShipping sx={{ fontSize: 16 }} />
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Additional services
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<Elevator sx={{ fontSize: 16 }} />}
                  label={`Pickup lift: ${bookingData.serviceLift === 'yes' ? 'Available' : 'Not available'}`}
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
                <Chip
                  icon={<Elevator sx={{ fontSize: 16 }} />}
                  label={`Drop lift: ${bookingData.serviceLiftdrop === 'yes' ? 'Available' : 'Not available'}`}
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
                {bookingData.selectedFloor !== undefined && bookingData.selectedFloor !== null ? (
                  <Chip
                    label={`Floor: ${bookingData.selectedFloor}`}
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                ) : null}
                <Chip
                  icon={<DirectionsCar sx={{ fontSize: 16 }} />}
                  label={`Van access: ${bookingData.vanAccessible === 'yes' ? 'Yes' : 'No'}`}
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              position: 'sticky',
              top: 20,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
              <CurrencyRupee /> Price summary
            </Typography>

            {priceLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                  Calculating price...
                </Typography>
              </Box>
            ) : (
              <>
                <Stack spacing={1.5} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Base shipping</Typography>
                    {/* <Typography variant="body2">₹{priceBreakdown.basePrice.toLocaleString('en-IN')}</Typography> */}
                     <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      ₹{calculatedPrice.toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                                    
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(25,118,210,0.12) 0%, rgba(25,118,210,0.04) 100%)',
                    border: '1px solid',
                    borderColor: 'primary.100'
                  }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>Total amount</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      ₹{calculatedPrice.toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                </Stack>

                <Alert
                  severity="info"
                  icon={<VerifiedUser fontSize="small" />}
                  sx={{ mb: 3, borderRadius: 2 }}
                >
                  <Typography variant="body2">
                    Please pay 10% of the total amount (₹{(calculatedPrice * 0.1).toLocaleString('en-IN')}) now to confirm your booking slot..
                    {/* Balance ₹{(calculatedPrice * 0.9).toLocaleString('en-IN')} payable at pickup. */}
                  </Typography>
                </Alert>

                {/* TWO BUTTONS: Get Quotation AND Confirm Booking */}
                <Stack spacing={2}>
                  {/* <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleGetQuotation}
                    disabled={loading || calculatedPrice === 0}
                    startIcon={<Email />}
                  >
                    Get Quotation by Email
                  </Button> */}
                  
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleCreateBooking}
                    disabled={loading || calculatedPrice === 0 || bookingData.selectedItems.length === 0 || !bookingData.selectedTimeSlot}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                    sx={{
                      borderRadius: 2,
                      py: 1.4,
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '1rem',
                      boxShadow: '0 4px 14px rgba(25,118,210,0.35)'
                    }}
                  >
                    {loading ? "Creating Booking..." : "Confirm & Proceed to Payment"}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={onBack}
                    disabled={loading}
                    sx={{ borderRadius: 2, py: 1.2, textTransform: 'none', fontWeight: 600 }}
                  >
                    Back to Services
                  </Button>
                </Stack>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
      <ValidationDialog
        open={validationOpen}
        message={validationMessage}
        onClose={() => setValidationOpen(false)}
      />
    </>
  );
};

export default Step3_ReviewBooking;