import AxiosClient from "../AxiosClient";

/* ===========================
   PDF Blob → Base64 Conversion
=========================== */
export const pdfBlobToBase64 = async (pdfBlob) => {
  if (!pdfBlob) {
    throw new Error("PDF blob is required");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(pdfBlob);

    reader.onloadend = () => {
      const base64 = reader.result.split(",")[1]; // remove prefix
      resolve(base64);
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
};

/* ===========================
   Send Quotation Email
=========================== */
export const sendQuotationEmail = async (emailData) => {
  try {
    if (!emailData.pdfBlob) {
      return { success: false, error: "PDF is required" };
    }

    const pdfBase64 = await pdfBlobToBase64(emailData.pdfBlob);

    const requestData = {
      recipientEmail: emailData.recipientEmail,
      customerName: emailData.customerName,
      quotationNumber:
        emailData.quotationNumber || `QM-${emailData.bookingId}`,
      pickupDate: emailData.pickupDate,
      pickupTime: emailData.pickupTime,
      totalAmount: emailData.totalAmount,
      pdfBase64: pdfBase64,
      bookingId: emailData.bookingId,
      userId: emailData.userId,
      customerPhone: emailData.customerPhone || "",
      fromAddress: emailData.fromAddress || "",
      toAddress: emailData.toAddress || "",
      distance: emailData.distance || 0,
      totalCFT: emailData.totalCFT || 0,
      totalItems: emailData.totalItems || 0,
    };

    const response = await AxiosClient.post(
      "/Email/send-quotation",
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Email sending error:", error.response?.data || error);

    return {
      success: false,
      error:
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to send email",
    };
  }
};

/* ===========================
   Send Booking Confirmation Email
   (Uses SAME DTO as backend)
=========================== */
export const sendBookingConfirmationEmail = async (bookingData) => {
  try {
    if (!bookingData.pdfBlob) {
      return { success: false, error: "PDF is required" };
    }

    const pdfBase64 = await pdfBlobToBase64(bookingData.pdfBlob);

    const requestData = {
      recipientEmail: bookingData.recipientEmail,
      customerName: bookingData.customerName,
      quotationNumber: `QM-${bookingData.bookingId}`,
      pickupDate: bookingData.pickupDate,
      pickupTime: bookingData.pickupTime,
      totalAmount: bookingData.totalAmount,
      pdfBase64: pdfBase64,
      bookingId: bookingData.bookingId,
      userId: bookingData.userId,
      customerPhone: bookingData.customerPhone || "",
      fromAddress: bookingData.fromAddress || "",
      toAddress: bookingData.toAddress || "",
      distance: bookingData.distance || 0,
      totalCFT: bookingData.totalCFT || 0,
      totalItems: bookingData.totalItems || 0,
    };

    const response = await AxiosClient.post(
      "/Email/send-quotation",
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Booking confirmation email error:",
      error.response?.data || error
    );

    return {
      success: false,
      error: "Failed to send booking confirmation email",
    };
  }
};
