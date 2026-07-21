import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  Snackbar,
  Tabs,
  Tab
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import Step1_SelectItems from "./Step1_SelectItems";
import Step2_ServiceOptions from "./Step2_ServiceOptions";
import Step2_ReviewAndPayment from "./Step2_ReviewAndPayment";
import Step5_Confirmation from "./Step5_Confirmation";
import BookingProgress from "./BookingProgress";
import AxiosClient from "../AxiosClient";

/* ---------------- HELPER ---------------- */
const organizeInventoryByCategory = (data) => {
  return data.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push({
      itemID: item.itemID,
      name: item.name,
      sizeCFT: item.sizeCFT,
      category: item.category
    });
    return acc;
  }, {});
};

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
 const distance = searchParams.get("distance");
  const priceCalculateCitywise = searchParams.get("activeTab");
 
 // const priceCalculateTabwise = "within"; // Default value, can be changed based on your logic
  //const priceCalculateCitywise = "within"; // Default value, can be changed based on your logic

    const shiftingDate = localStorage.getItem("shiftingDate");
  const fromAddress = localStorage.getItem("fromAddress");
  const toAddress = localStorage.getItem("toAddress");
  const userId = localStorage.getItem("userID");
  const addressId = localStorage.getItem("addressID");
  const mobile = localStorage.getItem("mobile");
  const [currentStep, setCurrentStep] = useState(1);
  const [step1SubStep, setStep1SubStep] = useState("items"); // "items" | "services"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [inventoryData, setInventoryData] = useState([]);
  const [organizedInventory, setOrganizedInventory] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);

  /* ---------------- MAIN BOOKING STATE ---------------- */
  const [bookingData, setBookingData] = useState({
    selectedItems: [],
    categories: [],

    serviceLift: null,
    selectedFloor: null,
    vanAccessible: null,
    roadDistance: null,
    roadDetails: "",
    selectedTimeSlot: null,

    distance: 0,
    totalCFT: 0,
    price: 0,
    quotationNumber: null,
    customerName: "",
    customerEmail: "",
    customerPhone: mobile || "",
    paymentMethod: "UPI",
    fromAddress: fromAddress || "",
    toAddress: toAddress || "",
    bookingId: null,
    transactionId: null,
    bookingConfirmed: false,
    shiftingDate: shiftingDate || null,
    timeSlots: [],
  });

  /* ---------------- SCROLL TO TOP ON STEP CHANGE ---------------- */
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  }, [currentStep]);

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const inventoryResponse = await AxiosClient.get("/inventory/GetAllInventory");
      if (inventoryResponse.status === 200) {
        setInventoryData(inventoryResponse.data);
        const organized = organizeInventoryByCategory(inventoryResponse.data);
        setOrganizedInventory(organized);
        setBookingData(prev => ({ ...prev, categories: Object.keys(organized) }));
      }

      const slotResponse = await AxiosClient.get("/timeSlot/GetAllTimeSlots");
      if (slotResponse.status === 200) {
        setTimeSlots(slotResponse.data);
      }
    } catch {
      //showError("Failed to load booking data. Please refresh.");
    }
  };

  /* ---------------- STORE DISTANCE SAFELY ---------------- */
  useEffect(() => {
    if (distance && Number(distance) > 0) {
      setBookingData(prev => ({
        ...prev,
        distance: Number(distance)
      }));
    }
  }, [distance]);

  /* ---------------- TOTAL CFT ---------------- */
  useEffect(() => {
    const totalCFT = bookingData.selectedItems.reduce(
      (sum, i) => sum + i.quantity * (i.sizeCFT || 0),
      0
    );
    setBookingData(prev => ({ ...prev, totalCFT }));
  }, [bookingData.selectedItems]);

  /* ---------------- FINAL PRICE CALCULATION ---------------- */
  // useEffect(() => {
  //   const calculatePrice = async () => {
  //     const {
  //       totalCFT,
  //       distance,
  //       serviceLift,
  //       selectedFloor,
  //       vanAccessible
  //     } = bookingData;

  //     if (!totalCFT || !distance) return;

  //     try {
  //          const dist = parseInt(distance, 10) || 0;
  //         const cft = parseInt(totalCFT, 10) || 0;
  //       const res = await AxiosClient.get(
  //         `/Price/GetPrice?distance=${dist}&cftTotal=${cft}&activeTab=${priceCalculateTabwise}`
  //       );

  //       let basePrice = res.data?.price || 0;
  //       let floorCharge =
  //         serviceLift === "no" && selectedFloor ? selectedFloor * 200 : 0;
  //       let roadCharge = vanAccessible === "no" ? 500 : 0;

  //       setBookingData(prev => ({
  //         ...prev,
  //         price: basePrice + floorCharge + roadCharge
  //       }));
  //     } catch {
  //       //showError("Price calculation failed");
  //     }
  //   };

  //   calculatePrice();
  // }, [
  //   bookingData.totalCFT,
  //   bookingData.distance,
  //   bookingData.serviceLift,
  //   bookingData.selectedFloor,
  //   bookingData.vanAccessible
  // ]);

  /* ---------------- STEP HANDLERS ---------------- */
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (step1SubStep === "items") {
        if (!bookingData.selectedItems.length) {
          showError("Please select at least one item");
          return;
        }
        setStep1SubStep("services");
      } else {
        if (
          !bookingData.serviceLift ||
          !bookingData.vanAccessible ||
          !bookingData.selectedTimeSlot ||
          (bookingData.serviceLift === "no" && bookingData.selectedFloor === null) ||
          (bookingData.vanAccessible === "no" && !bookingData.roadDistance)
        ) {
          showError("Please complete all service options");
          return;
        }
        setCurrentStep(2);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setStep1SubStep("services");
    } else if (currentStep === 1 && step1SubStep === "services") {
      setStep1SubStep("items");
    }
  };

  const handleUpdateBookingData = (updates) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  };

  const showError = (msg) => {
    setError(msg);
    setSnackbarOpen(true);
  };

  /* ---------------- RENDER STEP ---------------- */
  const renderCurrentStep = () => {
    const commonProps = {
      bookingData,
      onUpdate: handleUpdateBookingData,
      onNext: handleNextStep,
      onBack: handlePreviousStep,
      loading
    };

    if (currentStep === 1) {
      if (step1SubStep === "items") {
        return (
          <Step1_SelectItems
            {...commonProps}
            inventoryData={inventoryData}
            organizedInventory={organizedInventory}
          />
        );
      } else {
        return (
          <Step2_ServiceOptions
            {...commonProps}
            distance={bookingData.distance}
            timeSlots={timeSlots}
          />
        );
      }
    }

    if (currentStep === 2) {
      return (
        <Step2_ReviewAndPayment
          {...commonProps}
          distance={bookingData.distance}
          shiftingDate={shiftingDate}
          fromAddress={fromAddress}
          toAddress={toAddress}
          userId={userId}
          addressId={addressId}
          timeSlots={timeSlots}
          priceCalculateCitywise={priceCalculateCitywise}
        />
      );
    }

    return null;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <BookingProgress currentStep={currentStep} />

      <Paper sx={{ mt: 3, p: 3, borderRadius: 3 }}>
        {currentStep === 1 && (
          <Tabs
            value={step1SubStep === "items" ? 0 : 1}
            onChange={(e, newValue) => {
              if (newValue === 0) {
                setStep1SubStep("items");
              } else {
                if (!bookingData.selectedItems.length) {
                  showError("Please select at least one item first");
                  return;
                }
                setStep1SubStep("services");
              }
            }}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="1. Select Items" sx={{ fontWeight: 600, fontSize: "14px", textTransform: "none" }} />
            <Tab label="2. Service Options" sx={{ fontWeight: 600, fontSize: "14px", textTransform: "none" }} />
          </Tabs>
        )}
        {renderCurrentStep()}
      </Paper>
    </Container>
  );
};

export default BookingPage;
