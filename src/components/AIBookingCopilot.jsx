import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Badge,
  Chip,
  Grid,
  Alert
} from "@mui/material";
import {
  AutoAwesome,
  Send,
  HelpOutline,
  CheckCircle,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Schedule,
  LocalShipping,
  Elevator,
  MeetingRoom,
  Close,
  ChevronRight,
  Info,
  Download,
  Payment,
  CalendarToday,
  LocationOn,
  Person,
  Email,
  Phone,
  DirectionsCar,
  Receipt
} from "@mui/icons-material";
import { motion, AnimatePresence } from "motion/react";
import AxiosClient from "../AxiosClient";
import { generateBookingConfirmationPDF } from "../pages/generateQuotationPDF";

const AIBookingCopilot = ({ bookingData, onUpdate, inventoryData, timeSlots }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Active step in the wizard flow
  const [activeStep, setActiveStep] = useState(1);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // 10 Guided Shifting Steps definitions
  const STEPS = [
    {
      id: 1,
      name: "Addresses",
      description: "Pickup & Delivery address",
      question: "First, could you tell me where you are shifting from and shifting to? Please mention both addresses.",
      placeholder: "e.g., Shifting from Sector 62 Noida to Indirapuram Ghaziabad",
      validate: (data) => data.fromAddress && data.toAddress,
      value: (data) => data.fromAddress && data.toAddress ? `${data.fromAddress.substring(0, 18)}... ➔ ${data.toAddress.substring(0, 18)}...` : null
    },
    {
      id: 2,
      name: "Shifting Items",
      description: "Furniture, boxes, appliances",
      question: "What household items, furniture, or box counts do you need to shift? (Note: You can also upload room videos or photos in the 'AI Room Scanner' below to auto-extract items!)",
      placeholder: "e.g., 3-seater sofa, double bed, fridge, 5 boxes",
      validate: (data) => data.selectedItems && data.selectedItems.length > 0,
      value: (data) => data.selectedItems && data.selectedItems.length > 0 
        ? `${data.selectedItems.reduce((sum, item) => sum + item.quantity, 0)} items selected` 
        : null
    },
    {
      id: 3,
      name: "Date & Timeslot",
      description: "When are you shifting",
      question: "What is your target shifting date, and which timeslot would you prefer? You can select any timeslot from our available list.",
      placeholder: "e.g., July 25th 2026 morning",
      validate: (data) => data.shiftingDate && data.selectedTimeSlot,
      value: (data) => {
        if (!data.shiftingDate) return null;
        const slotName = timeSlots?.find(s => s.timeSlotID === data.selectedTimeSlot)?.timeSlotName || "Slot Selected";
        return `${data.shiftingDate} (${slotName})`;
      }
    },
    {
      id: 4,
      name: "Pickup Lift & Floor",
      description: "Pickup accessibility",
      question: "At your pickup location, is there an elevator/service lift available? And what floor level is the house on?",
      placeholder: "e.g., 3rd floor with lift / Ground floor",
      validate: (data) => data.serviceLift !== null && data.selectedFloor !== null,
      value: (data) => data.selectedFloor !== null 
        ? `Fl. ${data.selectedFloor} (${data.serviceLift === 'yes' ? 'Lift' : 'No lift'})` 
        : null
    },
    {
      id: 5,
      name: "Drop Lift & Floor",
      description: "Delivery accessibility",
      question: "At your destination/delivery location, is there a service lift available? And what floor level is it?",
      placeholder: "e.g., 2nd floor with no lift",
      validate: (data) => data.serviceLiftdrop !== null && data.floordrop !== null,
      value: (data) => data.floordrop !== null 
        ? `Fl. ${data.floordrop} (${data.serviceLiftdrop === 'yes' ? 'Lift' : 'No lift'})` 
        : null
    },
    {
      id: 6,
      name: "Van Accessibility",
      description: "Truck access to door",
      question: "Is the moving truck or van able to park directly in front of the door? If no, what is the approximate distance from the road?",
      placeholder: "e.g., Yes, accessible / No, 50 meters away",
      validate: (data) => data.vanAccessible === "yes" || (data.vanAccessible === "no" && data.roadDistance),
      value: (data) => data.vanAccessible === 'yes' 
        ? "Accessible" 
        : data.vanAccessible === 'no' 
          ? `Not Accessible (${data.roadDistance || 'distance not set'})`
          : null
    },
    {
      id: 7,
      name: "Your Name",
      description: "Booking customer name",
      question: "Could you please tell me your full name to generate the quotation?",
      placeholder: "e.g., Jeet Kumar",
      validate: (data) => data.customerName && data.customerName.trim().length > 0,
      value: (data) => data.customerName || null
    },
    {
      id: 8,
      name: "Email & Mobile",
      description: "Booking communication channels",
      question: "Please share your email address and confirmation mobile number so we can register your UPI payment token.",
      placeholder: "e.g., customer@example.com, 9876543210",
      validate: (data) => data.customerEmail && data.customerPhone,
      value: (data) => data.customerEmail ? `${data.customerEmail} (${data.customerPhone})` : null
    },
    {
      id: 9,
      name: "Review & Book",
      description: "Quotation & UPI payment",
      question: "Awesome! We have collected all your details and calculated your best rates. You can download the estimated quotation PDF or proceed to book right now!",
      placeholder: "Ready to shift!",
      validate: () => true,
      value: (data) => `Calculated Price: ₹${calculatedPrice.toLocaleString("en-IN")}`
    }
  ];

  const initialBotGreeter = "Hello! I am your PackYatra AI Shifting Copilot. Let's get your move organized step-by-step! First, where are you shifting from and shifting to? Please mention both addresses.";

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: initialBotGreeter,
      stepId: 1
    }
  ]);

  // Determine active step based on bookingData completeness
  useEffect(() => {
    const nextIncomplete = STEPS.find(s => !s.validate(bookingData));
    if (nextIncomplete) {
      setActiveStep(nextIncomplete.id);
    } else {
      setActiveStep(9); // All completed
    }
  }, [bookingData]);

  // Handle active step changes to automatically post corresponding bot question
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const targetStep = STEPS.find(s => s.id === activeStep);
      if (targetStep && lastMsg.stepId !== activeStep && lastMsg.sender !== 'user') {
        setMessages(prev => [
          ...prev,
          {
            sender: "ai",
            text: targetStep.question,
            stepId: activeStep
          }
        ]);
      }
    }
  }, [activeStep]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Live Price Calculation in copilot
  useEffect(() => {
    const calculateLivePrice = async () => {
      const totalCFT = bookingData.selectedItems?.reduce(
        (sum, item) => sum + (item.quantity * (item.sizeCFT || 0)),
        0
      ) || 0;

      if (bookingData.distance > 0 && totalCFT > 0) {
        try {
          const dist = parseInt(bookingData.distance, 10) || 0;
          const cft = parseInt(totalCFT, 10) || 0;
          const activeTab = localStorage.getItem("activeTab") || "within";
          const res = await AxiosClient.get(
            `/Price/GetPrice?distance=${dist}&cftTotal=${cft}&activeTab=${activeTab}`
          );
          if (res.status === 200 && res.data?.price) {
            let basePrice = res.data.price;
            let pickupLiftCharge = bookingData.serviceLift === "no" ? 500 : 0;
            let dropLiftCharge = bookingData.serviceLiftdrop === "no" ? 500 : 0;
            let floorCharge = bookingData.selectedFloor === 0 ? 0 : (bookingData.selectedFloor || 0) * 200;
            const total = basePrice + pickupLiftCharge + dropLiftCharge + floorCharge;
            setCalculatedPrice(total);
            onUpdate({ price: total, totalCFT });
          }
        } catch (err) {
          console.error("Copilot pricing error:", err);
        }
      } else {
        setCalculatedPrice(0);
      }
    };
    calculateLivePrice();
  }, [
    bookingData.selectedItems,
    bookingData.distance,
    bookingData.serviceLift,
    bookingData.selectedFloor,
    bookingData.serviceLiftdrop,
    bookingData.floordrop,
    bookingData.vanAccessible,
    bookingData.roadDistance
  ]);

  // Send message processing with Gemini API
  const handleSend = async (textToSend = userInput) => {
    const text = textToSend.trim();
    if (!text) return;

    // Append user message
    setMessages((prev) => [...prev, { sender: "user", text, stepId: activeStep }]);
    if (textToSend === userInput) {
      setUserInput("");
    }
    setLoading(true);

    try {
      const validItems = inventoryData.map((item) => ({
        itemID: item.itemID,
        name: item.name,
        sizeCFT: item.sizeCFT,
        category: item.category
      }));

      const response = await fetch("/api/gemini/automated-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          validItems,
          timeSlots,
          currentBookingData: bookingData
        })
      });

      if (!response.ok) {
        throw new Error("Failed to process request with AI Booking service.");
      }

      const data = await response.json();
      if (data) {
        const updates = {};
        if (data.selectedItems && Array.isArray(data.selectedItems)) {
          updates.selectedItems = data.selectedItems;
        }
        if (data.serviceLift !== undefined) updates.serviceLift = data.serviceLift;
        if (data.selectedFloor !== undefined) updates.selectedFloor = data.selectedFloor;
        if (data.serviceLiftdrop !== undefined) updates.serviceLiftdrop = data.serviceLiftdrop;
        if (data.floordrop !== undefined) updates.floordrop = data.floordrop;
        if (data.vanAccessible !== undefined) updates.vanAccessible = data.vanAccessible;
        if (data.roadDistance !== undefined) updates.roadDistance = data.roadDistance;
        if (data.roadDetails !== undefined) updates.roadDetails = data.roadDetails;
        if (data.selectedTimeSlot !== undefined) updates.selectedTimeSlot = data.selectedTimeSlot;
        if (data.customerName) updates.customerName = data.customerName;
        if (data.customerEmail) updates.customerEmail = data.customerEmail;
        if (data.customerPhone) updates.customerPhone = data.customerPhone;
        
        if (data.fromAddress) {
          updates.fromAddress = data.fromAddress;
          localStorage.setItem("fromAddress", data.fromAddress);
        }
        if (data.toAddress) {
          updates.toAddress = data.toAddress;
          localStorage.setItem("toAddress", data.toAddress);
        }
        if (data.shiftingDate) {
          updates.shiftingDate = data.shiftingDate;
          localStorage.setItem("shiftingDate", data.shiftingDate);
        }

        onUpdate(updates);

        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.aiReply || "I've saved your details. What's next?",
            stepId: activeStep
          }
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I experienced a minor bump parsing that. Let's try again! Could you provide the requested details clearly?",
          stepId: activeStep
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Direct manual option updates (quick reply buttons)
  const handleQuickUpdate = (fieldName, fieldValue) => {
    const updates = { [fieldName]: fieldValue };
    if (fieldName === "fromAddress") localStorage.setItem("fromAddress", fieldValue);
    if (fieldName === "toAddress") localStorage.setItem("toAddress", fieldValue);
    if (fieldName === "shiftingDate") localStorage.setItem("shiftingDate", fieldValue);
    onUpdate(updates);
    
    // Auto post confirmation message
    setMessages(prev => [
      ...prev,
      {
        sender: "user",
        text: `Selected ${fieldName}: ${fieldValue}`,
        stepId: activeStep
      },
      {
        sender: "ai",
        text: `Got it! Saved ${fieldName} as ${fieldValue}.`,
        stepId: activeStep
      }
    ]);
  };

  // Download quotation PDF from Copilot
  const handleDownloadQuotation = async () => {
    try {
      const totalCFT = bookingData.selectedItems.reduce(
        (sum, item) => sum + (item.quantity * (item.sizeCFT || 0)),
        0
      );
      const confirmationPdf = await generateBookingConfirmationPDF({
        ...bookingData,
        price: calculatedPrice,
        transactionId: `EST-${Date.now()}`,
        shiftingDate: bookingData.shiftingDate,
        totalCFT,
        timeSlots
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
      console.error("PDF download failed from Copilot:", error);
    }
  };

  // Process PhonePe UPI checkout from Copilot
  const handleProceedToPayment = async () => {
    if (!bookingData.customerName || !bookingData.customerEmail || !bookingData.customerPhone) {
      setMessages(prev => [...prev, {
        sender: "ai",
        text: "Please make sure your name, email, and phone number are filled in first to proceed with the booking!",
        stepId: activeStep
      }]);
      return;
    }

    setPaymentLoading(true);
    try {
      const totalCFT = bookingData.selectedItems.reduce(
        (sum, item) => sum + (item.quantity * (item.sizeCFT || 0)),
        0
      );
      const tokenAmount = calculatedPrice * 0.1;
      const balanceAmount = calculatedPrice * 0.9;

      const bookingDetails = {
        userID: parseInt(localStorage.getItem("userID") || "1", 10),
        sourceAddressID: localStorage.getItem("addressID") || "1",
        destinationAddressID: localStorage.getItem("addressID") || "1",
        pickupDate: new Date(bookingData.shiftingDate).toISOString(),
        pickupTimeSlotID: bookingData.selectedTimeSlot || 1,
        status: "Pending",
        totalAmount: calculatedPrice,
        bookingAmountPaid: 0.0,
        quotationNumber: "",
        totalVolume: totalCFT,
        bookingItemList: bookingData.selectedItems.map(item => ({
          itemID: item.itemID,
          quantity: item.quantity
        })),
        additionalServices: {
          serviceLift: bookingData.serviceLift === "yes",
          floorNumber: bookingData.selectedFloor || 0,
          vanAccessible: bookingData.vanAccessible === "yes",
          roadDistance: bookingData.roadDistance || "",
          roadDetails: bookingData.roadDetails || ""
        }
      };

      const response = await AxiosClient.post(
        "/booking/CreateBooking",
        bookingDetails,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        const createdBookingId = response.data.bookingID;
        const quotationNumber = response.data.quotationNumber;

        onUpdate({
          bookingId: createdBookingId,
          quotationNumber: quotationNumber
        });

        const amountInPaise = Math.round(tokenAmount * 100);
        const payRes = await AxiosClient.post("/phonepe/pay", {
          amount: amountInPaise
        });

        const { merchantOrderId, redirectUrl } = payRes.data;

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
            customerName: bookingData.customerName,
            customerEmail: bookingData.customerEmail,
            customerPhone: bookingData.customerPhone,
            paymentMethod: "UPI",
            tokenAmount,
            balanceAmount,
            timeSlots
          })
        );

        window.location.href = redirectUrl;
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: "ai",
        text: "Could not initiate payment. Please contact Support team at +91 90715 35535.",
        stepId: activeStep
      }]);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Custom quick options container depending on current step
  const renderQuickControls = () => {
    switch (activeStep) {
      case 2:
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              💡 Add common items instantly (or upload photo/video in scanner below):
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap gap={1}>
              {inventoryData?.slice(0, 5).map(item => {
                const currentQty = bookingData.selectedItems?.find(i => i.itemID === item.itemID)?.quantity || 0;
                return (
                  <Chip
                    key={item.itemID}
                    label={`${item.name} (${currentQty})`}
                    onClick={() => {
                      const existing = [...(bookingData.selectedItems || [])];
                      const foundIdx = existing.findIndex(i => i.itemID === item.itemID);
                      if (foundIdx > -1) {
                        existing[foundIdx].quantity += 1;
                      } else {
                        existing.push({ itemID: item.itemID, name: item.name, sizeCFT: item.sizeCFT, quantity: 1, category: item.category });
                      }
                      onUpdate({ selectedItems: existing });
                    }}
                    color={currentQty > 0 ? "primary" : "default"}
                    size="small"
                  />
                );
              })}
            </Stack>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              🕒 Click to select an available shifting timeslot:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap gap={1}>
              {timeSlots?.map(slot => (
                <Chip
                  key={slot.timeSlotID}
                  label={slot.timeSlotName}
                  color={bookingData.selectedTimeSlot === slot.timeSlotID ? "primary" : "default"}
                  onClick={() => handleQuickUpdate("selectedTimeSlot", slot.timeSlotID)}
                  size="small"
                />
              ))}
              <Chip
                label="Tomorrow"
                variant="outlined"
                onClick={() => {
                  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                  handleQuickUpdate("shiftingDate", tomorrowStr);
                }}
                size="small"
              />
              <Chip
                label="Next Saturday"
                variant="outlined"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + (6 - d.getDay() + 7) % 7 || 7);
                  handleQuickUpdate("shiftingDate", d.toISOString().split('T')[0]);
                }}
                size="small"
              />
            </Stack>
          </Box>
        );
      case 4:
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              🏢 Pickup Lift & Floor Picker:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Button size="small" variant={bookingData.serviceLift === "yes" ? "contained" : "outlined"} onClick={() => onUpdate({ serviceLift: "yes" })}>
                Yes Lift
              </Button>
              <Button size="small" variant={bookingData.serviceLift === "no" ? "contained" : "outlined"} onClick={() => onUpdate({ serviceLift: "no" })}>
                No Lift
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap gap={0.5}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map(f => (
                <Chip
                  key={f}
                  label={f === 0 ? "Ground" : `Fl. ${f}`}
                  color={bookingData.selectedFloor === f ? "primary" : "default"}
                  onClick={() => onUpdate({ selectedFloor: f })}
                  size="small"
                />
              ))}
            </Stack>
          </Box>
        );
      case 5:
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              🏢 Drop-off Lift & Floor Picker:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Button size="small" variant={bookingData.serviceLiftdrop === "yes" ? "contained" : "outlined"} onClick={() => onUpdate({ serviceLiftdrop: "yes" })}>
                Yes Lift
              </Button>
              <Button size="small" variant={bookingData.serviceLiftdrop === "no" ? "contained" : "outlined"} onClick={() => onUpdate({ serviceLiftdrop: "no" })}>
                No Lift
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap gap={0.5}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map(f => (
                <Chip
                  key={f}
                  label={f === 0 ? "Ground" : `Fl. ${f}`}
                  color={bookingData.floordrop === f ? "primary" : "default"}
                  onClick={() => onUpdate({ floordrop: f })}
                  size="small"
                />
              ))}
            </Stack>
          </Box>
        );
      case 6:
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              🚚 Van Access:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Button size="small" variant={bookingData.vanAccessible === "yes" ? "contained" : "outlined"} onClick={() => onUpdate({ vanAccessible: "yes" })}>
                Yes, can park close
              </Button>
              <Button size="small" variant={bookingData.vanAccessible === "no" ? "contained" : "outlined"} onClick={() => onUpdate({ vanAccessible: "no" })}>
                No (long carry)
              </Button>
            </Stack>
            {bookingData.vanAccessible === "no" && (
              <Stack direction="row" spacing={1}>
                {["0-50m", "0-100m", "0-150m", "0-200m"].map(d => (
                  <Chip
                    key={d}
                    label={d}
                    color={bookingData.roadDistance === d ? "primary" : "default"}
                    onClick={() => onUpdate({ roadDistance: d })}
                    size="small"
                  />
                ))}
              </Stack>
            )}
          </Box>
        );
      case 8:
        return (
          <Box sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1}>
              <Chip
                label="Pre-fill my phone number"
                variant="outlined"
                onClick={() => {
                  const savedMobile = localStorage.getItem("mobile");
                  if (savedMobile) {
                    onUpdate({ customerPhone: savedMobile });
                  }
                }}
                size="small"
              />
            </Stack>
          </Box>
        );
      case 9:
        return (
          <Box sx={{ mt: 1.5, p: 2, borderRadius: 2, bgcolor: "indigo.50", border: "1px solid", borderColor: "primary.100" }}>
            <Typography variant="subtitle2" fontWeight={800} color="primary.dark" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
              <Receipt fontSize="small" /> Real-time Price Estimation Breakdown
            </Typography>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Total Shifting Volume:</Typography>
                <Typography variant="body2" fontWeight={700}>
                  {bookingData.selectedItems?.reduce((s, i) => s + (i.quantity * (i.sizeCFT || 0)), 0).toFixed(1)} CFT
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Calculated Estimate:</Typography>
                <Typography variant="body2" fontWeight={800} color="primary.main">
                  ₹{calculatedPrice.toLocaleString("en-IN")}
                </Typography>
              </Grid>
            </Grid>
            <Stack direction="column" spacing={1.5}>
              <Button
                variant="contained"
                fullWidth
                size="medium"
                startIcon={<Download />}
                onClick={handleDownloadQuotation}
                sx={{ textTransform: "none", fontWeight: 700, bgcolor: "success.main", "&:hover": { bgcolor: "success.dark" } }}
              >
                Download Estimated Quotation
              </Button>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={paymentLoading ? <CircularProgress size={20} color="inherit" /> : <Payment />}
                onClick={handleProceedToPayment}
                disabled={paymentLoading || calculatedPrice <= 0}
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)"
                }}
              >
                {paymentLoading ? "Setting up booking..." : `Book Now & Pay Token ₹${Math.round(calculatedPrice * 0.1).toLocaleString("en-IN")}`}
              </Button>
            </Stack>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "primary.100",
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "grey.50",
        mb: 4,
        boxShadow: "0 10px 30px rgba(79, 70, 229, 0.05)"
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          color: "white",
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer"
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              width: 36,
              height: 36,
              animation: "pulse 2s infinite"
            }}
          >
            <AutoAwesome sx={{ color: "white", fontSize: 20 }} />
          </Avatar>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: "-0.01em" }}>
                AI Shifting Copilot (Interactive Guide)
              </Typography>
              <Chip
                label="Step-by-Step"
                size="small"
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  fontSize: "10px",
                  height: 18,
                  fontWeight: 700
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ opacity: 0.9, display: "block" }}>
              Talk naturally or click options on each step to pre-fill your entire shift booking!
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" sx={{ color: "white" }}>
          {isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </IconButton>
      </Box>

      {/* BODY */}
      <Collapse in={isOpen}>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* LEFT CHAT PANEL */}
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  bgcolor: "white",
                  borderRadius: 2.5,
                  border: "1px solid",
                  borderColor: "grey.200",
                  height: 420,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden"
                }}
              >
                {/* MESSAGES VIEWPORT */}
                <Box
                  sx={{
                    flexGrow: 1,
                    p: 2.5,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    bgcolor: "grey.25"
                  }}
                >
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                        maxWidth: "85%"
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.8,
                          borderRadius: msg.sender === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                          bgcolor: msg.sender === "user" ? "primary.main" : "grey.100",
                          color: msg.sender === "user" ? "white" : "text.primary",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                        }}
                      >
                        <Typography variant="body2" sx={{ lineHeight: 1.6, fontWeight: msg.sender === "user" ? 500 : 400 }}>
                          {msg.text}
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
                  {loading && (
                    <Box sx={{ display: "flex", gap: 1, p: 1, alignItems: "center" }}>
                      <CircularProgress size={16} thickness={5} color="primary" />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Analyzing shifting instructions...
                      </Typography>
                    </Box>
                  )}
                  <div ref={chatEndRef} />
                </Box>

                <Divider />

                {/* CONTROLS & CHAT INPUT */}
                <Box sx={{ p: 2, bgcolor: "grey.50" }}>
                  {renderQuickControls()}
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !loading && userInput.trim()) {
                          handleSend();
                        }
                      }}
                      placeholder={STEPS.find(s => s.id === activeStep)?.placeholder || "Type your shifting requirements..."}
                      disabled={loading || activeStep === 9}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "white",
                          borderRadius: 2
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={() => handleSend()}
                      disabled={loading || !userInput.trim() || activeStep === 9}
                      sx={{
                        borderRadius: 2,
                        minWidth: 46,
                        px: 0,
                        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
                      }}
                    >
                      <Send fontSize="small" />
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </Grid>

            {/* RIGHT SIDEBAR: STEP-BY-STEP FLOW CHECKLIST */}
            <Grid item xs={12} md={5}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, height: 420, overflowY: "auto", bgcolor: "white" }}>
                <Typography variant="subtitle2" fontWeight={800} color="text.primary" sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircle color="primary" fontSize="small" />
                  Your Guided Shifting Sequence
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {STEPS.map((step) => {
                    const isCompleted = step.validate(bookingData);
                    const isActive = activeStep === step.id;
                    const parsedVal = step.value(bookingData);

                    return (
                      <ListItem
                        key={step.id}
                        button
                        onClick={() => setActiveStep(step.id)}
                        disabled={loading}
                        sx={{
                          mb: 1,
                          borderRadius: 2,
                          bgcolor: isActive ? "primary.50" : isCompleted ? "success.50" : "transparent",
                          border: "1px solid",
                          borderColor: isActive ? "primary.200" : isCompleted ? "success.100" : "grey.100",
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: isActive ? "primary.100" : "grey.50"
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {isCompleted ? (
                            <CheckCircle color="success" fontSize="small" />
                          ) : (
                            <Box
                              sx={{
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                border: "2px solid",
                                borderColor: isActive ? "primary.main" : "grey.400",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "10px",
                                fontWeight: 700,
                                color: isActive ? "primary.main" : "grey.500",
                                bgcolor: isActive ? "white" : "transparent"
                              }}
                            >
                              {step.id}
                            </Box>
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={isActive || isCompleted ? 700 : 500} color={isActive ? "primary.main" : "text.primary"}>
                              {step.name}
                            </Typography>
                          }
                          secondary={
                            parsedVal ? (
                              <Typography variant="caption" fontWeight={600} color="success.dark" sx={{ display: "block" }}>
                                {parsedVal}
                              </Typography>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                {step.description}
                              </Typography>
                            )
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AIBookingCopilot;
