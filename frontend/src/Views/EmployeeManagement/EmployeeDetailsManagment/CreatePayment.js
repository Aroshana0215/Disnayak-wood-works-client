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
  Stack,
  Paper,
  IconButton,
  Collapse,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  getEmployeeWorkedDetail,
  updateDailyDetailsAsPaid,
} from "../../../services/EmployeeManagementService/EmployeeDailyDetailService";
import {
  newPaySheet,
  getLatestToDateByEmployee,
} from "../../../services/EmployeeManagementService/EmployeePaySheetService";
import {
  getemployeeDetailsById,
  updateemployeeDetails,
} from "../../../services/EmployeeManagementService/EmployeeDetailService";
import { newExpense } from "../../../services/AccountManagementService/ExpenseManagmentService";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreatePayment = () => {
  const { eid } = useParams();
  const { user } = useSelector((state) => state.auth);

  const [empData, setEmpData] = useState({
    name: "",
    empID: "",
    nic: "",
    address: "",
    otValuePerHour: "",
    salaryPerDay: "",
    currentLendAmount: "",
  });
  const [workDetail, setWorkDetail] = useState([]);
  const [totalPayment, setTotalPayment] = useState("");
  const [totalFullDaySal, setTotalFullDaySal] = useState("");
  const [salaryPerHalfDay, setSalaryPerHalfDay] = useState("");
  const [otPerHour, setOtPerHour] = useState("");
  const [totalHalfDaySal, setTotalHalfDaySal] = useState("");
  const [totalAdvance, setTotalAdvance] = useState("");
  const [salaryPerDay, setSalaryPerDay] = useState("");
  const [totalDay, setTotalDay] = useState("");
  const [totalHalfDay, setTotalHalfDay] = useState("");
  const [totalOt, setTotalOt] = useState("");
  const [totalOtAmount, setTotalOtAmount] = useState("");
  const [reduceAmount, setReduceAmount] = useState("0");
  const [actualPayment, setActualPayment] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [previous, setPrevious] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 10);

  useEffect(() => {
    const fetchEmpData = async () => {
      try {
        const data = await getemployeeDetailsById(eid);
        setEmpData(data);
        setPrevious(data.currentLendAmount);
      } catch (error) {
        console.error("Error fetching employee data:", error.message);
      }
    };
    fetchEmpData();
  }, [eid]);

  useEffect(() => {
    const calculateActualPayment = () => {
      const payment = parseFloat(totalHalfDaySal || 0) + parseFloat(totalFullDaySal || 0) + parseFloat(totalOtAmount || 0);
      setTotalPayment(payment.toFixed(2));
      const total = payment - parseFloat(reduceAmount || 0) - parseFloat(totalAdvance || 0);
      setActualPayment(total.toFixed(2));
    };
    calculateActualPayment();
  }, [reduceAmount, totalAdvance, totalOtAmount, totalFullDaySal, totalHalfDaySal, toDate]);

  const handleDateChange = async (date) => {
    setToDate(date);
    if (date) {
      const formatedFromDate = new Date(fromDate);
      formatedFromDate.setHours(0, 0, 0, 0);
      const formatedToDate = new Date(date);
      formatedToDate.setHours(23, 59, 59, 999);
      try {
        const data = await getEmployeeWorkedDetail({ fromDate: formatedFromDate, toDate: formatedToDate, eid });
        setWorkDetail(data);
        calculateTotals(data);
      } catch (error) {
        console.error("Error getting work details:", error.message);
      }
    }
  };

  const calculateTotals = (data) => {
    let totOt = 0.0, totDays = 0.0, totHalfDays = 0.0, totAdvance = 0.0;
    data.forEach((item) => {
      if (item.isPresent) {
        let [h, m] = (item.otHours || "0").split(".").map(Number);
        const ot = (h || 0) + (m || 0) / 60;
        totOt += ot;
        const inMins = item.inTime.split(":").reduce((h, m) => h * 60 + +m);
        const outMins = item.outTime.split(":").reduce((h, m) => h * 60 + +m);
        const workedHours = (outMins - inMins) / 60;
        if (workedHours < 9) totHalfDays++; else totDays++;
        totAdvance += parseFloat(item.advancePerDay || 0);
      }
    });
    setTotalAdvance(totAdvance.toFixed(2));
    setTotalHalfDay(totHalfDays.toFixed(2));
    setTotalDay(totDays.toFixed(2));
    setSalaryPerDay(parseFloat(empData.salaryPerDay || 0).toFixed(2));
    const fullDayPay = parseFloat(empData.salaryPerDay || 0) * totDays;
    const halfDayPay = (parseFloat(empData.salaryPerDay || 0) / 2) * totHalfDays;
    setTotalFullDaySal(fullDayPay.toFixed(2));
    setTotalHalfDaySal(halfDayPay.toFixed(2));
    setSalaryPerHalfDay((parseFloat(empData.salaryPerDay || 0) / 2).toFixed(2));
    setTotalOt(totOt.toFixed(2));
    setOtPerHour(empData.otValuePerHour);
    setTotalOtAmount((totOt * parseFloat(empData.otValuePerHour || 0)).toFixed(2));
  };

  const clearDateFilters = () => {
    setFromDate(null);
    setToDate(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    if (parseFloat(totalPayment) <= 0) {
      toast.error("Total OT Amount must be greater than 0.");
      setLoading(false);
      return;
    }
    if (!toDate) {
      toast.error("Please select a valid 'To Date' before submitting.");
      setLoading(false);
      return;
    }
    const formData = {
      totalPayment,
      totalAdvance,
      totalDay,
      totalOt,
      fromDate,
      toDate,
      currentDate: formattedDate,
      eid_fk: empData.id,
      eid: empData.empID,
      employeeName: empData.firstName,
      paymentStatus,
      reduceAmount,
      actualPayment,
      status: "A",
      createdBy: user.displayName,
      createdDate: formattedDate,
    };
    try {
      const paysheetId = await newPaySheet(formData);
      if (paysheetId && empData.currentLendAmount > 0 && reduceAmount > 0) {
        const updatedEmployeeData = {
          currentLendAmount: parseFloat(previous) - parseFloat(reduceAmount),
        };
        await updateemployeeDetails(eid, updatedEmployeeData);
      }
      if (paysheetId) {
        const stringResulty = await updateDailyDetailsAsPaid(formData);
        if(stringResulty){
          const formData = {
            date: formattedDate,
            type: "Salaray",
            des: "Employee Salaray",
            amount: actualPayment,
            status: "A",
            createdBy: user.displayName,
            createdDate: formattedDate,
          };

      const ExpensesId = await newExpense(formData);
      console.log("New Expenses ID:", ExpensesId);
      if(ExpensesId){
        toast.success(`${stringResulty}`);
        setTimeout(() => {
          setLoading(false);
          window.location.href = `/employee/payment/${eid}`;
        }, 1000);
        }
      }
      }
    } catch (error) {
      setLoading(false);
      toast.error("Error occurred during payment submission.");
      console.error("Error creating pay sheet details:", error.message);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return "";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  useEffect(() => {
    const fetchLatestToDate = async () => {
      try {
        if (eid) {
          const latestToDate = await getLatestToDateByEmployee(eid);
          let newFromDate = latestToDate ? new Date(latestToDate.seconds * 1000) : new Date();
          if (latestToDate) newFromDate.setDate(newFromDate.getDate() + 1);
          setFromDate(newFromDate);
        }
      } catch (error) {
        console.error("Error fetching latest toDate:", error.message);
      }
    };
    fetchLatestToDate();
  }, [eid]);
  

  return (
    <Container>
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12}>
          <Typography variant="h4" color="primary" align="center" gutterBottom>
            Pay Sheet
          </Typography>
        </Grid>

        {/* Date Filters */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="From Date"
                  value={fromDate}
                  onChange={(date) => setFromDate(date)}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
                <DatePicker
                  label="To Date"
                  value={toDate}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} size="small" />}
                  shouldDisableDate={(date) => fromDate && date < fromDate}
                />
              </LocalizationProvider>
              <Button variant="outlined" onClick={clearDateFilters}>
                Clear
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Expand/Collapse Work Detail Table */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              onClick={() => setIsExpanded(!isExpanded)}
              sx={{ cursor: "pointer" }}
            >
              <Typography variant="h6" color="primary">
                Employee Work Details
              </Typography>
              <IconButton>{isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}</IconButton>
            </Stack>
            <Collapse in={isExpanded}>
              <Table sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Employee</TableCell>
                    <TableCell align="center">Date</TableCell>
                    <TableCell align="center">Is Present</TableCell>
                    <TableCell align="center">In Time</TableCell>
                    <TableCell align="center">Out Time</TableCell>
                    <TableCell align="center">OT Hours</TableCell>
                    <TableCell align="center">Advance Per Day</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workDetail.map((work, index) => (
                    <TableRow key={index}>
                      <TableCell align="center">{work.eid_name}</TableCell>
                      <TableCell align="center">
                        {new Date(work.dateTime.seconds * 1000).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={work.isPresent ? "Present" : "Absent"}
                          color={work.isPresent ? "success" : "error"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">{work.inTime}</TableCell>
                      <TableCell align="center">{work.outTime}</TableCell>
                      <TableCell align="center">{work.otHours}</TableCell>
                      <TableCell align="center">{work.advancePerDay}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Collapse>
          </Paper>
        </Grid>

        {/* Final Form Section */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              🧾 Payment Summary
            </Typography>

            {/* 👇 FORM starts here 👇 */}
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Section 1: Attendance & Salary */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    📅 Attendance & Salary Info
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField label="Total Working Days" type="number" value={totalDay} InputProps={{ readOnly: true }} fullWidth />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="Salary Per Day" type="number" value={salaryPerDay} InputProps={{ readOnly: true }} fullWidth />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="Full Day Salary" type="number" value={totalFullDaySal} InputProps={{ readOnly: true }} fullWidth />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField label="Half Working Days" type="number" value={totalHalfDay} InputProps={{ readOnly: true }} fullWidth />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="Salary Per Half Day" type="number" value={salaryPerHalfDay} InputProps={{ readOnly: true }} fullWidth />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="Half Day Salary" type="number" value={totalHalfDaySal} InputProps={{ readOnly: true }} fullWidth />
                </Grid>

                {/* Section 2: OT Summary */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    ⏱️ Overtime Calculation
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField label="Total OT Hours" type="number" value={totalOt} InputProps={{ readOnly: true }} fullWidth />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="Rate per OT Hour" type="number" value={otPerHour} InputProps={{ readOnly: true }} fullWidth />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="OT Amount" type="number" value={totalOtAmount} InputProps={{ readOnly: true }} fullWidth />
                </Grid>

                {/* Section 3: Advance & Deductions */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    💸 Advance & Deductions
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField label="Total Advance Taken" type="number" value={totalAdvance} InputProps={{ readOnly: true }} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Reduce Amount"
                    type="number"
                    value={reduceAmount}
                    onChange={(e) => setReduceAmount(e.target.value)}
                    fullWidth
                    helperText="Loan or deduction amount to subtract"
                  />
                </Grid>

                {/* Section 4: Final Calculation */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    ✅ Final Payment
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Total Payment (Before Deduction)"
                    type="number"
                    value={totalPayment}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Actual Payment to Employee"
                    type="number"
                    value={actualPayment}
                    InputProps={{ readOnly: true }}
                    fullWidth
                    InputLabelProps={{ style: { fontWeight: "bold", color: "#2e7d32" } }}
                    sx={{ bgcolor: "#f1f8e9" }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Status</InputLabel>
                    <Select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} label="Payment Status">
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    fullWidth
                    size="large"
                    sx={{ mt: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : "Submit Payment"}
                  </Button>
                </Grid>
              </Grid>
            </form>
            {/* 👆 FORM ends here 👆 */}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );

};

export default CreatePayment;