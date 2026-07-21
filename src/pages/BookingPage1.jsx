import React, { useEffect, useState } from "react";
import PopupModal from "../pages/PopupModal";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import BookingDetailsCard from "./BookingDetailsCard";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {
  Button,
  Paper,
  Select,
  MenuItem,
  IconButton,
  Stack,
  TextField,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Container,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  CardActions,
  Fade,
  Zoom,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Snackbar
} from "@mui/material";
import {
  Add,
  Remove,
  Category,
  Elevator,
  LocalShipping,
  LocationOn,
  Menu as MenuIcon,
  Home,
  DirectionsCar,
  Event,
  CheckCircle,
  AccessTime,
  CalendarToday
} from "@mui/icons-material";
import AxiosClient from "../AxiosClient";
import CircularProgress from '@mui/material/CircularProgress';
import { keyframes } from '@mui/material/styles';

const slideInUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const BookingPage = (selectedDate) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeTab, setActiveTab] = useState("Sofas & Seating");
  const [selectedItems, setSelectedItems] = useState([]);
  const [step, setStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [searchParams] = useSearchParams();
  const distance = searchParams.get("distance");
  const priceCalculateCitywise = searchParams.get("activeTab");
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalCFT, setTotalCFT] = useState(0);
  const [floor, setFloor] = useState(1);
  const [serviceLift, setServiceLift] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [vanAccessible, setVanAccessible] = useState(null);
  const [roadDistance, setRoadDistance] = useState(null);
  const [roadDetails, setRoadDetails] = useState("");
  const [bookings, setBookings] = useState([]);
  const [bookingId, setBookingId] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const userId = localStorage.getItem("userID");
  const addressId = localStorage.getItem("addressID");
  const shiftingDate = searchParams.get("shiftingDate");
  const fromAddress = searchParams.get("fromAddress");
  const toAddress = searchParams.get("toAddress");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch inventory
        const inventoryResponse = await AxiosClient.get("/inventory/GetAllInventory");
        if (inventoryResponse.status === 200) {
          setInventoryData(inventoryResponse.data);
          const groupedData = organizeInventoryByCategory(inventoryResponse.data);
          setInventory(groupedData);
        }

        // Fetch time slots
        const timeSlotResponse = await AxiosClient.get('/TimeSlot/GetAllTimeSlots');
        if (timeSlotResponse.status === 200) {
          setTimeSlots(timeSlotResponse.data);
        }

        // Fetch bookings
        if (userId) {
          const bookingsResponse = await AxiosClient.get(`/Booking/GetBookings/${userId}`);
          if (bookingsResponse.status === 200) {
            setBookings(bookingsResponse.data);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    populateSelectedItems();
  }, [step, bookings]);

  useEffect(() => {
    calculatedCFT();
  }, [selectedItems]);

  useEffect(() => {
    calculatePrice();
  }, [distance, totalCFT, serviceLift, selectedFloor, vanAccessible, roadDistance]);

  const populateSelectedItems = async () => {
    if (bookings && bookings.length > 0) {
      const latestBooking = bookings[0];
      const items = latestBooking?.bookingItems;

      if (items && items.length > 0) {
        if (inventoryData) {
          const populatedItems = items.map((item) => {
            const inventoryItem = inventoryData.find(
              (invItem) => invItem?.itemID === item.itemID
            );

            return {
              itemID: item.itemID,
              name: inventoryItem?.name || "Unknown Item",
              quantity: item.quantity,
              sizeCFT: inventoryItem ? inventoryItem.sizeCFT : 0,
            };
          });

          setSelectedItems(populatedItems);
        }
      }
    }
  };

  const calculatedCFT = () => {
    const calculatedCFT = selectedItems.reduce(
      (total, item) => total + (item.quantity * (item.sizeCFT || 0)),
      0
    );
    setTotalCFT(calculatedCFT);
  };

  const calculatePrice = () => {
    if ((distance > 0 && totalCFT > 0) || (distance > 0 && priceCalculateCitywise === "within")) {
      const fetchPrice = async () => {
        if (!distance || totalCFT <= 0) return;

        setLoading(true);
        try {
          const dist = parseInt(distance, 10) || 0;
          const cft = parseInt(totalCFT, 10) || 0;

          const response = await AxiosClient.get(
            `/Price/GetPrice?distance=${dist}&cftTotal=${cft}&activeTab=${priceCalculateCitywise}`
          );
          if (response.status === 200) {
            let basePrice = response.data.price || 0;
            
            // Add additional charges
            if (serviceLift === "no" && selectedFloor) {
              basePrice += selectedFloor * 200;
            }

            if (vanAccessible === "no" && roadDistance) {
              basePrice += 500;
            }

            setPrice(basePrice);
          }
        } catch (error) {
          console.error("Error fetching price:", error);
          setError("Failed to calculate price. Please try again.");
          setSnackbarOpen(true);
        }
        setLoading(false);
      };

      fetchPrice();
    }
  };

  const organizeInventoryByCategory = (data) => {
    return data.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push({ itemID: item.itemID, name: item.name, sizeCFT: item.sizeCFT });
      return acc;
    }, {});
  };

  const handleTabChange = (category) => {
    setActiveTab(category);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleAddItem = (itemID) => {
    setSelectedItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.itemID === itemID);

      if (existingItem) {
        return prevItems.map((item) =>
          item.itemID === itemID ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        const selectedItem = Object.values(inventory)
          .flat()
          .find((item) => item.itemID === itemID);

        if (!selectedItem) return prevItems;

        return [...prevItems, { ...selectedItem, quantity: 1 }];
      }
    });
  };

  const handleRemoveItem = (itemID) => {
    setSelectedItems((prevItems) => {
      return prevItems
        .map((item) =>
          item.itemID === itemID
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0);
    });
  };

  const handleDropdownChange = (itemID, value) => {
    setSelectedItems((prevItems) =>
      prevItems.map((item) =>
        item.itemID === itemID ? { ...item, quantity: parseInt(value, 10) } : item
      )
    );
  };

  const handleContinue = async () => {
    setError(null);
    
    // Validation
    // if (!selectedTimeSlot) {
    //   setError("Please select a time slot");
    //   setSnackbarOpen(true);
    //   return;
    // }
    
    if (selectedItems.length === 0) {
      setError("Please select at least one item");
      setSnackbarOpen(true);
      return;
    }
    
    if (!serviceLift || !vanAccessible) {
      setError("Please fill all service options");
      setSnackbarOpen(true);
      return;
    }
    
    if (serviceLift === "no" && !selectedFloor) {
      setError("Please select floor number");
      setSnackbarOpen(true);
      return;
    }
    
    if (vanAccessible === "no" && !roadDistance) {
      setError("Please select road distance");
      setSnackbarOpen(true);
      return;
    }

    const bookingDetails = {
      userID: parseInt(userId, 10),
      sourceAddressID: addressId,
      destinationAddressID: addressId,
      pickupDate: new Date(shiftingDate).toISOString(),
   pickupTimeSlotID: selectedTimeSlot || 1,
      status: "Pending",
      totalAmount: price,
      bookingAmountPaid: 0.0,
      bookingItemList: selectedItems.map((item) => ({
        itemID: item.itemID,
        quantity: item.quantity,
      })),
      additionalServices: {
        serviceLift: serviceLift === "yes",
        floorNumber: selectedFloor,
        vanAccessible: vanAccessible === "yes",
        roadDistance: roadDistance,
        roadDetails: roadDetails
      }
    };

    try {
      const response = await AxiosClient.post(
        "/booking/CreateBooking",
        bookingDetails,
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.status === 200) {
        setBookingId(response.data.bookingID);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      setError("Failed to create booking. Please try again.");
      setSnackbarOpen(true);
    }
  };

  const categories = Object.keys(inventory || {});

  const LocationSummary = () => (
    <Card sx={{
      mb: 2,
      borderRadius: 3,
      background: 'linear-gradient(135deg, #f8f9ff 0%, #eef1ff 100%)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{
          fontWeight: 'bold',
          mb: 1.5,
          color: '#667eea',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <LocationOn sx={{ fontSize: 20 }} />
          Shifting Details
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Box sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                <Home sx={{ fontSize: 12, mr: 0.5 }} />
                From:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                {fromAddress?.split(',').slice(0, 2).join(',') || 'Not specified'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                <Home sx={{ fontSize: 12, mr: 0.5 }} />
                To:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                {toAddress?.split(',').slice(0, 2).join(',') || 'Not specified'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                <DirectionsCar sx={{ fontSize: 12, mr: 0.5 }} />
                Distance:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#667eea', fontSize: '0.85rem' }}>
                {distance || 0} km
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                <CalendarToday sx={{ fontSize: 12, mr: 0.5 }} />
                Date:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                {shiftingDate ? new Date(shiftingDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : 'Not set'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const CategoryDrawer = () => (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: isSmallMobile ? '80%' : 280,
          backgroundColor: theme.palette.background.paper,
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <Category sx={{ mr: 1 }} />
          Categories
        </Typography>
        <List>
          {categories.map((category) => (
            <ListItem key={category} disablePadding>
              <ListItemButton
                onClick={() => handleTabChange(category)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  backgroundColor: activeTab === category ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <ListItemText 
                  primary={category} 
                  primaryTypographyProps={{
                    fontWeight: activeTab === category ? 'bold' : 'normal',
                    fontSize: '0.95rem',
                  }}
                />
                {activeTab === category && <CheckCircle sx={{ ml: 1, fontSize: 16 }} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <Container maxWidth="xl" sx={{ py: isMobile ? 1 : 3, px: isMobile ? 1 : 2 }}>
      {/* Snackbar for errors */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar 
          position="sticky" 
          sx={{ 
            mb: 2, 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <IconButton
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              edge="start"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Booking Details
            </Typography>
            <Chip 
              label={`${selectedItems.length} items`}
              size="small"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Toolbar>
        </AppBar>
      )}

      {/* Category Drawer for Mobile */}
      {isMobile && <CategoryDrawer />}

      {/* Progress Stepper - Desktop */}
      {!isMobile && (
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={1} alternativeLabel>
            <Step>
              <StepLabel>Select Items</StepLabel>
            </Step>
            <Step>
              <StepLabel>Choose Services</StepLabel>
            </Step>
            <Step>
              <StepLabel>Review & Book</StepLabel>
            </Step>
          </Stepper>
        </Box>
      )}

      <Grid container spacing={isMobile ? 1 : 3}>
        {/* Left Column - Booking Summary & Items */}
        <Grid item xs={12} md={8}>
          <Zoom in={true}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              overflow: 'visible',
              mb: isMobile ? 2 : 3,
              background: 'linear-gradient(to bottom right, #ffffff, #f8f9ff)',
            }}>
              <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                {/* Header */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 3,
                  flexDirection: isMobile ? 'column' : 'row',
                  textAlign: isMobile ? 'center' : 'left',
                  gap: 2
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}>
                    <Category sx={{
                      color: '#667eea',
                      fontSize: isMobile ? 28 : 32,
                    }} />
                    <Typography
                      variant={isMobile ? "h6" : "h5"}
                      sx={{
                        fontWeight: 'bold',
                        color: '#667eea',
                      }}
                    >
                      Select Your Items
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip 
                      label={`${selectedItems.length} items selected`}
                      color="primary"
                      size="small"
                    />
                    <Chip 
                      label={`${totalCFT.toFixed(1)} CFT`}
                      color="secondary"
                      size="small"
                    />
                  </Box>
                </Box>

                {/* Category Tabs - Desktop */}
                {!isMobile && (
                  <Fade in={true}>
                    <Box sx={{
                      display: 'flex',
                      gap: 1,
                      flexWrap: 'wrap',
                      mb: 3,
                      justifyContent: 'center',
                    }}>
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={activeTab === category ? "contained" : "outlined"}
                          onClick={() => handleTabChange(category)}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 'bold',
                            borderRadius: '20px',
                            px: 2,
                            py: 1,
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease',
                            background: activeTab === category 
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : 'transparent',
                            borderColor: '#667eea',
                            color: activeTab === category ? 'white' : '#667eea',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                            },
                          }}
                        >
                          {category}
                        </Button>
                      ))}
                    </Box>
                  </Fade>
                )}

                {/* Mobile Category Button */}
                {isMobile && (
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      startIcon={<MenuIcon />}
                      onClick={() => setDrawerOpen(true)}
                      sx={{
                        borderRadius: '20px',
                        borderColor: '#667eea',
                        color: '#667eea',
                        fontWeight: 'bold',
                        width: '100%',
                      }}
                    >
                      Browse Categories ({categories.length})
                    </Button>
                  </Box>
                )}

                {/* Active Category Header for Mobile */}
                {isMobile && (
                  <Box sx={{
                    mb: 2,
                    p: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    borderLeft: '4px solid #667eea',
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                      {activeTab} • {inventory[activeTab]?.length || 0} items
                    </Typography>
                  </Box>
                )}

                {/* Inventory Items */}
                <Paper
                  elevation={0}
                  sx={{
                    p: isMobile ? 1.5 : 2,
                    borderRadius: 3,
                    background: 'transparent',
                    maxHeight: isMobile ? '50vh' : '60vh',
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '4px',
                    },
                  }}
                >
                  {inventory[activeTab]?.map((item, index) => {
                    const selectedItem = selectedItems.find((selected) => selected.itemID === item.itemID);

                    return (
                      <Fade in={true} key={index}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: isMobile ? 1.5 : 2,
                            mb: 2,
                            borderRadius: '16px',
                            background: selectedItem 
                              ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                              : '#ffffff',
                            boxShadow: selectedItem 
                              ? '0 4px 15px rgba(102, 126, 234, 0.15)'
                              : '0 2px 8px rgba(0, 0, 0, 0.08)',
                            border: selectedItem ? '2px solid rgba(102, 126, 234, 0.3)' : '2px solid transparent',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.2)',
                            },
                          }}
                        >
                          {/* Item Name */}
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 600,
                                fontSize: isMobile ? '0.9rem' : '1rem',
                                color: '#333',
                                mb: 0.5,
                              }}
                            >
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.sizeCFT} CFT per item
                            </Typography>
                            {selectedItem && (
                              <Chip
                                label={`${selectedItem.quantity * item.sizeCFT} CFT`}
                                size="small"
                                color="primary"
                                sx={{ mt: 0.5, fontSize: '0.7rem', height: 20 }}
                              />
                            )}
                          </Box>

                          {/* Quantity Controls */}
                          <Stack direction="row" alignItems="center" spacing={isMobile ? 0.5 : 1}>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveItem(item.itemID)}
                              sx={{
                                bgcolor: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                width: isMobile ? 32 : 36,
                                height: isMobile ? 32 : 36,
                                '&:hover': {
                                  bgcolor: 'rgba(239, 68, 68, 0.2)',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <Remove fontSize={isMobile ? "small" : "medium"} />
                            </IconButton>

                            <Select
                              value={selectedItem ? selectedItem.quantity : 1}
                              onChange={(e) => handleDropdownChange(item.itemID, e.target.value)}
                              size="small"
                              sx={{
                                minWidth: isMobile ? 45 : 55,
                                height: isMobile ? 32 : 36,
                                bgcolor: '#ffffff',
                                borderRadius: '10px',
                                fontSize: isMobile ? '0.8rem' : '0.9rem',
                                fontWeight: 600,
                                '& .MuiOutlinedInput-notchedOutline': {
                                  border: '2px solid rgba(102, 126, 234, 0.3)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#667eea',
                                },
                              }}
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ))}
                            </Select>

                            <IconButton
                              size="small"
                              onClick={() => handleAddItem(item.itemID)}
                              sx={{
                                bgcolor: 'rgba(102, 126, 234, 0.1)',
                                color: '#667eea',
                                width: isMobile ? 32 : 36,
                                height: isMobile ? 32 : 36,
                                '&:hover': {
                                  bgcolor: 'rgba(102, 126, 234, 0.2)',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <Add fontSize={isMobile ? "small" : "medium"} />
                            </IconButton>
                          </Stack>
                        </Box>
                      </Fade>
                    );
                  })}
                </Paper>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        {/* Right Column - Service Options & Booking Details */}
        <Grid item xs={12} md={4}>
          <Stack spacing={isMobile ? 2 : 3}>
            {/* Location Summary */}
            <LocationSummary />

            {/* Time Slot Selection */}
            <Zoom in={true} style={{ transitionDelay: '100ms' }}>
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                background: 'linear-gradient(to bottom right, #ffffff, #f8f9ff)',
              }}>
                <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    mb: 2,
                    color: '#667eea',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}>
                    <AccessTime />
                    Select Time Slot
                  </Typography>
                  
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
                    gap: 1.5,
                  }}>
                    {timeSlots.map((slot) => (
                      <ToggleButton
                        key={slot.timeSlotID}
                        value={slot.timeSlotID}
                        selected={selectedTimeSlot === slot.timeSlotID}
                        onChange={() => setSelectedTimeSlot(slot.timeSlotID)}
                        sx={{
                          py: 1.5,
                          borderRadius: '12px',
                          border: '2px solid rgba(102, 126, 234, 0.3)',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          '&.Mui-selected': {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: 'bold',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            }
                          },
                          '&:hover': {
                            background: 'rgba(102, 126, 234, 0.1)',
                          },
                        }}
                      >
                        {slot.timeSlotName}
                      </ToggleButton>
                    ))}
                  </Box>
                  
                  {/* {!selectedTimeSlot && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      * Please select a time slot to continue
                    </Typography>
                  )} */}
                </CardContent>
              </Card>
            </Zoom>

            {/* Service Options Card */}
            <Zoom in={true} style={{ transitionDelay: '150ms' }}>
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                background: 'linear-gradient(to bottom right, #ffffff, #f8f9ff)',
              }}>
                <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    mb: 2,
                    color: '#667eea',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}>
                    <Elevator />
                    Service Options
                  </Typography>

                  {/* Service Lift */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#555' }}>
                      Service Lift Available?
                    </Typography>
                    <ToggleButtonGroup
                      value={serviceLift}
                      exclusive
                      onChange={(event, newValue) => setServiceLift(newValue)}
                      fullWidth={isMobile}
                      sx={{
                        '& .MuiToggleButton-root': {
                          flex: 1,
                          py: 1.5,
                          fontSize: isMobile ? '0.8rem' : '0.9rem',
                          borderRadius: '12px !important',
                          border: '2px solid rgba(102, 126, 234, 0.3)',
                          '&.Mui-selected': {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: 'bold',
                          },
                          '&:hover': {
                            background: 'rgba(102, 126, 234, 0.1)',
                          },
                        },
                      }}
                    >
                      {["yes", "no"].map((option) => (
                        <ToggleButton key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Box>

                  {/* Floor Selection */}
                  {serviceLift === "no" && (
                    <Fade in={serviceLift === "no"}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#555' }}>
                          Select Floor (Additional ₹200/floor)
                        </Typography>
                        <Box sx={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(5, 1fr)',
                          gap: 1,
                        }}>
                          {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map((floor) => (
                            <ToggleButton
                              key={floor}
                              value={floor}
                              selected={selectedFloor === floor}
                              onChange={() => setSelectedFloor(floor)}
                              size="small"
                              sx={{
                                minHeight: 40,
                                borderRadius: '10px',
                                fontSize: '0.8rem',
                                border: '2px solid rgba(102, 126, 234, 0.3)',
                                '&.Mui-selected': {
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: 'white',
                                  fontWeight: 'bold',
                                },
                              }}
                            >
                              {floor}
                            </ToggleButton>
                          ))}
                        </Box>
                      </Box>
                    </Fade>
                  )}

                  {/* Van Accessibility */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#555' }}>
                      Van Accessible to Door?
                    </Typography>
                    <ToggleButtonGroup
                      value={vanAccessible}
                      exclusive
                      onChange={(event, newValue) => setVanAccessible(newValue)}
                      fullWidth={isMobile}
                      sx={{
                        '& .MuiToggleButton-root': {
                          flex: 1,
                          py: 1.5,
                          fontSize: isMobile ? '0.8rem' : '0.9rem',
                          borderRadius: '12px !important',
                          border: '2px solid rgba(102, 126, 234, 0.3)',
                          '&.Mui-selected': {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: 'bold',
                          },
                        },
                      }}
                    >
                      {["yes", "no"].map((option) => (
                        <ToggleButton key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Box>

                  {/* Road Distance */}
                  {vanAccessible === "no" && (
                    <Fade in={vanAccessible === "no"}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#555' }}>
                          Distance from House (Additional ₹500)
                        </Typography>
                        <Box sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: 1,
                        }}>
                          {["0-50m", "0-100m", "0-150m", "0-200m", "0-250m", "0-300m", "0-350m", "0-400m", "0-450m", "0-500m"].map((distance) => (
                            <ToggleButton
                              key={distance}
                              value={distance}
                              selected={roadDistance === distance}
                              onChange={() => setRoadDistance(distance)}
                              size="small"
                              sx={{
                                fontSize: '0.75rem',
                                borderRadius: '8px',
                                border: '2px solid rgba(102, 126, 234, 0.3)',
                                '&.Mui-selected': {
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: 'white',
                                  fontWeight: 'bold',
                                },
                              }}
                            >
                              {distance}
                            </ToggleButton>
                          ))}
                        </Box>

                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1, color: '#555' }}>
                          Road Details
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          placeholder="Narrow lane, stairs, parking distance..."
                          value={roadDetails}
                          onChange={(e) => setRoadDetails(e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              fontSize: '0.9rem',
                              '&:hover fieldset': {
                                borderColor: '#667eea',
                              },
                            },
                          }}
                        />
                      </Box>
                    </Fade>
                  )}
                </CardContent>
              </Card>
            </Zoom>

            {/* Booking Details Card */}
            <Zoom in={true} style={{ transitionDelay: '200ms' }}>
              <div>
                <BookingDetailsCard
                  selectedItems={selectedItems}
                  price={price}
                  handleContinue={handleContinue}
                  serviceLift={serviceLift}
                  selectedFloor={selectedFloor}
                  vanAccessible={vanAccessible}
                  roadDistance={roadDistance}
                  selectedTimeSlot={selectedTimeSlot}
                  timeSlots={timeSlots}
                  loading={loading}
                />
              </div>
            </Zoom>
          </Stack>
        </Grid>
      </Grid>

      {/* Fixed Continue Button for Mobile */}
      {isMobile && selectedItems.length > 0 && (
        <Fade in={selectedItems.length > 0}>
          <Box sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            background: 'linear-gradient(to top, rgba(255,255,255,0.95), transparent)',
            zIndex: 1000,
            animation: `${slideInUp} 0.3s ease-out`,
          }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleContinue}
              disabled={loading || !selectedTimeSlot}
              sx={{
                py: 1.5,
                borderRadius: '16px',
                background: !selectedTimeSlot 
                  ? '#ccc' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.5)',
                '&:hover': {
                  transform: !selectedTimeSlot ? 'none' : 'translateY(-2px)',
                  boxShadow: !selectedTimeSlot ? 'none' : '0 6px 25px rgba(102, 126, 234, 0.6)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                  Calculating...
                </>
              ) : !selectedTimeSlot ? (
                'Select Time Slot to Continue'
              ) : (
                `Book Now - ₹${price.toLocaleString('en-IN')}`
              )}
            </Button>
          </Box>
        </Fade>
      )}

      {/* Popup Modal */}
      <PopupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        price={price}
        shiftingDate={shiftingDate}
        userId={userId}
        bookingId={bookingId}
        selectedTimeSlot={selectedTimeSlot}
        timeSlots={timeSlots}
      />
    </Container>
  );
};

export default BookingPage;