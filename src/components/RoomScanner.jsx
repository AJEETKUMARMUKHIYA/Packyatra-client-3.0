import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Paper,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardMedia,
  CardContent,
  Tooltip,
  Chip
} from "@mui/material";
import {
  AutoAwesome,
  CloudUpload,
  Close,
  CheckCircle,
  PhotoCamera,
  RestartAlt,
  Delete,
  Add,
  Remove,
  ChevronRight
} from "@mui/icons-material";

const SCANNING_PHASES = [
  "Uploading room media to PackYatra AI...",
  "Analyzing room space, layout, and frames...",
  "Identifying furniture & appliances...",
  "Estimating volume in Cubic Feet (CFT)...",
  "Matching detected items with our inventory database...",
  "Refining results for maximum accuracy..."
];

const RoomScanner = ({ inventoryData, selectedItems, onAddItems }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [scanResult, setScanResult] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errorSnackbar, setErrorSnackbar] = useState({ open: false, message: "" });
  const [successSnackbar, setSuccessSnackbar] = useState({ open: false, message: "" });

  const fileInputRef = useRef(null);

  // Rotate through funny/realistic scanning phases to keep the user engaged
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setInterval(() => {
        setCurrentPhase((prev) => (prev + 1) % SCANNING_PHASES.length);
      }, 3000);
    } else {
      setCurrentPhase(0);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const addFiles = (files) => {
    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    if (validFiles.length === 0) {
      showError("Please select valid room photos or videos (PNG, JPG, WEBP, MP4, WEBM, MOV).");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);

    // Create object URLs for previewing
    const newPreviews = validFiles.map((file) => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    // Revoke the object URL to avoid memory leak
    URL.revokeObjectURL(previews[index].url);

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setSelectedFiles([]);
    setPreviews([]);
    setScanResult([]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    addFiles(files);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleScan = async () => {
    if (selectedFiles.length === 0) {
      showError("Please upload at least one room photo or video.");
      return;
    }

    setLoading(true);
    try {
      // Convert all files to base64
      const base64Files = await Promise.all(
        selectedFiles.map((file) => fileToBase64(file))
      );

      // We only send minimal item metadata to Gemini to match against
      const validItems = inventoryData.map((item) => ({
        itemID: item.itemID,
        name: item.name,
        category: item.category,
        sizeCFT: item.sizeCFT,
      }));

      const response = await fetch("/api/gemini/scan-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: base64Files,
          validItems,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to scan media.");
      }

      const data = await response.json();
      const detected = data.items || [];

      if (detected.length === 0) {
        showError("PackYatra AI couldn't detect any moving items in the uploaded media. Try uploading a clearer picture or video walkthrough.");
        setLoading(false);
        return;
      }

      // Map back detailed information from our inventory list
      const resultsWithDetails = detected
        .map((scanned) => {
          const matched = inventoryData.find((inv) => String(inv.itemID) === String(scanned.itemID));
          if (matched) {
            return {
              ...matched,
              quantity: scanned.quantity || 1,
            };
          }
          return null;
        })
        .filter(Boolean);

      setScanResult(resultsWithDetails);
      setDialogOpen(true);
    } catch (err) {
      console.error(err);
      showError(err.message || "Something went wrong while scanning the media.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemID, delta) => {
    setScanResult((prev) =>
      prev
        .map((item) => {
          if (item.itemID === itemID) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const applyResults = () => {
    // Merge results into parent component selection
    onAddItems(scanResult);
    setDialogOpen(false);
    showSuccess(`Added ${scanResult.reduce((s, i) => s + i.quantity, 0)} items to your inventory!`);
    clearAll();
  };

  const showError = (msg) => {
    setErrorSnackbar({ open: true, message: msg });
  };

  const showSuccess = (msg) => {
    setSuccessSnackbar({ open: true, message: msg });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
        bgcolor: "white",
        mb: 4,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)"
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, flexWrap: "wrap", gap: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              color: "white",
              borderRadius: "12px",
              width: 42,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 10px rgba(79, 70, 229, 0.3)"
            }}
          >
            <AutoAwesome fontSize="small" />
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: "text.primary" }}>
                AI Room-to-Inventory Scanner (Photo & Video Walkthrough)
              </Typography>
              <Chip
                label="Gemini 3.5"
                size="small"
                color="primary"
                sx={{
                  height: 20,
                  fontSize: "10px",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
                }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Upload photos or a short video walkthrough of your rooms. PackYatra AI will automatically pre-populate your shifting items list!
            </Typography>
          </Box>
        </Stack>

        {previews.length > 0 && (
          <Button
            size="small"
            color="error"
            startIcon={<RestartAlt fontSize="small" />}
            onClick={clearAll}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Clear All
          </Button>
        )}
      </Stack>

      {/* DRAG AND DROP ZONE */}
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          border: "2px dashed",
          borderColor: isDragOver ? "primary.main" : "grey.300",
          borderRadius: 3,
          p: 4,
          textAlign: "center",
          cursor: "pointer",
          bgcolor: isDragOver ? "primary.50" : "grey.50",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "primary.main",
            bgcolor: "primary.50"
          }
        }}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <CloudUpload sx={{ fontSize: 44, color: isDragOver ? "primary.main" : "grey.400", mb: 1.5 }} />
        <Typography variant="body1" fontWeight={700} sx={{ mb: 0.5, color: "text.primary" }}>
          Drag & drop room photos or videos here or click to browse
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Supports PNG, JPG, WEBP, MP4, WEBM, MOV (Walkthrough videos or room photos)
        </Typography>
      </Box>

      {/* PHOTO/VIDEO PREVIEWS */}
      {previews.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 1 }}>
            UPLOADED MEDIA ({previews.length})
          </Typography>
          <Grid container spacing={2}>
            {previews.map((preview, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "grey.200",
                    pt: "100%", // 1:1 Aspect Ratio
                    bgcolor: "grey.100"
                  }}
                >
                  {preview.type?.startsWith("video/") ? (
                    <video
                      src={preview.url}
                      muted
                      loop
                      autoPlay
                      playsInline
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  ) : (
                    <img
                      src={preview.url}
                      alt={preview.name}
                      referrerPolicy="no-referrer"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  )}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      bgcolor: "rgba(0, 0, 0, 0.6)",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(0, 0, 0, 0.8)"
                      }
                    }}
                  >
                    <Close sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={handleScan}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />}
              sx={{
                px: 4,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: "none",
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)",
                  boxShadow: "0 6px 18px rgba(79, 70, 229, 0.4)"
                }
              }}
            >
              {loading ? "Analyzing Room..." : "Analyze with AI"}
            </Button>
          </Box>
        </Box>
      )}

      {/* SCANNING LOADER WINDOW */}
      {loading && (
        <Paper
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: "primary.200",
            bgcolor: "primary.50",
            textAlign: "center"
          }}
        >
          <CircularProgress size={32} sx={{ mb: 1.5, color: "primary.main" }} />
          <Typography variant="body2" fontWeight={700} color="primary.main">
            {SCANNING_PHASES[currentPhase]}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            Our Gemini-3.5 multimodality algorithm is matching room contents to moving volumes...
          </Typography>
        </Paper>
      )}

      {/* CONFIRMATION / ADJUSTMENT DIALOG */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CheckCircle color="success" />
            <Typography variant="h6" fontWeight={800}>
              AI Scan Complete!
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            We've identified the following items from your room photos. Review or adjust before adding to your selection.
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 1 }}>
          <List disablePadding>
            {scanResult.map((item) => (
              <React.Fragment key={item.itemID}>
                <ListItem
                  sx={{
                    py: 1.5,
                    px: 0.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                        {item.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="primary.main" fontWeight={600}>
                        Volume: {item.sizeCFT} CFT per item
                      </Typography>
                    }
                  />

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(item.itemID, -1)}
                      sx={{
                        border: "1px solid",
                        borderColor: "grey.300",
                        bgcolor: "grey.50"
                      }}
                    >
                      <Remove sx={{ fontSize: 14 }} />
                    </IconButton>
                    <Typography
                      variant="body2"
                      fontWeight={800}
                      sx={{ minWidth: 28, textAlign: "center" }}
                    >
                      {item.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(item.itemID, 1)}
                      sx={{
                        border: "1px solid",
                        borderColor: "primary.300",
                        bgcolor: "primary.50",
                        color: "primary.main"
                      }}
                    >
                      <Add sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Stack>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>

          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 2,
              bgcolor: "grey.50",
              border: "1px solid",
              borderColor: "grey.200",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              TOTAL SCAN VOLUME
            </Typography>
            <Typography variant="subtitle2" fontWeight={800} color="primary.main">
              {scanResult.reduce((sum, item) => sum + item.quantity * item.sizeCFT, 0).toFixed(1)} CFT
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 2 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            color="inherit"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={applyResults}
            variant="contained"
            color="primary"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
            }}
          >
            Add to Selection
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR FEEDBACKS */}
      <Snackbar
        open={errorSnackbar.open}
        autoHideDuration={6000}
        onClose={() => setErrorSnackbar({ open: false, message: "" })}
      >
        <Alert severity="error" sx={{ width: "100%", borderRadius: 2, fontWeight: 600 }}>
          {errorSnackbar.message}
        </Alert>
      </Snackbar>

      <Snackbar
        open={successSnackbar.open}
        autoHideDuration={4000}
        onClose={() => setSuccessSnackbar({ open: false, message: "" })}
      >
        <Alert severity="success" sx={{ width: "100%", borderRadius: 2, fontWeight: 600 }}>
          {successSnackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default RoomScanner;
