import React, { useState, useEffect, useMemo } from "react";
import { getAllActiveStockDetails } from "../../../services/InventoryManagementService/StockSummaryManagementService";
import { getAllCategories } from "../../../services/PriceCardService";
import { getAllActiveTreeType } from "../../../services/SettingManagementService/TreeTypeService";
import { getAllActiveTimberNature } from "../../../services/SettingManagementService/TimberNatureService";
import {
  Grid,
  Stack,
  Typography,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Loading from "../../../Components/Progress/Loading";
import ErrorAlert from "../../../Components/Alert/ErrorAlert";
import { Link } from "react-router-dom";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";

const ActiveStockList = () => {
  const [summaryData, setSummaryData] = useState([]);
  const [categories, setCategories] = useState([]); // price-card categories
  const [filteredData, setFilteredData] = useState([]);

  const [treeTypes, setTreeTypes] = useState([]); // ✅ same as PriceCardList
  const [timberNatures, setTimberNatures] = useState([]); // ✅ same as PriceCardList

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters (same as PriceCardList)
  const [timberTypeQuery, setTimberTypeQuery] = useState("");
  const [timberNatuerQuery, setTimberNatuerQuery] = useState("");
  const [dimensionsQuery, setDimensionsQuery] = useState("");
  const [categoryIdQuery, setCategoryIdQuery] = useState("");
  const [generalQuery, setGeneralQuery] = useState("");

  const [dimensionOptions, setDimensionOptions] = useState([]);

  const columns = [
    { field: "categoryId_fk", headerName: "Category ID", width: 150 },
    {
      field: "lengthRange",
      headerName: "Length Range",
      width: 130,
      renderCell: ({ row }) => `${row.minlength} - ${row.maxlength}`,
    },
    { field: "timberType", headerName: "Type", width: 120 },
    { field: "timberNature", headerName: "Nature", width: 150 },
    {
      field: "dimensions",
      headerName: "Dimensions",
      width: 130,
      renderCell: ({ row }) => `${row.areaLength} x ${row.areaWidth}`,
    },
    { field: "length", headerName: "Length", width: 150 },
    {
      field: "totalPieces",
      headerName: "Total Pieces",
      width: 120,
      renderCell: ({ value }) => (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <Typography variant="body2" style={{ fontWeight: "bold" }}>
            {value}
          </Typography>
        </div>
      ),
    },
    { field: "toBeCutAmount", headerName: "Order Amount", width: 150 },
    { field: "createdBy", headerName: "Created By", width: 120 },
  ];

  // ✅ Fetch ALL data ONCE (stock + categories + dropdown data)
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [stockRes, categoryData, treeTypeRes, timberNatureRes] = await Promise.all([
          getAllActiveStockDetails(),
          getAllCategories(),
          getAllActiveTreeType(),
          getAllActiveTimberNature(),
        ]);

        if (!Array.isArray(stockRes)) throw new Error("Invalid stock data format");
        if (!Array.isArray(categoryData)) throw new Error("Invalid data format received from API");
        if (!Array.isArray(treeTypeRes)) throw new Error("Invalid tree type data format received from API");
        if (!Array.isArray(timberNatureRes)) throw new Error("Invalid timber nature data format received from API");

        setSummaryData(stockRes);
        setCategories(categoryData);
        setTreeTypes(treeTypeRes);
        setTimberNatures(timberNatureRes);

        setFilteredData(stockRes);
        setLoading(false);
      } catch (err) {
        setError(err?.message || "Something went wrong");
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ✅ Dimension dropdown options (same approach)
  const updateDimensionOptions = (nature) => {
    if (nature === "Planks") {
      setDimensionOptions([
        "0.1 x 5",
        "0.2 x 5",
        "0.3 x 5",
        "0.4 x 5",
        "0.5 x 5",
        "0.6 x 5",
        "0.7 x 5",
        "0.8 x 5",
        "0.1 x 6",
        "0.2 x 6",
        "0.3 x 6",
        "0.4 x 6",
        "0.5 x 6",
        "0.6 x 6",
        "0.7 x 6",
        "0.8 x 6",
      ]);
    } else if (nature === "Blocks") {
      setDimensionOptions([
        "2 x 2",
        "2 x 4",
        "2 x 5",
        "2 x 6",
        "3 x 2",
        "3 x 3",
        "3 x 4",
        "3 x 5",
        "3 x 6",
        "4 x 3",
        "4 x 4",
        "4 x 5",
        "4 x 6",
      ]);
    } else if (nature === "Dust") {
      setDimensionOptions(["0 x 0"]);
    } else {
      setDimensionOptions([]);
    }
  };

  // ✅ Parse "2 x 4" -> [2,4] (numeric safe for swapped matching)
  const parseDim = (dimStr) => {
    const [a, b] = String(dimStr)
      .toLowerCase()
      .split("x")
      .map((p) => p.trim());
    const n1 = Number(a);
    const n2 = Number(b);
    return [n1, n2];
  };

  // ✅ Dimensions matching for categories (2x4 == 4x2)
  const matchCategoryDimensions = (cat, selectedDim) => {
    const [q1, q2] = parseDim(selectedDim);
    const c1 = Number(cat.areaLength);
    const c2 = Number(cat.areaWidth);

    if ([q1, q2, c1, c2].some((n) => Number.isNaN(n))) return false;

    const normal = c1 === q1 && c2 === q2;
    const swapped = c1 === q2 && c2 === q1;
    return normal || swapped;
  };

  // ✅ MAIN FILTERING (like PriceCardList but works correctly with dropdown values)
  const handleSearch = () => {
    let matchedCategories = categories;

    // Timber Type: exact match (dropdown value)
    if (timberTypeQuery) {
      const q = timberTypeQuery.toLowerCase().trim();
      matchedCategories = matchedCategories.filter(
        (c) => String(c.timberType ?? "").toLowerCase().trim() === q
      );
    }

    // Timber Nature: exact match (dropdown value)
    if (timberNatuerQuery) {
      const q = timberNatuerQuery.toLowerCase().trim();
      matchedCategories = matchedCategories.filter(
        (c) => String(c.timberNature ?? "").toLowerCase().trim() === q
      );
    }

    // Dimensions: supports swapped
    if (dimensionsQuery) {
      matchedCategories = matchedCategories.filter((c) =>
        matchCategoryDimensions(c, dimensionsQuery)
      );
    }

    // Category ID AFTER dimensions (same order)
    if (categoryIdQuery) {
      matchedCategories = matchedCategories.filter(
        (c) => String(c.categoryId) === String(categoryIdQuery)
      );
    }

    const matchedCategoryIds = new Set(
      matchedCategories.map((c) => String(c.categoryId))
    );

    // Filter active stock rows by matched category IDs
    let data = summaryData.filter((r) =>
      matchedCategoryIds.has(String(r.categoryId_fk))
    );

    // General search on stock rows
    if (generalQuery) {
      const q = generalQuery.toLowerCase();
      data = data.filter((r) =>
        Object.values(r).some((val) => String(val).toLowerCase().includes(q))
      );
    }

    setFilteredData(data);
  };

  useEffect(() => {
    handleSearch();
  }, [
    timberTypeQuery,
    timberNatuerQuery,
    dimensionsQuery,
    categoryIdQuery,
    generalQuery,
    summaryData,
    categories,
  ]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // unique category ids for dropdown
  const uniqueCategoryIds = useMemo(() => {
    const ids = categories.map((c) => c.categoryId).filter(Boolean);
    return [...new Set(ids)];
  }, [categories]);

  if (loading) return <Loading />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <>
      <Grid container>
        <Grid item xs={12} p={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#9C6B3D" }}>
              Stock Summary
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button variant="contained" component={Link} to={"/switch-category"}>
                Switch Category
              </Button>

              <Button
                variant="contained"
                startIcon={<AddCircleOutlineOutlinedIcon />}
                component={Link}
                to={"/stock"}
              >
                New
              </Button>
            </Stack>
          </Stack>
        </Grid>

        <Grid item xs={12} p={2}>
          <Stack
            p={2}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ bgcolor: "background.default", borderRadius: 1 }}
          >
            <Stack direction="row" spacing={2}>
              {/* ✅ Timber Type (API - same as PriceCardList) */}
              <TextField
                select
                size="small"
                value={timberTypeQuery}
                onChange={(e) => setTimberTypeQuery(e.target.value)}
                label="Timber Type"
                sx={{ minWidth: "180px" }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {treeTypes.map((t) => (
                  <MenuItem key={t.typeId ?? t.id} value={t.typeName}>
                    {t.typeName}
                  </MenuItem>
                ))}
              </TextField>

              {/* ✅ Timber Nature (API - same as PriceCardList) */}
              <TextField
                select
                size="small"
                value={timberNatuerQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setTimberNatuerQuery(val);
                  updateDimensionOptions(val);

                  if (!val) {
                    setDimensionsQuery("");
                    setDimensionOptions([]);
                  }
                }}
                label="Timber Nature"
                sx={{ minWidth: "180px" }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {timberNatures.map((n) => (
                  <MenuItem key={n.natureId ?? n.id} value={n.natureName}>
                    {n.natureName}
                  </MenuItem>
                ))}
              </TextField>

              {/* Dimensions */}
              <TextField
                select
                size="small"
                value={dimensionsQuery}
                onChange={(e) => setDimensionsQuery(e.target.value)}
                label="Dimensions"
                sx={{ minWidth: "180px" }}
                disabled={!timberNatuerQuery}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {dimensionOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>

              {/* Category ID */}
              <TextField
                select
                size="small"
                value={categoryIdQuery}
                onChange={(e) => setCategoryIdQuery(e.target.value)}
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
            </Stack>

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

        <Grid item xs={12} p={2}>
          <DataGrid
            sx={{ bgcolor: "background.default" }}
            rows={filteredData}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 8 } },
            }}
            pageSizeOptions={[8]}
            disableRowSelectionOnClick
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ActiveStockList;
