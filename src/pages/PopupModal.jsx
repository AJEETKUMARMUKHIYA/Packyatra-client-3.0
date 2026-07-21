import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Paper,
  Box,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel
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
  ArrowForward,
  Receipt,
  CreditCard,
  ConfirmationNumber,
  Phone,
  Person,
  ChevronLeft,
  ChevronRight,
  Print,
  ViewList,
  LocalShipping
} from "@mui/icons-material";
import AxiosClient from "../AxiosClient";
import { sendQuotationEmail, confirmBooking, validateEmail, validatePhone } from "./EmailService";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PopupModal = ({ 
  isOpen, 
  onClose, 
  price, 
  shiftingDate, 
  userId, 
  bookingId, 
  userData = {},
  addressData = {},
  selectedItems = [],
  onBookingConfirmed,
  timeSlots = [],
  selectedTimeSlot = 1
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // State Management
  const [selectedDate, setSelectedDate] = useState(() => {
    if (shiftingDate) {
      const date = new Date(shiftingDate);
      return !isNaN(date.getTime()) ? date : new Date();
    }
    return new Date();
  });
  
  const [selectedSlot, setSelectedSlot] = useState(() => {
    if (timeSlots && timeSlots.length > 0 && selectedTimeSlot) {
      const slot = timeSlots.find(s => s.timeSlotID === selectedTimeSlot);
      return slot ? slot.timeSlotName : "2:30 PM";
    }
    return "2:30 PM";
  });
  
  const [totalPrice, setTotalPrice] = useState(0.0);
  const [startIndex, setStartIndex] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [customerEmail, setCustomerEmail] = useState(userData.email || "");
  const [customerName, setCustomerName] = useState(userData.name || "");
  const [customerPhone, setCustomerPhone] = useState(userData.phone || "");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [pdfBlob, setPdfBlob] = useState(null);
  const [confirmationPdfBlob, setConfirmationPdfBlob] = useState(null);
  const [apiConnected, setApiConnected] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [formErrors, setFormErrors] = useState({});
  const [dates, setDates] = useState([]);
  const [transactionId, setTransactionId] = useState(null);
  const [ticketId, setTicketId] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
 const sendBookingConfirmationEmail = async (bookingData, pdfBlob) => {
  try {
    // Calculate total CFT
    const totalCFT = selectedItems.reduce((total, item) => 
      total + (item.quantity * (item.sizeCFT || 0)), 0
    );
    
    const emailData = {
      recipientEmail: bookingData.customerEmail,
      customerName: bookingData.customerName,
      bookingId: bookingData.bookingId,
      transactionId: bookingData.paymentTransactionId,
      ticketId: bookingData.ticketId || `TKT-${bookingData.bookingId}`,
      pickupDate: new Date(bookingData.pickupDate).toLocaleDateString('en-IN'),
      pickupTime: bookingData.pickupTime,
      totalAmount: `₹${bookingData.totalAmount.toLocaleString('en-IN')}`,
      paidAmount: `₹${bookingData.paymentAmount.toLocaleString('en-IN')}`,
      balanceAmount: `₹${(bookingData.totalAmount * 0.9).toLocaleString('en-IN')}`,
      pdfBlob: pdfBlob,  // This will be converted to base64
      type: 'booking_confirmation',
      fromAddress: bookingData.fromAddress || '',
      toAddress: bookingData.toAddress || '',
      distance: 0,
      totalCFT: totalCFT,
      totalItems: selectedItems.length,
      userId: bookingData.userId,
      customerPhone: bookingData.customerPhone,
      quotationNumber: `QM-${bookingData.bookingId}`
    };

    console.log("Sending booking confirmation email:", {
      recipientEmail: bookingData.customerEmail,
      bookingId: bookingData.bookingId,
      hasPdfBlob: !!pdfBlob
    });

    const result = await sendQuotationEmail(emailData);
    return result;
  } catch (error) {
    console.error('Confirmation email error:', error);
    return { success: false, error: 'Failed to send confirmation email' };
  }
};
const rollbackPayment = async (transactionId) => {
  try {
    const response = await AxiosClient.post(
      "/booking/RollbackPayment",
      {
        transactionID: transactionId,
        bookingID: bookingId
      },
      { headers: { "Content-Type": "application/json" } }
    );
    
    if (response.status === 200) {
      console.log("Payment rolled back successfully");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Payment rollback error:", error);
    return false;
  }
};
  // Stepper steps
  const steps = ["Schedule Pickup", "Generate PDF", "Complete Action", "Finish"];
  
  // Generate dates function
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

  // Initialize dates
  useEffect(() => {
    const datesArray = generateDates(new Date(shiftingDate));
    setDates(datesArray);
  }, [price, shiftingDate]);

  // Calculate total price
  useEffect(() => {
    const selectedDateInfo = dates.find(date => date.fullDate.toDateString() === selectedDate.toDateString());
    if (!selectedDateInfo) {
      setTotalPrice(price);
      return;
    }
    let finalPrice = selectedDateInfo.basePrice;
    if (selectedSlot === "9:30 AM") {
      finalPrice *= 1.05;
    }
    setTotalPrice(parseFloat(finalPrice.toFixed(2)));
  }, [selectedDate, selectedSlot, dates, price]);

  // Test API connection
  useEffect(() => {
    if (isOpen) {
      setApiConnected(true);
    }
  }, [isOpen]);

  // Navigation handlers
  const handleNext = async () => {
    setFormErrors({});
    
    if (activeStep === 0) {
      if (!selectedDate) {
        showSnackbar("Please select a pickup date", "warning");
        return;
      }
      setActiveStep(1);
      
    } else if (activeStep === 1) {
      await generateQuotationPDF();
      
    } else if (activeStep === 2) {
      const errors = {};
      
      if (!customerName.trim()) {
        errors.customerName = "Name is required";
      }
      
      if (!validateEmail(customerEmail)) {
        errors.customerEmail = "Valid email is required";
      }
      
      if (activeTab === 1 && !validatePhone(customerPhone)) {
       // errors.customerPhone = "Valid phone number is required";
      }
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        showSnackbar("Please fix the errors in the form", "warning");
        return;
      }
      
      if (activeTab === 0) {
        await handleSendEmail();
      } else {
        await handleConfirmBooking();
      }
      
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setFormErrors({});
  };

  // Generate Quotation PDF
  // const generateQuotationPDF = async () => {
  //   setLoading(true);
  //   try {
  //     const doc = new jsPDF({
  //       orientation: 'portrait',
  //       unit: 'mm',
  //       format: 'a4'
  //     });

  //     // Header
  //     doc.setFontSize(24);
  //     doc.setTextColor(33, 150, 243);
  //     doc.text("QUOTATION", 105, 20, { align: "center" });
      
  //     // Quotation Details
  //     doc.setFontSize(12);
  //     doc.setTextColor(0, 0, 0);
  //     doc.text(`Quotation No: QM-${bookingId}`, 20, 35);
  //     doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 20, 42);
      
  //     // Customer Details
  //     doc.text("Customer Details:", 20, 55);
  //     doc.text(`Name: ${customerName || "Customer"}`, 20, 62);
  //     doc.text(`Email: ${customerEmail}`, 20, 69);
  //     doc.text(`Phone: ${customerPhone || "N/A"}`, 20, 76);
      
  //     // Pickup Details
  //     doc.text("Pickup Details:", 20, 89);
  //     doc.text(`Date: ${selectedDate.toLocaleDateString('en-IN')}`, 20, 96);
  //     doc.text(`Time: ${selectedSlot}`, 20, 103);
      
  //     // Selected Items
  //     if (selectedItems.length > 0) {
  //       doc.text("Selected Items:", 20, 116);
  //       let yPos = 123;
  //       selectedItems.forEach((item, index) => {
  //         if (yPos < 250) {
  //           doc.text(`${item.name} x ${item.quantity} = ${item.quantity * item.sizeCFT} CFT`, 20, yPos);
  //           yPos += 7;
  //         }
  //       });
  //     }
      
  //     // Price Summary
  //     const yStart = selectedItems.length > 0 ? 140 + (selectedItems.length * 7) : 130;
  //     doc.text("Price Summary:", 20, yStart);
      
  //     doc.text(`Base Price: ₹${price.toLocaleString('en-IN')}`, 20, yStart + 7);
      
  //     const selectedDateInfo = dates.find(date => date.fullDate.toDateString() === selectedDate.toDateString());
  //     if (selectedDateInfo?.isWeekend) {
  //       doc.text(`Weekend Surcharge (5%): ₹${(price * 0.05).toLocaleString('en-IN')}`, 20, yStart + 14);
  //     }
      
  //     if (selectedSlot === "9:30 AM") {
  //       doc.text(`Early Morning Surcharge (5%): ₹${(totalPrice * 0.05).toLocaleString('en-IN')}`, 20, yStart + 21);
  //     }
      
  //     doc.setFontSize(16);
  //     doc.setFont(undefined, 'bold');
  //     doc.text(`Total Amount: ₹${totalPrice.toLocaleString('en-IN')}`, 20, yStart + 35);
      
  //     // Footer
  //     doc.setFontSize(10);
  //     doc.text("This is a quotation. No payment required at this stage.", 105, 280, { align: "center" });
  //     doc.text("Thank you for choosing our service!", 105, 287, { align: "center" });
      
  //     const pdfBlob = doc.output('blob');
  //     setPdfBlob(pdfBlob);
      
  //     showSnackbar("Quotation PDF generated successfully!", "success");
  //     setActiveStep(2);
      
  //   } catch (error) {
  //     console.error("PDF generation error:", error);
  //     showSnackbar("Failed to generate PDF", "error");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const generateQuotationPDF = async () => {
  setLoading(true);
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // ===== PAGE 1 =====
    // Header with company name
    doc.setFontSize(24);
    doc.setTextColor(33, 150, 243);
    doc.text("PACKYATRA PACKERS & MOVERS", 105, 20, { align: "center" });
    
    // Quotation details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Quotation No: PK-${bookingId}`, 20, 35);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 20, 42);
    
    // Customer Details
    doc.text("Customer Details:", 20, 55);
    doc.text(`Name: ${customerName || "Customer"}`, 20, 62);
    doc.text(`Email: ${customerEmail}`, 20, 69);
    doc.text(`Phone: ${customerPhone || "N/A"}`, 20, 76);
    
    // Pickup Details
    doc.text("Pickup Details:", 20, 89);
    doc.text(`Date: ${selectedDate.toLocaleDateString('en-IN')}`, 20, 96);
    doc.text(`Time: ${selectedSlot}`, 20, 103);
    
    // Pickup and Delivery Address
    doc.text("From:", 20, 116);
    doc.text("Address Line 1", 20, 123);
    doc.text("Address Line 2", 20, 130);
    doc.text("City, State, PIN", 20, 137);
    
    doc.text("To:", 20, 150);
    doc.text("Address Line 1", 20, 157);
    doc.text("Address Line 2", 20, 164);
    doc.text("City, State, PIN", 20, 171);
    
    // Price Table
    doc.setFontSize(14);
    doc.text("Particulars (Packaging and Shifting)", 20, 185);
    
    // Create a simple table
    let yPos = 192;
    doc.setFontSize(12);
    doc.text("Movement Charges", 20, yPos);
    doc.text(`₹ ${price.toLocaleString('en-IN')}`, 150, yPos);
    yPos += 7;
    
    doc.text("Labour Charges", 20, yPos);
    doc.text("Included", 150, yPos);
    yPos += 7;
    
    doc.text("Local Transportation Charges", 20, yPos);
    doc.text("Included", 150, yPos);
    yPos += 7;
    
    doc.text("Loading Unloading Charges", 20, yPos);
    doc.text("Included", 150, yPos);
    yPos += 7;
    
    doc.text("Addon Charges", 20, yPos);
    doc.text("₹ 0", 150, yPos);
    yPos += 7;
    
    // Total
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text("Gross Freight", 20, yPos + 5);
    doc.text(`₹ ${totalPrice.toLocaleString('en-IN')}`, 150, yPos + 5);
    doc.setFontSize(10);
    doc.text("(Price inclusive of GST wherever applicable)", 20, yPos + 12);
    
    // Payment Terms
    doc.setFontSize(12);
    doc.setTextColor(33, 150, 243);
    doc.text("Payment Terms & Conditions", 20, 260);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // Payment schedule table
    const payments = [
      { label: "Token Amount", amount: "₹ 3,000", when: "To be paid now" },
      { label: "At the time of pickup", amount: "₹ 10,705.50", when: "To be paid via Packyatra payment" },
      { label: "At the time of delivery", amount: "₹ 2,294.50", when: "To be paid via Packyatra payment" }
    ];
    
    let payYPos = 268;
    payments.forEach(payment => {
      doc.text(payment.label, 20, payYPos);
      doc.text(payment.amount, 80, payYPos);
      doc.text(payment.when, 120, payYPos);
      payYPos += 7;
    });
    
    // Company Footer
    doc.setFontSize(10);
    doc.text("Authorized Signatory,", 20, 290);
    doc.text("Packyatra Technologies Solutions Private Limited", 20, 297);
    doc.text("CIN: XXXXXXXX", 20, 304);
    doc.text("PAN: XXXXXXXX", 20, 311);
    doc.text("GST No: XXXXXXXXXXXXXX", 20, 318);
    
    // Ratings
    doc.text("10,000+ Happy Customers", 140, 290);
    doc.text("Rated 4.7/5", 140, 297);
    doc.text("Best Safety Standards", 140, 304);
    doc.text("100% Contactless Service", 140, 311);
    
    // ===== PAGE 2 =====
    doc.addPage();
    
    doc.setFontSize(16);
    doc.setTextColor(33, 150, 243);
    doc.text("Shifting Inventory Summary", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Please review and reach out to us for any questions.", 105, 28, { align: "center" });
    
    // Movement Info
    doc.setFontSize(12);
    doc.text("Movement Info:", 20, 40);
    doc.text(`CRN: PK-${bookingId}`, 20, 47);
    doc.text("Load Type: Sharing Load", 20, 54);
    doc.text(`Pickup Date: ${selectedDate.toLocaleDateString('en-IN')}`, 20, 61);
    doc.text(`Pickup Time: ${selectedSlot}`, 20, 68);
    doc.text("Delivery ETA: 3-5 Days", 20, 75);
    doc.text(`Total Volume: ${selectedItems.reduce((total, item) => total + (item.quantity * item.sizeCFT), 0)} CFT`, 20, 82);
    
    // Inventory Table
    doc.setFontSize(12);
    doc.text("Inventory (Name & Qty)", 20, 95);
    
    doc.setFontSize(10);
    let invYPos = 102;
    let col1X = 20;
    let col2X = 120;
    let currentCol = 1;
    
    selectedItems.forEach((item, index) => {
      if (invYPos > 270) {
        doc.addPage();
        invYPos = 20;
      }
      
      const xPos = currentCol === 1 ? col1X : col2X;
      doc.text(`${item.name}`, xPos, invYPos);
      doc.text(`${item.quantity}`, xPos + 80, invYPos);
      
      if (currentCol === 1) {
        currentCol = 2;
      } else {
        currentCol = 1;
        invYPos += 7;
      }
    });
    
    // ===== PAGE 3 =====
    doc.addPage();
    
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.text("RESTRICTED ITEMS:", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const restrictedItems = "We do not accept to move perishable goods, jewellery, arms & ammunition, hazardous material like crackers, explosives, chemicals, filled gas cylinder, battery acids, and inflammable oils; such as diesel, petrol, kerosene, gasoline, narcotics & counter brand items.";
    doc.text(restrictedItems, 20, 30, { maxWidth: 170 });
    
    // Quotation Exclusions
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.text("QUOTATION EXCLUSIONS:", 20, 70);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const exclusions = [
      "Any professional third party services such as electrician/plumber/carpenter, multiple pick-ups/deliveries, storage related costs in transit, vehicle/labour detention and overtime beyond normal working hours.",
      "Shuttle service due to access/parking restrictions, delivery to high rise buildings and use of extra manpower for walking stairs, hoist, handling of heavy objects like pianos, safes etc.",
      "Mandatory labour union charges, which are applicable at Mumbai or any other location, will be billed as actual or can be paid to the labour union directly.",
      "Any fees/permissions required to extend Packyatra shifting services at client's location like society tax, society permission, Society parking fees etc. will be borne by client."
    ];
    
    let exclYPos = 80;
    exclusions.forEach(exclusion => {
      doc.text(`• ${exclusion}`, 20, exclYPos, { maxWidth: 170 });
      exclYPos += 20;
    });
    
    // Terms & Conditions
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.text("Terms & Conditions:", 20, 170);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const terms = [
      "Please keep your Cash/Jewellery/Valuables in your custody.",
      "Packyatra would not be liable for any mishappening. Please intimate whether the vehicle can enter the premises/lane.",
      "The packing materials are company property and will be taken back on the same day of unloading.",
      "The above quotes do not include any dismantling (Carpenter Work) and fittings of electrical, or electronic appliances.",
      "Mathadi (Union Labour & related) charges have to be paid by the client and are not included in the quotation.",
      "The consignments accepted for dispatch through our lorries are carried entirely at the owner's risk, customers are advised to insure the consignment.",
      "Due to unforeseen circumstances if the movement is not executed, then the liability will be only to the token amount paid by the customer."
    ];
    
    let termsYPos = 180;
    terms.forEach(term => {
      doc.text(`• ${term}`, 20, termsYPos, { maxWidth: 170 });
      termsYPos += 15;
    });
    
    // Note
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const note = "PS: During the weekend and month end there will be many customers shifting at a time, hence kindly bear with our team, as we will try to get this streamlined.";
    doc.text(note, 20, 280, { maxWidth: 170 });
    
    // Company Contact Info
    doc.setTextColor(33, 150, 243);
    doc.text("© Packyatra Technologies Solutions Pvt Ltd", 105, 290, { align: "center" });
    doc.setTextColor(0, 0, 0);
    doc.text("6th Floor, Bren Mercury, Kaikondrahalli, Sarjapur Main Road, Bangalore - 560035.", 105, 297, { align: "center" });
    doc.text("Mobile +91 90715 35535 Email Id support@packyatra.com", 105, 304, { align: "center" });
    
    const pdfBlob = doc.output('blob');
    setPdfBlob(pdfBlob);
    
    showSnackbar("Packyatra Quotation PDF generated successfully!", "success");
    setActiveStep(2);
    
  } catch (error) {
    console.error("PDF generation error:", error);
    showSnackbar("Failed to generate PDF", "error");
  } finally {
    setLoading(false);
  }
};

  // Generate Confirmation PDF
  const generateConfirmationPDF = async (transactionId) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header
      doc.setFontSize(28);
      doc.setTextColor(46, 125, 50);
      doc.text("BOOKING CONFIRMED", 105, 25, { align: "center" });
      
      // Booking Details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Booking ID: QM-${bookingId}`, 20, 45);
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 20, 52);
      doc.text(`Transaction ID: ${transactionId}`, 20, 59);
      
      // Customer Details
      doc.setFont(undefined, 'bold');
      doc.text("Customer Details:", 20, 75);
      doc.setFont(undefined, 'normal');
      doc.text(`Name: ${customerName}`, 20, 82);
      doc.text(`Email: ${customerEmail}`, 20, 89);
      doc.text(`Phone: ${customerPhone}`, 20, 96);
      
      // Booking Details
      doc.setFont(undefined, 'bold');
      doc.text("Booking Details:", 20, 112);
      doc.setFont(undefined, 'normal');
      doc.text(`Pickup Date: ${selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`, 20, 119);
      doc.text(`Pickup Time: ${selectedSlot}`, 20, 126);
      doc.text(`From Address: ${addressData.fromAddress || 'Not specified'}`, 20, 133);
      doc.text(`To Address: ${addressData.toAddress || 'Not specified'}`, 20, 140);
      
      // Selected Items Table
      if (selectedItems.length > 0) {
        doc.setFont(undefined, 'bold');
        doc.text("Items to be Shipped:", 20, 156);
        
        const tableData = selectedItems.map(item => [
          item.name,
          item.quantity.toString(),
          `${item.sizeCFT} CFT`,
          `${(item.quantity * item.sizeCFT).toFixed(1)} CFT`
        ]);
        
        doc.autoTable({
          startY: 163,
          head: [['Item', 'Quantity', 'Size/Unit', 'Total CFT']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [33, 150, 243] },
          margin: { left: 20 }
        });
      }
      
      // Payment Details
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 170;
      doc.setFont(undefined, 'bold');
      doc.text("Payment Details:", 20, finalY);
      doc.setFont(undefined, 'normal');
      doc.text(`Payment Method: ${paymentMethod}`, 20, finalY + 7);
      doc.text(`Transaction ID: ${transactionId}`, 20, finalY + 14);
      doc.text(`Total Amount: ₹${totalPrice.toLocaleString('en-IN')}`, 20, finalY + 21);
      doc.text(`Token Paid (10%): ₹${(totalPrice * 0.1).toLocaleString('en-IN')}`, 20, finalY + 28);
      doc.text(`Balance Payable: ₹${(totalPrice * 0.9).toLocaleString('en-IN')}`, 20, finalY + 35);
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Please carry this confirmation and ID proof during pickup.", 105, 280, { align: "center" });
      doc.text("Thank you for choosing our service!", 105, 287, { align: "center" });
      
      return doc.output('blob');
    } catch (error) {
      console.error("Confirmation PDF error:", error);
      return null;
    }
  };

  // Payment Processing
  const processPayment = async () => {
    if (!totalPrice || totalPrice <= 0) {
      return { success: false, error: "Invalid amount" };
    }
    
    try {
      const tokenAmount = totalPrice * 0.1;
      const generatedTransactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const paymentDetails = {
        userID: parseInt(userId, 10),
        bookingID: bookingId,
        amount: parseFloat(tokenAmount.toFixed(2)),
        paymentStatus: "Partial Paid",
        transactionID: generatedTransactionId,
        paymentDate: new Date().toISOString(),
        paymentMethod: paymentMethod
      };

      const response = await AxiosClient.post(
        "/booking/ProcessPayment",
        paymentDetails,
        { headers: { "Content-Type": "application/json" } }
      );
      
      if (response.status === 200) {
        setTransactionId(generatedTransactionId);
        return { 
          success: true, 
          transactionId: generatedTransactionId,
          amount: tokenAmount,
          fullAmount: totalPrice
        };
      } else {
        return { success: false, error: "Payment processing failed" };
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      return { success: false, error: "Payment gateway error" };
    }
  };

 // Send Email
const handleSendEmail = async () => {
  setLoading(true);
  
  try {
    // Calculate total CFT from selected items
    const totalCFT = selectedItems.reduce((total, item) => 
      total + (item.quantity * (item.sizeCFT || 0)), 0
    );
    
    const emailData = {
      recipientEmail: customerEmail,
      customerName: customerName,
      quotationNumber: `QM-${bookingId}`,
      pickupDate: selectedDate.toLocaleDateString('en-IN'),
      pickupTime: selectedSlot,
      totalAmount: `₹${totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      pdfBlob: pdfBlob,  // This will be converted to base64 in EmailService
      bookingId: bookingId,
      userId: userId,
      customerPhone: customerPhone,
      fromAddress: addressData.fromAddress || '',
      toAddress: addressData.toAddress || '',
      distance: addressData.distance || 0,
      totalCFT: totalCFT,
      totalItems: selectedItems.length,
      type: 'quotation'
    };

    console.log("Sending email with data:", {
      recipientEmail: customerEmail,
      bookingId: bookingId,
      hasPdfBlob: !!pdfBlob
    });

    const result = await sendQuotationEmail(emailData);
    
    console.log("Email result:", result);
    
    if (result.success) {
      showSnackbar("✅ Quotation sent to your email!", "success");
      handleDownloadPDF(pdfBlob, `Quotation_QM-${bookingId}.pdf`);
      setActiveStep(3);
    } else {
      showSnackbar(`⚠️ ${result.error || "Failed to send email"}`, "warning");
      // Fallback: Download PDF
      handleDownloadPDF(pdfBlob, `Quotation_QM-${bookingId}.pdf`);
      showSnackbar("PDF downloaded as backup", "info");
    }
    
  } catch (error) {
    console.error('Email error:', error);
    showSnackbar("Failed to send email. Downloading PDF...", "error");
    handleDownloadPDF(pdfBlob, `Quotation_QM-${bookingId}.pdf`);
  } finally {
    setLoading(false);
  }
};

 const handleConfirmBooking = async () => {
  setLoading(true);
  setFormErrors({});
  
  try {
    // Validate required fields
    if (!customerName.trim()) {
      setFormErrors({ customerName: "Name is required" });
      showSnackbar("Please enter your name", "error");
      setLoading(false);
      return;
    }
    
    if (!validateEmail(customerEmail)) {
      setFormErrors({ customerEmail: "Valid email is required" });
      showSnackbar("Please enter a valid email", "error");
      setLoading(false);
      return;
    }
    
    // if (!validatePhone(customerPhone)) {
    //   setFormErrors({ customerPhone: "Valid phone number is required" });
    //   showSnackbar("Please enter a valid phone number", "error");
    //   setLoading(false);
    //   return;
    // }

    // Step 1: Process Payment
    const paymentResult = await processPayment();
    
    if (!paymentResult.success) {
      showSnackbar(`❌ Payment failed: ${paymentResult.error}`, "error");
      setLoading(false);
      return;
    }

    // Step 2: Generate booking confirmation PDF
    const confirmationPdf = await generateConfirmationPDF(paymentResult.transactionId);
    setConfirmationPdfBlob(confirmationPdf);
    
    // Step 3: Update booking in database
    const bookingData = {
      bookingId: bookingId,
      userId: parseInt(userId, 10),
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      pickupDate: selectedDate.toISOString(),
      pickupTime: selectedSlot,
      totalAmount: totalPrice,
      paymentMethod: paymentMethod,
      paymentAmount: totalPrice * 0.1,
      paymentTransactionId: paymentResult.transactionId,
      paymentStatus: "Partial Paid",
      bookingStatus: "Confirmed",
      fromAddress: addressData.fromAddress || '',
      toAddress: addressData.toAddress || '',
      selectedItems: selectedItems,
      quotationNumber: `QM-${bookingId}`
    };

    // Call your existing confirmBooking function
    const result = await confirmBooking(bookingData);
    
    if (result.success) {
      // Step 4: Send confirmation email
      if (apiConnected) {
        const emailResult = await sendBookingConfirmationEmail(bookingData, confirmationPdf);
        if (!emailResult.success) {
          showSnackbar(`⚠️ ${emailResult.error}`, "warning");
        }
      }
      
      // Step 5: Update state
      setBookingConfirmed(true);
      setPaymentSuccess(true);
      setTransactionId(paymentResult.transactionId);
      setTicketId(`TKT-${bookingId}`);
      
      showSnackbar("✅ Booking confirmed successfully!", "success");
      
      // Call parent callback if provided
      if (onBookingConfirmed) {
        onBookingConfirmed({
          ...bookingData,
          confirmationId: result.confirmationId || bookingId,
          transactionId: paymentResult.transactionId
        });
      }
      
      setActiveStep(3);
      
    } else {
      showSnackbar(`❌ ${result.error || "Failed to confirm booking"}`, "error");
      // Rollback payment if booking confirmation fails
      await rollbackPayment(paymentResult.transactionId);
    }
    
  } catch (error) {
    console.error('Booking confirmation error:', error);
    showSnackbar("Failed to confirm booking. Please try again.", "error");
  } finally {
    setLoading(false);
  }
};

  // Date navigation
  const handleScrollRight = () => {
    if (startIndex + (isMobile ? 3 : 4) < dates.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const handleScrollLeft = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  // Helper functions
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDownloadPDF = (pdfData, filename) => {
    if (!pdfData) return false;
    
    try {
      const url = URL.createObjectURL(pdfData);
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

  // Render Booking Details
  const renderBookingDetails = () => (
    <Card sx={{ mb: 3, borderLeft: '4px solid', borderColor: 'primary.main' }}>
      <CardContent>
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          mb: 2,
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Receipt />
          Booking Summary
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Booking ID
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              QM-{bookingId}
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Pickup Date
            </Typography>
            <Typography variant="body1">
              {selectedDate.toLocaleDateString('en-IN')}
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Pickup Time
            </Typography>
            <Typography variant="body1">
              {selectedSlot}
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Total Amount
            </Typography>
            <Typography variant="body1" fontWeight={600} color="success.main">
              ₹{totalPrice.toLocaleString('en-IN')}
            </Typography>
          </Grid>
          
          {selectedItems.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Items ({selectedItems.length})
              </Typography>
              <Box sx={{ mt: 1, maxHeight: 100, overflowY: 'auto' }}>
                {selectedItems.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.quantity} × {item.sizeCFT} CFT
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );

  // Render step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: isMobile ? 1 : 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center", mb: 3 }}>
              Confirm Your Shifting Date & Slot
            </Typography>
            
            {/* Booking Details */}
            {renderBookingDetails()}
            
            {/* Date Selection */}
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Select Pickup Date:
            </Typography>
            <Box sx={{ display: "flex", gap: 1, justifyContent: "center", alignItems: "center", mb: 3 }}>
              <IconButton 
                onClick={handleScrollLeft} 
                disabled={startIndex === 0}
                size="small"
                sx={{ color: startIndex === 0 ? 'grey.400' : 'primary.main' }}
              >
                <ChevronLeft />
              </IconButton>
              
              {dates.slice(startIndex, startIndex + (isMobile ? 3 : 4)).map((item, index) => (
                <Paper 
                  key={index} 
                  elevation={selectedDate.toDateString() === item.fullDate.toDateString() ? 4 : 1} 
                  sx={{ 
                    p: isMobile ? 1 : 2, 
                    textAlign: "center", 
                    cursor: "pointer", 
                    borderRadius: 2, 
                    transition: "0.3s", 
                    border: selectedDate.toDateString() === item.fullDate.toDateString() ? "2px solid" : "1px solid",
                    borderColor: selectedDate.toDateString() === item.fullDate.toDateString() ? 'primary.main' : 'grey.300',
                    bgcolor: selectedDate.toDateString() === item.fullDate.toDateString() ? 'primary.light' : 'white', 
                    color: item.isWeekend ? 'error.main' : 'inherit', 
                    "&:hover": { 
                      boxShadow: 4, 
                      transform: "scale(1.05)" 
                    },
                    minWidth: isMobile ? 70 : 80,
                    flex: 1
                  }} 
                  onClick={() => setSelectedDate(item.fullDate)}
                >
                  <Typography variant="body2" sx={{ 
                    fontWeight: "bold", 
                    color: item.isWeekend ? 'error.main' : 'inherit',
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}>
                    {item.day}
                  </Typography>
                  <Typography variant={isMobile ? "body1" : "h6"} sx={{ my: 0.5, fontWeight: 600 }}>
                    {item.dateText}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: "bold", color: "success.main" }}>
                    ₹ {Math.round(item.basePrice).toLocaleString('en-IN')}
                  </Typography>
                </Paper>
              ))}
              
              <IconButton 
                onClick={handleScrollRight} 
                disabled={startIndex + (isMobile ? 3 : 4) >= dates.length}
                size="small"
                sx={{ color: startIndex + (isMobile ? 3 : 4) >= dates.length ? 'grey.400' : 'primary.main' }}
              >
                <ChevronRight />
              </IconButton>
            </Box>

            {/* Time Slot Selection */}
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
              Select Pickup Slot:
            </Typography>
            <Box sx={{ 
              display: "flex", 
              justifyContent: "center", 
              gap: 1,
              flexWrap: isMobile ? "wrap" : "nowrap",
              mb: 3 
            }}>
              {timeSlots.length > 0 ? (
                timeSlots.map((slot, index) => (
                  <Button
                    key={slot.timeSlotID}
                    variant={selectedSlot === slot.timeSlotName ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => setSelectedSlot(slot.timeSlotName)}
                    sx={{
                      textTransform: "none",
                      fontWeight: "bold",
                      borderRadius: 2,
                      px: isMobile ? 1 : 2,
                      py: 1,
                      fontSize: isMobile ? "0.75rem" : "0.875rem",
                      flex: isMobile ? 1 : 'auto',
                      minWidth: isMobile ? '30%' : 'auto'
                    }}
                  >
                    {slot.timeSlotName}
                  </Button>
                ))
              ) : (
                ["9:30 AM", "2:30 PM", "5:00 PM"].map((slot, index) => (
                  <Button
                    key={index}
                    variant={selectedSlot === slot ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => setSelectedSlot(slot)}
                    sx={{
                      textTransform: "none",
                      fontWeight: "bold",
                      borderRadius: 2,
                      px: isMobile ? 1 : 2,
                      py: 1,
                      fontSize: isMobile ? "0.75rem" : "0.875rem",
                      flex: isMobile ? 1 : 'auto',
                      minWidth: isMobile ? '30%' : 'auto'
                    }}
                  >
                    {slot}
                  </Button>
                ))
              )}
            </Box>

            {/* Calendar Selection */}
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
              Or select from Calendar:
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              <DatePicker 
                selected={selectedDate} 
                onChange={(date) => { 
                  setSelectedDate(date); 
                  setDates(generateDates(date)); 
                  setStartIndex(0); 
                }} 
                minDate={new Date(shiftingDate)} 
                inline
                calendarClassName="custom-calendar"
              />
            </Box>

            {/* Price Summary */}
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              bgcolor: 'grey.50',
              textAlign: 'center',
              border: '1px solid',
              borderColor: selectedSlot === "9:30 AM" ? 'warning.main' : 'primary.main'
            }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                Total Price: <span style={{ 
                  color: selectedSlot === "9:30 AM" ? theme.palette.warning.main : theme.palette.success.main 
                }}>
                  ₹ {totalPrice.toLocaleString('en-IN')}
                </span>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedSlot === "9:30 AM" ? "Includes 5% early morning surcharge" : "Standard pricing"}
              </Typography>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ p: isMobile ? 1 : 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center", mb: 3 }}>
              Generate {activeTab === 0 ? "Quotation" : "Booking"} PDF
            </Typography>
            
            <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PictureAsPdf /> {activeTab === 0 ? "Quotation" : "Booking"} Preview
                </Typography>
                
                {renderBookingDetails()}
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Pickup Details</Typography>
                    <Typography variant="body1">
                      {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at {selectedSlot}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Price Breakdown</Typography>
                    <Stack spacing={0.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Base Price</Typography>
                        <Typography variant="body2">₹{price.toLocaleString('en-IN')}</Typography>
                      </Box>
                      
                      {selectedDate.getDay() === 0 || selectedDate.getDay() === 6 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Weekend Surcharge (5%)</Typography>
                          <Typography variant="body2" color="warning.main">+ ₹{(price * 0.05).toLocaleString('en-IN')}</Typography>
                        </Box>
                      ) : null}
                      
                      {selectedSlot === "9:30 AM" ? (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Early Morning Surcharge (5%)</Typography>
                          <Typography variant="body2" color="warning.main">+ ₹{(totalPrice * 0.05).toLocaleString('en-IN')}</Typography>
                        </Box>
                      ) : null}
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body1" fontWeight={600}>Total Amount</Typography>
                        <Typography variant="h6" color="success.main" fontWeight={700}>
                          ₹{totalPrice.toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              Click "Generate PDF" to create a downloadable {activeTab === 0 ? "quotation" : "booking confirmation"}. 
              This PDF will be sent to your email {activeTab === 1 ? "after payment confirmation" : ""}.
            </Alert>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: isMobile ? 1 : 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center", mb: 3 }}>
              Complete Your Action
            </Typography>
            
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={activeTab} onChange={handleTabChange} centered variant={isMobile ? "fullWidth" : "standard"}>
                <Tab label="Get Quotation" icon={<Email />} iconPosition="start" />
                <Tab label="Confirm Booking" icon={<ConfirmationNumber />} iconPosition="start" />
              </Tabs>
            </Box>
            
            {/* Common Form Fields */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Stack spacing={3}>
                  <TextField
                    label="Full Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    error={!!formErrors.customerName}
                    helperText={formErrors.customerName}
                    fullWidth
                    required
                    size={isMobile ? "small" : "medium"}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                  
                  <TextField
                    label="Email Address"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    error={!!formErrors.customerEmail}
                    helperText={formErrors.customerEmail}
                    fullWidth
                    required
                    size={isMobile ? "small" : "medium"}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                  
                  <TextField
                    label="Phone Number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    error={!!formErrors.customerPhone}
                    helperText={formErrors.customerPhone || "Required for booking confirmation"}
                    fullWidth
                    required={activeTab === 1}
                    size={isMobile ? "small" : "medium"}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
            
            {/* Tab-specific content */}
            {activeTab === 0 ? (
              <Card>
                <CardContent>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Quotation PDF will be sent to your email. No payment required.
                  </Alert>
                  <Typography variant="body2" color="text.secondary">
                    You'll receive the quotation for review. You can confirm booking later.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent>
                  <FormControl component="fieldset" sx={{ mb: 3 }}>
                    <FormLabel component="legend">Select Payment Method</FormLabel>
                    <RadioGroup
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      row={!isMobile}
                    >
                      <FormControlLabel value="UPI" control={<Radio />} label="UPI" />
                      <FormControlLabel value="Credit Card" control={<Radio />} label="Credit Card" />
                      <FormControlLabel value="Debit Card" control={<Radio />} label="Debit Card" />
                      <FormControlLabel value="Net Banking" control={<Radio />} label="Net Banking" />
                    </RadioGroup>
                  </FormControl>
                  
                  <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        Payment Summary
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Total Amount</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ₹{totalPrice.toLocaleString('en-IN')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Token Amount (10%)</Typography>
                          <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                            ₹{(totalPrice * 0.1).toLocaleString('en-IN')}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Pay Now (10% Token)
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
                            ₹{(totalPrice * 0.1).toLocaleString('en-IN')}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                  
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Pay 10% token to confirm booking. Balance payable at pickup.
                  </Alert>
                </CardContent>
              </Card>
            )}
            
            {/* API Status */}
            {apiConnected === false && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Email service is offline. PDF will be downloaded instead.
              </Alert>
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ p: isMobile ? 1 : 2 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'success.main' }}>
                {activeTab === 0 ? "Quotation Sent!" : "Booking Confirmed!"}
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                {activeTab === 0 
                  ? `Check ${customerEmail} for your quotation`
                  : `Booking confirmed! Details sent to ${customerEmail}`}
              </Typography>
            </Box>

            {/* Booking Ticket for Confirmed Bookings */}
            {activeTab === 1 && (
              <Card sx={{ 
                mb: 3, 
                border: '2px solid', 
                borderColor: 'success.main',
                background: 'linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%)'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    mb: 2, 
                    color: 'success.main',
                    textAlign: 'center'
                  }}>
                    🎫 BOOKING CONFIRMATION TICKET
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: 'white', 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        <Typography variant="caption" color="text.secondary">
                          BOOKING ID
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="primary.main">
                          QM-{bookingId}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: 'white', 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        <Typography variant="caption" color="text.secondary">
                          TRANSACTION ID
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="primary.main">
                          {transactionId || `TXN-${bookingId}`}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Customer Name</Typography>
                        <Typography variant="body2" fontWeight={600}>{customerName}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Pickup Date & Time</Typography>
                        <Typography variant="body2">
                          {selectedDate.toLocaleDateString('en-IN')} at {selectedSlot}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Total Amount</Typography>
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          ₹{totalPrice.toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Paid Amount (10% Token)</Typography>
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          ₹{(totalPrice * 0.1).toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                      
                      <Alert severity="success" sx={{ mt: 2 }}>
                        ✅ 10% token amount paid successfully! 
                        Balance ₹{(totalPrice * 0.9).toLocaleString('en-IN')} payable at pickup.
                      </Alert>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Quotation Summary */}
            {activeTab === 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                    Quotation Summary
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Quotation ID</Typography>
                    <Typography variant="body2" fontWeight={600}>QM-{bookingId}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Pickup Date</Typography>
                    <Typography variant="body2">{selectedDate.toLocaleDateString('en-IN')}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Pickup Time</Typography>
                    <Typography variant="body2">{selectedSlot}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Total Amount</Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  
                  <Alert severity="info">
                    This quotation is valid for 7 days. To confirm booking, please make 10% token payment.
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }} flexWrap={isMobile ? "wrap" : "nowrap"}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => handleDownloadPDF(
                  activeTab === 0 ? pdfBlob : confirmationPdfBlob, 
                  activeTab === 0 ? `Quotation_QM-${bookingId}.pdf` : `Booking_Confirmation_QM-${bookingId}.pdf`
                )}
                disabled={activeTab === 0 ? !pdfBlob : !confirmationPdfBlob}
                sx={{ mb: isMobile ? 1 : 0 }}
              >
                Download {activeTab === 0 ? 'Quotation' : 'Ticket'}
              </Button>
              <Button
                variant="contained"
                startIcon={<Print />}
                onClick={() => window.print()}
                sx={{ mb: isMobile ? 1 : 0 }}
              >
                Print {activeTab === 0 ? 'Summary' : 'Ticket'}
              </Button>
              {activeTab === 1 && (
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<ViewList />}
                  onClick={() => navigate('/my-bookings')}
                >
                  View All Bookings
                </Button>
              )}
            </Stack>
          </Box>
        );

      default:
        return null;
    }
  };

  // Get button text
  const getButtonText = () => {
    if (loading) return "Processing...";
    
    switch (activeStep) {
      case 0: return "Continue to PDF";
      case 1: return (activeTab === 0 ? pdfBlob : confirmationPdfBlob) ? "Continue to Next Step" : "Generate PDF";
      case 2: return activeTab === 0 ? "Send Quotation" : "Confirm & Pay (10%)";
      case 3: return "Finish";
      default: return "Continue";
    }
  };

  // Get button icon
  const getButtonIcon = () => {
    if (loading) return <CircularProgress size={20} />;
    
    switch (activeStep) {
      case 0: return <ArrowForward />;
      case 1: return <PictureAsPdf />;
      case 2: return activeTab === 0 ? <Send /> : <CreditCard />;
      case 3: return <CheckCircle />;
      default: return <ArrowForward />;
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
        PaperProps={{
          sx: { borderRadius: isMobile ? 0 : 2 }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
            {activeStep === 0 ? "Schedule Pickup" : 
             activeStep === 1 ? "Generate PDF" : 
             activeStep === 2 ? (activeTab === 0 ? "Send Quotation" : "Confirm Booking") : 
             "Complete"}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white', p: 0.5 }}>
            <Close />
          </IconButton>
        </DialogTitle>

        {/* Stepper */}
        {activeStep < 3 && (
          <Box sx={{ px: isMobile ? 1 : 3, pt: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: isMobile ? '0.75rem' : '0.875rem'
                    }
                  }}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

        <DialogContent sx={{ maxHeight: isMobile ? 'calc(100vh - 200px)' : '70vh', overflowY: 'auto' }}>
          {renderStepContent(activeStep)}
        </DialogContent>

        <DialogActions sx={{ 
          justifyContent: "space-between", 
          p: isMobile ? 2 : 3,
          borderTop: 1,
          borderColor: 'divider'
        }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
            startIcon={<ArrowBack />}
            sx={{ 
              visibility: activeStep === 0 ? 'hidden' : 'visible',
              minWidth: isMobile ? 'auto' : 100
            }}
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
            endIcon={getButtonIcon()}
            sx={{ 
              px: isMobile ? 3 : 4, 
              py: isMobile ? 1 : 1.5,
              fontWeight: 600,
              minWidth: isMobile ? 'auto' : 160
            }}
          >
            {getButtonText()}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PopupModal;