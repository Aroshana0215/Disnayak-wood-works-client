import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getexpenseById, updateexpense } from "../../../services/AccountManagementService/ExpenseManagmentService";
import { getAllActiveExpenseType } from "../../../services/SettingManagementService/ExpenseTypeService"; // Importing the service

const UpdateExp = () => {
  const { user } = useSelector((state) => state.auth);
  const { expId } = useParams(); // Get the expense ID from the URL params
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: "",
    type: "",
    des: "",
    amount: "",
  });

  const [expenseTypes, setExpenseTypes] = useState([]); // State to store the fetched expense types
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ prevent double submit

  // Fetch the expense data and the expense types on component mount
  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        const response = await getexpenseById(expId);
        setFormData({
          date: response.date,
          type: response.type,
          des: response.des,
          amount: response.amount,
        });
      } catch (error) {
        console.error("Error fetching expense data:", error.message);
      }
    };

    const fetchExpenseTypes = async () => {
      try {
        const response = await getAllActiveExpenseType();
        setExpenseTypes(response); // Assuming response is an array of types
      } catch (error) {
        console.error("Error fetching expense types:", error);
      }
    };

    fetchExpenseData();
    fetchExpenseTypes();
  }, [expId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // ✅ block double click
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Only include the fields that are being updated: date, type, des, amount
      const updatedData = {
        date: formData.date,
        type: formData.type,
        des: formData.des,
        amount: formData.amount,
        status: "A", // Assuming status is active when updating
        modifiedBy: user.displayName,
      };

      await updateexpense(expId, updatedData); // Update the expense

      // Optionally, you can add logic for updating account summary or other related data

      navigate("/exp"); // Redirect back to the expense list
    } catch (error) {
      console.error("Error updating expense:", error.message);
    } finally {
      setIsSubmitting(false); // ✅ always re-enable
    }
  };

  return (
    <Container>
      <Grid container direction="row" justifyContent="center" alignItems="stretch" spacing={2} p={2}>
        <Grid item xs={12}>
          <Typography variant="h4" sx={{ color: "#9C6B3D" }} align="center">
            Update Expense
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
                disabled={isSubmitting} // ✅ disable while submitting
                required
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
                  disabled={isSubmitting} // ✅ disable while submitting
                  required
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
                disabled={isSubmitting} // ✅ disable while submitting
                required
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
              />
            </Grid>

            <Grid item xs={12} padding={1}>
              <TextField
                label="Amount"
                name="amount"
                disabled={isSubmitting} // ✅ disable while submitting
                required
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
              <Button type="submit" variant="contained" sx={{ color: "#ffffff" }} disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UpdateExp;
