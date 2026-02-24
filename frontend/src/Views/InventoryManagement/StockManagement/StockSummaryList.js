import React, { useState, useEffect } from "react";
import { getAllSummaryDetails } from "../../../services/InventoryManagementService/StockSummaryManagementService";
import { getAllCategories } from "../../../services/PriceCardService";
import {
  Grid,
  Stack,
  Typography,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Loading from "../../../Components/Progress/Loading";
import ErrorAlert from "../../../Components/Alert/ErrorAlert";
import { Link } from "react-router-dom";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";

const StockSummaryList = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [categoryIdQuery, setCategoryIdQuery] = useState("");
  const [lengthQuery, setLengthQuery] = useState("");
  const [generalQuery, setGeneralQuery] = useState("");

  // Dropdown data
  const [uniqueCategoryIds, setUniqueCategoryIds] = useState([]);
  const [lengthOptions, setLengthOptions] = useState([]);

  const columns = [
    { field: "categoryId_fk", headerName: "Category ID", width: 150 },
    { field: "length", headerName: "Length", width: 150 },
    { field: "totalPieces", headerName: "Total Pieces", width: 120 },
    { field: "changedAmount", headerName: "Changed Amount", width: 150 },
    { field: "previousAmount", headerName: "Previous Amount", width: 160 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "billId_fk", headerName: "Bill ID", width: 120 },
    { field: "stk_id_fk", headerName: "Stock ID", width: 120 },
    { field: "toBeCutAmount", headerName: "Order Amount", width: 130 },
    { field: "createdBy", headerName: "Created By", width: 120 },
    { field: "createdDate", headerName: "Created Date", width: 120 },
    { field: "modifiedBy", headerName: "Modified By", width: 130 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        let summaryData = await getAllSummaryDetails();
        let categoryData = await getAllCategories();

        if (!Array.isArray(summaryData) || !Array.isArray(categoryData)) {
          throw new Error("Invalid data format received from API");
        }

        setCategories(summaryData);
        setFilteredCategories(summaryData);

        // Extract unique category IDs
        const uniqueIds = [...new Set(categoryData.map((c) => c.categoryId))];
        setUniqueCategoryIds(uniqueIds);

        setLoading(false);
      } catch (err) {
        setError(err?.message || "Something went wrong");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to update length options based on selected category
  const updateLengthOptions = (categoryId) => {
    const selectedCategory = categories.find(
      (category) => String(category.categoryId_fk) === String(categoryId)
    );

    if (selectedCategory) {
      const minLength = selectedCategory.minlength;
      const maxLength = selectedCategory.maxlength;

      const lengths = [];
      for (let i = minLength; i <= maxLength; i++) {
        lengths.push(i);
      }
      setLengthOptions(lengths);
    } else {
      setLengthOptions([]);
    }
  };

  const handleSearch = () => {
    let filteredData = categories;

    // Apply Category ID filter
    if (categoryIdQuery) {
      filteredData = filteredData.filter(
        (category) => String(category.categoryId_fk) === String(categoryIdQuery)
      );
    }

    // Apply Length filter
    if (lengthQuery) {
      filteredData = filteredData.filter(
        (category) => String(category.length) === String(lengthQuery)
      );
    }

    // Apply general query filter
    if (generalQuery) {
      const q = generalQuery.toLowerCase();
      filteredData = filteredData.filter((c) =>
        Object.values(c).some((val) => String(val).toLowerCase().includes(q))
      );
    }

    setFilteredCategories(filteredData);
  };

    useEffect(() => {
    handleSearch();
  }, [ categoryIdQuery, lengthQuery, categories]);


  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    setCategoryIdQuery(selectedCategoryId);
    updateLengthOptions(selectedCategoryId); // Update length options based on selected category
    setLengthQuery(""); // Reset the length filter
  };

  if (loading) return <Loading />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <>
      <Grid container>
        <Grid item xs={12} p={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#9C6B3D" }}>
              Stock Summary
            </Typography>

            <Button
              variant="contained"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              component={Link}
              to={"/stock"}
              sx={{ padding: "5px 15px", height: "45px" }}
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
            {/* Category ID Dropdown */}
            <TextField
              select
              size="small"
              value={categoryIdQuery}
              onChange={handleCategoryChange}
              label="Category ID"
              sx={{ minWidth: "180px" }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {uniqueCategoryIds.map((id) => (
                <MenuItem key={id} value={id}>
                  {id}
                </MenuItem>
              ))}
            </TextField>

            {/* Length Dropdown */}
            <TextField
              select
              size="small"
              value={lengthQuery}
              onChange={(e) => setLengthQuery(e.target.value)}
              label="Length"
              sx={{ minWidth: "180px" }}
              disabled={!categoryIdQuery} // Disable length dropdown if no category is selected
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {lengthOptions.map((length) => (
                <MenuItem key={length} value={length}>
                  {length}
                </MenuItem>
              ))}
            </TextField>

            {/* General search */}
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

        <Grid item xs={12} p={1}>
          <DataGrid
            sx={{ bgcolor: "background.default" }}
            rows={filteredCategories}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[10, 20, 50]}
            disableRowSelectionOnClick
            autoHeight
          />
        </Grid>
      </Grid>
    </>
  );
};

export default StockSummaryList;