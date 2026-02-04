import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import {
  getemployeeDetailsById,
  updateemployeeDetails,
} from "../../../services/EmployeeManagementService/EmployeeDetailService";
import { toast } from "react-toastify";

// Convert Date / timestamp / string into YYYY-MM-DD for input[type="date"]
const toInputDate = (value) => {
  if (!value) return "";
  const raw = value?.toDate ? value.toDate() : value; // Firestore Timestamp support
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// salaryPerDay valid only if > 0
const isValidDaySalary = (value) => {
  if (value === null || value === undefined) return false;
  if (String(value).trim() === "") return false;
  return value > 0;
};

const UpdateEmpUpdate = () => {
  const { eid } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [employee, setEmployee] = useState(null);
  const [errors, setErrors] = useState({});

  // "DAY" -> show Salary Per Day, "MONTH" -> show Salary Per Month
  const [salaryType, setSalaryType] = useState("MONTH");

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        const empDetails = await getemployeeDetailsById(eid);
        setEmployee(empDetails);

        // Decide which salary field to show based on salaryPerDay
        setSalaryType(isValidDaySalary(empDetails?.salaryPerDay) ? "DAY" : "MONTH");
      } catch (error) {
        console.error("Error fetching employee details:", error?.message);
        toast.error("Failed to load employee details");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [eid]);

  const validate = () => {
    const temp = {};

    if (!employee?.firstName?.trim()) temp.firstName = "First name is required";
    if (!employee?.lastName?.trim()) temp.lastName = "Last name is required";
    if (!employee?.phoneNo?.trim()) temp.phoneNo = "Phone number is required";
    if (!employee?.nic?.trim()) temp.nic = "NIC is required";
    if (!employee?.holidayRate?.trim()) temp.holidayRate = "Holiday Rate is required";

    // Salary validation - validate only the visible one
    if (salaryType === "DAY") {
      if (!isValidDaySalary(employee?.salaryPerDay)) {
        temp.salaryPerDay = "Salary per day must be greater than 0";
      }
    } else {
      const month = Number(employee?.salaryPerMonth);
      if (!Number.isFinite(month) || month <= 0) {
        temp.salaryPerMonth = "Salary per month must be greater than 0";
      }
    }

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEmployee((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleStatusToggle = () => {
    setEmployee((prev) => ({
      ...prev,
      status: prev?.status === "A" ? "D" : "A",
    }));
  };

  const updatePayload = useMemo(() => {
    if (!employee) return null;

    return {
      empID: employee.empID ?? "",
      createdBy: employee.createdBy ?? "",
      firstName: employee.firstName ?? "",
      lastName: employee.lastName ?? "",
      nic: employee.nic ?? "",
      phoneNo: employee.phoneNo ?? "",
      address: employee.address ?? "",
      joinDate: employee.joinDate ?? "",
      holidayRate: employee.holidayRate ?? "",
      otValuePerHour: employee.otValuePerHour ?? "",
      employeeImage: employee.employeeImage ?? "",
      status: employee.status ?? "A",

      // Only include the salary field that is relevant
      ...(salaryType === "DAY"
        ? { salaryPerDay: employee.salaryPerDay ?? "" }
        : { salaryPerMonth: employee.salaryPerMonth ?? "" }),
    };
  }, [employee, salaryType]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    if (!employee?.id) {
      toast.error("Missing employee document id");
      return;
    }

    setSaving(true);
    try {
      await updateemployeeDetails(employee.id, updatePayload); // ✅ Firestore doc id
      toast.success("Employee updated successfully!");
      navigate("/employee");
    } catch (error) {
      toast.error("Error updating employee: " + (error?.message ?? "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !employee) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography
        variant="h4"
        align="center"
        sx={{
            color: "primary.main",
            fontWeight: 800,
            letterSpacing: 0.5,
            mb: 3,
            position: "relative",
            "&::after": {
            content: '""',
            display: "block",
            width: 90,
            height: 4,
            borderRadius: 99,
            bgcolor: "primary.main",
            opacity: 0.35,
            mx: "auto",
            mt: 1.2,
            },
        }}
        >
        Update Employee
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Read-only Employee ID */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Employee ID"
                value={employee.empID ?? ""}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>

            {/* Names */}
            <Grid item xs={12} md={6}>
              <TextField
                name="firstName"
                label="First Name"
                value={employee.firstName ?? ""}
                onChange={handleChange}
                fullWidth
                size="small"
                error={Boolean(errors.firstName)}
                helperText={errors.firstName}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="lastName"
                label="Last Name"
                value={employee.lastName ?? ""}
                onChange={handleChange}
                fullWidth
                size="small"
                error={Boolean(errors.lastName)}
                helperText={errors.lastName}
              />
            </Grid>

            {/* NIC / Phone */}
            <Grid item xs={12} md={6}>
              <TextField
                name="nic"
                label="NIC"
                value={employee.nic ?? ""}
                onChange={handleChange}
                fullWidth
                size="small"
                error={Boolean(errors.nic)}
                helperText={errors.nic}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="phoneNo"
                label="Phone Number"
                value={employee.phoneNo ?? ""}
                onChange={handleChange}
                fullWidth
                size="small"
                error={Boolean(errors.phoneNo)}
                helperText={errors.phoneNo}
              />
            </Grid>

            {/* Join Date */}
            <Grid item xs={12} md={6}>
              <TextField
                name="joinDate"
                label="Join Date"
                type="date"
                value={toInputDate(employee.joinDate)}
                onChange={handleChange}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12} md={6}>
              <TextField
                name="address"
                label="Address"
                value={employee.address ?? ""}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>

            {/* Salary (show only one field) */}
            {salaryType === "DAY" ? (
              <Grid item xs={12} md={6}>
                <TextField
                  name="salaryPerDay"
                  label="Salary Per Day"
                  value={employee.salaryPerDay ?? ""}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={Boolean(errors.salaryPerDay)}
                  helperText={errors.salaryPerDay}
                />
              </Grid>
            ) : (
              <Grid item xs={12} md={6}>
                <TextField
                  name="salaryPerMonth"
                  label="Salary Per Month"
                  value={employee.salaryPerMonth ?? ""}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={Boolean(errors.salaryPerMonth)}
                  helperText={errors.salaryPerMonth}
                />
              </Grid>
            )}

            {/* OT */}
            <Grid item xs={12} md={6}>
              <TextField
                name="otValuePerHour"
                label="OT Value Per Hour"
                value={employee.otValuePerHour ?? ""}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>

             {/* Holiday Rate*/}
            <Grid item xs={12} md={6}>
              <TextField
                name="holidayRate"
                label="Holiday Rate"
                value={employee.holidayRate ?? ""}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6} display="flex" alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={employee.status === "A"}
                    onChange={handleStatusToggle}
                  />
                }
                label={employee.status === "A" ? "Active" : "Inactive"}
              />
            </Grid>

            {/* Actions */}
            <Grid item xs={12} display="flex" justifyContent="space-between" mt={1}>
              <Button variant="outlined" onClick={() => navigate("/employee")}>
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                sx={{ color: "primary" }}
              >
                {saving ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  "Update"
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default UpdateEmpUpdate;