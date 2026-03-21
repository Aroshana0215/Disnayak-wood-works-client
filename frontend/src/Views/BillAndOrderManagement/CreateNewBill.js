import React, { useState, useEffect, useMemo } from "react";
import {
  Grid,
  Typography,
  Button,
  Stack,
  FormControl,
  FormLabel,
  OutlinedInput,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Box,
  Divider,
  Chip,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import { ToastContainer, toast } from "react-toastify";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TextField } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; 

import { newBill } from "../../services/BillAndOrderService/BilllManagemntService";
import {
  createStockSummary,
  updateStockSummaryDetails,
  getStockSummaryById,
} from "../../services/InventoryManagementService/StockSummaryManagementService";
import { createOrder } from "../../services/BillAndOrderService/OrderManagmentService";
import { newIncome } from "../../services/AccountManagementService/IncomeManagmentService";
import {
  newAccountSummary,
  updateAccountSummary,
  getActiveAccountSummaryDetails,
} from "../../services/AccountManagementService/AccountSummaryManagmentService";
import { getCategoryById } from "../../services/PriceCardService";
import { createbillAdvance } from "../../services/BillAndOrderService/BilllAdvanceService";

const brand = { brown: "#9C6B3D" };

const CreateNewBill = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { woodData } = location.state;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const currentDate = useMemo(() => new Date(), []);
  const currentDateTime = useMemo(() => currentDate.toISOString(), [currentDate]);

  const formattedDate = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, "0");
    const d = String(currentDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [currentDate]);

  const [formData, setFormData] = useState({
    cusName: "",
    cusAddress: "",
    cusPhoneNumber: "",
    totalAmount: 0,
    advance: 0,
    otherCharges: 0,
    remainningAmount: 0,
    PromizeDate: "",
    description: "",
    billBookNo: "",
    billStatus: "",
    billCreatedDate: "", // Add the billCreatedDate state
  });

  const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

  const getTotalLengthResult = (row) => {
    const length = Number(row.requestLength || 0);
    const width = Number(row.width || 0);
    const amount = Number(row.amount || 0);

    if (row.natureName === "Block" || row.natureName === "Blocks") return round2(length * amount);

    if (row.natureName === "Planks" || row.natureName === "Plank") {
      if (width > 8) return round2(length * amount);
      return round2(((length * width) / 12) * amount);
    }

    return round2(length * amount);
  };

  const getRowTotal = (wood) => {
    const nature = (wood.natureName || "").toLowerCase();
    const length = Number(wood.requestLength || 0);
    const width = Number(wood.width || 0);
    const amount = Number(wood.amount || 0);
    const billPrice = Number(wood.billPrice || 0);

    if (nature === "block" || nature === "blocks") return round2(length * amount * billPrice);

    if (nature === "plank" || nature === "planks") {
      if (width > 8) return round2(length * amount * billPrice);
      const sqFeet = (length * width) / 12;
      return round2(sqFeet * amount * billPrice);
    }

    return round2(amount * billPrice);
  };

  const calculateTotals = (advance, otherCharges) => {
    let totalAmount = woodData.reduce((sum, wood) => sum + getRowTotal(wood), 0);
    totalAmount = totalAmount + Number(otherCharges || 0)
    const remainningAmount = totalAmount - Number(advance || 0);
    return { totalAmount: round2(totalAmount), remainningAmount: round2(remainningAmount) };
  };

  useEffect(() => {
    const { totalAmount, remainningAmount } = calculateTotals(formData.advance, formData.otherCharges);
    setFormData((prev) => ({ ...prev, totalAmount, remainningAmount }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [woodData, formData.advance, formData.otherCharges]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateBillInputs = (woodDataArg, formDataArg) => {
    let status = false;

    if (!formDataArg.cusName) {
      toast.error("Customer Name required");
      status = true;
    } else if (!formDataArg.cusAddress) {
      toast.error("Customer Address required");
      status = true;
    } else if (!formDataArg.cusPhoneNumber) {
      toast.error("Customer Phone Number required");
      status = true;
    } else if (formDataArg.totalAmount === "" || formDataArg.totalAmount === null) {
      toast.error("Total amount required");
      status = true;
    } else if (formDataArg.remainningAmount === "" || formDataArg.remainningAmount === null) {
      toast.error("Remaining amount required");
      status = true;
    } else if (!formDataArg.PromizeDate) {
      toast.error("Promized date required");
      status = true;
    } else if (!formDataArg.billStatus) {
      toast.error("Status required");
      status = true;
    } else if (!formDataArg.billBookNo) {
      toast.error("BillBook No required");
      status = true;
    }else if (!formDataArg.billCreatedDate) {
      toast.error("Bill create date required");
      status = true;
    }

        for (const wood of woodDataArg) {
      if (formDataArg.billStatus !== "ORDER" && Number(wood.toBeCut) > 0) {
        toast.error("No stock for timber!! check Bill status");
        status = true;
      }
    }

    if (formDataArg.billStatus === "COMPLETE" && Number(formDataArg.advance) > 0) {
      toast.error("Cannot have advance for Complete bill !!");
      status = true;
    }

    return status;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = validateBillInputs(woodData, formData);
      if (result) return;

      const formattedData = {
        ...formData,
        dateAndTime: currentDateTime,
        status: "A",
        createdBy: user.displayName,
        createdDate: currentDateTime,
      };

      const bill = await newBill(formattedData);

      if (bill != null) {
        if (Number(formData.advance) > 0) {
          await createbillAdvance({
            amount: formData.advance,
            description: "Initial Advance",
            date: formattedDate,
            BillId: bill.id,
            status: "A",
            createdBy: user.displayName,
            createdDate: formattedDate,
          });
        }

        for (const wood of woodData) {
          if (formData.billStatus !== "ORDER") {
            const data = await getStockSummaryById(wood.summaryId);
            if (!data) continue;

            await updateStockSummaryDetails(data.id, {
              status: "D",
              modifiedBy: user.displayName,
              modifiedDate: currentDateTime,
            });

            const categoryData = await getCategoryById(data.categoryId_fk);
            if (!categoryData) continue;

            await createStockSummary({
              totalPieces: wood.totalPieces - wood.amount,
              changedAmount: wood.amount,
              previousAmount: wood.totalPieces,
              categoryId_fk: wood.categoryId_fk,
              maxlength: categoryData.maxlength,
              minlength: categoryData.minlength,
              timberNature: categoryData.timberNature,
              timberType: categoryData.timberType,
              areaLength: categoryData.areaLength,
              areaWidth: categoryData.areaWidth,
              length: String(wood.requestLength),
              toBeCutAmount: wood.toBeCut,
              stk_id_fk: "",
              status: "A",
              billId_fk: bill.id,
              createdBy: user.displayName,
              createdDate: currentDateTime,
            });
          } else {
            const data = await getStockSummaryById(wood.summaryId);
            if (!data) continue;

            await updateStockSummaryDetails(data.id, {
              toBeCutAmount: wood.amount,
              modifiedBy: user.displayName,
              modifiedDate: currentDateTime,
            });
          }

          await createOrder({
            discountPrice: wood.billPrice || 0,
            categoryId_fk: wood.categoryId_fk || 0,
            availablePiecesAmount: wood.totalPieces || 0,
            neededPiecesAmount: wood.amount || 0,
            tobeCut: wood.toBeCut,
            woodLength: wood.requestLength,
            isComplete: formData.billStatus === "ORDER" ? false : true,
            status: "A",
            billId_fk: bill.id,
            createdBy: user.displayName,
            createdDate: currentDateTime,
          });
        }

        if (formData.billStatus !== "INTERNAL") {
          let incomeAmount = 0;
          if (formData.billStatus === "COMPLETE") incomeAmount = formData.totalAmount;
          else if (Number(formData.advance) > 0) incomeAmount = formData.advance;

          const incomeId = await newIncome({
            date: formData.billCreatedDate,
            type: `${formData.billStatus}-Bill`,
            des: `${formData.billStatus} bill in bill creation`,
            amount: incomeAmount,
            BilId: bill.billID || "",
            status: "A",
            createdBy: user.displayName,
            createdDate: currentDateTime,
          });

          if (incomeId) {
            const data = await getActiveAccountSummaryDetails();
            if (data) {
              await updateAccountSummary(data.id, {
                status: "D",
                modifiedBy: user.displayName,
                modifiedDate: currentDateTime,
              });

              await newAccountSummary({
                totalAmount: Number(data.totalAmount) + Number(formData.totalAmount),
                changedAmount: formData.totalAmount,
                previousAmount: data.totalAmount,
                expId_fk: "",
                incId_fk: incomeId,
                status: "A",
                createdBy: user.displayName,
                createdDate: currentDateTime,
              });
            }
          }
        }
      }

      navigate(`/bill/view/${bill.id}`);
    } catch (error) {
      console.error("Error creating bill:", error?.message || error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(
    () => [
      { field: "categoryId", headerName: "ID", width: 110 },
      {
        field: "TreeType",
        headerName: "Tree Type",
        width: 170,
        renderCell: ({ row }) => `${row.timberType}-${row.natureName}`,
      },
      {
        field: "diamention",
        headerName: "Dimension",
        width: 140,
        renderCell: ({ row }) => `${row.length} x ${row.width}`,
      },
      { field: "requestLength", headerName: "Length", width: 95 },
      { field: "totalPieces", headerName: "Stock", width: 90 },
      { field: "unitPrice", headerName: "Unit Price", width: 110 },
      { field: "amount", headerName: "Amount", width: 90 },
      { field: "toBeCut", headerName: "To Be Cut", width: 100 },
      {
        field: "TotalLength",
        headerName: "TotalLength",
        width: 120,
        renderCell: ({ row }) => getTotalLengthResult(row).toFixed(2),
      },
      { field: "billPrice", headerName: "Bill Price", width: 110 },
      { field: "total", headerName: "Total", width: 120 },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const rows = useMemo(
    () =>
      woodData.map((wood, index) => ({
        id: index + 1,
        ...wood,
        total: getRowTotal(wood),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [woodData]
  );

  const summary = useMemo(() => {
    const count = woodData.length;
    const outOfStock = woodData.filter((w) => Number(w.toBeCut) > 0).length;
    return { count, outOfStock };
  }, [woodData]);

  return (
    <>
      <ToastContainer />

      <Box sx={{ p: { xs: 1.5, md: 2 } }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "background.paper",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  letterSpacing: 0.2,
                  color: brand.brown,
                }}
              >
                Create a New Bill
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill customer details, then review wood items and save.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip size="small" label={`${summary.count} item(s)`} variant="outlined" />
              {summary.outOfStock > 0 ? (
                <Chip size="small" color="warning" label={`${summary.outOfStock} need cut`} />
              ) : (
                <Chip size="small" color="success" variant="outlined" label="All in stock" />
              )}
            </Stack>
          </Box>

          <Divider />

          {/* ✅ Vertical layout: Customer -> Wood Items -> Actions */}
          <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {/* Customer Details */}
              <Grid item xs={12}>
                <Paper
                  variant="outlined"
                  sx={{ borderRadius: 2, p: 2, bgcolor: "background.paper" }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                      Customer Details
                    </Typography>
                    <Chip size="small" label="Required" variant="outlined" />
                  </Stack>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={1.5}>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <FormLabel>Customer Name</FormLabel>
                        <OutlinedInput
                          size="small"
                          name="cusName"
                          value={formData.cusName}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          sx={{ mt: 0.5 }}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <FormLabel>Customer Address</FormLabel>
                        <OutlinedInput
                          size="small"
                          name="cusAddress"
                          value={formData.cusAddress}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          sx={{ mt: 0.5 }}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <FormLabel>Phone Number</FormLabel>
                        <OutlinedInput
                          size="small"
                          name="cusPhoneNumber"
                          value={formData.cusPhoneNumber}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          sx={{ mt: 0.5 }}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <FormLabel>Total Amount</FormLabel>
                        <OutlinedInput
                          size="small"
                          name="totalAmount"
                          value={formData.totalAmount}
                          readOnly
                          sx={{
                            mt: 0.5,
                            bgcolor: "rgba(0,0,0,0.03)",
                            fontWeight: 800,
                          }}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <FormLabel>Advance</FormLabel>
                        <OutlinedInput
                          size="small"
                          name="advance"
                          value={formData.advance}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          sx={{ mt: 0.5 }}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <FormLabel>Remaining Amount</FormLabel>
                        <OutlinedInput
                          size="small"
                          name="remainningAmount"
                          value={formData.remainningAmount}
                          readOnly
                          sx={{
                            mt: 0.5,
                            bgcolor: "rgba(0,0,0,0.03)",
                            fontWeight: 800,
                          }}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <FormLabel>Description</FormLabel>
                        <OutlinedInput
                          size="small"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          sx={{ mt: 0.5 }}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <FormLabel>Bill Book No</FormLabel>
                        <OutlinedInput
                          size="small"
                          name="billBookNo"
                          value={formData.billBookNo}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          sx={{ mt: 0.5 }}
                        />
                      </FormControl>
                    </Grid>

                     <Grid item xs={12} md={4}>
                      <FormControl fullWidth sx={{ mt: 0.5 }}> <br></br>
                        <InputLabel>Bill Status</InputLabel>
                        <Select
                          name="billStatus"
                          value={formData.billStatus}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          size="small"
                          label="Bill Status"
                        >
                          <MenuItem value="ORDER">ORDER</MenuItem>
                          <MenuItem value="COMPLETE">COMPLETE</MenuItem>
                          <MenuItem value="INTERNAL">INTERNAL</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                      <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <FormLabel>Other Charges</FormLabel>
                        <OutlinedInput
                          size="small"
                          name="otherCharges"
                          value={formData.otherCharges}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          sx={{ mt: 0.5 }}
                        />
                      </FormControl>
                    </Grid>

                      <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <FormLabel>Promize Date</FormLabel>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            name="PromizeDate"
                            value={formData.PromizeDate}
                            onChange={(date) => handleChange({ target: { name: "PromizeDate", value: date } })}
                            disabled={isSubmitting}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                size="small"
                                sx={{
                                  mt: 0.5,
                                  bgcolor: "rgba(0,0,0,0.03)",
                                  fontWeight: 800,
                                }}
                              />
                            )}
                          />
                        </LocalizationProvider>
                      </FormControl>
                    </Grid>

                      <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <FormLabel>Bill Date</FormLabel>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateTimePicker
                        name="billCreatedDate"
                        value={formData.billCreatedDate}
                        onChange={(date) => handleChange({ target: { name: "billCreatedDate", value: date } })}
                         disabled={isSubmitting}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            sx={{
                              mt: 0.5,
                              bgcolor: "rgba(0,0,0,0.03)",
                              fontWeight: 800,
                            }}
                            value={formData.billCreatedDate ? formData.billCreatedDate.toLocaleString() : ""} // Format date
                          />
                        )}
                      />
                       </LocalizationProvider>
                      </FormControl>
                    </Grid>


                  </Grid>
                </Paper>
              </Grid>

              {/* Wood Items */}
              <Grid item xs={12}>
                <Paper
                  variant="outlined"
                  sx={{ borderRadius: 2, p: 2, bgcolor: "background.paper" }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                      Wood Items
                    </Typography>
                    <Chip
                      size="small"
                      label="Scroll to view all"
                      variant="outlined"
                      sx={{ borderColor: "rgba(156,107,61,0.35)" }}
                    />
                  </Stack>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ width: "100%", height: 460 }}>
                    <DataGrid
                      rows={rows}
                      columns={columns}
                      pageSize={100}
                      rowsPerPageOptions={[100]}
                      disableRowSelectionOnClick
                      sx={{
                        border: 0,
                        "& .MuiDataGrid-columnHeaders": {
                          bgcolor: "rgba(0,0,0,0.02)",
                          borderBottom: "1px solid rgba(0,0,0,0.08)",
                        },
                        "& .MuiDataGrid-row:hover": { bgcolor: "rgba(156,107,61,0.06)" },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* Actions */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    p: 1.5,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                    bgcolor: "background.paper",
                  }}
                >
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate("/bill")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting}
                    sx={{
                      bgcolor: brand.brown,
                      "&:hover": { bgcolor: "#855A35" },
                      px: 3,
                    }}
                  >
                    {isSubmitting ? "Saving..." : "Save Bill"}
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default CreateNewBill;
