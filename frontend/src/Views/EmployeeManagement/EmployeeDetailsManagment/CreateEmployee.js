import React, { useState, useEffect } from "react";
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
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import {
  newEmployee,
  getemployeeDetailsById,
  updateemployeeDetails,
} from "../../../services/EmployeeManagementService/EmployeeDetailService";

const CreateEmployee = ({ mode = "create" }) => {
  const { eid } = useParams(); // For update, we get the employee ID from the URL
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [salaryType, setSalaryType] = useState("DAY"); // DAY | MONTH
  const [payload, setPayload] = useState({
    firstName: "",
    lastName: "",
    nic: "",
    address: "",
    phoneNo: "",
    otValuePerHour: "",
    salaryPerDay: "",
    salaryPerMonth: "",
    currentLendAmount: "",
    joinDate: "",
    employeeImage: null,
    status: "A",
    createdDate: new Date().toISOString().split("T")[0],
    createdBy: user?.displayName || user?.email || user?.uid || "System",
    modifiedBy: "",
    modifiedDate: "",
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (mode === "update" && eid) {
      const fetchEmployeeDetails = async () => {
        try {
          const empDetails = await getemployeeDetailsById(eid);
          setPayload(empDetails);
          setSalaryType(empDetails.salaryPerDay ? "DAY" : "MONTH"); // Determine salary type based on data
        } catch (error) {
          toast.error("Error fetching employee details for update: " + error.message);
        }
      };
      fetchEmployeeDetails();
    }
  }, [eid, mode]);

  const validate = () => {
    let tempErrors = {};
    // Validate all required fields except system/optional & salary fields
    Object.entries(payload).forEach(([key, value]) => {
      if (!value && !["currentLendAmount", "modifiedBy", "modifiedDate", "salaryPerDay", "salaryPerMonth", "employeeImage"].includes(key)) {
        tempErrors[key] = `${key.replace(/([A-Z])/g, " $1").trim()} is required`;
      }
    });

    // Salary validation based on selected salary type
    if (salaryType === "DAY" && !payload.salaryPerDay) tempErrors.salaryPerDay = "Salary per day is required";
    if (salaryType === "MONTH" && !payload.salaryPerMonth) tempErrors.salaryPerMonth = "Salary per month is required";

    if (payload.phoneNo && !/^\d{10}$/.test(payload.phoneNo)) tempErrors.phoneNo = "Phone number must be 10 digits";
    if (payload.otValuePerHour && isNaN(payload.otValuePerHour)) tempErrors.otValuePerHour = "OT Value must be a valid number";
    if (!payload.employeeImage) tempErrors.employeeImage = "Employee image is required";

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
    const file = e.target.files?.[0];
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
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSalaryTypeChange = (e) => {
    const nextType = e.target.value;
    setSalaryType(nextType);
    setPayload((prev) => ({
      ...prev,
      salaryPerDay: nextType === "DAY" ? prev.salaryPerDay : "",
      salaryPerMonth: nextType === "MONTH" ? prev.salaryPerMonth : "",
    }));
    setErrors((prev) => {
      const { salaryPerDay, salaryPerMonth, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    setLoading(true);
    try {
      const finalPayload = {
        ...payload,
        salaryPerDay: salaryType === "DAY" ? payload.salaryPerDay : "",
        salaryPerMonth: salaryType === "MONTH" ? payload.salaryPerMonth : "",
      };

      if (mode === "create") {
        await newEmployee(finalPayload);
        toast.success("Employee created successfully!");
      } else {
        await updateemployeeDetails(eid, finalPayload);
        toast.success("Employee details updated successfully!");
      }

      setTimeout(() => {
        setLoading(false);
        window.location.href = "/employee";
      }, 1000);
    } catch (error) {
      toast.error("Error submitting form: " + error.message);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ color: "#9C6B3D" }} align="center" gutterBottom>
          {mode === "create" ? "Employee Details Submission" : "Update Employee Details"}
        </Typography>

        <Grid container component="form" onSubmit={handleSubmit} spacing={2}>
          {/* Salary Type Radio (Top Center) */}
          <Grid item xs={12} display="flex" justifyContent="center">
            <FormControl>
              <RadioGroup row value={salaryType} onChange={handleSalaryTypeChange}>
                <FormControlLabel value="DAY" control={<Radio />} label="Salary Per Day" />
                <FormControlLabel value="MONTH" control={<Radio />} label="Salary Per Month" />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Dynamic Fields */}
          {Object.entries(payload).map(([key, value]) => {
            const hiddenKeys = ["status", "createdDate", "createdBy", "modifiedBy", "modifiedDate", "employeeImage"];
            if (salaryType === "DAY" && key === "salaryPerMonth") return null;
            if (salaryType === "MONTH" && key === "salaryPerDay") return null;
            if (hiddenKeys.includes(key)) return null;

            return (
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
            );
          })}

          {/* Employee Image Upload */}
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
                  "&:hover": { backgroundColor: "#f0f0f0" },
                }}
                onClick={() => document.getElementById("employeeImageInput").click()}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: "100px", height: "100px", borderRadius: "50%" }}
                  />
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

              {errors.employeeImage && (
                <Typography color="error" variant="body2">
                  {errors.employeeImage}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Submit */}
          <Grid item xs={12} display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" sx={{ color: "#9C6B3D" }} size="large" disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : mode === "create" ? "Create" : "Update"}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default CreateEmployee;
