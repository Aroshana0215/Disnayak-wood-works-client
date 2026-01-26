import React, { useState, useEffect } from "react";
import { getAllCategories } from "../../services/PriceCardService";
import { getAllActiveTreeType } from "../../services/SettingManagementService/TreeTypeService";
import { getAllActiveTimberNature } from "../../services/SettingManagementService/TimberNatureService";
import {
  Stack,
  Typography,
  Grid,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Loading from "../../Components/Progress/Loading";
import ErrorAlert from "../../Components/Alert/ErrorAlert";
import { Link } from "react-router-dom";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";

const PriceCardList = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [timberTypeQuery, setTimberTypeQuery] = useState("");
  const [timberNatuerQuery, setTimberNatuerQuery] = useState("");
  const [dimensionsQuery, setDimensionsQuery] = useState("");
  const [categoryIdQuery, setCategoryIdQuery] = useState("");
  const [generalQuery, setGeneralQuery] = useState("");

  // Dropdown data
  const [dimensionOptions, setDimensionOptions] = useState([]);
  const [treeTypes, setTreeTypes] = useState([]);
  const [timberNatures, setTimberNatures] = useState([]);

  const columns = [
    { field: "categoryId", headerName: "Id", width: 130 },
    { field: "timberType", headerName: "Timber Type", width: 130 },
    { field: "timberNature", headerName: "Timber Nature", width: 140 },
    {
      field: "dimensions",
      headerName: "Dimensions",
      width: 130,
      renderCell: ({ row }) => `${row.areaLength} x ${row.areaWidth}`,
    },
    {
      field: "lengthRange",
      headerName: "Length",
      width: 130,
      renderCell: ({ row }) => `${row.minlength} - ${row.maxlength}`,
    },
    {
      field: "unitPrice",
      headerName: "Unit Price (RS:)",
      width: 130,
      renderCell: ({ row }) => `${row.unitPrice}.00`,
    },
    { field: "description", headerName: "Description", width: 160 },
    { field: "createdBy", headerName: "Created By", width: 125 },
    { field: "modifiedBy", headerName: "Modified By", width: 125 },
    {
      field: "actions",
      headerName: "Actions",
      width: 130,
      renderCell: ({ row }) => (
        <Link to={`/price/update/${row.id}`}>
          <Button variant="contained" size="small">
            Update
          </Button>
        </Link>
      ),
    },
  ];

  // ✅ Fetch all data ONCE (do not put filter states in dependencies)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryData = await getAllCategories();
        if (!Array.isArray(categoryData)) {
          throw new Error("Invalid data format received from API");
        }
        setCategories(categoryData);
        setFilteredCategories(categoryData);

        const treeTypeData = await getAllActiveTreeType();
        if (!Array.isArray(treeTypeData)) {
          throw new Error("Invalid tree type data format received from API");
        }
        setTreeTypes(treeTypeData);

        const timberNatureData = await getAllActiveTimberNature();
        if (!Array.isArray(timberNatureData)) {
          throw new Error("Invalid timber nature data format received from API");
        }
        setTimberNatures(timberNatureData);

        setLoading(false);
      } catch (err) {
        setError(err?.message || "Something went wrong");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateDimensionOptions = (nature) => {
    if (nature === "Planks") {
    setDimensionOptions(generatePlankDimensions());
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
    } else {
      setDimensionOptions([]);
    }
  };

const generatePlankDimensions = () => {
  const dimensions = [];

  for (let length = 0.4; length <= 2.0; length += 0.1) {
    const decimal = Number((length % 1).toFixed(1));

    // ❌ skip .8 and .9 (feet–inch rule)
    if (decimal === 0.8 || decimal === 0.9) continue;

    for (let width = 1; width <= 12; width++) {
      dimensions.push(`${length.toFixed(1)} x ${width}`);
    }
  }

  return dimensions;
};



  const handleSearch = () => {
    let filteredData = categories;

    if (timberTypeQuery) {
      const q = timberTypeQuery.toLowerCase();
      filteredData = filteredData.filter((c) =>
        (c.timberType ?? "").toLowerCase().includes(q)
      );
    }

    if (timberNatuerQuery) {
      const q = timberNatuerQuery.toLowerCase();
      filteredData = filteredData.filter((c) =>
        (c.timberNature ?? "").toLowerCase().includes(q)
      );
    }

  if (dimensionsQuery) {
    const [aRaw, bRaw] = dimensionsQuery
      .toLowerCase()
      .split("x")
      .map((p) => p.trim());

    const a = Number(aRaw);
    const b = Number(bRaw);

    filteredData = filteredData.filter((c) => {
      const len = Number(c.areaLength);
      const wid = Number(c.areaWidth);

      // Match both orientations: (a,b) OR (b,a)
      return (len === a && wid === b) || (len === b && wid === a);
    });
  }

    // ✅ Category Id filter AFTER Dimensions
    if (categoryIdQuery) {
      filteredData = filteredData.filter(
        (c) => String(c.categoryId) === String(categoryIdQuery)
      );
    }

    if (generalQuery) {
      const q = generalQuery.toLowerCase();
      filteredData = filteredData.filter((c) =>
        Object.values(c).some((val) => String(val).toLowerCase().includes(q))
      );
    }

    setFilteredCategories(filteredData);
  };

  // ✅ Run search when filters change (include categoryIdQuery)
  useEffect(() => {
    handleSearch();
  }, [generalQuery, timberTypeQuery, timberNatuerQuery, dimensionsQuery, categoryIdQuery, categories]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  if (loading) return <Loading />;
  if (error) return <ErrorAlert error={error} />;

  // ✅ unique category ids for dropdown (avoid duplicates)
  const uniqueCategoryIds = [...new Set(categories.map((c) => c.categoryId))];

  return (
    <>
      <Grid container>
        <Grid item xs={12} p={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#9C6B3D" }}>
              Price Details
            </Typography>

            <Button
              variant="contained"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              component={Link}
              to={"/price/add"}
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
            <Stack direction="row" spacing={2}>
              {/* Timber Type */}
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
                {treeTypes.map((treeType) => (
                  <MenuItem key={treeType.typeId} value={treeType.typeName}>
                    {treeType.typeName}
                  </MenuItem>
                ))}
              </TextField>

              {/* Timber Nature */}
              <TextField
                select
                size="small"
                value={timberNatuerQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setTimberNatuerQuery(val);
                  updateDimensionOptions(val);

                  // ✅ If nature cleared, clear dependent fields
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
                {timberNatures.map((nature) => (
                  <MenuItem key={nature.natureId} value={nature.natureName}>
                    {nature.natureName}
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
                {dimensionOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>

              {/* Category ID dropdown AFTER Dimensions */}
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

export default PriceCardList;
