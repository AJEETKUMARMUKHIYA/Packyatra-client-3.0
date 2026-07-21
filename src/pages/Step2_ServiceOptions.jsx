import React from "react";
import {
  Grid,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Box,
  Stack,
  Paper,
  Fade,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Avatar,
  Chip
} from "@mui/material";
import {
  Elevator,
  AccessTime,
  LocationOn,
  DirectionsCar,
  CheckCircle,
  Cancel,
  ApartmentOutlined
} from "@mui/icons-material";

const Step2_ServiceOptions = ({
  bookingData,
  onUpdate,
  onNext,
  onBack,
  distance,
  timeSlots
}) => {
  const {
    serviceLift,
    selectedFloor,
    serviceLiftdrop,
    floordrop,
    vanAccessible,
    roadDistance,
    roadDetails,
    selectedTimeSlot,
    fromAddress,
    toAddress
  } = bookingData;

  /* ======================
     PRICE CONFIG
  ====================== */
  const FLOOR_PRICE = 200;

  const LIFT_NOT_AVAILABLE_PRICE = 500;

  /* ======================
     PRICE CALCULATION
  ====================== */

  const calculateExtraCharge = (distance) => {
    if (!distance) return 0;
    return (distance / 50) * 200;
  };

  const handlePickupLiftChange = (e, value) => {
    if (value !== null) {
      onUpdate({
        serviceLift: value,
        //  selectedFloor: value === "yes" ? null : selectedFloor
      });
    }
  };

  const handleDropLiftChange = (e, value) => {
    if (value !== null) {
      onUpdate({
        serviceLiftdrop: value,
        //  floordrop: value === "yes" ? null : floordrop
      });
    }
  };

  // Calculate total CFT
  const totalCFT = bookingData.selectedItems.reduce(
    (sum, item) => sum + item.quantity * (item.sizeCFT || 0),
    0
  );

  // Function to get floor charge when lift NOT available
  function getFloorCharge(totalCFT, floor) {
    const priceTable = {
      2: { small: 1500, medium: 2000, large: 3000 },
      3: { small: 2500, medium: 3500, large: 4000 },
      4: { small: 3000, medium: 4000, large: 4500 },
      5: { small: 4000, medium: 5000, large: 5500 }
    };

    let slab;

    if (totalCFT <= 300) slab = "small";
    else if (totalCFT <= 800) slab = "medium";
    else slab = "large";

    if (floor >= 2 && floor <= 5) {
      return priceTable[floor][slab];
    }

    if (floor > 5) {
      const basePrice = priceTable[5][slab];
      const extraFloors = floor - 5;
      return basePrice + extraFloors * 1000;
    }

    return 0;
  }

  /* -------------------------
     Pickup Floor Charge
  -------------------------- */

  const pickupFloorCharge =
    serviceLift === "yes"
      ? selectedFloor
        ? selectedFloor * FLOOR_PRICE
        : 0
      : getFloorCharge(totalCFT, selectedFloor);

  /* -------------------------
     Drop Floor Charge
  -------------------------- */

  const dropFloorCharge =
    serviceLiftdrop === "yes"
      ? floordrop
        ? floordrop * FLOOR_PRICE
        : 0
      : getFloorCharge(totalCFT, floordrop);

  // const pickupFloorCharge =
  //   selectedFloor ? selectedFloor * FLOOR_PRICE : 0;

  // const dropFloorCharge =
  //   floordrop ? floordrop * FLOOR_PRICE : 0;

  const pickupLiftCharge = serviceLift === "no" ? LIFT_NOT_AVAILABLE_PRICE : 0;

  const dropLiftCharge = serviceLiftdrop === "no" ? LIFT_NOT_AVAILABLE_PRICE : 0;

  const VanAccessCharge =
    vanAccessible === "no" ? calculateExtraCharge(roadDistance) : 0;

  const totalExtraCharge =
    pickupFloorCharge + dropFloorCharge + pickupLiftCharge + dropLiftCharge + VanAccessCharge;

  /* ======================
     HANDLERS (RESTORED LOGIC)
  ====================== */

  const handlePickupFloorSelect = (floor) => onUpdate({ selectedFloor: floor });

  const handleDropFloorSelect = (floor) => onUpdate({ floordrop: floor });

  const handleTimeSlotChange = (id) => onUpdate({ selectedTimeSlot: id });

  const handleVanAccessChange = (e, value) => {
    if (value !== null) {
      onUpdate({ vanAccessible: value });
      if (value === "yes") {
        onUpdate({ roadDistance: null, roadDetails: "" });
      }
    }
  };

  const handleRoadDistanceSelect = (dist) => onUpdate({ roadDistance: dist });

  const handleRoadDetailsChange = (e) => onUpdate({ roadDetails: e.target.value });

  const isNextDisabled = !selectedTimeSlot || !vanAccessible;

  const toggleStyle = {
    py: 1.3,
    borderRadius: 2,
    textTransform: "none",
    fontWeight: 600,
    fontSize: "13.5px",
    border: "1.5px solid",
    borderColor: "grey.200",
    color: "text.secondary",
    "&.Mui-selected": {
      background: "linear-gradient(135deg, #4f46e5, #6366f1)",
      color: "#fff",
      borderColor: "transparent",
      boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)"
    },
    "&.Mui-selected:hover": {
      background: "linear-gradient(135deg, #4338ca, #4f46e5)"
    }
  };

  const parseTime = (label) => {
    const [hour, period] = label.split(" ");
    return { hour, period };
  };

  const floorListItemStyle = {
    borderRadius: 1.5,
    mx: 0.75,
    my: 0.3,
    "&.Mui-selected": {
      background: "linear-gradient(135deg, #4f46e5, #6366f1)",
      color: "white"
    },
    "&.Mui-selected:hover": {
      background: "linear-gradient(135deg, #4338ca, #4f46e5)"
    }
  };

  /* ======================
     UI
  ====================== */

  return (
    <Grid container spacing={2.5}>
      {/* LEFT SECTION */}
      <Grid item xs={12} lg={8}>
        <Stack spacing={2.5}>
          {/* TIME SLOT */}
          <Paper
            elevation={0}
            sx={{ p: 2.75, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: "primary.50", color: "primary.main", width: 36, height: 36 }}>
                <AccessTime fontSize="small" />
              </Avatar>
              <Typography variant="h6" fontWeight={700} fontSize="16.5px">
                Select pickup time slot
              </Typography>
            </Stack>

            {["AM", "PM"].map((period) => (
              <Box key={period} sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 700, mb: 1, fontSize: "13.5px", color: "text.secondary" }}>
                  {period === "AM" ? "☀️ Morning" : "🌤 Afternoon"}
                </Typography>

                <Grid container spacing={1.25}>
                  {timeSlots
                    ?.filter((slot) => slot.timeSlotName.includes(period))
                    .map((slot) => {
                      const { hour } = parseTime(slot.timeSlotName);
                      const isSelected = selectedTimeSlot === slot.timeSlotID;

                      return (
                        <Grid item xs={3} sm={2} md={1.5} key={slot.timeSlotID}>
                          <Paper
                            onClick={() => handleTimeSlotChange(slot.timeSlotID)}
                            elevation={0}
                            sx={{
                              width: 58,
                              height: 58,
                              borderRadius: "50%",
                              cursor: "pointer",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              border: isSelected ? "2px solid #4f46e5" : "1.5px solid #e5e7eb",
                              background: isSelected
                                ? "linear-gradient(135deg, #eef2ff, #e0e7ff)"
                                : "#fff",
                              boxShadow: isSelected ? "0 4px 12px rgba(79, 70, 229, 0.25)" : "none",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.18)",
                                borderColor: "primary.main",
                                transform: "translateY(-1px)"
                              }
                            }}
                          >
                            <AccessTime
                              sx={{
                                fontSize: 15,
                                mb: 0,
                                color: isSelected ? "primary.main" : "text.secondary"
                              }}
                            />
                            <Typography fontWeight={700} fontSize={13} lineHeight={1.3} color={isSelected ? "primary.main" : "text.primary"}>
                              {hour}
                            </Typography>
                            <Typography
                              variant="caption"
                              fontSize={9}
                              lineHeight={1}
                              color={isSelected ? "primary.main" : "text.secondary"}
                            >
                              {period}
                            </Typography>
                          </Paper>
                        </Grid>
                      );
                    })}
                </Grid>
              </Box>
            ))}
          </Paper>

          {/* PICKUP */}
          <Paper
            elevation={0}
            sx={{ p: 2.75, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 0.5 }}>
              <Avatar sx={{ bgcolor: "success.50", color: "success.main", width: 36, height: 36 }}>
                <Elevator fontSize="small" />
              </Avatar>
              <Typography variant="h6" fontWeight={700} fontSize="16.5px">
                Pickup location
              </Typography>
            </Stack>

            <Typography sx={{ mt: 2, mb: 1, fontWeight: 600, fontSize: "13.5px", color: "text.secondary" }}>
              Service lift available?
            </Typography>

            <ToggleButtonGroup
              exclusive
              fullWidth
              value={serviceLift}
              onChange={handlePickupLiftChange}
            >
              <ToggleButton value="yes" sx={toggleStyle}>
                Yes
              </ToggleButton>
              <ToggleButton value="no" sx={toggleStyle}>
                No
              </ToggleButton>
            </ToggleButtonGroup>

            {
              <Box sx={{ mt: 2.5 }}>
                <Typography fontWeight={600} fontSize="13.5px" color="text.secondary" mb={1}>
                  Select pickup floor
                </Typography>

                <Box
                  sx={{
                    maxHeight: 170,
                    overflowY: "auto",
                    border: "1.5px solid",
                    borderColor: "grey.200",
                    borderRadius: 2,
                    py: 0.5
                  }}
                >
                  <List disablePadding>
                    <ListItemButton
                      selected={selectedFloor === 0}
                      onClick={() => handlePickupFloorSelect(0)}
                      sx={floorListItemStyle}
                    >
                      <ListItemText primary="Ground Floor" primaryTypographyProps={{ fontSize: "13.5px", fontWeight: 500 }} />
                    </ListItemButton>

                    {[...Array(50)].map((_, i) => (
                      <ListItemButton
                        key={i}
                        selected={selectedFloor === i + 1}
                        onClick={() => handlePickupFloorSelect(i + 1)}
                        sx={floorListItemStyle}
                      >
                        <ListItemText primary={`Floor ${i + 1}`} primaryTypographyProps={{ fontSize: "13.5px", fontWeight: 500 }} />
                      </ListItemButton>
                    ))}
                  </List>
                </Box>
              </Box>
            }
          </Paper>

          {/* DROP */}
          <Paper
            elevation={0}
            sx={{ p: 2.75, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 0.5 }}>
              <Avatar sx={{ bgcolor: "error.50", color: "error.main", width: 36, height: 36 }}>
                <Elevator fontSize="small" />
              </Avatar>
              <Typography variant="h6" fontWeight={700} fontSize="16.5px">
                Drop location
              </Typography>
            </Stack>

            <Typography sx={{ mt: 2, mb: 1, fontWeight: 600, fontSize: "13.5px", color: "text.secondary" }}>
              Service lift available?
            </Typography>

            <ToggleButtonGroup
              exclusive
              fullWidth
              value={serviceLiftdrop}
              onChange={handleDropLiftChange}
            >
              <ToggleButton value="yes" sx={toggleStyle}>
                Yes
              </ToggleButton>
              <ToggleButton value="no" sx={toggleStyle}>
                No
              </ToggleButton>
            </ToggleButtonGroup>

            {
              <Box sx={{ mt: 2.5 }}>
                <Typography fontWeight={600} fontSize="13.5px" color="text.secondary" mb={1}>
                  Select drop floor
                </Typography>

                <Box
                  sx={{
                    maxHeight: 170,
                    overflowY: "auto",
                    border: "1.5px solid",
                    borderColor: "grey.200",
                    borderRadius: 2,
                    py: 0.5
                  }}
                >
                  <List disablePadding>
                    <ListItemButton
                      selected={floordrop === 0}
                      onClick={() => handleDropFloorSelect(0)}
                      sx={floorListItemStyle}
                    >
                      <ListItemText primary="Ground Floor" primaryTypographyProps={{ fontSize: "13.5px", fontWeight: 500 }} />
                    </ListItemButton>

                    {[...Array(50)].map((_, i) => (
                      <ListItemButton
                        key={i}
                        selected={floordrop === i + 1}
                        onClick={() => handleDropFloorSelect(i + 1)}
                        sx={floorListItemStyle}
                      >
                        <ListItemText primary={`Floor ${i + 1}`} primaryTypographyProps={{ fontSize: "13.5px", fontWeight: 500 }} />
                      </ListItemButton>
                    ))}
                  </List>
                </Box>
              </Box>
            }
          </Paper>

          {/* VAN ACCESS */}
          <Paper
            elevation={0}
            sx={{ p: 2.75, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5 }}>
              <Avatar sx={{ bgcolor: "warning.50", color: "warning.main", width: 36, height: 36 }}>
                <DirectionsCar fontSize="small" />
              </Avatar>
              <Typography fontWeight={700} fontSize="16.5px">
                Van accessible to door?
              </Typography>
            </Stack>

            <ToggleButtonGroup
              exclusive
              fullWidth
              value={vanAccessible}
              onChange={handleVanAccessChange}
            >
              <ToggleButton value="yes" sx={toggleStyle}>
                Yes
              </ToggleButton>
              <ToggleButton value="no" sx={toggleStyle}>
                No
              </ToggleButton>
            </ToggleButtonGroup>
            {vanAccessible === "no" && (
              <Fade in>
                <Box sx={{ mt: 2.5 }}>
                  <Typography fontWeight={600} fontSize="13.5px" color="text.secondary" mb={1}>
                    Approximate distance from road
                  </Typography>
                  <Grid container spacing={1.25}>
                    {["0-50m", "0-100m", "0-150m", "0-200m"].map((d) => (
                      <Grid item xs={6} key={d}>
                        <ToggleButton
                          value={d}
                          fullWidth
                          size="small"
                          sx={toggleStyle}
                          selected={roadDistance === d}
                          onChange={() => handleRoadDistanceSelect(d)}
                        >
                          {d}
                        </ToggleButton>
                      </Grid>
                    ))}
                  </Grid>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    sx={{
                      mt: 2,
                      "& .MuiOutlinedInput-root": { borderRadius: 2 }
                    }}
                    placeholder="Additional details"
                    value={roadDetails}
                    onChange={handleRoadDetailsChange}
                  />
                </Box>
              </Fade>
            )}
          </Paper>
        </Stack>
      </Grid>

      {/* RIGHT SECTION — SUMMARY SIDEBAR */}
      <Grid item xs={12} lg={4}>
        <Paper
          elevation={0}
          sx={{
            p: 2.75,
            position: "sticky",
            top: 20,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "grey.200",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1 }}>
            <Avatar sx={{ bgcolor: "primary.50", color: "primary.main", width: 36, height: 36 }}>
              <ApartmentOutlined fontSize="small" />
            </Avatar>
            <Typography variant="h6" fontWeight={700} fontSize="16.5px">
              Service summary
            </Typography>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.75}>
            <Box sx={{ display: "flex", gap: 1.25 }}>
              <LocationOn sx={{ fontSize: 19, color: "success.main", mt: 0.2 }} />
              <Box>
                <Typography fontSize="11.5px" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  Pickup address
                </Typography>
                <Typography fontSize="13.5px" sx={{ mt: 0.25 }}>
                  {fromAddress}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1.25 }}>
              <LocationOn sx={{ fontSize: 19, color: "error.main", mt: 0.2 }} />
              <Box>
                <Typography fontSize="11.5px" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  Drop-off address
                </Typography>
                <Typography fontSize="13.5px" sx={{ mt: 0.25 }}>
                  {toAddress}
                </Typography>
              </Box>
            </Box>
          </Stack>

          {/* <Typography>
            Pickup floor charge: ₹{pickupFloorCharge}
          </Typography>

          <Typography>
            Drop floor charge: ₹{dropFloorCharge}
          </Typography> */}

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.25}>
            {pickupLiftCharge > 0 && (
              <Chip
                icon={<Cancel sx={{ fontSize: 16 }} />}
                label="Lift available at pickup location: No"
                size="small"
                sx={{
                  justifyContent: "flex-start",
                  bgcolor: "error.50",
                  color: "error.main",
                  fontWeight: 600,
                  fontSize: "12px",
                  py: 1.8,
                  "& .MuiChip-icon": { color: "error.main" }
                }}
              />
            )}

            {pickupLiftCharge == 0 && (
              <Chip
                icon={<CheckCircle sx={{ fontSize: 16 }} />}
                label="Lift available at pickup location: Yes"
                size="small"
                sx={{
                  justifyContent: "flex-start",
                  bgcolor: "success.50",
                  color: "success.main",
                  fontWeight: 600,
                  fontSize: "12px",
                  py: 1.8,
                  "& .MuiChip-icon": { color: "success.main" }
                }}
              />
            )}
            {dropLiftCharge > 0 && (
              <Chip
                icon={<Cancel sx={{ fontSize: 16 }} />}
                label="Lift available at drop-off location: No"
                size="small"
                sx={{
                  justifyContent: "flex-start",
                  bgcolor: "error.50",
                  color: "error.main",
                  fontWeight: 600,
                  fontSize: "12px",
                  py: 1.8,
                  "& .MuiChip-icon": { color: "error.main" }
                }}
              />
            )}
            {dropLiftCharge == 0 && (
              <Chip
                icon={<CheckCircle sx={{ fontSize: 16 }} />}
                label="Lift available at drop-off location: Yes"
                size="small"
                sx={{
                  justifyContent: "flex-start",
                  bgcolor: "success.50",
                  color: "success.main",
                  fontWeight: 600,
                  fontSize: "12px",
                  py: 1.8,
                  "& .MuiChip-icon": { color: "success.main" }
                }}
              />
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* <Typography fontWeight={700}>
            Total extra charge: ₹{totalExtraCharge}
          </Typography> */}

          <Stack spacing={1.25} sx={{ mt: 3 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={onNext}
              disabled={isNextDisabled}
              sx={{
                py: 1.3,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: "14px",
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
                background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                "&:hover": {
                  background: "linear-gradient(135deg, #4338ca, #4f46e5)",
                  boxShadow: "0 6px 18px rgba(79, 70, 229, 0.4)"
                },
                "&.Mui-disabled": {
                  background: "grey.200",
                  color: "grey.400"
                }
              }}
            >
              Service confirmation
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={onBack}
              sx={{
                py: 1.2,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: "13.5px",
                textTransform: "none",
                borderColor: "grey.300",
                color: "text.secondary",
                "&:hover": {
                  borderColor: "primary.main",
                  color: "primary.main",
                  bgcolor: "primary.50"
                }
              }}
            >
              Back to item selection page
            </Button>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Step2_ServiceOptions;