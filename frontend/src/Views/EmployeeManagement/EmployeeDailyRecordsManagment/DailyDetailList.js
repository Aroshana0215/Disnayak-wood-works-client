import React, { useState, useEffect } from "react";
import {
  Stack,
  Typography,
  Chip,
  IconButton,
  Box,
  Tooltip,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Grid,
  Button,
  TextField,
} from "@mui/material";
import { Link } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import {
  getAllemployeeDailyDetails,
  updateemployeeDailyDetails,
} from "../../../services/EmployeeManagementService/EmployeeDailyDetailService";
import { getAllActiveEmployeeDetails } from "../../../services/EmployeeManagementService/EmployeeDetailService";
import Loading from "../../../Components/Progress/Loading";
import ErrorAlert from "../../../Components/Alert/ErrorAlert";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PaidIcon from "@mui/icons-material/Paid";
import CancelIcon from "@mui/icons-material/Cancel";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const DailyDetailList = () => {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredDetails, setFilteredDetails] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [otHours, setOtHours] = useState("");
  const [advancePerDay, setAdvancePerDay] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const formatDate = (date) => {
    if (!date) return "";
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().split("T")[0];
  };

  const getWorkType = (inTime, outTime) => {
    if (!inTime || !outTime) return "-";

    const inDateTime = new Date(`1970-01-01T${inTime}`);
    const outDateTime = new Date(`1970-01-01T${outTime}`);

    if (isNaN(inDateTime.getTime()) || isNaN(outDateTime.getTime())) return "-";
    if (outDateTime <= inDateTime) return "-";

    const totalMinutes = (outDateTime - inDateTime) / (1000 * 60);

    // same rule you use in CreatePayment: < 9 hours = half day, else full day
    const workedHours = totalMinutes / 60;
    return workedHours < 9 ? "Half Day" : "Full Day";
  };

  const calculateOTHours = (inTime, outTime) => {
    if (!inTime || !outTime) return "0.00";

    const inDateTime = new Date(`1970-01-01T${inTime}`);
    const outDateTime = new Date(`1970-01-01T${outTime}`);

    if (outDateTime <= inDateTime) return "0.00";

    const totalMinutes = (outDateTime - inDateTime) / (1000 * 60);

    const noon = new Date("1970-01-01T12:00:00");
    const afterNoonStart = new Date("1970-01-01T12:01:00");
    const afternoonEnd = new Date("1970-01-01T16:59:00");

    // ✅ Case 1: Full day completed
    if (totalMinutes >= 540) {
      const otMinutes = totalMinutes - 540;
      const otHours = Math.floor(otMinutes / 60);
      const otMinutesPart = Math.round(otMinutes % 60);
      return `${otHours}.${otMinutesPart.toString().padStart(2, "0")}`;
    }

    // ✅ Case 2: In before 12PM and Out between 12:01PM - 4:59PM (half day logic)
    if (inDateTime < noon && outDateTime >= afterNoonStart && outDateTime <= afternoonEnd) {
      const otMinutes = totalMinutes - 240;
      if (otMinutes <= 0) return "0.00";
      const otHours = Math.floor(otMinutes / 60);
      const otMinutesPart = Math.round(otMinutes % 60);
      return `${otHours}.${otMinutesPart.toString().padStart(2, "0")}`;
    }

    // ✅ Case 3: In after 12PM (afternoon-only shift, still eligible for half-day + OT)
    if (inDateTime >= noon) {
      const otMinutes = totalMinutes - 240;
      if (otMinutes <= 0) return "0.00";
      const otHours = Math.floor(otMinutes / 60);
      const otMinutesPart = Math.round(otMinutes % 60);
      return `${otHours}.${otMinutesPart.toString().padStart(2, "0")}`;
    }

    return "0.00";
  };

  const handleUpdateSave = async () => {
    try {
      const updateData = {
        inTime,
        outTime,
        otHours: calculateOTHours(inTime, outTime),
        advancePerDay,
      };
      await updateemployeeDailyDetails(selectedRow.id, updateData);
      setOpenDialog(false);

      const updatedDetails = details.map((item) =>
        item.id === selectedRow.id ? { ...item, ...updateData } : item
      );
      setDetails(updatedDetails);
      setFilteredDetails(updatedDetails);
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Failed to update employeeDailyDetails:", err);
    }
  };

  const columns = [
    {
      field: "dateTime",
      headerName: "Date",
      width: 120,
      renderCell: ({ row }) => formatDate(new Date(row.dateTime.seconds * 1000)),
    },
    {
      field: "isPresent",
      headerName: "Present",
      width: 110,
      renderCell: ({ row }) => (
        <Chip
          label={row.isPresent ? "Present" : "Absent"}
          color={row.isPresent ? "success" : "error"}
          variant="outlined"
          sx={{ fontWeight: "bold" }}
        />
      ),
    },

    // ✅ NEW COLUMN: Half Day / Full Day (only when present)
    {
      field: "workType",
      headerName: "Type",
      width: 120,
      sortable: false,
      renderCell: ({ row }) => {
        if (!row.isPresent) return "-";

        const type = getWorkType(row.inTime, row.outTime);
        const isFull = type === "Full Day";

        return (
          <Chip
            label={type}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: "bold",
              borderColor: isFull ? "#66BB6A" : "#FFB74D",
              color: isFull ? "#1B5E20" : "#E65100",
              backgroundColor: isFull ? "#C8E6C9" : "#FFE0B2",
            }}
          />
        );
      },
    },

    { field: "inTime", headerName: "In Time", width: 120 },
    { field: "outTime", headerName: "Out Time", width: 120 },
    { field: "otHours", headerName: "OT Hours", width: 120 },
    {
      field: "advancePerDay",
      headerName: "Advance (RS:)",
      width: 120,
      renderCell: ({ row }) => `${row.advancePerDay}.00`,
    },
    { field: "eid_name", headerName: "Employee", width: 130 },
    {
      field: "isPaid",
      headerName: "Payment Status",
      width: 150,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            width: "100%",
            padding: "15px 10px",
          }}
        >
          {row.isPaid ? (
            <>
              <PaidIcon color="success" fontSize="small" />
              <Typography variant="body2" sx={{ color: "green", fontWeight: "bold" }}>
                Paid
              </Typography>
            </>
          ) : (
            <>
              <CancelIcon color="error" fontSize="small" />
              <Typography variant="body2" sx={{ color: "red", fontWeight: "bold" }}>
                Not Paid
              </Typography>
            </>
          )}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: ({ row }) => (
        <Tooltip title={row.isPaid ? "" : "Update"}>
          <span>
            <IconButton
              onClick={() => {
                if (!row.isPaid) {
                  setSelectedRow(row);
                  setInTime(row.inTime);
                  setOutTime(row.outTime);
                  setOtHours(row.otHours);
                  setAdvancePerDay(row.advancePerDay);
                  setOpenDialog(true);
                }
              }}
              color="info"
              size="medium"
              disabled={row.isPaid}
              sx={{
                borderRadius: "50%",
                backgroundColor: "#E3F2FD",
                "&:hover": { backgroundColor: "#BBDEFB" },
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </span>
        </Tooltip>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllemployeeDailyDetails();
        if (Array.isArray(data)) {
          const sortedData = data
            .sort((a, b) => a.dateTime.seconds - b.dateTime.seconds)
            .map((detail, index) => ({
              ...detail,
              id: detail.id || index,
            }));
          setDetails(sortedData);
          setFilteredDetails(sortedData);
          setLoading(false);
        } else {
          throw new Error("Invalid data format received from API");
        }
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getAllActiveEmployeeDetails();
        if (Array.isArray(data)) setEmployeeList(data);
        else throw new Error("Invalid employee data format");
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  const handleSearch = () => {
    let filteredData = details;

    if (selectedEmployee) {
      filteredData = filteredData.filter((detail) => detail.eid_name === selectedEmployee);
    }

    if (fromDate && toDate) {
      const fromDateFormatted = formatDate(fromDate);
      const toDateFormatted = formatDate(toDate);

      filteredData = filteredData.filter((detail) => {
        const detailDate = formatDate(new Date(detail.dateTime.seconds * 1000));
        return detailDate >= fromDateFormatted && detailDate <= toDateFormatted;
      });
    }

    setFilteredDetails(filteredData);
  };

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployee, fromDate, toDate]);

  const clearDateFilters = () => {
    setFromDate(null);
    setToDate(null);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={2} p={2}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#9C6B3D" }}>
              Daily Employee Details
            </Typography>

            <IconButton
              sx={{
                width: "45px",
                height: "45px",
                border: "1px solid rgba(0, 0, 0, 0.12)",
                borderRadius: 1,
                bgcolor: "background.paper",
                padding: "5px 15px",
              }}
            >
              <CalendarMonthIcon fontSize="medium" sx={{ color: "#9C6B3D" }} />
            </IconButton>

            <Button
              variant="contained"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              component={Link}
              to={"/employee/daily/add"}
              sx={{ padding: "5px 15px", height: "45px" }}
            >
              New
            </Button>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Stack
            p={2}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              bgcolor: "background.default",
              borderRadius: 1,
              border: "1px solid rgba(0, 0, 0, 0.12)",
            }}
          >
            <Stack direction="row" spacing={2}>
              <DatePicker
                label="From Date"
                value={fromDate}
                onChange={(date) => setFromDate(date)}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
              <DatePicker
                label="To Date"
                value={toDate}
                onChange={(date) => setToDate(date)}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
              <Button variant="outlined" onClick={clearDateFilters}>
                Clear
              </Button>
            </Stack>

            <Select
              size="small"
              displayEmpty
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">
                <em>All Employees</em>
              </MenuItem>
              {employeeList.map((emp) => (
                <MenuItem key={emp.id} value={emp.firstName}>
                  {emp.firstName}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <DataGrid
            sx={{
              bgcolor: "background.default",
              "& .MuiDataGrid-row": {
                transition: "all 0.3s",
              },
              "& .different-date": {
                marginTop: "20px",
              },
            }}
            rows={filteredDetails}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 8 } },
            }}
            pageSizeOptions={[8]}
            disableRowSelectionOnClick
            getRowClassName={(params) => {
              const index = filteredDetails.findIndex((row) => row.id === params.id);
              if (index > 0) {
                const currentDate = formatDate(new Date(filteredDetails[index].dateTime.seconds * 1000));
                const previousDate = formatDate(new Date(filteredDetails[index - 1].dateTime.seconds * 1000));
                if (currentDate !== previousDate) return "different-date";
              }
              return "";
            }}
          />
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Update Daily Record</DialogTitle>
        <DialogContent dividers>
          {selectedRow && (
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <Typography>
                <strong>Date:</strong> {formatDate(new Date(selectedRow.dateTime.seconds * 1000))}
              </Typography>
              <Typography>
                <strong>Employee:</strong> {selectedRow.eid_name}
              </Typography>

              <TextField
                label="In Time"
                value={inTime}
                onChange={(e) => {
                  setInTime(e.target.value);
                  setOtHours(calculateOTHours(e.target.value, outTime));
                }}
                fullWidth
              />
              <TextField
                label="Out Time"
                value={outTime}
                onChange={(e) => {
                  setOutTime(e.target.value);
                  setOtHours(calculateOTHours(inTime, e.target.value));
                }}
                fullWidth
              />

              <TextField label="OT Hours" value={otHours} disabled fullWidth />

              {/* ✅ NEW: Show Half Day / Full Day in dialog (when present) */}
              <TextField
                label="Work Type"
                value={selectedRow.isPresent ? getWorkType(inTime, outTime) : "-"}
                disabled
                fullWidth
              />

              <TextField
                label="Advance"
                value={advancePerDay}
                onChange={(e) => setAdvancePerDay(e.target.value)}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" sx={{ color: "#9C6B3D" }} onClick={handleUpdateSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Record updated successfully"
      />
    </LocalizationProvider>
  );
};

export default DailyDetailList;
