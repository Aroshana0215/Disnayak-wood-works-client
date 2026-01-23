import React, { useState, useEffect } from 'react';
import { getAllSummaryDetails } from "../../../services/InventoryManagementService/StockSummaryManagementService"; 
import { getCategoryById } from "../../../services/PriceCardService";
import { getInventoryDetailsById } from "../../../services/InventoryManagementService/StockManagementService";
import { getbillDetailsById } from "../../../services/BillAndOrderService/BilllManagemntService"; 
import { Grid, Stack, Typography, Button,  TextField, MenuItem,InputAdornment } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Loading from "../../../Components/Progress/Loading";
import ErrorAlert from "../../../Components/Alert/ErrorAlert";
import { Link } from "react-router-dom";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";

const StockSummaryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timberTypeQuery, setTimberTypeQuery] = useState("");
  const [timberNatuerQuery, setTimberNatuerQuery] = useState("");
  const [generalQuery, setGeneralQuery] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);


  const columns = [
    { field: "categoryId_fk", headerName: "Category ID", width: 150 },
    { field: "length", headerName: "length", width: 150 },
    { field: "totalPieces", headerName: "Total Pieces", width: 120 },
    { field: "changedAmount", headerName: "Changed Amount", width: 150 },
    { field: "previousAmount", headerName: "Previous Amount", width: 160 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "billId_fk", headerName: "Bill ID", width: 120 },
    { field: "stk_id_fk", headerName: "Stock ID", width: 120 },
    { field: "createdBy", headerName: "Created By", width: 120 },
    { field: "modifiedBy", headerName: "Modified By", width: 130 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        let summaryData = await getAllSummaryDetails();

        if (Array.isArray(summaryData)) {
          setCategories(summaryData);
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

    if (timberTypeQuery) {
      const lowercasedTimberTypeQuery = timberTypeQuery.toLowerCase();
      filteredData = filteredData.filter((category) =>
        category.timberType.toLowerCase().includes(lowercasedTimberTypeQuery)
      );
    }

    if (timberNatuerQuery) {
      const lowercasedTimberNatuerQuery = timberNatuerQuery.toLowerCase();
      filteredData = filteredData.filter((category) =>
        category.timberNature.toLowerCase().includes(lowercasedTimberNatuerQuery)
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
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight="bold" color="primary">
              Stock Summaryscs
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              component={Link}
              to={"/stock"}
              sx={{ padding: "5px 15px", height: "45px", marginLeft: "auto"  }}
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
            <TextField
              select
              size="small"
              value={timberTypeQuery}
              onChange={(e) => setTimberTypeQuery(e.target.value)}
              label="Timber Type"
              sx={{
                minWidth: "180px",
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="Sapu">Sapu</MenuItem>
              <MenuItem value="Grandis">Grandis</MenuItem>
              <MenuItem value="Thekka">Thekka</MenuItem>
              <MenuItem value="Micro">Micro</MenuItem>
              <MenuItem value="Amba">Amba</MenuItem>
              <MenuItem value="Kos">Kos</MenuItem>
              <MenuItem value="Maara">Maara</MenuItem>
              <MenuItem value="LunuMidella">LunuMidella</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              value={timberNatuerQuery}
              onChange={(e) => setTimberNatuerQuery(e.target.value)}
              label="Timber Nature"
              sx={{
                minWidth: "180px",
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="Blocks">Blocks</MenuItem>
              <MenuItem value="Planks">Planks</MenuItem>
              <MenuItem value="Dust">Dust</MenuItem>
            </TextField>
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
            rows={categories}
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

export default StockSummaryList;
