// utils/userService.js
import axiosClient from "../AxiosClient";

// Existing functions
export const checkAndCreateUser = async (mobileNumber, userData = {}) => {
  try {
    // Step 1: Check if user exists
    const checkResponse = await axiosClient.get(`/User/CheckUser/${mobileNumber}`);
    let userID;
    let addressID;

    if (checkResponse.status === 200) {
      // User exists
      userID = checkResponse.data.userID;
      addressID = checkResponse.data.addressID;
    } else {
      // Step 2: Create new user
      const createResponse = await axiosClient.post("/User/CreateUser", {
        name: "User",
        phoneNumber: mobileNumber,
        email: `${mobileNumber}@user.com`,
        password: "defaultPassword",
        ...userData
      });
      userID = createResponse.data.userID;
      addressID = createResponse.data.addressID;
    }

    return { userID, mobileNumber, addressID };
  } catch (error) {
    console.error("Error in checkAndCreateUser:", error);
    throw error;
  }
};

// NEW: Get user profile
export const getUserProfile = async (userId) => {
  try {
    if (!userId) {
      console.error("User ID is required to fetch profile");
      return null;
    }

   // console.log(`Fetching profile for user ID: ${userId}`);
    const response = await axiosClient.get(`/User/${userId}`);

    if (response.status === 200 && response.data) {
      //console.log("User profile API response:", response.data);
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

// NEW: Get user bookings
export const getUserBookings = async (userId) => {
  try {
    if (!userId) {
      console.error("User ID is required to fetch bookings");
      return [];
    }

    //console.log(`Fetching bookings for user ID: ${userId}`);
    const response = await axiosClient.get(`/Booking/GetBookings/${userId}`);

    if (response.status === 200 && response.data) {
      //console.log("Bookings API response:", response.data);

      // Transform API data to match component structure
      const bookings = Array.isArray(response.data)
        ? response.data
        : [response.data];

      return bookings.map((booking, index) => ({
        id: booking.bookingId || booking.id || `BK${String(index + 1).padStart(3, "0")}`,
        type: booking.serviceType || booking.type || "Standard Service",
        status: (booking.status || "pending").toLowerCase(),
        statusText: getStatusText(booking.status),
        from: booking.pickupLocation || booking.from || "Location not specified",
        to: booking.deliveryLocation || booking.to || "Location not specified",
        date: formatDate(booking.bookingDate || booking.date || booking.createdDate),
        items: booking.itemsDescription || booking.items || "Not specified",
        trackingId: booking.trackingNumber || booking.trackingId || `TRK${Date.now()}${index}`,
        originalData: booking, // Keep original data for reference
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return getMockBookings(); // Fallback to mock data
  }
};

// NEW: Get combined user profile with booking stats
export const getUserProfileWithBookings = async (userId) => {
  try {
    const [profile, bookings] = await Promise.all([
      getUserProfile(userId),
      getUserBookings(userId),
    ]);

    // Get user info from localStorage if available
    const localUserInfo = JSON.parse(localStorage.getItem("user") || "{}");

    // Calculate booking stats
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(
      (b) => b.status === "completed" || b.status === "confirmed"
    ).length;
    const pendingBookings = bookings.filter((b) => b.status === "pending").length;

    return {
      // Merge local storage data first (fresher)
      ...localUserInfo,
      // Then API profile data
      ...profile,
      // Add calculated stats
      totalBookings,
      completedBookings,
      pendingBookings,
      // Add formatted dates if not present
      memberSince: profile?.createdDate
        ? formatDate(profile.createdDate)
        : localUserInfo?.memberSince || "January 2023",
      lastLogin: "Today", // You can update this with actual last login
      address: profile?.address || profile?.shippingAddress || localUserInfo?.address || "Address not specified",
      preferredService: profile?.preferredService || localUserInfo?.preferredService || "Household Relocation",
      // Keep bookings for convenience
      bookings,
    };
  } catch (error) {
    console.error("Error fetching combined data:", error);
    return getMockUserData();
  }
};

// NEW: Create a new booking
export const createBooking = async (userId, bookingData) => {
  try {
    if (!userId) {
      throw new Error("User ID is required to create booking");
    }

    const response = await axiosClient.post("/Booking/CreateBooking", {
      userId,
      ...bookingData,
    });

    if (response.status === 200 || response.status === 201) {
      console.log("Booking created successfully:", response.data);
      // Dispatch event to notify components about new booking
      window.dispatchEvent(new Event("booking-update"));
      return response.data;
    }
    throw new Error("Failed to create booking");
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

// NEW: Update booking status
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await axiosClient.put(`/Booking/UpdateStatus/${bookingId}`, {
      status,
    });

    if (response.status === 200) {
      console.log("Booking status updated successfully");
      window.dispatchEvent(new Event("booking-update"));
      return response.data;
    }
    throw new Error("Failed to update booking status");
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
};

// NEW: Cancel booking
export const cancelBooking = async (bookingId) => {
  try {
    const response = await axiosClient.delete(`/Booking/CancelBooking/${bookingId}`);

    if (response.status === 200) {
      console.log("Booking cancelled successfully");
      window.dispatchEvent(new Event("booking-update"));
      return response.data;
    }
    throw new Error("Failed to cancel booking");
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
};

// Helper functions
const getStatusText = (status) => {
  if (!status) return "Pending";
  const statusMap = {
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    in_transit: "In Transit",
    delivered: "Delivered",
    in_progress: "In Progress",
    awaiting_payment: "Awaiting Payment",
  };
  return statusMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return dateString;
  }
};

// Mock data functions (fallback when API fails)
const getMockBookings = () => {
  return [
    {
      id: "BK001",
      type: "Household Relocation",
      status: "pending",
      statusText: "Pending",
      from: "New York, NY",
      to: "Los Angeles, CA",
      date: "January 15, 2024",
      items: "Furniture, Electronics, Clothes",
      trackingId: "TRK7890123",
    },
    {
      id: "BK002",
      type: "Office Move",
      status: "confirmed",
      statusText: "Confirmed",
      from: "Boston, MA",
      to: "Chicago, IL",
      date: "January 20, 2024",
      items: "Desks, Files, Computers, Printers",
      trackingId: "TRK7890456",
    },
    {
      id: "BK003",
      type: "International Shipping",
      status: "completed",
      statusText: "Completed",
      from: "Miami, FL",
      to: "London, UK",
      date: "December 10, 2023",
      items: "Personal Belongings, Documents",
      trackingId: "TRK7890789",
    },
  ];
};

const getMockUserData = () => {
  const localUserInfo = JSON.parse(localStorage.getItem("user") || "{}");
  const mockBookings = getMockBookings();

  return {
    name: localUserInfo?.name || "John Doe",
    email: localUserInfo?.email || `${localUserInfo?.mobile || "user"}@example.com`,
    mobile: localUserInfo?.mobile || "+1 (555) 123-4567",
    memberSince: localUserInfo?.memberSince || "March 15, 2022",
    lastLogin: "Today, 10:30 AM",
    address: localUserInfo?.address || "123 Main Street, New York, NY 10001",
    preferredService: localUserInfo?.preferredService || "Household Relocation",
    totalBookings: mockBookings.length,
    completedBookings: mockBookings.filter((b) => b.status === "completed").length,
    pendingBookings: mockBookings.filter((b) => b.status === "pending").length,
    bookings: mockBookings,
  };
};

// Export all functions
export default {
  checkAndCreateUser,
  getUserProfile,
  getUserBookings,
  getUserProfileWithBookings,
  createBooking,
  updateBookingStatus,
  cancelBooking,
};