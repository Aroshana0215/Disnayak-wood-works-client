import React, { useState, useEffect } from 'react';
import { getAllIncomeType } from '../../../services/SettingManagementService/IncomeTypeService'; 
import { Stack, Typography, Grid, Button, TextField, InputAdornment } from "@mui/material";
import { Link } from "react-router-dom";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { DataGrid } from "@mui/x-data-grid";
import Loading from "../../../Components/Progress/Loading";
import ErrorAlert from "../../../Components/Alert/ErrorAlert";
import SearchIcon from "@mui/icons-material/Search";

const IncomeTypeList = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generalQuery, setGeneralQuery] = useState("");

  const columns = [
    { field: "incomeTypeID", headerName: "Income Id", width: 150 },
    { field: "typeName", headerName: "typeName", width: 150 },
    { field: "description", headerName: "description", width: 150 },
    { field: "createdDate", headerName: "createdDate", width: 150 },
    { field: "createdBy", headerName: "createdBy", width: 150 },
    { field: "modifiedDate", headerName: "modifiedDate", width: 150 },
    { field: "modifiedBy", headerName: "modifiedBy", width: 150 },
    { field: "status", headerName: "status", width: 150 },
    {
      field: "view",
      headerName: "View",
      width: 120,
      renderCell: ({ row }) => (
        <Link to={`/setting/incomeType/${row.id}`}>
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
        const data = await getAllIncomeType();
        console.log("Fetched data:", data); // Log fetched data to inspect its format
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
    const lowercasedQuery = generalQuery.toLowerCase();
    const filteredData = categories.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(lowercasedQuery)
      )
    );
    setFilteredCategories(filteredData);
  };

  useEffect(() => {
    handleSearch();
  }, [generalQuery]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
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
            <Typography variant="h6" fontWeight="bold" color="primary">
              Income Types
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              component={Link}
              to={"/setting/incomeType/add"}
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
              border: "1px solid rgba(0, 0, 0, 0.12)",
            }}
          >
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

export default IncomeTypeList;
