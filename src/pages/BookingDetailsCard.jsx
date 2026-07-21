import React from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  Stack,
  Button,
  Divider,
  Box,
  Paper,
  Grid,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Fade,
  Zoom,
  Tooltip
} from "@mui/material";
import {
  ShoppingCart,
  Inventory2,
  ReceiptLong,
  CheckCircle,
  LocalShipping,
  Elevator,
  DirectionsCar,
  LocationOn,
  ArrowForward,
  Info,
  Numbers,
  Scale,
  CurrencyRupee
} from "@mui/icons-material";

const BookingDetailsCard = ({
  selectedItems,
  price,
  handleContinue,
  serviceLift,
  selectedFloor,
  vanAccessible,
  roadDistance
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const totalQuantity = selectedItems.reduce((total, item) => total + item.quantity, 0);
  const totalCFT = selectedItems.reduce((total, item) => total + item.quantity * item.sizeCFT, 0);

  // Professional font size configuration
  const fontSize = {
    title: isMobile ? "1.25rem" : isTablet ? "1.375rem" : "1.5rem",      // 20px - 24px
    subtitle: isMobile ? "0.875rem" : isTablet ? "0.9375rem" : "1rem",    // 14px - 16px
    body: isMobile ? "0.8125rem" : isTablet ? "0.875rem" : "0.9375rem",   // 13px - 15px
    small: isMobile ? "0.75rem" : "0.8125rem",                           // 12px - 13px
    price: isMobile ? "1.625rem" : isTablet ? "1.75rem" : "1.875rem"      // 26px - 30px
  };

  // Calculate additional charges
  const floorCharge = serviceLift === "no" && selectedFloor ? selectedFloor * 200 : 0;
  const vanCharge = vanAccessible === "no" && roadDistance ? 500 : 0;
  const basePrice = price - floorCharge - vanCharge;

  return (
    <Zoom in={true}>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          background: '#ffffff',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          overflow: 'visible',
          position: 'relative',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #1976d2 0%, #21a1f3 100%)',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px'
          }
        }}
      >
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          {/* Header with Professional Typography */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: isMobile ? 44 : 48,
                height: isMobile ? 44 : 48,
                background: 'linear-gradient(135deg, #1976d2 0%, #21a1f3 100%)'
              }}
            >
              <ReceiptLong sx={{ fontSize: isMobile ? '1.25rem' : '1.5rem' }} />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: fontSize.title,
                  color: '#1a237e',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2
                }}
              >
                Booking Summary
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: fontSize.small,
                  color: 'text.secondary',
                  fontWeight: 500,
                  letterSpacing: '0.02em'
                }}
              >
                {totalQuantity} items • {totalCFT.toFixed(1)} CFT
              </Typography>
            </Box>
            <Chip
              label="DRAFT"
              size="small"
              sx={{
                ml: 'auto',
                fontWeight: 600,
                fontSize: fontSize.small,
                height: 24,
                bgcolor: 'rgba(33, 161, 243, 0.1)',
                color: 'primary.main'
              }}
            />
          </Stack>

          {/* Service Details Section - Professional Layout */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 2,
              bgcolor: 'rgba(33, 161, 243, 0.02)',
              border: '1px solid rgba(33, 161, 243, 0.08)'
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                fontSize: fontSize.subtitle,
                color: '#1a237e',
                mb: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <LocalShipping sx={{ fontSize: fontSize.subtitle }} />
              Service Specifications
            </Typography>

            <Grid container spacing={2.5}>
              {/* Service Lift */}
              <Grid item xs={12} sm={6}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Elevator sx={{ color: 'primary.main', fontSize: '1.25rem' }} />
                  <Box>
                    <Typography
                      sx={{
                        fontSize: fontSize.small,
                        color: 'text.secondary',
                        fontWeight: 500,
                        letterSpacing: '0.03em'
                      }}
                    >
                      SERVICE LIFT
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: fontSize.body,
                        fontWeight: 600,
                        color: serviceLift === 'no' ? '#d32f2f' : '#2e7d32'
                      }}
                    >
                      {serviceLift ? serviceLift.toUpperCase() : 'NOT SELECTED'}
                    </Typography>
                  </Box>
                </Stack>
                {serviceLift === "no" && selectedFloor && (
                  <Typography
                    sx={{
                      fontSize: fontSize.small,
                      color: '#d32f2f',
                      fontWeight: 500,
                      mt: 0.5,
                      pl: 3.5
                    }}
                  >
                    + Floor charge: ₹{floorCharge}
                  </Typography>
                )}
              </Grid>

              {/* Van Accessibility */}
              <Grid item xs={12} sm={6}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <DirectionsCar sx={{ color: 'primary.main', fontSize: '1.25rem' }} />
                  <Box>
                    <Typography
                      sx={{
                        fontSize: fontSize.small,
                        color: 'text.secondary',
                        fontWeight: 500,
                        letterSpacing: '0.03em'
                      }}
                    >
                      VAN ACCESS
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: fontSize.body,
                        fontWeight: 600,
                        color: vanAccessible === 'no' ? '#d32f2f' : '#2e7d32'
                      }}
                    >
                      {vanAccessible ? vanAccessible.toUpperCase() : 'NOT SELECTED'}
                    </Typography>
                  </Box>
                </Stack>
                {vanAccessible === "no" && roadDistance && (
                  <Typography
                    sx={{
                      fontSize: fontSize.small,
                      color: '#d32f2f',
                      fontWeight: 500,
                      mt: 0.5,
                      pl: 3.5
                    }}
                  >
                    + Access charge: ₹500
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Paper>

          {/* Selected Items - Professional Table-like Layout */}
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              fontSize: fontSize.subtitle,
              color: '#1a237e',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Inventory2 sx={{ fontSize: fontSize.subtitle }} />
            Selected Inventory
          </Typography>

          <Box sx={{ mb: 3 }}>
            {selectedItems.map((item, index) => (
              <Fade in={true} key={item.itemID} timeout={300 + index * 100}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: 2,
                    bgcolor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.01)' : 'transparent',
                    border: '1px solid rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'rgba(33, 161, 243, 0.2)',
                      bgcolor: 'rgba(33, 161, 243, 0.02)'
                    }
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={6} sm={5}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <CheckCircle
                          sx={{
                            color: 'primary.main',
                            fontSize: isMobile ? '1rem' : '1.125rem'
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: fontSize.body,
                            fontWeight: 500,
                            color: '#1a237e'
                          }}
                        >
                          {item.name}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={3} sm={2}>
                      <Typography
                        sx={{
                          fontSize: fontSize.body,
                          fontWeight: 600,
                          color: 'text.primary',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <Numbers sx={{ fontSize: fontSize.small, opacity: 0.6 }} />
                        {item.quantity}
                      </Typography>
                    </Grid>
                    <Grid item xs={3} sm={3}>
                      <Typography
                        sx={{
                          fontSize: fontSize.body,
                          color: 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <Scale sx={{ fontSize: fontSize.small, opacity: 0.6 }} />
                        {(item.quantity * item.sizeCFT).toFixed(1)} CFT
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Chip
                        label={`${item.sizeCFT} CFT ea`}
                        size="small"
                        sx={{
                          fontSize: fontSize.small,
                          fontWeight: 500,
                          height: 24,
                          bgcolor: 'rgba(0, 0, 0, 0.04)'
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Fade>
            ))}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Price Breakdown - Professional Financial Layout */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                fontSize: fontSize.subtitle,
                color: '#1a237e',
                mb: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <CurrencyRupee sx={{ fontSize: fontSize.subtitle }} />
              Price Breakdown
            </Typography>

            <Stack spacing={2}>
              {/* Base Price */}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography
                  sx={{
                    fontSize: fontSize.body,
                    color: 'text.primary',
                    fontWeight: 500
                  }}
                >
                  Base Shipping
                </Typography>
                <Typography
                  sx={{
                    fontSize: fontSize.body,
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  ₹{basePrice.toLocaleString('en-IN')}
                </Typography>
              </Stack>

              {/* Additional Charges */}
              {(floorCharge > 0 || vanCharge > 0) && (
                <Box sx={{ pl: 2, borderLeft: '2px solid rgba(33, 161, 243, 0.2)' }}>
                  <Typography
                    sx={{
                      fontSize: fontSize.small,
                      color: 'text.secondary',
                      fontWeight: 500,
                      mb: 1
                    }}
                  >
                    Additional Charges
                  </Typography>
                  {floorCharge > 0 && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography
                        sx={{
                          fontSize: fontSize.body,
                          color: 'error.main'
                        }}
                      >
                        Floor Access
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: fontSize.body,
                          fontWeight: 600,
                          color: 'error.main'
                        }}
                      >
                        + ₹{floorCharge.toLocaleString('en-IN')}
                      </Typography>
                    </Stack>
                  )}
                  {vanCharge > 0 && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography
                        sx={{
                          fontSize: fontSize.body,
                          color: 'error.main'
                        }}
                      >
                        Road Access
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: fontSize.body,
                          fontWeight: 600,
                          color: 'error.main'
                        }}
                      >
                        + ₹{vanCharge.toLocaleString('en-IN')}
                      </Typography>
                    </Stack>
                  )}
                </Box>
              )}

              {/* Divider before total */}
              <Divider sx={{ my: 1 }} />

              {/* Total Price - Prominent Display */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(33, 161, 243, 0.05)',
                  border: '1px solid rgba(33, 161, 243, 0.1)'
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: fontSize.subtitle,
                      fontWeight: 700,
                      color: '#1a237e',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    TOTAL AMOUNT
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: fontSize.small,
                      color: 'text.secondary',
                      fontWeight: 500
                    }}
                  >
                    Inclusive of all charges
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: fontSize.price,
                    fontWeight: 700,
                    color: '#1a237e',
                    letterSpacing: '-0.02em',
                    display: 'flex',
                    alignItems: 'baseline'
                  }}
                >
                  <CurrencyRupee sx={{ fontSize: `calc(${fontSize.price} * 0.85)`, mr: 0.5 }} />
                  {price.toLocaleString('en-IN')}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Continue Button - Professional CTA */}
          {handleContinue && (
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={handleContinue}
                fullWidth={isMobile}
                size={isMobile ? "large" : "medium"}
                sx={{
                  py: isMobile ? 1.75 : 1.5,
                  px: isMobile ? 4 : 6,
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: fontSize.subtitle,
                  letterSpacing: '0.02em',
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #1976d2 0%, #21a1f3 100%)',
                  boxShadow: '0 4px 20px rgba(33, 161, 243, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(33, 161, 243, 0.4)',
                    background: 'linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)'
                  }
                }}
                endIcon={<ArrowForward sx={{ fontSize: fontSize.subtitle }} />}
              >
                Proceed to Payment
              </Button>
              
              <Typography
                sx={{
                  fontSize: fontSize.small,
                  color: 'text.secondary',
                  mt: 2,
                  fontWeight: 500
                }}
              >
                You can review and modify before final payment
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Zoom>
  );
};

export default BookingDetailsCard;