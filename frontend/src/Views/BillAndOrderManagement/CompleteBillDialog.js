import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

const CompleteBillDialog = ({ open, onClose, onConfirm , remaingAmount}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Billing Completion</DialogTitle>
      <DialogContent>
            <DialogContentText>
                Balance is {" "} 
            <span 
                style={{ 
                color: 'red',    // Highlight color
                fontWeight: 'bold',  // Bold text
                fontSize: '20px'    // Increased font size
                }}
            >
                RS: {remaingAmount}
            </span> 
            <br />
            Are you sure you want to complete?
            </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: "#9C6B3D" }}>
          No
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompleteBillDialog;
