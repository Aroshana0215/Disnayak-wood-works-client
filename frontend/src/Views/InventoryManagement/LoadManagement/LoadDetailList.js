import React, { useState, useEffect } from 'react';
import { getAllLoadDetails } from '../../../services/InventoryManagementService/LoadDetailsService';
import { Stack, Typography, Grid, Button, TextField, InputAdornment } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import Loading from "../../../Components/Progress/Loading";
import ErrorAlert from "../../../Components/Alert/ErrorAlert";
import SearchIcon from "@mui/icons-material/Search";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";

const LoadDetailList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unLoadedDateQuery, setUnLoadedDateQuery] = useState(null);
  const [generalQuery, setGeneralQuery] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);

  const columns = [
    { field: "loadID", headerName: "ID", width: 90 },
    { field: "sellerName", headerName: "Seller Name", width: 150 },
    { field: "unloadedDate", headerName: "Unloaded Date", width: 150 },
    { field: "lorryNumber", headerName: "Lorry Number", width: 150 },
    { field: "driver", headerName: "Driver", width: 120 },
    { field: "otherDetails", headerName: "Other Details", width: 150 },
    { field: "createdBy", headerName: "Created By", width: 120 },
    { field: "modifiedBy", headerName: "Modified By", width: 130 },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: ({ row }) => (
        <Link to={`/load/timber/view/${row.id}`}>
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
        const data = await getAllLoadDetails();
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

  const handleSearch = () => {
    let filteredData = categories;

    if (unLoadedDateQuery) {
      const formattedDate = format(unLoadedDateQuery, "yyyy-MM-dd");
      filteredData = filteredData.filter((category) =>
        category.unloadedDate.includes(formattedDate)
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
  }, [generalQuery, unLoadedDateQuery]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearDate = () => {
    setUnLoadedDateQuery(null);
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
              Load Details
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              component={Link}
              to={"/load/add"}
            >
              New
            </Button>
          </Stack>
        </Grid>
        <Grid item xs={12} p={2}>
          <Stack
            p={2}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              bgcolor: "background.default",
              borderRadius: 1,
            }}
          >
            <Stack direction="row" spacing={2}>
              <DatePicker
                label="UnLoaded date"
                value={unLoadedDateQuery}
                onChange={(date) => setUnLoadedDateQuery(date)}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
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
              onKeyDown={(e) => handleKeyDown(e)}
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

export default LoadDetailList;
