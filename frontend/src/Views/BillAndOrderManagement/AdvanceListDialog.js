import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

const AdvanceListDialog = ({ open, onClose, onConfirm, billAdvance }) => {
  // Ensure billAdvance is an array
  if (!Array.isArray(billAdvance)) {
    console.error("Expected billAdvance to be an array, but got:", billAdvance);
    return null; // Optionally, render a fallback or error message
  }

  // Ensure billAdvance has at least one item
  if (billAdvance.length === 0) {
    return null;  // Optionally, return null or render a loading state
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Billing Completion</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Here Advance List
        </DialogContentText>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Amount</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Loop through billAdvance array and create a row for each item */}
            {billAdvance.map((advance, index) => {
              const { description, date, amount } = advance;

              // Format the date if it's a valid Timestamp or a string
              let formattedDate = "N/A";
              if (date) {
                // If date is a Firebase Timestamp, format it as a date string
                if (date.seconds) {
                  formattedDate = new Date(date.seconds * 1000).toLocaleDateString();
                } else if (typeof date === "string") {
                  // If date is a string (e.g., '2026-02-12'), use it directly
                  formattedDate = new Date(date).toLocaleDateString();
                }
              }

              return (
                <TableRow key={index}>
                  <TableCell>{formattedDate}</TableCell>
                  <TableCell>{amount}</TableCell>
                  <TableCell>{description}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: "#9C6B3D" }}>
          close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdvanceListDialog;
