import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from "@mui/material";

const ValidationDialog = ({ open, message, onClose, title = "⚠️ Action Required" }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        {title}
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mt: 1 }}>
          {message}
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          onClick={onClose}
          autoFocus
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ValidationDialog;
