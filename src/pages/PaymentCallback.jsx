import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  Button
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/HourglassEmpty";
import { useNavigate } from "react-router-dom";

import AxiosClient from "../AxiosClient";
import { generateBookingConfirmationPDF } from "./generateQuotationPDF";
import { sendBookingConfirmationEmail } from "./EmailService";
import { is } from "date-fns/locale/is";

const PaymentCallback = () => {
  const [status, setStatus] = useState("CHECKING"); // CHECKING | SUCCESS | CANCELLED | FAILED | PENDING
  const [message, setMessage] = useState("Verifying payment, please wait...");
  const [transactionId, setTransactionId] = useState("");
  const [utr, setUtr] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const navigate = useNavigate();

  // 🔹 Main payment success handler - ORIGINAL CODE INTEGRATED
  const handleSuccessfulPayment = async (payload, txnId, utrNumber) => {
    try {
      const userId = parseInt(localStorage.getItem("userID"), 10);
     // const quotationNumber = `PACKY-${payload.bookingData.bookingId}`;
      // 1️⃣ Save payment
      await AxiosClient.post("/booking/ProcessPayment", {
        userID: userId,
        bookingID: payload.bookingData.bookingId,
        amount: payload.tokenAmount,
        paymentStatus: "Partial Paid",
        transactionID: txnId,
        utr: utrNumber, // ADDED: Include UTR
        paymentDate: new Date().toISOString(),
        paymentMethod: payload.paymentMethod || "UPI"
      });

      // 2️⃣ Update booking
      await AxiosClient.put(
        `/booking/Update/${payload.bookingData.bookingId}`,
        {
          bookingID: payload.bookingData.bookingId,
          bookingAmountPaid: payload.tokenAmount,
          status: "Partially Paid",
          totalAmount: payload.bookingData.price,
         // quotationNumber: quotationNumber, 
          isquotation: true
    
          
        }
      );

      if (userId && payload.customerEmail) {
  try {
    await AxiosClient.put(`/User/Update/${userId}`, {
      // ⚠️ DON'T send userID in body - it comes from URL
      name: payload.customerName,
      phoneNumber: payload.customerPhone || "",
      email: payload.customerEmail,
      password: "" // Send empty string if not changing
      // userID is NOT included here - it's in the URL
    });
    console.log("User updated successfully:", userId);
  } catch (err) {
    console.warn("User update failed (ignored):", {
      userId,
      error: err.response?.data || err.message,
      status: err.response?.status
    });
  }
}

      // 4️⃣ Generate PDF
      const timeSlotName =
        payload.timeSlots?.find(
          s => s.timeSlotID === payload.bookingData.selectedTimeSlot
        )?.timeSlotName || "Selected Time";

      const pdfBlob = await generateBookingConfirmationPDF({
        ...payload.bookingData,
        transactionId: txnId,
        utr: utrNumber, // ADDED: Include UTR in PDF
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone || "",
        shiftingDate: payload.bookingData.shiftingDate,
        selectedTimeSlot: payload.bookingData.selectedTimeSlot,
        timeSlots: payload.timeSlots || [],
        quotationNumber: quotationNumber
      });

      // 5️⃣ Send email (background)
      sendBookingConfirmationEmail({
        recipientEmail: payload.customerEmail,
        customerName: payload.customerName,
        bookingId: payload.bookingData.bookingId,
        transactionId: txnId,
        utr: utrNumber, // ADDED: Include UTR in email
        pickupDate: new Date(
          payload.bookingData.shiftingDate
        ).toLocaleDateString("en-IN"),
        pickupTime: timeSlotName,
        totalAmount: payload.bookingData.price,
        paidAmount: payload.tokenAmount,
        balanceAmount: payload.balanceAmount,
        pdfBlob,
        type: "booking_confirmation",
        fromAddress: payload.bookingData.fromAddress || "",
        toAddress: payload.bookingData.toAddress || "",
        distance: payload.bookingData.distance || 0,
        totalCFT: payload.bookingData.totalCFT || 0,
        totalItems: payload.bookingData.selectedItems?.length || 0
      }).catch(err => console.error("Email failed:", err));

      // 6️⃣ Save confirmation data
      sessionStorage.setItem(
        "bookingConfirmationData",
        JSON.stringify({
          bookingId: payload.bookingData.bookingId,
          transactionId: txnId,
          utr: utrNumber, // ADDED: Include UTR
          price: payload.bookingData.price,
          customerName: payload.customerName,
          customerEmail: payload.customerEmail,
          customerPhone: payload.customerPhone || "",
          shiftingDate: payload.bookingData.shiftingDate,
          selectedTimeSlot: payload.bookingData.selectedTimeSlot,
          fromAddress: payload.bookingData.fromAddress || "",
          toAddress: payload.bookingData.toAddress || "",
          distance: payload.bookingData.distance || 0,
          totalCFT: payload.bookingData.totalCFT || 0,
          selectedItems: payload.bookingData.selectedItems || [],
          confirmationPdfBlob: pdfBlob,
          quotationSent: true,
          tokenAmount: payload.tokenAmount,
          balanceAmount: payload.balanceAmount,
          timeSlots: payload.timeSlots || []
        })
      );

      // 7️⃣ Cleanup
      localStorage.removeItem("merchantTransactionId");
      localStorage.removeItem("postPaymentPayload");
      
    } catch (error) {
      console.error("Payment processing error:", error);
      throw error;
    }
  };

  // 🔹 Handle cancelled payment
  const handleCancelledPayment = async (merchantTransactionId) => {
    try {
      await AxiosClient.post("/phonepe/cancel-notify", {
        transactionId: merchantTransactionId
      });
    } catch (notifyError) {
      console.log("Cancellation notification failed (normal)");
    } finally {
      localStorage.removeItem("merchantTransactionId");
      localStorage.removeItem("postPaymentPayload");
    }
  };

  // 🔹 Extract UTR from payment details
  const extractUTRFromResponse = (responseData) => {
    try {
      const rawResponse = responseData?.debug?.rawResponse;
      if (rawResponse) {
        const parsed = JSON.parse(rawResponse);
        const paymentDetails = parsed?.PaymentDetails;
        
        if (paymentDetails && Array.isArray(paymentDetails)) {
          // Look for completed transaction
          const completedTxn = paymentDetails.find(
            detail => detail.State === "COMPLETED"
          );
          
          if (completedTxn?.SplitInstruments?.[0]?.Rail?.Utr) {
            return completedTxn.SplitInstruments[0].Rail.Utr;
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Error extracting UTR:", error);
      return null;
    }
  };

  // 🔹 Check if payment is actually successful despite API flag
  const isPaymentActuallySuccessful = (responseData) => {
    const rawResponse = responseData?.debug?.rawResponse;
    
    if (!rawResponse) return false;
    
    try {
      const parsed = JSON.parse(rawResponse);
      
      // Check 1: Main order state
      if (parsed.State === "COMPLETED") {
        // Check 2: Look for any completed payment
        const paymentDetails = parsed.PaymentDetails || [];
        const hasCompletedPayment = paymentDetails.some(
          detail => detail.State === "COMPLETED"
        );
        
        // Check 3: Look for UTR (optional but good indicator)
        const hasUTR = paymentDetails.some(
          detail => detail?.SplitInstruments?.[0]?.Rail?.Utr
        );
        
        return hasCompletedPayment || hasUTR;
      }
      
      return false;
    } catch (error) {
      console.error("Error parsing raw response:", error);
      return false;
    }
  };

  useEffect(() => {
    const runPaymentFlow = async () => {
      try {
        const merchantTransactionId = localStorage.getItem("merchantTransactionId");
        const payloadString = localStorage.getItem("postPaymentPayload");

        if (!merchantTransactionId || !payloadString) {
          setStatus("FAILED");
          setMessage("Invalid payment session.");
          return;
        }

        const payload = JSON.parse(payloadString);

        setMessage("Checking payment status with PhonePe...");
        
        try {
          // 1. Call PhonePe status API
          const statusResponse = await AxiosClient.get(`/phonepe/status/${merchantTransactionId}`);
          console.log("PhonePe Status Response:", statusResponse.data);
          
          // 2. Extract UTR if available
          const extractedUTR = extractUTRFromResponse(statusResponse.data);
          if (extractedUTR) {
            setUtr(extractedUTR);
          }
          
          // 3. Check if payment is actually successful (bypassing the incorrect success flag)
          const isActuallySuccessful = isPaymentActuallySuccessful(statusResponse.data);
          
          if (isActuallySuccessful) {
            // ✅ Payment is ACTUALLY successful (based on raw data)
            const txnId = statusResponse.data?.transactionId || 
                         merchantTransactionId ||
                         `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
            
            setTransactionId(txnId);
            
            // Extract and set customer email for display
            const customerEmail = payload?.customerEmail || "";
            if (customerEmail) {
              setCustomerEmail(customerEmail);
            }
            
            await handleSuccessfulPayment(payload, txnId, extractedUTR);
            setStatus("SUCCESS");
            setMessage(extractedUTR 
              ? `Payment successful! UTR: ${extractedUTR}`
              : "Payment successful! Confirmation sent to your email."
            );
            
            setTimeout(() => {
              navigate("/booking/step5_confirmation");
            }, 3000);
            
          } else if (statusResponse.data?.success === true) {
            // ✅ API says success (traditional case)
            const txnId = statusResponse.data?.transactionId || merchantTransactionId;
            setTransactionId(txnId);
            
            // Extract and set customer email for display
            const customerEmail = payload?.customerEmail || "";
            if (customerEmail) {
              setCustomerEmail(customerEmail);
            }
            
            await handleSuccessfulPayment(payload, txnId, extractedUTR);
            setStatus("SUCCESS");
            setMessage("Payment successful! Confirmation sent to your email.");
            
            setTimeout(() => {
              navigate("/booking/step5_confirmation");
            }, 3000);
            
          } else {
            // Check for specific failure/cancellation indicators
            const rawResponse = statusResponse.data?.debug?.rawResponse;
            
            if (rawResponse) {
              try {
                const parsed = JSON.parse(rawResponse);
                const paymentDetails = parsed.PaymentDetails || [];
                
                // Check for cancelled transactions
                const cancelledPayment = paymentDetails.find(
                  detail => detail.State === "FAILED" && 
                           (detail.ErrorCode === "TXN_CANCELLED" || 
                            detail.ErrorCode?.includes("CANCEL"))
                );
                
                if (cancelledPayment) {
                  // ❌ Cancelled
                  await handleCancelledPayment(merchantTransactionId);
                  setStatus("CANCELLED");
                  setMessage("Payment was cancelled. No amount has been deducted.");
                  return;
                }
              } catch (parseError) {
                console.error("Error parsing for cancellation:", parseError);
              }
            }
            
            // Check if order is expired or failed
            if (statusResponse.data?.status === "EXPIRED" || 
                statusResponse.data?.rawStatus === "EXPIRED") {
              setStatus("FAILED");
              setMessage("Payment session expired. Please try again.");
            } else if (statusResponse.data?.rawStatus === "PENDING") {
              // Still pending
              setStatus("PENDING");
              setMessage("Payment is still processing. Please wait a moment...");
              
              // Option: Auto-refresh after delay
              setTimeout(() => {
                window.location.reload();
              }, 5000);
            } else {
              // ⚠️ Failed or unknown
              setStatus("FAILED");
              setMessage(
                statusResponse.data?.message || 
                "Payment failed. Please try again or contact support."
              );
            }
          }
          
        } catch (statusError) {
          console.error("Status check error:", statusError);
          
          // Network error or API down
          setStatus("FAILED");
          setMessage(
            statusError.response?.data?.message ||
            "Unable to verify payment status. Please check your internet connection or contact support."
          );
        }

      } catch (err) {
        console.error("Callback error:", err);
        setStatus("FAILED");
        setMessage(
          err.response?.data?.message ||
          "Something went wrong while confirming payment."
        );
      }
    };

    runPaymentFlow();
  }, [navigate]);

  const handleGoHome = () => navigate("/");

  const handleRetryPayment = () => {
    localStorage.removeItem("merchantTransactionId");
    localStorage.removeItem("postPaymentPayload");
    navigate("/booking/payment");
  };

  const handleRefreshStatus = () => {
    window.location.reload();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f7fa",
        p: 2
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: "100%" }}>
        {status === "CHECKING" && (
          <Stack spacing={3} alignItems="center">
            <CircularProgress size={60} />
            <Typography variant="h6">{message}</Typography>
          </Stack>
        )}

        {status === "PENDING" && (
          <Stack spacing={3} alignItems="center">
            <PendingIcon color="info" sx={{ fontSize: 80 }} />
            <Typography variant="h6" color="info.main">
              Payment Processing
            </Typography>
            <Alert severity="info">{message}</Alert>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleRefreshStatus}
            >
              Refresh Status
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This may take a few moments...
            </Typography>
          </Stack>
        )}

        {status === "SUCCESS" && (
          <Stack spacing={3} alignItems="center">
            <CheckCircleIcon color="success" sx={{ fontSize: 80 }} />
            <Typography variant="h6" color="success.main">
              Payment Successful
            </Typography>
            {transactionId && (
              <Alert severity="success">Transaction ID: {transactionId}</Alert>
            )}
            {utr && (
              <Alert severity="info">
                <strong>UTR:</strong> {utr}
              </Alert>
            )}
            {customerEmail && (
              <Alert severity="success">
                <strong>Confirmation sent to:</strong> {customerEmail}
              </Alert>
            )}
            <Typography variant="body2" color="text.secondary">
              {customerEmail 
                ? "Confirmation has been sent to your email."
                : "Payment completed successfully. Please save your transaction details."}
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate("/booking/step5_confirmation")}
            >
              Go to Confirmation
            </Button>
            <Button variant="outlined" fullWidth onClick={handleGoHome}>
              Go to Home
            </Button>
          </Stack>
        )}

        {status === "CANCELLED" && (
          <Stack spacing={3} alignItems="center">
            <CancelIcon color="warning" sx={{ fontSize: 80 }} />
            <Typography variant="h6" color="warning.main">
              Payment Cancelled
            </Typography>
            <Alert severity="info">{message}</Alert>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleRetryPayment}
            >
              Retry Payment
            </Button>
            <Button variant="outlined" fullWidth onClick={handleGoHome}>
              Go to Home
            </Button>
          </Stack>
        )}

        {status === "FAILED" && (
          <Stack spacing={3} alignItems="center">
            <ErrorIcon color="error" sx={{ fontSize: 80 }} />
            <Alert severity="error">{message}</Alert>
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={handleRetryPayment}
            >
              Retry Payment
            </Button>
            <Button variant="outlined" fullWidth onClick={handleGoHome}>
              Go to Home
            </Button>
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default PaymentCallback;