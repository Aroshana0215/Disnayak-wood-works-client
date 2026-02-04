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
  FormHelperText,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  getEmployeeWorkedDetailNotpaid,
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
    holidayRate: "",
    otValuePerHour: "",
    salaryPerDay: "",
    salaryPerMonth: "",
    currentLendAmount: "",
    isMonthPayEmp: false, // ✅ make sure this exists in your employee doc
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

  // ✅ NEW: validation error for Payment Status
  const [paymentStatusError, setPaymentStatusError] = useState("");

  // ✅ NEW: Working Holiday fields (only for month-pay employees with no day salary)
  const [workingHolidayAmount, setWorkingHolidayAmount] = useState("0");
  const [holidayTotal, setHolidayTotal] = useState("0.00");

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 10);

  const hasDaySalary = (emp) => {
    const v = emp?.salaryPerDay;
    return v !== null && v !== undefined && String(v).trim() !== "";
  };

  const hasMonthSalary = (emp) => {
    const v = emp?.salaryPerMonth;
    return v !== null && v !== undefined && String(v).trim() !== "";
  };

  const getSalaryMode = (emp) => {
    if (hasDaySalary(emp)) return "DAY";
    if (hasMonthSalary(emp)) return "MONTH";
    return "NONE";
  };

  // ✅ determine half-day vs full-day using your same rule: < 9 hours = half day
  const getWorkType = (work) => {
    if (!work?.isPresent) return "-";
    if (!work?.inTime || !work?.outTime) return "-";

    const inMins = work.inTime.split(":").reduce((h, m) => h * 60 + +m);
    const outMins = work.outTime.split(":").reduce((h, m) => h * 60 + +m);
    if (!Number.isFinite(inMins) || !Number.isFinite(outMins)) return "-";
    if (outMins <= inMins) return "-";

    const workedHours = (outMins - inMins) / 60;
    return workedHours < 9 ? "Half Day" : "Full Day";
  };

  // ✅ condition you asked:
  // if salaryPerDay is null/empty AND isMonthPayEmp is true => show holiday fields
  const showHolidayFields = !hasDaySalary(empData) && empData?.salaryPerDay == null 
  || empData?.salaryPerDay <= 0 || empData?.salaryPerDay == undefined || String(empData?.salaryPerDay).trim() === "";
  console.log("empData?.salaryPerDay" + empData?.salaryPerDay);

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

  // ✅ calculate holidayTotal whenever user changes amount / rate
  useEffect(() => {
    if (!showHolidayFields) {
      setWorkingHolidayAmount("0");
      setHolidayTotal("0.00");
      return;
    }

    const amount = parseFloat(workingHolidayAmount || 0);
    const rate = parseFloat(empData?.holidayRate || 0);
    const total = amount * rate;

    setHolidayTotal((Number.isFinite(total) ? total : 0).toFixed(2));
  }, [workingHolidayAmount, empData?.holidayRate, showHolidayFields]);

  useEffect(() => {
    const calculateActualPayment = () => {
      const payment =
        parseFloat(totalHalfDaySal || 0) +
        parseFloat(totalFullDaySal || 0) +
        parseFloat(totalOtAmount || 0);

      setTotalPayment(payment.toFixed(2));

      // ✅ UPDATED (your requested formula): add holidayTotal
      const total = payment -  (parseFloat(reduceAmount || 0) + parseFloat(totalAdvance || 0) ) + parseFloat(holidayTotal || 0);

      setActualPayment(total.toFixed(2));
    };
    calculateActualPayment();
  }, [
    reduceAmount,
    totalAdvance,
    totalOtAmount,
    totalFullDaySal,
    totalHalfDaySal,
    toDate,
    holidayTotal,
  ]);

  const handleDateChange = async (date) => {
    setToDate(date);
    if (date) {
      const formatedFromDate = new Date(fromDate);
      formatedFromDate.setHours(0, 0, 0, 0);

      const formatedToDate = new Date(date);
      formatedToDate.setHours(23, 59, 59, 999);

      try {
        const data = await getEmployeeWorkedDetailNotpaid({
          fromDate: formatedFromDate,
          toDate: formatedToDate,
          eid,
        });
        setWorkDetail(data);
        calculateTotals(data);
      } catch (error) {
        console.error("Error getting work details:", error.message);
      }
    }
  };

  const calculateTotals = (data) => {
    const salaryMode = getSalaryMode(empData);

    let totOt = 0.0,
      totDays = 0.0,
      totHalfDays = 0.0,
      totAdvance = 0.0;

    data.forEach((item) => {
      if (item.isPresent) {
        let [h, m] = (item.otHours || "0").split(".").map(Number);
        const ot = (h || 0) + (m || 0) / 60;
        totOt += ot;

        const inMins = item.inTime.split(":").reduce((h, m) => h * 60 + +m);
        const outMins = item.outTime.split(":").reduce((h, m) => h * 60 + +m);

        const workedHours = (outMins - inMins) / 60;

        if (workedHours < 9) totHalfDays++;
        else totDays++;
      }
      totAdvance += parseFloat(item.advancePerDay || 0);
    });

    setTotalAdvance(totAdvance.toFixed(2));
    setTotalHalfDay(totHalfDays.toFixed(2));
    setTotalDay(totDays.toFixed(2));

    setTotalOt(totOt.toFixed(2));
    setOtPerHour(empData.otValuePerHour);
    setTotalOtAmount((totOt * parseFloat(empData.otValuePerHour || 0)).toFixed(2));

    // ✅ MONTH SALARY MODE: no full/half day calculations
    if (salaryMode === "MONTH") {
      const monthly = parseFloat(empData.salaryPerMonth || 0);

      setSalaryPerDay("");
      setSalaryPerHalfDay("");
      setTotalHalfDaySal("0.00");
      setTotalFullDaySal(monthly.toFixed(2));
      return;
    }

    // ✅ DAY SALARY MODE
    const daySalary = parseFloat(empData.salaryPerDay || 0);
    setSalaryPerDay(daySalary.toFixed(2));

    const fullDayPay = daySalary * totDays;
    const halfDayPay = (daySalary / 2) * totHalfDays;

    setTotalFullDaySal(fullDayPay.toFixed(2));
    setTotalHalfDaySal(halfDayPay.toFixed(2));
    setSalaryPerHalfDay((daySalary / 2).toFixed(2));
  };

  const clearDateFilters = () => {
    setFromDate(null);
    setToDate(null);
  };

  const validateBeforeSubmit = () => {
    // ✅ paymentStatus mandatory
    if (!paymentStatus || String(paymentStatus).trim() === "") {
      setPaymentStatusError("Payment Status is required");
      toast.error("Please select Payment Status");
      return false;
    }
    setPaymentStatusError("");

    // ✅ optional: validate holiday amount (non-negative)
    if (showHolidayFields && parseFloat(workingHolidayAmount || 0) < 0) {
      toast.error("Working Holiday Amount cannot be negative");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateBeforeSubmit()) return;

    setLoading(true);

    if (parseFloat(totalPayment) <= 0) {
      toast.error("Total Payment must be greater than 0.");
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
      holidayRate: empData.holidayRate,

      // ✅ NEW: include holiday info (optional but recommended)
      workingHolidayAmount: showHolidayFields ? workingHolidayAmount : "0",
      holidayTotal: showHolidayFields ? holidayTotal : "0.00",

      paymentStatus,
      reduceAmount,
      actualPayment,
      status: "A",
      createdBy: user?.displayName || user?.email || user?.uid || "System",
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

        if (stringResulty) {
          const expData = {
            date: formattedDate,
            type: "Salaray",
            des: "Employee Salaray",
            amount: actualPayment,
            status: "A",
            createdBy: user?.displayName || user?.email || user?.uid || "System",
            createdDate: formattedDate,
          };

          const ExpensesId = await newExpense(expData);
          console.log("New Expenses ID:", ExpensesId);

          if (ExpensesId) {
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

  const salaryMode = getSalaryMode(empData);

  return (
    <Container>
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12}>
          <Typography variant="h4" sx={{ color: "#9C6B3D" }} align="center" gutterBottom>
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
              <Typography variant="h6" sx={{ color: "#9C6B3D" }}>
                Employee Work Details
              </Typography>
              <IconButton>
                {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Stack>

            <Collapse in={isExpanded}>
              <Table sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Employee</TableCell>
                    <TableCell align="center">Date</TableCell>
                    <TableCell align="center">Is Present</TableCell>
                    <TableCell align="center">Type</TableCell>
                    <TableCell align="center">In Time</TableCell>
                    <TableCell align="center">Out Time</TableCell>
                    <TableCell align="center">OT Hours</TableCell>
                    <TableCell align="center">Advance Per Day</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workDetail.map((work, index) => {
                    const type = getWorkType(work);
                    const isFull = type === "Full Day";

                    return (
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

                        <TableCell align="center">
                          {work.isPresent ? (
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
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        <TableCell align="center">{work.inTime}</TableCell>
                        <TableCell align="center">{work.outTime}</TableCell>
                        <TableCell align="center">{work.otHours}</TableCell>
                        <TableCell align="center">{work.advancePerDay}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Collapse>
          </Paper>
        </Grid>

        {/* Final Form Section */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "#9C6B3D" }}>
              🧾 Payment Summary
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    📅 Attendance & Salary Info
                  </Typography>
                </Grid>

                {/* DAY MODE fields */}
                {salaryMode === "DAY" && (
                  <>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Total Working Days"
                        type="number"
                        value={totalDay}
                        InputProps={{ readOnly: true }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Salary Per Day"
                        type="number"
                        value={salaryPerDay}
                        InputProps={{ readOnly: true }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Full Day Salary"
                        type="number"
                        value={totalFullDaySal}
                        InputProps={{ readOnly: true }}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Half Working Days"
                        type="number"
                        value={totalHalfDay}
                        InputProps={{ readOnly: true }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Salary Per Half Day"
                        type="number"
                        value={salaryPerHalfDay}
                        InputProps={{ readOnly: true }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Half Day Salary"
                        type="number"
                        value={totalHalfDaySal}
                        InputProps={{ readOnly: true }}
                        fullWidth
                      />
                    </Grid>
                  </>
                )}

                {/* MONTH MODE fields */}
                {salaryMode === "MONTH" && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Salary Per Month"
                        type="number"
                        value={String(empData?.salaryPerMonth ?? "")}
                        InputProps={{ readOnly: true }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Monthly Salary (Full)"
                        type="number"
                        value={totalFullDaySal}
                        InputProps={{ readOnly: true }}
                        fullWidth
                      />
                    </Grid>
                  </>
                )}

                {/* ✅ Working Holidays (only when salaryPerDay is empty AND isMonthPayEmp true) */}
                {showHolidayFields && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        🏖️ Working Holidays
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Working Holiday Amount"
                        type="number"
                        value={workingHolidayAmount}
                        onChange={(e) => setWorkingHolidayAmount(e.target.value)}
                        fullWidth
                        helperText="Default is 0"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={`Holiday Total (Rate: ${empData?.holidayRate || 0})`}
                        type="number"
                        value={holidayTotal}
                        InputProps={{ readOnly: true }}
                        fullWidth
                      />
                    </Grid>
                  </>
                )}

                {/* OT Summary */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    ⏱️ Overtime Calculation
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Total OT Hours"
                    type="number"
                    value={totalOt}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Rate per OT Hour"
                    type="number"
                    value={otPerHour}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="OT Amount"
                    type="number"
                    value={totalOtAmount}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </Grid>

                {/* Advance & Deductions */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    💸 Advance & Deductions
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Total Advance Taken"
                    type="number"
                    value={totalAdvance}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
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

                {/* Final */}
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
                    InputLabelProps={{
                      style: { fontWeight: "bold", color: "#2e7d32" },
                    }}
                    sx={{ bgcolor: "#f1f8e9" }}
                  />
                </Grid>

                {/* ✅ Payment Status (MANDATORY) */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!paymentStatusError}>
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                      value={paymentStatus}
                      onChange={(e) => {
                        setPaymentStatus(e.target.value);
                        if (e.target.value) setPaymentStatusError("");
                      }}
                      label="Payment Status"
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </Select>
                    {paymentStatusError && <FormHelperText>{paymentStatusError}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ color: "#9C6B3D", mt: 2 }}
                    disabled={loading}
                    fullWidth
                    size="large"
                  >
                    {loading ? <CircularProgress size={24} /> : "Submit Payment"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CreatePayment;