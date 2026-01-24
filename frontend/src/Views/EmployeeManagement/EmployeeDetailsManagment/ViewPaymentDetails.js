import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Grid,
  Typography,
  Card,
  Divider,
  Box,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { getemployeePaySheetById } from "../../../services/EmployeeManagementService/EmployeePaySheetService";
import { getEmployeeWorkedDetail } from "../../../services/EmployeeManagementService/EmployeeDailyDetailService";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";

const ViewPaymentDetails = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workDetail, setWorkDetail] = useState([]);
  const [showWorkDetails, setShowWorkDetails] = useState(true);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const data = await getemployeePaySheetById(paymentId);
        setPaymentDetails(data);

        if (data) {
          const formatedFromDate = new Date(data.fromDate.seconds * 1000);
          formatedFromDate.setHours(0, 0, 0, 0);

          const formatedToDate = new Date(data.toDate.seconds * 1000);
          formatedToDate.setHours(23, 59, 59, 999);

          const workDataList = await getEmployeeWorkedDetail({
            fromDate: formatedFromDate,
            toDate: formatedToDate,
            eid: data.eid_fk,
          });

          setWorkDetail(workDataList || []);
        }
      } catch (error) {
        console.error("Error fetching payment details:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId]);

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return "N/A";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ✅ Half Day / Full Day (rule: < 9 hours = half day)
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

  // ✅ Compute totals from workDetail (for correct Total Half Days display)
  const computedTotals = useMemo(() => {
    let totalHalfDays = 0;
    let totalFullDays = 0;

    (workDetail || []).forEach((w) => {
      const type = getWorkType(w);
      if (type === "Half Day") totalHalfDays += 1;
      if (type === "Full Day") totalFullDays += 1;
    });

    return {
      totalHalfDays,
      totalFullDays,
    };
  }, [workDetail]);

  // ✅ Use DB value if exists, otherwise computed
  const safeHalfDays =
    paymentDetails?.totalHalfDay !== null &&
    paymentDetails?.totalHalfDay !== undefined &&
    String(paymentDetails?.totalHalfDay).trim() !== ""
      ? paymentDetails.totalHalfDay
      : computedTotals.totalHalfDays;

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!paymentDetails) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 4 }}>
        Payment details not found.
      </Typography>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Typography variant="h4" sx={{ color: "#9C6B3D" }} align="center">
            Payment Details
          </Typography>
        </Grid>

        {/* Payment Summary */}
        <Grid item xs={12}>
          <Card elevation={3} sx={{ borderRadius: 3, p: 2 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Payment Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              display="grid"
              gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }}
              gap={2}
            >
              {[
                { label: "Employee Name", value: paymentDetails.employeeName },
                { label: "Employee ID", value: paymentDetails.eid },
                { label: "From Date", value: formatDate(paymentDetails.fromDate) },
                { label: "To Date", value: formatDate(paymentDetails.toDate) },
                { label: "Total Days", value: paymentDetails.totalDay },
                // ✅ FIXED: show correct Half Days
                { label: "Total Half Days", value: safeHalfDays },
                { label: "Total OT Hours", value: paymentDetails.totalOt },
                { label: "Total Advance", value: paymentDetails.totalAdvance },
                { label: "Reduce Amount", value: paymentDetails.reduceAmount },
                { label: "Actual Payment", value: paymentDetails.actualPayment },
                { label: "Payment Status", value: paymentDetails.paymentStatus },
                { label: "Total Payment", value: paymentDetails.totalPayment },
              ].map((item, i) => (
                <Box key={i}>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography fontWeight={500} variant="body1">
                    {item.value || item.value === 0 ? item.value : "-"}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>

        {/* Work Details Table */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2, mb: 3 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ cursor: "pointer" }}
              onClick={() => setShowWorkDetails(!showWorkDetails)}
            >
              <Typography variant="h6" sx={{ color: "#9C6B3D" }}>
                Employee Work Details
              </Typography>
              <IconButton>
                {showWorkDetails ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Stack>

            <Collapse in={showWorkDetails} timeout="auto" unmountOnExit>
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
                  {workDetail && workDetail.length > 0 ? (
                    workDetail.map((work, index) => {
                      const type = getWorkType(work);
                      const isFull = type === "Full Day";

                      return (
                        <TableRow key={index}>
                          <TableCell align="center">{work.eid_name}</TableCell>
                          <TableCell align="center">{formatDate(work.dateTime)}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={work.isPresent ? "Present" : "Absent"}
                              color={work.isPresent ? "success" : "error"}
                              variant="outlined"
                              sx={{ fontWeight: "bold" }}
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
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No work details found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Collapse>
          </Paper>
        </Grid>

        {/* Actions */}
        <Grid item xs={12} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            sx={{ color: "#9C6B3D", borderRadius: 2 }}
            onClick={() => navigate(`/employee/payment-list`)}
          >
            Back to Payments
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ViewPaymentDetails;
