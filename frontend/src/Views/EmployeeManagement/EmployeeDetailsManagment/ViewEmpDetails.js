import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Button,
  Avatar,
  Switch,
  FormControl,
  FormLabel,
  Box,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { getemployeeDetailsById, updateemployeeDetails } from "../../../services/EmployeeManagementService/EmployeeDetailService";
import CircleIcon from "@mui/icons-material/Circle";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const ViewEmpDetails = () => {
  const { eid } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const empDetails = await getemployeeDetailsById(eid);
        setEmployee(empDetails);
        setStatus(empDetails.status);
      } catch (error) {
        console.error("Error fetching employee details:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeDetails();
  }, [eid]);

  const handleStatusToggle = async () => {
    setIsUpdating(true);
    const newStatus = status === "A" ? "D" : "A";
    try {
      await updateemployeeDetails(employee.id, { status: newStatus });
      setStatus(newStatus);
      setEmployee((prev) => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error("Error updating status:", error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!employee) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 4 }}>
        Unable to load employee details. Please try again later.
      </Typography>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} textAlign="center">
          <Typography variant="h4" color="primary">
            Employee Profile
          </Typography>
        </Grid>

        {/* Employee Details Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, borderRadius: 2, textAlign: "center", p: 3 }}>
            <Avatar
              src={employee.employeeImage}
              alt={`${employee.firstName} ${employee.lastName}`}
              sx={{ width: 100, height: 100, margin: "auto", mb: 2 }}
            />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {employee.firstName} {employee.lastName}
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
              <Typography variant="subtitle2" color={status === "A" ? "green" : "red"}>
                {status === "A" ? "Active" : "Inactive"}
              </Typography>
              <CircleIcon sx={{ fontSize: 10, color: status === "A" ? "green" : "red" }} />
            </Box>
            <Divider sx={{ my: 2 }} />
            <CardContent>
              <Grid container spacing={2}>
                {[{ label: "NIC", value: employee.nic, icon: <PermIdentityIcon /> },
                { label: "Phone", value: employee.phoneNo, icon: <PhoneIcon /> },
                { label: "Salary", value: employee.salaryPerDay, icon: <AttachMoneyIcon /> },
                { label: "OT Rate", value: employee.otValuePerHour, icon: <AccessTimeIcon /> },
                { label: "Join Date", value: new Date(employee.joinDate).toLocaleDateString(), icon: <CalendarTodayIcon /> },
                { label: "Created By", value: employee.createdBy, icon: <PersonAddIcon /> },
                { label: "Created Date", value: new Date(employee.createdDate).toLocaleDateString(), icon: <CalendarTodayIcon /> },
                { label: "Address", value: employee.address, icon: <HomeIcon /> }].map((field, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Typography fontWeight={500} sx={{ fontSize: "0.8rem", mb: 0.5, textAlign: "left" }}>
                      {field.label}
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={field.value}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position="end">{field.icon}</InputAdornment>
                        ),
                        sx: { height: 32, fontSize: "0.85rem" },
                      }}
                      sx={{ bgcolor: "#eaeaea", borderRadius: 1 }}
                    />
                  </Grid>
                ))}
              </Grid>
              <FormControl component="fieldset" sx={{ mt: 2, textAlign: "center" }}>
                <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>Change Status
                <Switch
                  checked={status === "A"}
                  onChange={handleStatusToggle}
                  color="primary"
                  disabled={isUpdating}
                />
                </FormLabel>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid item xs={12} display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/employee")}
            sx={{ borderRadius: 2 }}
          >
            Back
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ViewEmpDetails;
