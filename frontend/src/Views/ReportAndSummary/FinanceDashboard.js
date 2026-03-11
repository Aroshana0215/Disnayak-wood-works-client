import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Divider,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import dayjs from "dayjs";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { getActiveExpensesByDate } from "../../../src/services/AccountManagementService/ExpenseManagmentService";
import { getActiveIncomeByDate } from "../../../src/services/AccountManagementService/IncomeManagmentService";

const COLORS = [
  "#6366F1",
  "#14B8A6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#84CC16",
  "#F97316",
];

const cardStyles = {
  borderRadius: 4,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  height: "100%",
};

function groupByField(items, fieldName, amountField = "amount", fallback = "Other") {
  const grouped = items.reduce((acc, item) => {
    const key = item?.[fieldName] || fallback;
    const value = Number(item?.[amountField] || 0);

    acc[key] = (acc[key] || 0) + value;
    return acc;
  }, {});

  return Object.entries(grouped).map(([name, value]) => ({
    name,
    value,
  }));
}

function SummaryCard({ title, value, icon, color, subtext }) {
  return (
    <Card sx={cardStyles}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              Rs. {Number(value || 0).toLocaleString()}
            </Typography>
            {subtext ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {subtext}
              </Typography>
            ) : null}
          </Box>

          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: "16px",
              background: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function CustomPieLabel({ name, percent }) {
  return `${name} ${(percent * 100).toFixed(0)}%`;
}

export default function FinanceDashboard() {
  const [filterMode, setFilterMode] = useState("range");
  const [singleDate, setSingleDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [startDate, setStartDate] = useState(dayjs().startOf("month").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().endOf("month").format("YYYY-MM-DD"));

  const [incomeItems, setIncomeItems] = useState([]);
  const [expenseItems, setExpenseItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFilterMode = (_, newMode) => {
    if (newMode) {
      setFilterMode(newMode);
    }
  };

  useEffect(() => {
    const fetchFinanceData = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        let incomeResponse = [];
        let expenseResponse = [];

        if (filterMode === "single") {
          incomeResponse = await getActiveIncomeByDate({ singleDate });
          expenseResponse = await getActiveExpensesByDate({ singleDate });
        } else {
          incomeResponse = await getActiveIncomeByDate({ startDate, endDate });
          expenseResponse = await getActiveExpensesByDate({ startDate, endDate });
        }

        setIncomeItems(Array.isArray(incomeResponse) ? incomeResponse : []);
        setExpenseItems(Array.isArray(expenseResponse) ? expenseResponse : []);
      } catch (error) {
        console.error("Error fetching finance dashboard data:", error);
        setErrorMessage("Failed to load finance data.");
        setIncomeItems([]);
        setExpenseItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, [filterMode, singleDate, startDate, endDate]);

  const totalIncome = useMemo(() => {
    return incomeItems.reduce((sum, item) => sum + Number(item?.amount || 0), 0);
  }, [incomeItems]);

  const totalExpense = useMemo(() => {
    return expenseItems.reduce((sum, item) => {
      return sum + Number(item?.amount || 0);
    }, 0);
  }, [expenseItems]);

  const netProfit = totalIncome - totalExpense;

  const incomeChartData = useMemo(() => {
    return groupByField(incomeItems, "type", "amount", "Income");
  }, [incomeItems]);

  const expenseChartData = useMemo(() => {
    if (expenseItems.some((item) => item?.category)) {
      return groupByField(expenseItems, "category", "amount", "Expense");
    }

    if (expenseItems.some((item) => item?.type)) {
      return groupByField(expenseItems, "type", "amount", "Expense");
    }

    return groupByField(expenseItems, "expenseType", "amount", "Expense");
  }, [expenseItems]);

  const filterLabel = useMemo(() => {
    if (filterMode === "single") {
      return dayjs(singleDate).format("DD MMM YYYY");
    }

    return `${dayjs(startDate).format("DD MMM YYYY")} - ${dayjs(endDate).format("DD MMM YYYY")}`;
  }, [filterMode, singleDate, startDate, endDate]);

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        backgroundColor: "#F8FAFC",
        minHeight: "100vh",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Finance Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Track income, expenses, and profit/loss by date or date range
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip
            icon={<CalendarMonthIcon />}
            label={filterLabel}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={netProfit >= 0 ? "Profit" : "Loss"}
            color={netProfit >= 0 ? "success" : "error"}
            sx={{ fontWeight: 700 }}
          />
        </Stack>
      </Stack>

      <Card sx={{ ...cardStyles, mb: 4 }}>
        <CardContent>
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Typography variant="h6" fontWeight={700}>
                Filter Transactions
              </Typography>

              <ToggleButtonGroup
                value={filterMode}
                exclusive
                onChange={handleFilterMode}
                size="small"
              >
                <ToggleButton value="single">Single Date</ToggleButton>
                <ToggleButton value="range">Date Range</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <Divider />

            {filterMode === "single" ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Select Date"
                    type="date"
                    fullWidth
                    value={singleDate}
                    onChange={(e) => setSingleDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Start Date"
                    type="date"
                    fullWidth
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="End Date"
                    type="date"
                    fullWidth
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            )}
          </Stack>
        </CardContent>
      </Card>

      {errorMessage ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      ) : null}

      {loading ? (
        <Box
          sx={{
            minHeight: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <SummaryCard
                title="Total Income"
                value={totalIncome}
                icon={<TrendingUpIcon />}
                color="linear-gradient(135deg, #10B981, #34D399)"
                subtext={`${incomeItems.length} income record(s)`}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <SummaryCard
                title="Total Expense"
                value={totalExpense}
                icon={<TrendingDownIcon />}
                color="linear-gradient(135deg, #EF4444, #F87171)"
                subtext={`${expenseItems.length} expense record(s)`}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <SummaryCard
                title={netProfit >= 0 ? "Net Profit" : "Net Loss"}
                value={Math.abs(netProfit)}
                icon={<AccountBalanceWalletIcon />}
                color={
                  netProfit >= 0
                    ? "linear-gradient(135deg, #3B82F6, #60A5FA)"
                    : "linear-gradient(135deg, #F97316, #FB923C)"
                }
                subtext={
                  netProfit >= 0
                    ? "Income is higher than expenses"
                    : "Expenses are higher than income"
                }
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <Card sx={cardStyles}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    Income Breakdown
                  </Typography>

                  {incomeChartData.length === 0 ? (
                    <Typography color="text.secondary">
                      No income data available for the selected period.
                    </Typography>
                  ) : (
                    <Box sx={{ width: "100%", height: 360 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={incomeChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            label={CustomPieLabel}
                          >
                            {incomeChartData.map((_, index) => (
                              <Cell
                                key={`income-cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => `Rs. ${Number(value).toLocaleString()}`}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Card sx={cardStyles}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    Expense Breakdown
                  </Typography>

                  {expenseChartData.length === 0 ? (
                    <Typography color="text.secondary">
                      No expense data available for the selected period.
                    </Typography>
                  ) : (
                    <Box sx={{ width: "100%", height: 360 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={expenseChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            label={CustomPieLabel}
                          >
                            {expenseChartData.map((_, index) => (
                              <Cell
                                key={`expense-cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => `Rs. ${Number(value).toLocaleString()}`}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}