import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Tabs,
  Tab,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, isValid } from "date-fns";
import { toast } from "react-toastify";

import {
  getbillAdvancesByBillId,
  createbillAdvance,
} from "../../services/BillAndOrderService/BilllAdvanceService";
import {
  getbillDetailsById,
  updatebillDetails,
} from "../../services/BillAndOrderService/BilllManagemntService";
import { newIncome } from "../../services/AccountManagementService/IncomeManagmentService";

const UpdateBillAdvance = ({ open, onClose, user, bill }) => {
  const currentDate = new Date();
  const formattedDate = format(currentDate, "yyyy-MM-dd");

  const toYYYYMMDD = (date) => {
    if (!date) return null;
    const d = date instanceof Date ? date : new Date(date);
    return isValid(d) ? format(d, "yyyy-MM-dd") : null;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billData, setBillData] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [newAdvance, setNewAdvance] = useState({
    amount: "",
    description: "",
    date: null,
  });

  useEffect(() => {
    if (bill?.id && open) {
      fetchBillData(bill.id);
    }
  }, [bill?.id, open]);

  const fetchBillData = async (billId) => {
    try {
      const data = await getbillAdvancesByBillId(billId);
      setBillData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching bill data:", error);
      setBillData([]);
    }
  };

  const validateBillInputs = (formData, billDetails) => {
    if (!billDetails) {
      toast.error("Invalid Bill!");
      return true;
    }

    if (!formData.amount || String(formData.amount).trim() === "") {
      toast.error("Amount required");
      return true;
    }

    if (!formData.date) {
      toast.error("Date required");
      return true;
    }

    const amountNum = Number(formData.amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      toast.error("Invalid amount");
      return true;
    }

    const currentAdvance = Number(billDetails.advance || 0);
    const totalAmount = Number(billDetails.totalAmount || 0);

    if (amountNum + currentAdvance > totalAmount) {
      toast.error("Sum of the advance cannot exceed the Bill amount!!");
      return true;
    }

    return false;
  };

  const handleAdd = async (event) => {
    event?.preventDefault?.();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (!bill?.id) {
        toast.error("Invalid Bill!");
        return;
      }

      const billDetails = await getbillDetailsById(bill.id);

      const hasError = validateBillInputs(newAdvance, billDetails);
      if (hasError) return;

      const advanceDate = toYYYYMMDD(newAdvance.date);
      if (!advanceDate) {
        toast.error("Invalid date");
        return;
      }

      // ✅ Create Advance (send date as yyyy-MM-dd)
      const payLoad = {
        amount: newAdvance.amount,
        description: newAdvance.description || "",
        date: advanceDate, // ✅ DB format
        BillId: bill.id,
        status: "A",
        createdBy: user?.displayName || "",
        createdDate: formattedDate,
      };

      const advanceId = await createbillAdvance(payLoad);

      if (!advanceId) {
        toast.error("Advance creating error!!");
        return;
      }

      // ✅ Update bill details (advance + remaining)
      const prevAdvance = Number(billDetails.advance || 0);
      const totalAmount = Number(billDetails.totalAmount || 0);
      const addAmount = Number(newAdvance.amount || 0);

      const updatedAdvance = prevAdvance + addAmount;
      const updatedRemaining = totalAmount - updatedAdvance;

      const newBillDetails = {
        ...billDetails,
        advance: updatedAdvance,
        remainningAmount: updatedRemaining,
        modifiedBy: user?.displayName || "",
        modifiedDate: formattedDate,
      };

      // ✅ Create income record (also yyyy-MM-dd)
      const incomeId = await newIncome({
        date: advanceDate, // ✅ DB format
        type: "Advance-Bill",
        des: "Order Advance",
        amount: newAdvance.amount,
        BilId: bill?.billID || "",
        status: "A",
        createdBy: user?.displayName || "",
        createdDate: formattedDate,
      });

      if (incomeId) {
        await updatebillDetails(bill.id, newBillDetails);
      } else {
        toast.error("Income creating error!");
        return;
      }

      await fetchBillData(bill.id);
      setTabIndex(0);
      setNewAdvance({ amount: "", description: "", date: null });

      toast.success("Advance created successfully!");
    } catch (error) {
      console.error("Error creating Advance:", error);
      toast.error("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (_event, newValue) => {
    setTabIndex(newValue);
  };

  const renderBillDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (!isValid(d)) {
      // Handle strings like "February 23, 2026 at ..."
      if (typeof value === "string" && value.includes(" at ")) {
        const cleaned = value.split(" at ")[0];
        const d2 = new Date(cleaned);
        return isValid(d2) ? format(d2, "yyyy-MM-dd") : String(value);
      }
      return String(value);
    }
    return format(d, "yyyy-MM-dd");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Update Bill</DialogTitle>

      <DialogContent>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Advance List" />
          <Tab label="Add Advance" />
        </Tabs>

        {tabIndex === 0 && (
          <Box mt={2}>
            <h3>Bill Advances</h3>

            {billData && billData.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Advance Amount</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {billData.map((row, index) => (
                    <TableRow key={row?.id ?? index}>
                      <TableCell>{renderBillDate(row?.date || row?.createdDate)}</TableCell>
                      <TableCell>{row?.amount}</TableCell>
                      <TableCell>{row?.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>No advances found.</p>
            )}
          </Box>
        )}

        {tabIndex === 1 && (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box mt={2} component="form" onSubmit={handleAdd}>
              <h3>Add New Advance</h3>

              <DatePicker
                label="Date"
                value={newAdvance.date}
                disabled={isSubmitting}
                onChange={(newDate) => setNewAdvance({ ...newAdvance, date: newDate })}
                renderInput={(params) => (
                  <TextField {...params} fullWidth margin="normal" />
                )}
              />

              <TextField
                label="Advance Amount"
                fullWidth
                margin="normal"
                disabled={isSubmitting}
                value={newAdvance.amount}
                onChange={(e) => setNewAdvance({ ...newAdvance, amount: e.target.value })}
              />

              <TextField
                label="Description"
                fullWidth
                margin="normal"
                disabled={isSubmitting}
                value={newAdvance.description}
                onChange={(e) =>
                  setNewAdvance({ ...newAdvance, description: e.target.value })
                }
              />

              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ color: "#fdfdfd" }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Advance"}
                </Button>
              </Box>
            </Box>
          </LocalizationProvider>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateBillAdvance;