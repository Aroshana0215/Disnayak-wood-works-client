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
import { getbillAdvancesByBillId, createbillAdvance } from "../../services/BillAndOrderService/BilllAdvanceService";
import { getbillDetailsById, updatebillDetails } from "../../services/BillAndOrderService/BilllManagemntService";
import { ToastContainer, toast } from "react-toastify";

const UpdateBill = ({ open, onClose, user, bill }) => {

  let currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Months are zero-based
  let day = ("0" + currentDate.getDate()).slice(-2);
  let formattedDate = `${year}-${month}-${day}`;


  const [billData, setBillData] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [newAdvance, setNewAdvance] = useState({
    amount: "",
    description: "",
    date: null,
  });

  useEffect(() => {
    if (bill.id && open) {
      fetchBillData(bill.id);
    }
  }, [bill.id, open]);

  const fetchBillData = async (billId) => {
    try {
      const data = await getbillAdvancesByBillId(billId);
      setBillData(data);
    } catch (error) {
      console.error("Error fetching bill data:", error);
    }
  };

  const handleAdd = async () => {

    const billDetails = await getbillDetailsById(bill.id);

    const result = validateBillInputs(newAdvance, billDetails);
    if (result) {
      return;
    }

    const payLoad = {
      ...newAdvance,
      BillId : bill.id, 
      status: "A",
      createdBy: user.displayName,
      createdDate: formattedDate,
    }
    const AdvanceId = await createbillAdvance(payLoad);

    if(AdvanceId){
     if(billDetails){
      const newBillDetails = {
        ...billDetails,
        advance : Number(billDetails.advance) + Number (newAdvance.amount) || Number(billDetails.advance) || Number(billDetails.advance) , 
        remainningAmount: Number(billDetails.totalAmount) - (Number(billDetails.advance) + Number (newAdvance.amount)) || Number(billDetails.remainningAmount),
        modifiedBy: user.displayName,
        modifiedDate: formattedDate,
      }
  
      updatebillDetails(bill.id, newBillDetails);
     }else{
      toast.success("Inavlid Bill!");
     }
         
    fetchBillData(bill.id);
    setTabIndex(0);
    setNewAdvance({}); 

    toast.success("Advance created successfully!");
    }else{
      toast.error("advance creating error!!");
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const validateBillInputs = (formData, billDetails) => {
    let status = false;
    
    if(!formData.amount || formData.amount === ""){
      toast.error("Amount required");
      status = true;
    }else{
      if(!formData.date || formData.date === ""){
        toast.error("Date required");
        status = true;
      }
    }

    const totAdvance = Number(formData.amount) + Number(billDetails.advance);
    if(totAdvance >  billDetails.totalAmount){
      toast.error("Sum of the advance cannot exceed the Bill amount!!");
      status = true;
    }
            return status;
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
                  {billData.map((bill, index) => (
                    <TableRow key={index}>
                      <TableCell>{bill.createdDate}</TableCell>
                      <TableCell>{bill.amount}</TableCell>
                      <TableCell>{bill.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>Loading...</p>
            )}
          </Box>
        )}

        {tabIndex === 1 && (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box mt={2}>
              <h3>Add New Advance</h3>
              <DatePicker
                label="Date"
                value={newAdvance.date}
                onChange={(newDate) =>
                  setNewAdvance({ ...newAdvance, date: newDate })
                }
                renderInput={(params) => (
                  <TextField {...params} fullWidth margin="normal" />
                )}
              />
              <TextField
                label="Advance Amount"
                fullWidth
                margin="normal"
                value={newAdvance.amount}
                onChange={(e) =>
                  setNewAdvance({ ...newAdvance, amount: e.target.value })
                }
              />
              <TextField
                label="Description"
                fullWidth
                margin="normal"
                value={newAdvance.description}
                onChange={(e) =>
                  setNewAdvance({
                    ...newAdvance,
                    description: e.target.value,
                  })
                }
              />
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button variant="contained" color="primary" onClick={handleAdd}>
                  Add Advance
                </Button>
              </Box>
            </Box>
          </LocalizationProvider>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateBill;
