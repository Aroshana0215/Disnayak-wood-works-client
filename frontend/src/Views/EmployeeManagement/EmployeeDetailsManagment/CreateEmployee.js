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
  Avatar,
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
  const { eid } = useParams();
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
    holidayRate: "0",
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

          setPayload({
            ...empDetails,
            holidayRate:
              empDetails?.holidayRate !== undefined &&
              empDetails?.holidayRate !== null &&
              String(empDetails?.holidayRate).trim() !== ""
                ? String(empDetails.holidayRate)
                : "0",
          });

          const isDay = empDetails?.salaryPerDay && Number(empDetails.salaryPerDay) > 0;
          setSalaryType(isDay ? "DAY" : "MONTH");
        } catch (error) {
          toast.error("Error fetching employee details for update: " + error.message);
        }
      };
      fetchEmployeeDetails();
    }
  }, [eid, mode]);

  const validate = () => {
    let tempErrors = {};

    Object.entries(payload).forEach(([key, value]) => {
      const optionalKeys = [
        "currentLendAmount",
        "modifiedBy",
        "modifiedDate",
        "salaryPerDay",
        "salaryPerMonth",
        "employeeImage",
        "holidayRate",
      ];

      if (!value && !optionalKeys.includes(key)) {
        tempErrors[key] = `${key.replace(/([A-Z])/g, " $1").trim()} is required`;
      }
    });

    if (salaryType === "DAY" && !payload.salaryPerDay)
      tempErrors.salaryPerDay = "Salary per day is required";

    if (salaryType === "MONTH" && !payload.salaryPerMonth)
      tempErrors.salaryPerMonth = "Salary per month is required";

    if (salaryType === "MONTH") {
      const hr = parseFloat(payload.holidayRate || 0);
      if (!Number.isFinite(hr) || hr < 0) tempErrors.holidayRate = "Holiday Rate must be 0 or greater";
    }

    if (payload.phoneNo && !/^\d{10}$/.test(payload.phoneNo))
      tempErrors.phoneNo = "Phone number must be 10 digits";

    if (payload.otValuePerHour && isNaN(payload.otValuePerHour))
      tempErrors.otValuePerHour = "OT Value must be a valid number";

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

      setErrors((prev) => ({ ...prev, employeeImage: "" }));
    }
  };

  const handleSalaryTypeChange = (e) => {
    const nextType = e.target.value;
    setSalaryType(nextType);

    setPayload((prev) => ({
      ...prev,
      salaryPerDay: nextType === "DAY" ? prev.salaryPerDay : "",
      salaryPerMonth: nextType === "MONTH" ? prev.salaryPerMonth : "",
      holidayRate: nextType === "MONTH" ? (prev.holidayRate ?? "0") : "0",
    }));

    setErrors((prev) => {
      const { salaryPerDay, salaryPerMonth, holidayRate, ...rest } = prev;
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
        holidayRate: salaryType === "MONTH" ? String(payload.holidayRate || "0") : "0",
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
          {/* Salary Type Radio */}
          <Grid item xs={12} display="flex" justifyContent="center">
            <FormControl>
              <RadioGroup row value={salaryType} onChange={handleSalaryTypeChange}>
                <FormControlLabel value="DAY" control={<Radio />} label="Salary Per Day" />
                <FormControlLabel value="MONTH" control={<Radio />} label="Salary Per Month" />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Fields */}
          {Object.entries(payload).map(([key, value]) => {
            const hiddenKeys = ["status", "createdDate", "createdBy", "modifiedBy", "modifiedDate", "employeeImage"];

            if (salaryType === "DAY" && key === "salaryPerMonth") return null;
            if (salaryType === "MONTH" && key === "salaryPerDay") return null;
            if (key === "holidayRate" && salaryType !== "MONTH") return null;
            if (hiddenKeys.includes(key)) return null;

            const isJoinDate = key === "joinDate";
            const isNumeric =
              ["otValuePerHour", "salaryPerDay", "salaryPerMonth", "currentLendAmount", "holidayRate"].includes(key);

            const label = key
              .charAt(0)
              .toUpperCase()
              .concat(key.slice(1))
              .replace(/([A-Z])/g, " $1");

            return (
              <Grid item key={key} xs={12} md={6}>
                <FormControl fullWidth>
                  <Typography variant="body1" fontWeight={500} gutterBottom>
                    {label}
                  </Typography>

                  <TextField
                    name={key}
                    value={value ?? ""}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    size="small"
                    type={isJoinDate ? "date" : isNumeric ? "number" : "text"}
                    inputProps={key === "holidayRate" ? { min: 0, step: "0.01" } : undefined}
                    InputLabelProps={{ shrink: isJoinDate }}
                    error={!!errors[key]}
                    helperText={errors[key]}
                  />
                </FormControl>
              </Grid>
            );
          })}

          {/* ✅ Image input SAME HEIGHT as other fields */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <Typography variant="body1" fontWeight={500} gutterBottom>
                Employee Image
              </Typography>

              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <TextField
                  fullWidth
                  size="small"
                  value={payload.employeeImage?.name || ""}
                  placeholder="Upload PNG or JPG (Max 5MB)"
                  InputProps={{ readOnly: true }}
                  error={!!errors.employeeImage}
                  helperText={errors.employeeImage}
                  onClick={() => document.getElementById("employeeImageInput").click()}
                  sx={{ cursor: "pointer" }}
                />

                <Button
                  variant="outlined"
                  onClick={() => document.getElementById("employeeImageInput").click()}
                  sx={{ height: "40px", whiteSpace: "nowrap" }}
                >
                  Upload
                </Button>

                <Avatar
                  src={imagePreview || ""}
                  sx={{ width: 40, height: 40 }}
                  variant="circular"
                />
              </Box>

              <input
                id="employeeImageInput"
                type="file"
                accept="image/png, image/jpeg"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
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