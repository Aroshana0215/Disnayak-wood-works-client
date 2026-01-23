import React, { useState, useEffect } from 'react';
import { getAllexpense } from "../../../services/AccountManagementService/ExpenseManagmentService"; // Import the API function
import { getAllActiveExpenseType } from "../../../services/SettingManagementService/ExpenseTypeService"; // Import the expense type API
import { Stack, Typography, Grid, Button, TextField, MenuItem, InputAdornment } from "@mui/material";
import { Link } from "react-router-dom";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { DataGrid } from "@mui/x-data-grid";
import Loading from "../../../Components/Progress/Loading";
import ErrorAlert from "../../../Components/Alert/ErrorAlert";
import SearchIcon from "@mui/icons-material/Search";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';

const ExpList = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expenseTypeQuery, setExpenseTypeQuery] = useState("");
  const [generalQuery, setGeneralQuery] = useState("");
  const [dateQuery, setDateQuery] = useState(null); // Date query state
  const [expenseTypes, setExpenseTypes] = useState([]); // State for expense types

  const columns = [
    { field: "expenseID", headerName: "ID", width: 90 },
    { field: 'date', headerName: 'Date', width: 150 },
    { field: "type", headerName: "Expense Type", width: 150 },
    { field: "des", headerName: "Description", width: 180 },
    {
      field: "amount",
      headerName: "Expense Amount (RS:)",
      width: 130,
      renderCell: ({ row }) => {
        return `${row.amount}.00`;
      },
    },
    { field: "createdBy", headerName: "Created By", width: 120 },
    { field: "modifiedBy", headerName: "Modified By", width: 130 },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <Link to={`/load/timber/view/${params.row.id}`}>
          <Button variant="contained" size="small">
            View
          </Button>
        </Link>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllexpense();
        if (Array.isArray(data)) {
          setCategories(data);
          setFilteredCategories(data);
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

  // Fetch the expense types
  useEffect(() => {
    const fetchExpenseTypes = async () => {
      try {
        const types = await getAllActiveExpenseType();
        setExpenseTypes(types); // Assuming the response is an array of expense types
      } catch (error) {
        console.error("Error fetching expense types:", error);
      }
    };

    fetchExpenseTypes();
  }, []);

  const handleSearch = () => {
    let filteredData = categories;

    if (expenseTypeQuery) {
      const lowercasedExpenseTypeQuery = expenseTypeQuery.toLowerCase();
      filteredData = filteredData.filter((category) =>
        category.type.toLowerCase().includes(lowercasedExpenseTypeQuery)
      );
    }

    if (dateQuery) {
      const formattedDate = format(dateQuery, 'yyyy-MM-dd');
      filteredData = filteredData.filter(category =>
        category.date.includes(formattedDate)
      );
    }

    if (generalQuery) {
      const lowercasedGeneralQuery = generalQuery.toLowerCase();
      filteredData = filteredData.filter((category) =>
        Object.values(category).some((value) =>
          String(value).toLowerCase().includes(lowercasedGeneralQuery)
        )
      );
    }

    setFilteredCategories(filteredData);
  };

  useEffect(() => {
    handleSearch();
  }, [expenseTypeQuery, generalQuery, dateQuery]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearDate = () => {
    setDateQuery(null);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorAlert error={error} />;
  }

  return (
    <>
      <Grid container>
        <Grid item xs={12} p={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight="bold" color="primary">
              Expense Details
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              component={Link}
              to={"/exp/add"}
            >
              New
            </Button>
          </Stack>
        </Grid>

        <Grid item xs={12} p={1}>
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
              <TextField
                select
                size="small"
                value={expenseTypeQuery}
                onChange={(e) => setExpenseTypeQuery(e.target.value)}
                label="Expense Type"
                sx={{
                  minWidth: "180px",
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {expenseTypes.map((type) => (
                  <MenuItem key={type.typeName} value={type.typeName}>
                    {type.typeName}
                  </MenuItem>
                ))}
              </TextField>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={dateQuery}
                  onChange={(date) => setDateQuery(date)}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
              </LocalizationProvider>
              <Button variant="outlined" onClick={clearDate}>
                Clear
              </Button>
            </Stack>
            <TextField
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Search All Fields"
              variant="outlined"
              value={generalQuery}
              onChange={(e) => setGeneralQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} p={2}>
          <DataGrid
            sx={{
              bgcolor: "background.default",
            }}
            rows={filteredCategories}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 8,
                },
              },
            }}
            pageSizeOptions={[8]}
            disableRowSelectionOnClick
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ExpList;
