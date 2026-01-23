import React, { useState, useEffect } from 'react';
import { getAllSummaryDetails } from '../../services/InventoryManagementService/StockSummaryManagementService'; // Import the API function
import { Button, Grid, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import Loading from "../../Components/Progress/Loading";
import ErrorAlert from "../../Components/Alert/ErrorAlert";
import { DataGrid } from "@mui/x-data-grid";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";

const StockHistory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const columns = [
    { field: "totalPieces", headerName: "Total Pieces", width: 120 },
    { field: "changedAmount", headerName: "Changed Amount", width: 150 },
    { field: "previousAmount", headerName: "Previous Amount", width: 150 },
    { field: "billId_fk", headerName: "Bill Id", width: 120 },
    { field: "stk_id_fk", headerName: "Stock Id", width: 120 },
    { field: "categoryId_fk", headerName: "Category", width: 120 },
    // { field: 'PromizeDate', headerName: 'Promized Date', width: 150 },
    { field: "description", headerName: "Description", width: 180 },
    { field: "billStatus", headerName: "Bill Status", width: 150 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "createdBy", headerName: "Created By", width: 120 },
    // { field: 'createdDate', headerName: 'Created Date', width: 150 },
    { field: "modifiedBy", headerName: "Modified By", width: 130 },
    // { field: 'modifiedDate', headerName: 'Modified Date', width: 150 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllSummaryDetails();
        console.log("Fetched data:", data); // Log fetched data to inspect its format
        if (Array.isArray(data)) {
          setCategories(data);
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
              Stock History
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              component={Link}
              to={"/bill/wants/wood"}
            >
              New Bill
            </Button>
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

export default StockHistory;
