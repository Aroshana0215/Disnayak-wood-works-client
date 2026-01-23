import React, { useState, useEffect } from "react";
import { Container, Grid, Typography, TextField, Button, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { newExpense } from "../../../services/AccountManagementService/ExpenseManagmentService";
import {
  getActiveAccountSummaryDetails,
  newAccountSummary,
  updateAccountSummary,
} from "../../../services/AccountManagementService/AccountSummaryManagmentService";
import { getAllActiveExpenseType } from "../../../services/SettingManagementService/ExpenseTypeService"; // Importing the service


const AddExp = () => {
  const { user } = useSelector((state) => state.auth);

  let currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = ('0' + (currentDate.getMonth() + 1)).slice(-2); // Months are zero-based
  let day = ('0' + currentDate.getDate()).slice(-2);
  let formattedDate = `${year}-${month}-${day}`;

  const [formData, setFormData] = useState({
    date: "",
    type: "",
    des: "",
    amount: "",
    status: "A",
    createdBy: user.displayName,
    createdDate: formattedDate,
  });

  const [expenseTypes, setExpenseTypes] = useState([]); // State to store the fetched expense types

  // Fetch expense types on component mount
  useEffect(() => {
    const fetchExpenseTypes = async () => {
      try {
        const response = await getAllActiveExpenseType();
        setExpenseTypes(response); // Assuming response is an array of types
      } catch (error) {
        console.error("Error fetching expense types:", error);
      }
    };
    fetchExpenseTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const ExpensesId = await newExpense(formData);
      console.log("New Expenses ID:", ExpensesId);

      if (ExpensesId != null) {
        const data = await getActiveAccountSummaryDetails();

        if (data != null) {
          const accountSummaryData = {
            status: "D",
          };

          await updateAccountSummary(data.id, accountSummaryData);
          const newAccountSummaryData = {
            totalAmount: Number(data.totalAmount) - Number(formData.amount),
            changedAmount: formData.amount,
            previousAmount: data.totalAmount,
            expId_fk: "",
            incId_fk: ExpensesId,
            status: "A",
            createdBy: "",
            createdDate: "",
            modifiedBy: "",
            modifiedDate: "",
          };
          await newAccountSummary(newAccountSummaryData);
        }
      }

      window.location.href = "/exp";
    } catch (error) {
      console.error("Error creating Expenses:", error.message);
    }
  };

  return (
    <Container>
      <Grid container direction="row" justifyContent="center" alignItems="stretch" spacing={2} p={2}>
        <Grid item xs={12}>
          <Typography variant="h4" color="primary" align="center">
            Add Expenses
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid
            container
            component={"form"}
            onSubmit={handleSubmit}
            padding={2}
            sx={{
              bgcolor: "background.default",
              borderRadius: 2,
            }}
          >
            <Grid item xs={12} padding={1}>
              <TextField
                label="Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                sx={{ mt: 2 }}
              />
            </Grid>
            <Grid item xs={12} padding={1}>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Type"
                >
                  {expenseTypes.map((type) => (
                    <MenuItem key={type.id} value={type.typeName}>
                      {type.typeName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} padding={1}>
              <TextField
                label="Description"
                name="des"
                value={formData.des}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
            </Grid>
            <Grid item xs={12} padding={1}>
              <TextField
                label="Amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              padding={2}
              sx={{
                display: "flex",
                direction: "row",
                justifyContent: "flex-end",
                alignItems: "flex-end",
              }}
            >
              <Button type="submit" variant="contained" color="primary">
                Create
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AddExp;
