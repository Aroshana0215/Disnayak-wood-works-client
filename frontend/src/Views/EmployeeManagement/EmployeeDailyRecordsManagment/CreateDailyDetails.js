import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Grid,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import { newDailyDetail } from "../../../services/EmployeeManagementService/EmployeeDailyDetailService";
import {
  getAllActiveEmployeeDetails,
  getemployeeDetailsById,
} from "../../../services/EmployeeManagementService/EmployeeDetailService";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";

const CreateDailyDetails = () => {
  const [employees, setEmployees] = useState([]);
  const [details, setDetails] = useState([]);
  const [commonDate, setCommonDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [allPresent, setAllPresent] = useState(false);
  const { user } = useSelector((state) => state.auth);

  // ✅ helper: "showHolidayFields" style rule for this row
  // If salaryPerDay is null/empty OR <= 0 => treat as "monthly/holiday style"
  // (meaning: OT eligible ONLY for full-day rule, skip half-day OT logic)
  const isOnlyFullDayOTEmployee = (employee) => {
    const raw = employee?.salaryPerDay;
    const num = parseFloat(raw);
    return raw === null || raw === undefined || String(raw).trim() === "" || !Number.isFinite(num) || num <= 0;
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeesList = await getAllActiveEmployeeDetails();
        setEmployees(employeesList);

        setDetails(
          employeesList.map((employee) => ({
            employeeId: employee.id,
            selectedDateTime: commonDate,
            isPresent: false,
            inTime: "",
            outTime: "",
            otHours: "",
            advancePerDay: "",
          }))
        );
      } catch (error) {
        console.error("Error fetching employees:", error.message);
        toast.error("Failed to load employee data.");
      }
    };
    fetchEmployees();
  }, [commonDate]);

  /**
   * ✅ OT Calculation
   * - If onlyFullDayOT = true:
   *   - Apply ONLY "Case 1: Full day completed" rule (>= 9 hours / 540 mins)
   *   - Skip Case 2 and Case 3 half-day OT rules
   */
  const calculateOTHours = (inTime, outTime, onlyFullDayOT = false) => {
    if (!inTime || !outTime) return "0.00";

    const inDateTime = new Date(`1970-01-01T${inTime}`);
    const outDateTime = new Date(`1970-01-01T${outTime}`);

    if (outDateTime <= inDateTime) return "0.00";

    const totalMinutes = (outDateTime - inDateTime) / (1000 * 60);

    // ✅ Case 1: Full day completed (always allowed)
    if (totalMinutes >= 540) {
      const otMinutes = totalMinutes - 540;
      const otHours = Math.floor(otMinutes / 60);
      const otMinutesPart = Math.round(otMinutes % 60);
      return `${otHours}.${otMinutesPart.toString().padStart(2, "0")}`;
    }

    // ✅ If "monthly/holiday style" employee => SKIP half-day OT rules
    if (onlyFullDayOT) return "0.00";

    const noon = new Date("1970-01-01T12:00:00");
    const afterNoonStart = new Date("1970-01-01T12:01:00");
    const afternoonEnd = new Date("1970-01-01T16:59:00");

    // ✅ Case 2: In before 12PM and Out between 12:01PM - 4:59PM (half day logic)
    if (
      inDateTime < noon &&
      outDateTime >= afterNoonStart &&
      outDateTime <= afternoonEnd
    ) {
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

  const handleChange = (index, field) => (event) => {
    const value = field === "isPresent" ? event.target.checked : event.target.value;

    setDetails((prevDetails) => {
      const updatedDetails = [...prevDetails];
      updatedDetails[index][field] = value;

      // ✅ decide OT mode for this employee row
      const employee = employees[index];
      const onlyFullDayOT = isOnlyFullDayOTEmployee(employee);

      if (field === "isPresent") {
        if (value) {
          updatedDetails[index].inTime = "08:00";
          updatedDetails[index].outTime = "17:00";
          updatedDetails[index].advancePerDay = "0";
          updatedDetails[index].otHours = calculateOTHours("08:00", "17:00", onlyFullDayOT);
        } else {
          updatedDetails[index].inTime = "";
          updatedDetails[index].outTime = "";
          updatedDetails[index].advancePerDay = "";
          updatedDetails[index].otHours = "";
        }
      }

      if (field === "inTime" || field === "outTime") {
        updatedDetails[index].otHours = calculateOTHours(
          updatedDetails[index].inTime,
          updatedDetails[index].outTime,
          onlyFullDayOT
        );
      }

      return updatedDetails;
    });
  };

  const handleCommonDateChange = (event) => {
    setAllPresent(false);
    const newDate = event.target.value;
    setCommonDate(newDate);
    setDetails((prev) => prev.map((detail) => ({ ...detail, selectedDateTime: newDate })));
  };

  const handleAllPresentToggle = (event) => {
    const isChecked = event.target.checked;
    setAllPresent(isChecked);

    setDetails((prevDetails) =>
      prevDetails.map((detail, index) => {
        const employee = employees[index];
        const onlyFullDayOT = isOnlyFullDayOTEmployee(employee);

        return {
          ...detail,
          isPresent: isChecked,
          inTime: isChecked ? "08:00" : "",
          outTime: isChecked ? "17:00" : "",
          advancePerDay: isChecked ? "0" : "",
          otHours: isChecked ? calculateOTHours("08:00", "17:00", onlyFullDayOT) : "",
        };
      })
    );
  };

  const validateFields = () => {
    let newErrors = {};
    let hasPresentEmployee = false;

    details.forEach((detail, index) => {
      if (detail.isPresent) {
        hasPresentEmployee = true;
        if (!detail.inTime) newErrors[`inTime-${index}`] = "Required";
        if (!detail.outTime) newErrors[`outTime-${index}`] = "Required";
      }
    });

    if (!hasPresentEmployee) {
      toast.error("Cannot submit no changes");
      return false;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill all required fields for present employees.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateFields()) return;

    setLoading(true);
    try {
      for (const detail of details) {
        const employee = await getemployeeDetailsById(detail.employeeId);

        const formData = {
          dateTime: new Date(detail.selectedDateTime),
          isPresent: detail.isPresent,
          inTime: detail.inTime || "08:00",
          outTime: detail.outTime || "17:00",
          otHours: detail.otHours || "0.00",
          advancePerDay: detail.advancePerDay || "0",
          eid_fk: detail.employeeId,
          eid_name: employee.firstName,
          status: "A",
          isPaid: false,
          createdDate: new Date().toISOString(),
        };

        await newDailyDetail(formData);
      }

      toast.success(
        `Attendance ${new Date(details[0].selectedDateTime).toISOString().split("T")[0]}`
      );
      setTimeout(() => {
        setLoading(false);
        window.location.href = "/employee/daily";
      }, 1000);
    } catch (error) {
      console.error("Error creating Daily Details:", error.message);
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="stretch" sx={{ p: 3 }}>
      <Grid item xs={12} md={10}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" align="center" sx={{ color: "#9C6B3D", mb: 3 }}>
            Create Daily Record
          </Typography>

          <Grid container component="form" onSubmit={handleSubmit} spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Date"
                type="date"
                value={commonDate}
                onChange={handleCommonDateChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>In Time</TableCell>
                      <TableCell>Out Time</TableCell>
                      <TableCell>OT Hours</TableCell>
                      <TableCell>Advance</TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch checked={allPresent} onChange={handleAllPresentToggle} />
                          }
                          label="Attendance"
                          sx={{ pb: "10px" }}
                        />
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {employees.map((employee, index) => (
                      <TableRow key={employee.id}>
                        <TableCell>{employee.firstName}</TableCell>

                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            type="time"
                            value={details[index]?.inTime}
                            onChange={handleChange(index, "inTime")}
                            disabled={!details[index]?.isPresent}
                            error={!!errors[`inTime-${index}`]}
                            helperText={errors[`inTime-${index}`] || ""}
                          />
                        </TableCell>

                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            type="time"
                            value={details[index]?.outTime}
                            onChange={handleChange(index, "outTime")}
                            disabled={!details[index]?.isPresent}
                            error={!!errors[`outTime-${index}`]}
                            helperText={errors[`outTime-${index}`] || ""}
                          />
                        </TableCell>

                        <TableCell>{details[index]?.otHours}</TableCell>

                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            type="number"
                            value={details[index]?.advancePerDay}
                            onChange={handleChange(index, "advancePerDay")}
                            disabled={!details[index]?.isPresent}
                          />
                        </TableCell>

                        <TableCell>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={details[index]?.isPresent}
                                onChange={handleChange(index, "isPresent")}
                              />
                            }
                            label="Present"
                            sx={{ pb: "10px" }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} textAlign="center">
              <Button
                type="submit"
                variant="contained"
                sx={{ color: "#9C6B3D" }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Submit"}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <ToastContainer />
    </Grid>
  );
};

export default CreateDailyDetails;