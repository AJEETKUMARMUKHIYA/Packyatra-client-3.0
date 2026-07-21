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
  Alert,
  CircularProgress,
  TextField,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
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
  Person,
  Phone,
  Payment,
  Download
} from "@mui/icons-material";
import AxiosClient from "../AxiosClient";
import { generateBookingConfirmationPDF } from "./generateQuotationPDF";
import { sendBookingConfirmationEmail } from "./EmailService";
import ValidationDialog from "./ValidationDialog";

const Step2_ReviewAndPayment = ({
  bookingData,
  onUpdate,
  onBack,
  distance,
  shiftingDate,
  fromAddress,
  toAddress,
  userId,
  addressId,
  timeSlots = [],
  priceCalculateCitywise,
  loading: parentLoading
}) => {
  const [priceLoading, setPriceLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  // Customer info inputs
  const [customerName, setCustomerName] = useState(bookingData.customerName || "");
  const [customerEmail, setCustomerEmail] = useState(bookingData.customerEmail || "");
  const [customerPhone, setCustomerPhone] = useState(bookingData.customerPhone || localStorage.getItem("mobile") || "");
  const [errors, setErrors] = useState({});

  const [validationOpen, setValidationOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  const totalCFT = bookingData.selectedItems.reduce(
    (sum, item) => sum + (item.quantity * (item.sizeCFT || 0)),
    0
  );

  const tokenAmount = calculatedPrice * 0.1;
  const balanceAmount = calculatedPrice * 0.9;

  useEffect(() => {
    calculatePrice();
  }, [distance, totalCFT, bookingData.serviceLift, bookingData.selectedFloor, bookingData.serviceLiftdrop, bookingData.floordrop, bookingData.vanAccessible, bookingData.roadDistance, priceCalculateCitywise]);

  const calculatePrice = async () => {
    const { serviceLift, serviceLiftdrop, selectedFloor, vanAccessible, roadDistance } = bookingData;
    
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
        `/Price/GetPrice?distance=${dist}&cftTotal=${cft}&activeTab=${priceCalculateCitywise}`
      );
      
      if (response.status === 200) {
        if (!response.data || !response.data.price || response.data.price <= 0) {
          setPriceLoading(false);
          setValidationMessage("Please contact support team at +91 90715 35535.");
          setValidationOpen(true);
          return;
        }

        let basePrice = response.data.price || 0;
        let floorCharge = selectedFloor === 0 ? selectedFloor * 200 : 0;    
        let roadCharge = 0;
        const pickupLiftCharge = serviceLift === "no" ? 500 : 0;
        const dropLiftCharge = serviceLiftdrop === "no" ? 500 : 0;

        const totalPrice = basePrice + floorCharge + roadCharge + pickupLiftCharge + dropLiftCharge;
        
        setCalculatedPrice(totalPrice);
        onUpdate({ 
          price: totalPrice,
          totalCFT: totalCFT 
        });
      }
    } catch (error) {
      console.error("Price calculation error:", error);
      setValidationOpen(true);
      setValidationMessage("Please contact support team at +91 9071535535.");
    } finally {
      setPriceLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!customerName.trim()) {
      newErrors.name = "Full Name is required";
    }
    if (!customerEmail.trim()) {
      newErrors.email = "Email Address is required";
    } else if (!/\S+@\S+\.\S+/.test(customerEmail)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!customerPhone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(customerPhone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = async () => {
    if (!validateForm()) {
      setError("Please fill out all required fields correctly.");
      setSnackbarOpen(true);
      return;
    }

    if (calculatedPrice <= 0) {
      setError("Please wait for the price calculation to complete.");
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { selectedItems, selectedTimeSlot, serviceLift, selectedFloor, serviceLiftdrop, floordrop, vanAccessible, roadDistance, roadDetails } = bookingData;

      const bookingDetails = {
        userID: parseInt(userId, 10),
        sourceAddressID: addressId,
        destinationAddressID: addressId,
        pickupDate: new Date(shiftingDate).toISOString(),
        pickupTimeSlotID: selectedTimeSlot || 1,
        status: "Pending",
        totalAmount: calculatedPrice,
        bookingAmountPaid: 0.0,
        quotationNumber: "",
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

      // 1. Create the booking on the backend
      const response = await AxiosClient.post(
        "/booking/CreateBooking",
        bookingDetails,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        const createdBookingId = response.data.bookingID;
        const quotationNumber = response.data.quotationNumber;

        // Update local booking states
        onUpdate({
          bookingId: createdBookingId,
          quotationNumber: quotationNumber,
          customerName,
          customerEmail,
          customerPhone
        });

        // 2. Process PhonePe payment initiation
        const amountInPaise = Math.round(tokenAmount * 100);
        const payRes = await AxiosClient.post("/phonepe/pay", {
          amount: amountInPaise
        });

        const { merchantOrderId, redirectUrl } = payRes.data;

        // Save session payload for redirect callback to complete the state
        localStorage.setItem("merchantTransactionId", merchantOrderId);
        localStorage.setItem(
          "postPaymentPayload",
          JSON.stringify({
            bookingData: {
              ...bookingData,
              bookingId: createdBookingId,
              quotationNumber: quotationNumber,
              price: calculatedPrice,
              totalCFT: totalCFT
            },
            customerName,
            customerEmail,
            customerPhone,
            paymentMethod: "UPI",
            tokenAmount,
            balanceAmount,
            timeSlots
          })
        );

        // Redirect to PhonePe payment gateway
        window.location.href = redirectUrl;
      } else {
        throw new Error("Failed to create booking. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred. Please contact our support team.");
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleDownloadQuotation = async () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      setError("Please fill in your name and email to download the quotation.");
      setSnackbarOpen(true);
      return;
    }

    try {
      const timeSlotName = timeSlots.find(s => s.timeSlotID === bookingData.selectedTimeSlot)?.timeSlotName || "Selected";
      const confirmationPdf = await generateBookingConfirmationPDF({
        ...bookingData,
        price: calculatedPrice,
        transactionId: `EST-${Date.now()}`,
        customerName,
        customerEmail,
        customerPhone,
        shiftingDate,
        selectedTimeSlot: bookingData.selectedTimeSlot,
        timeSlots,
        fromAddress,
        toAddress,
        totalCFT,
        serviceLift: bookingData.serviceLift,
        serviceLiftdrop: bookingData.serviceLiftdrop
      });

      if (confirmationPdf) {
        const url = URL.createObjectURL(confirmationPdf);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Estimated_Quotation_PACKYATRA.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      setError("Failed to generate PDF quotation. Please try again.");
      setSnackbarOpen(true);
    }
  };

  const getTimeSlotName = () => {
    if (!bookingData.selectedTimeSlot) return "Not selected";
    const slot = timeSlots.find(s => s.timeSlotID === bookingData.selectedTimeSlot);
    return slot ? slot.timeSlotName : "Selected Slot";
  };

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>

      <Grid container spacing={3}>
        {/* Left Grid: Booking Review & Customer details */}
        <Grid item xs={12} lg={7}>
          <Stack spacing={3}>
            {/* Shifting Details Review */}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1}>
                <LocalShipping color="primary" /> Review Shifting Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <CalendarToday color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">Shifting Date</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={500} pl={3}>
                    {shiftingDate ? new Date(shiftingDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "Not Selected"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <AccessTime color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">Time Slot</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={500} pl={3}>
                    {getTimeSlotName()}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" alignItems="start" gap={1} mb={1}>
                    <LocationOn color="error" fontSize="small" sx={{ mt: 0.3 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Pickup Location</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {fromAddress || "Not set"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" alignItems="start" gap={1} mb={1}>
                    <LocationOn color="success" fontSize="small" sx={{ mt: 0.3 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Drop Location</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {toAddress || "Not set"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" fontWeight={600} mb={1}>Selected Options:</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap gap={1}>
                <Chip icon={<Elevator />} label={`Pickup Lift: ${bookingData.serviceLift === "yes" ? "Yes" : "No"} (${bookingData.selectedFloor === 0 ? "Ground" : "Floor " + bookingData.selectedFloor})`} variant="outlined" />
                <Chip icon={<Elevator />} label={`Drop Lift: ${bookingData.serviceLiftdrop === "yes" ? "Yes" : "No"} (${bookingData.floordrop === 0 ? "Ground" : "Floor " + bookingData.floordrop})`} variant="outlined" />
                <Chip icon={<DirectionsCar />} label={`Van Access: ${bookingData.vanAccessible === "yes" ? "Yes" : "No"}`} variant="outlined" />
              </Stack>
            </Paper>

            {/* Customer Details Form */}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1}>
                <Person color="primary" /> Contact Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2.5}>
                <TextField
                  label="Full Name"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  fullWidth
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: "action.active" }} />
                  }}
                />

                <TextField
                  label="Email Address"
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email || "Confirmation email with invoice will be sent here"}
                  fullWidth
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: "action.active" }} />
                  }}
                />

                <TextField
                  label="Phone Number"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  fullWidth
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: "action.active" }} />
                  }}
                />
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Grid: Price Summary & Pay Actions */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, borderRadius: 2, position: "sticky", top: 20 }}>
            <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1}>
              <CurrencyRupee color="primary" /> Price Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {priceLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4, flexDirection: "column", alignItems: "center" }}>
                <CircularProgress />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                  Calculating best rates...
                </Typography>
              </Box>
            ) : (
              <>
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography color="text.secondary">Base Relocation Rate</Typography>
                    <Typography fontWeight={500}>₹{calculatedPrice.toLocaleString("en-IN")}</Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography color="text.secondary">Total Shifting Volume</Typography>
                    <Typography fontWeight={500}>{totalCFT.toFixed(1)} CFT ({bookingData.selectedItems.length} items)</Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    p: 2,
                    borderRadius: 1,
                    bgcolor: "primary.50",
                    border: "1px solid",
                    borderColor: "primary.100"
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Total Estimate</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
                      ₹{calculatedPrice.toLocaleString("en-IN")}
                    </Typography>
                  </Box>
                </Stack>

                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="body2" fontWeight={500}>
                    Pay only 10% booking token (<b>₹{tokenAmount.toLocaleString("en-IN")}</b>) to lock your shift date & time. Balance payable at shifting.
                  </Typography>
                </Alert>

                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleProceedToPayment}
                    disabled={loading || calculatedPrice === 0}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                  >
                    {loading ? "Initializing Secure Payment..." : `Book Now & Pay ₹${tokenAmount.toLocaleString("en-IN")}`}
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleDownloadQuotation}
                    startIcon={<Download />}
                    sx={{ textTransform: "none" }}
                  >
                    Download Estimated Quotation
                  </Button>

                  <Button
                    variant="text"
                    fullWidth
                    onClick={onBack}
                    disabled={loading}
                    sx={{ textTransform: "none", color: "text.secondary" }}
                  >
                    ← Modify Items or Services
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

export default Step2_ReviewAndPayment;
