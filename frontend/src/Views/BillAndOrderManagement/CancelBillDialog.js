import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

const CancelBillDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Bill Cancellation</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to cancel?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          No
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelBillDialog;
