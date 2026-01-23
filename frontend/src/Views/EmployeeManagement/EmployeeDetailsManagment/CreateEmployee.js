import React, { useState } from "react";
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  FormControl,
  Paper,
  Box,
  CircularProgress,
} from "@mui/material";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { newEmployee } from "../../../services/EmployeeManagementService/EmployeeDetailService";

const CreateEmployee = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  let currentDate = new Date().toISOString().split("T")[0];

  const [payload, setPayload] = useState({
    firstName: "",
    lastName: "",
    nic: "",
    address: "",
    phoneNo: "",
    otValuePerHour: "",
    salaryPerDay: "",
    currentLendAmount: "",
    joinDate: "",
    employeeImage: null,
    status: "A",
    createdDate: currentDate,
    createdBy: user.displayName,
    modifiedBy: "",
    modifiedDate: "",
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  const validate = () => {
    let tempErrors = {};
    Object.entries(payload).forEach(([key, value]) => {
      if (!value && key !== "currentLendAmount" && key !== "modifiedBy" && key !== "modifiedDate") {
        tempErrors[key] = `${key.replace(/([A-Z])/g, " $1").trim()} is required`;
      }
    });

    if (payload.phoneNo && !/^\d{10}$/.test(payload.phoneNo)) {
      tempErrors.phoneNo = "Phone number must be 10 digits";
    }

    if (payload.salaryPerDay && isNaN(payload.salaryPerDay)) {
      tempErrors.salaryPerDay = "Salary must be a valid number";
    }

    if (payload.otValuePerHour && isNaN(payload.otValuePerHour)) {
      tempErrors.otValuePerHour = "OT Value must be a valid number";
    }

    if (!payload.employeeImage) {
      tempErrors.employeeImage = "Employee image is required";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prevPayload) => ({
      ...prevPayload,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/png", "image/jpeg"].includes(file.type)) {
        toast.error("Only PNG or JPG images are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      setPayload((prevPayload) => ({
        ...prevPayload,
        employeeImage: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    setLoading(true);
    try {
      await newEmployee(payload);
      toast.success("Employee created successfully!");

      setTimeout(() => {
        setLoading(false);
        window.location.href = "/employee";
      }, 1000);
    } catch (error) {
      toast.error("Error creating employee: " + error.message);
      console.error("Error creating employee:", error.message);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" color="primary" align="center" gutterBottom>
          Employee Details Submission
        </Typography>
        <Grid container component="form" onSubmit={handleSubmit} spacing={2}>
          {Object.entries(payload).map(([key, value]) =>
            ["status", "createdDate", "createdBy", "modifiedBy", "modifiedDate", "employeeImage"].includes(key) ? null : (
              <Grid item key={key} xs={12} md={6}>
                <FormControl fullWidth>
                  <Typography variant="body1" fontWeight={500} gutterBottom>
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                  </Typography>
                  <TextField
                    name={key}
                    value={value}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    type={key === "joinDate" ? "date" : "text"}
                    InputLabelProps={{ shrink: key === "joinDate" }}
                    error={!!errors[key]}
                    helperText={errors[key]}
                  />
                </FormControl>
              </Grid>
            )
          )}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <Typography variant="body1" fontWeight={500} gutterBottom>
                Employee Image
              </Typography>
              <Box
                sx={{
                  border: "2px dashed grey",
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 60,
                  cursor: "pointer",
                  textAlign: "center",
                  p: 2,
                  backgroundColor: "#f9f9f9",
                  "&:hover": {
                    backgroundColor: "#f0f0f0",
                  },
                }}
                onClick={() => document.getElementById("employeeImageInput").click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: "100px", height: "100px", borderRadius: "50%" }} />
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Click to upload PNG or JPG (Max 5MB)
                  </Typography>
                )}
              </Box>
              <input
                id="employeeImageInput"
                type="file"
                accept="image/png, image/jpeg"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              {errors.employeeImage && <Typography color="error" variant="body2">{errors.employeeImage}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12} display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" color="primary" size="large" disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Create"}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default CreateEmployee;
