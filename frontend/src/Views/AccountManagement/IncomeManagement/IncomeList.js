import React, { useState, useEffect } from 'react';
import { getAllincome } from '../../../services/AccountManagementService/IncomeManagmentService';
import { getAllActiveIncomeType } from "../../../services/SettingManagementService/IncomeTypeService";
import { Stack, Typography, Grid, Button, TextField, MenuItem, InputAdornment } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Loading from "../../../Components/Progress/Loading";
import ErrorAlert from "../../../Components/Alert/ErrorAlert";
import { Link } from "react-router-dom";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';

const IncomeList = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [incomeTypes, setIncomeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [incomeTypeQuery, setIncomeTypeQuery] = useState("");
  const [generalQuery, setGeneralQuery] = useState("");
  const [dateQuery, setDateQuery] = useState(null);

  const columns = [
    { field: "incID", headerName: "ID", width: 90 },
    {
      field: "date",
      headerName: "Date",
      width: 150,
      renderCell: ({ value }) => format(new Date(value), 'yyyy-MM-dd'),
    },
    { field: "type", headerName: "Income Type", width: 150 },
    {
      field: "amount",
      headerName: "Amount (RS:)",
      width: 130,
      renderCell: ({ row }) => `${row.amount}.00`,
    },
    { field: "BilId", headerName: "Bill ID", width: 150 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "des", headerName: "Description", width: 180 },
    { field: "createdBy", headerName: "Created By", width: 120 },
    { field: "modifiedBy", headerName: "Modified By", width: 130 },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: ({ row }) => (
        <Link to={`/income/view/${row.incID}`}>
          <Button variant="contained" size="small">View</Button>
        </Link>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const incomeData = await getAllincome();
        if (Array.isArray(incomeData)) {
          setCategories(incomeData);
          setFilteredCategories(incomeData);
        } else {
          throw new Error("Invalid data format received from API");
        }

        const incomeTypeData = await getAllActiveIncomeType();
        if (Array.isArray(incomeTypeData)) {
          setIncomeTypes(incomeTypeData);
        } else {
          throw new Error("Invalid data format received from API");
        }
        
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    let filteredData = categories;

    if (dateQuery) {
      const formattedDate = format(dateQuery, 'yyyy-MM-dd');
      filteredData = filteredData.filter(category =>
        category.date.includes(formattedDate)
      );
    }

    if (incomeTypeQuery) {
      const lowercasedIncomeTypeQuery = incomeTypeQuery.toLowerCase();
      filteredData = filteredData.filter(category =>
        category.type.toLowerCase().includes(lowercasedIncomeTypeQuery)
      );
    }

    if (generalQuery) {
      const lowercasedGeneralQuery = generalQuery.toLowerCase();
      filteredData = filteredData.filter(category =>
        Object.values(category).some(value =>
          String(value).toLowerCase().includes(lowercasedGeneralQuery)
        )
      );
    }

    setFilteredCategories(filteredData);
  };

  useEffect(() => {
    handleSearch();
  }, [incomeTypeQuery, generalQuery, dateQuery]);

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
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold" color="primary">Income Details</Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              component={Link}
              to="/income/add"
            >
              New
            </Button>
          </Stack>
        </Grid>

        <Grid item xs={12} p={2}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            justifyContent="space-between"
            sx={{
              bgcolor: "background.default",
              borderRadius: 1,
              border: "1px solid rgba(0, 0, 0, 0.12)",
              padding: "8px 16px",
            }}
          >
            <Stack direction="row" spacing={2}>

              <TextField
                select
                size="small"
                value={incomeTypeQuery}
                onChange={(e) => setIncomeTypeQuery(e.target.value)}
                label="Income Type"
                sx={{ minWidth: "180px" }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {incomeTypes.map((type) => (
                  <MenuItem key={type.typeName} value={type.typeName}>
                    {type.typeName}
                  </MenuItem>
                ))}
              </TextField>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Income Date"
                  value={dateQuery}
                  onChange={(date) => setDateQuery(date)}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
              </LocalizationProvider>
              <Button variant="outlined" onClick={clearDate}>
                Clear Date
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
            sx={{ bgcolor: "background.default" }}
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

export default IncomeList;
