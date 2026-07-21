import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  Stack,
  Paper,
  TextField,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Container,
  Pagination,
  Divider,
  Avatar
} from "@mui/material";

import {
  Add,
  Remove,
  Category,
  CheckCircle,
  Search,
  Clear,
  Inventory2,
  ShoppingCartOutlined
} from "@mui/icons-material";

import RoomScanner from "../components/RoomScanner";
import AIBookingCopilot from "../components/AIBookingCopilot";

const ITEMS_PER_PAGE = 12;

const Step1_SelectItems = ({
  bookingData,
  onUpdate,
  onNext,
  inventoryData,
  organizedInventory,
  timeSlots,
  loading
}) => {
  const { selectedItems, categories } = bookingData;

  const [activeCategory, setActiveCategory] = useState(categories[0] || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const itemsTopRef = useRef(null);

  const handleScanAddItems = (scannedItems) => {
    const updated = [...selectedItems];
    for (const item of scannedItems) {
      const existingIdx = updated.findIndex(i => String(i.itemID) === String(item.itemID));
      if (existingIdx > -1) {
        updated[existingIdx].quantity += item.quantity;
      } else {
        updated.push({
          itemID: item.itemID,
          name: item.name,
          sizeCFT: item.sizeCFT,
          quantity: item.quantity
        });
      }
    }
    onUpdate({ selectedItems: updated });
  };

  /* ============================
      FLATTEN INVENTORY
  ============================ */
  const allItemsWithCategory = useMemo(() => {
    return Object.entries(organizedInventory).flatMap(
      ([category, items]) =>
        items.map(item => ({ ...item, __category: category }))
    );
  }, [organizedInventory]);

  /* ============================
      FILTER ITEMS
  ============================ */
  const filteredItems = useMemo(() => {
    let items = [];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = allItemsWithCategory.filter(
        item =>
          item.name.toLowerCase().includes(q) ||
          (item.description &&
            item.description.toLowerCase().includes(q))
      );
    } else {
      items = organizedInventory[activeCategory] || [];
    }

    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [
    searchQuery,
    allItemsWithCategory,
    activeCategory,
    organizedInventory
  ]);

  /* ============================
      AUTO CATEGORY SWITCH
  ============================ */
  useEffect(() => {
    if (!searchQuery) return;

    const q = searchQuery.toLowerCase();
    const match = allItemsWithCategory.find(
      item =>
        item.name.toLowerCase().includes(q) ||
        (item.description &&
          item.description.toLowerCase().includes(q))
    );

    if (match && match.__category !== activeCategory) {
      setActiveCategory(match.__category);
    }
  }, [searchQuery, allItemsWithCategory, activeCategory]);

  /* ============================
      RESET PAGE
  ============================ */
  useEffect(() => {
    setPage(1);
  }, [activeCategory, searchQuery]);

  /* ============================
      PAGINATION
  ============================ */
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, page]);

  const startItem = (page - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(page * ITEMS_PER_PAGE, filteredItems.length);

  /* ============================
      SCROLL TO TOP
  ============================ */
  useEffect(() => {
    if (itemsTopRef.current) {
      itemsTopRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }, [page]);

  /* ============================
      ACTION HANDLERS
  ============================ */
  const handleAddItem = (itemID) => {
    const exist = selectedItems.find(i => i.itemID === itemID);

    if (exist) {
      onUpdate({
        selectedItems: selectedItems.map(i =>
          i.itemID === itemID
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      });
    } else {
      const item = inventoryData.find(i => i.itemID === itemID);
      if (item) {
        onUpdate({
          selectedItems: [
            ...selectedItems,
            {
              itemID: item.itemID,
              name: item.name,
              sizeCFT: item.sizeCFT,
              quantity: 1
            }
          ]
        });
      }
    }
  };

  const handleRemoveItem = (itemID) => {
    onUpdate({
      selectedItems: selectedItems
        .map(i =>
          i.itemID === itemID
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter(i => i.quantity > 0)
    });
  };

  const handleQuantityChange = (itemID, value) => {
    const qty = parseInt(value, 10);
    if (qty === 0) {
      onUpdate({
        selectedItems: selectedItems.filter(i => i.itemID !== itemID)
      });
    } else {
      onUpdate({
        selectedItems: selectedItems.map(i =>
          i.itemID === itemID ? { ...i, quantity: qty } : i
        )
      });
    }
  };

  /* ============================
      TOTALS
  ============================ */
  const totalQuantity = selectedItems.reduce(
    (s, i) => s + i.quantity,
    0
  );

  const totalCFT = selectedItems.reduce(
    (s, i) => s + i.quantity * i.sizeCFT,
    0
  );

  /* ============================
      UI
  ============================ */
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* SEARCH HERO */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #7c3aed 100%)",
          color: "white",
          boxShadow: "0 8px 24px rgba(79, 70, 229, 0.25)"
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <Avatar sx={{ bgcolor: "rgba(255,255,255,0.18)", width: 40, height: 40 }}>
            <Inventory2 fontSize="small" />
          </Avatar>
          <Box>
            <Typography fontWeight={800} fontSize="19px" letterSpacing="-0.01em">
              Select Your Items
            </Typography>
            <Typography fontSize="12.5px" sx={{ opacity: 0.85 }}>
              Browse categories or search to build your inventory list
            </Typography>
          </Box>
        </Stack>

        <TextField
          fullWidth
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "& fieldset": { border: "none" }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery("")}>
                  <Clear fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Paper>

      {/* AI BOOKING COPILOT (CONVERSATIONAL SHIFTING AUTOMATION) */}
      <AIBookingCopilot
        bookingData={bookingData}
        onUpdate={onUpdate}
        inventoryData={inventoryData}
        timeSlots={timeSlots}
      />

      {/* AI ROOM SCANNER */}
      <RoomScanner
        inventoryData={inventoryData}
        selectedItems={selectedItems}
        onAddItems={handleScanAddItems}
      />

      {/* CATEGORY CHIPS */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          mb: 3,
          overflowX: "auto",
          pb: 1,
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "grey.300", borderRadius: 3 }
        }}
      >
        {categories.map(cat => {
          const isActive = activeCategory === cat;
          return (
            <Chip
              key={cat}
              label={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSearchQuery("");
              }}
              icon={
                isActive
                  ? <CheckCircle fontSize="small" />
                  : <Category fontSize="small" />
              }
              sx={{
                fontWeight: 600,
                fontSize: "12.5px",
                px: 0.5,
                py: 2.1,
                borderRadius: "999px",
                flexShrink: 0,
                transition: "all 0.18s ease",
                ...(isActive
                  ? {
                      background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                      color: "white",
                      boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
                      "& .MuiChip-icon": { color: "white" }
                    }
                  : {
                      bgcolor: "white",
                      color: "text.secondary",
                      border: "1px solid",
                      borderColor: "grey.200",
                      "&:hover": {
                        borderColor: "primary.main",
                        color: "primary.main",
                        bgcolor: "primary.50"
                      }
                    })
              }}
            />
          );
        })}
      </Stack>

      <Grid container spacing={2.5}>
        {/* LEFT GRID */}
        <Grid item xs={12} lg={8} ref={itemsTopRef}>
          {filteredItems.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                py: 8,
                textAlign: "center",
                borderRadius: 3,
                border: "1px dashed",
                borderColor: "grey.300",
                bgcolor: "grey.50"
              }}
            >
              <Inventory2 sx={{ fontSize: 40, color: "grey.400", mb: 1 }} />
              <Typography fontWeight={600} color="text.secondary">
                No items found
              </Typography>
              <Typography fontSize="13px" color="text.disabled">
                Try a different search term or category
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {paginatedItems.map(item => {
                const selected = selectedItems.find(
                  i => i.itemID === item.itemID
                );
                const qty = selected?.quantity ?? 0;
                const isInCart = qty > 0;

                return (
                  <Grid item xs={12} sm={6} md={3} key={item.itemID}>
                    <Card
                      elevation={0}
                      sx={{
                        height: "100%",
                        minHeight: 108,
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 2.5,
                        border: "1.5px solid",
                        borderColor: isInCart ? "primary.main" : "grey.200",
                        boxShadow: isInCart
                          ? "0 4px 14px rgba(79, 70, 229, 0.15)"
                          : "0 1px 3px rgba(0,0,0,0.04)",
                        transition: "all 0.2s ease",
                        position: "relative",
                        overflow: "visible",
                        "&:hover": {
                          borderColor: "primary.main",
                          boxShadow: "0 6px 18px rgba(79, 70, 229, 0.15)",
                          transform: "translateY(-2px)"
                        }
                      }}
                    >
                      {isInCart && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            bgcolor: "primary.main",
                            color: "white",
                            borderRadius: "999px",
                            minWidth: 20,
                            height: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            px: 0.6,
                            boxShadow: "0 2px 6px rgba(79, 70, 229, 0.4)"
                          }}
                        >
                          {qty}
                        </Box>
                      )}
                      <CardContent
                        sx={{
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                          p: 1.75,
                          "&:last-child": { pb: 1.75 }
                        }}
                      >
                        <Typography
                          fontSize="12.5px"
                          fontWeight={600}
                          color="text.primary"
                          sx={{
                            lineHeight: 1.35,
                            minHeight: 34,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}
                        >
                          {item.name}
                        </Typography>

                        <Box sx={{ flexGrow: 1 }} />

                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            mt: 1.25,
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}
                        >
                          <IconButton
                            disabled={!selected || selected.quantity <= 0}
                            onClick={() => handleRemoveItem(item.itemID)}
                            size="small"
                            sx={{
                              bgcolor: "error.50",
                              color: "error.main",
                              width: 30,
                              height: 30,
                              "&:hover": { bgcolor: "error.100" },
                              "&.Mui-disabled": { bgcolor: "grey.100", color: "grey.300" }
                            }}
                          >
                            <Remove fontSize="small" />
                          </IconButton>

                          <Box
                            sx={{
                              flex: 1,
                              height: 30,
                              border: "1px solid",
                              borderColor: isInCart ? "primary.main" : "grey.200",
                              borderRadius: 1.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12.5,
                              fontWeight: 700,
                              color: isInCart ? "primary.main" : "text.secondary",
                              bgcolor: isInCart ? "primary.50" : "transparent"
                            }}
                          >
                            {qty}
                          </Box>

                          <IconButton
                            onClick={() => handleAddItem(item.itemID)}
                            size="small"
                            sx={{
                              bgcolor: "primary.main",
                              color: "white",
                              width: 30,
                              height: 30,
                              "&:hover": { bgcolor: "primary.dark" }
                            }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <Box sx={{ mt: 3.5, textAlign: "center" }}>
              <Typography fontSize="12.5px" color="text.secondary" sx={{ mb: 1 }}>
                Showing <strong>{startItem}–{endItem}</strong> of{" "}
                <strong>{filteredItems.length}</strong> items
              </Typography>

              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, v) => setPage(v)}
                size={isMobile ? "small" : "medium"}
                color="primary"
                shape="rounded"
                sx={{
                  display: "inline-flex",
                  "& .MuiPaginationItem-root": { fontWeight: 600 }
                }}
              />
            </Box>
          )}
        </Grid>

        {/* RIGHT PANEL */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              height: "calc(100vh - 120px)",
              display: "flex",
              flexDirection: "column",
              position: "sticky",
              top: 16,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "grey.200",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Avatar sx={{ bgcolor: "primary.50", color: "primary.main", width: 34, height: 34 }}>
                <ShoppingCartOutlined fontSize="small" />
              </Avatar>
              <Box>
                <Typography fontWeight={700} fontSize="14.5px">
                  Your Selection
                </Typography>
                <Typography fontSize="11.5px" color="text.secondary">
                  Review before continuing
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Box
                sx={{
                  flex: 1,
                  bgcolor: "grey.50",
                  borderRadius: 2,
                  p: 1.25,
                  textAlign: "center"
                }}
              >
                <Typography fontWeight={800} fontSize="17px" color="text.primary">
                  {totalQuantity}
                </Typography>
                <Typography fontSize="10.5px" color="text.secondary" fontWeight={600}>
                  TOTAL ITEMS
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  bgcolor: "primary.50",
                  borderRadius: 2,
                  p: 1.25,
                  textAlign: "center"
                }}
              >
                <Typography fontWeight={800} fontSize="17px" color="primary.main">
                  {totalCFT.toFixed(1)}
                </Typography>
                <Typography fontSize="10.5px" color="primary.main" fontWeight={600}>
                  TOTAL CFT
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
              {selectedItems.length === 0 ? (
                <Box sx={{ textAlign: "center", mt: 6 }}>
                  <ShoppingCartOutlined sx={{ fontSize: 36, color: "grey.300", mb: 1 }} />
                  <Typography fontSize="13px" color="text.secondary" fontWeight={500}>
                    No items selected
                  </Typography>
                  <Typography fontSize="11.5px" color="text.disabled">
                    Tap "+" on any item to add it
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1}>
                  {selectedItems.map(item => (
                    <Box
                      key={item.itemID}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1.1,
                        borderRadius: 2,
                        bgcolor: "grey.50",
                        border: "1px solid",
                        borderColor: "grey.100"
                      }}
                    >
                      <Typography
                        fontSize="11.5px"
                        fontWeight={600}
                        sx={{
                          flex: 1,
                          pr: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                        title={item.name}
                      >
                        {item.name}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, flexShrink: 0 }}>
                        <IconButton
                          size="small"
                          disabled={item.quantity <= 0}
                          onClick={() => handleRemoveItem(item.itemID)}
                          sx={{
                            width: 22,
                            height: 22,
                            bgcolor: "error.50",
                            color: "error.main",
                            "&:hover": { bgcolor: "error.100" }
                          }}
                        >
                          <Remove sx={{ fontSize: 13 }} />
                        </IconButton>

                        <Box
                          sx={{
                            minWidth: 24,
                            height: 22,
                            border: "1px solid",
                            borderColor: "grey.300",
                            borderRadius: 1,
                            fontSize: 11,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            bgcolor: "white"
                          }}
                        >
                          {item.quantity}
                        </Box>

                        <IconButton
                          size="small"
                          onClick={() => handleAddItem(item.itemID)}
                          sx={{
                            width: 22,
                            height: 22,
                            bgcolor: "primary.main",
                            color: "white",
                            "&:hover": { bgcolor: "primary.dark" }
                          }}
                        >
                          <Add sx={{ fontSize: 13 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            <Button
              fullWidth
              variant="contained"
              disabled={selectedItems.length === 0 || loading}
              onClick={onNext}
              sx={{
                mt: 2,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: "14px",
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
                background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                "&:hover": {
                  background: "linear-gradient(135deg, #4338ca, #4f46e5)",
                  boxShadow: "0 6px 18px rgba(79, 70, 229, 0.4)"
                }
              }}
            >
              Continue{selectedItems.length > 0 ? ` (${totalQuantity} items)` : ""}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Step1_SelectItems;