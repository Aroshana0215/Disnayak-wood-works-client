import React, { useState, useEffect } from 'react';
import { getAllCategories } from '../../services/PriceCardService';
import { getAllActiveTreeType } from '../../services/SettingManagementService/TreeTypeService';
import { getAllActiveTimberNature } from '../../services/SettingManagementService/TimberNatureService'; // Import Timber Nature API
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
  const [timberTypeQuery, setTimberTypeQuery] = useState("");
  const [timberNatuerQuery, setTimberNatuerQuery] = useState("");
  const [dimensionsQuery, setDimensionsQuery] = useState("");
  const [generalQuery, setGeneralQuery] = useState("");
  const [dimensionOptions, setDimensionOptions] = useState([]);
  const [treeTypes, setTreeTypes] = useState([]);
  const [timberNatures, setTimberNatures] = useState([]); // New state to hold timber natures
  console.log("dimensionOptions:",dimensionOptions);

  const columns = [
    { field: "categoryId", headerName: "Id", width: 130 },
    { field: "timberType", headerName: "Timber Type", width: 130 },
    { field: "timberNature", headerName: "Timber Nature", width: 140 },
    {
      field: "dimensions",
      headerName: "Dimensions",
      width: 130,
      renderCell: ({ row }) => {
        return `${row.areaLength} x ${row.areaWidth}`;
      },
    },
    {
      field: "lengthRange",
      headerName: "Length",
      width: 130,
      renderCell: ({ row }) => {
        return `${row.minlength} - ${row.maxlength}`;
      },
    },
    {
      field: "unitPrice",
      headerName: "Unit Price (RS:)",
      width: 130,
      renderCell: ({ row }) => {
        return `${row.unitPrice}.00`;
      },
    },
    { field: "description", headerName: "Description", width: 160 },
    { field: "createdBy", headerName: "Created By", width: 125 },
    { field: "modifiedBy", headerName: "Modified By", width: 125 },
    {
      field: "actions",
      headerName: "Actions",
      width: 130,
      renderCell: ({ row }) => {
        return (
          <Link to={`/price/update/${row.id}`}>
            <Button variant="contained" size="small">
              Update
            </Button>
          </Link>
        );
      },
    },
  ];

  // Fetch categories, tree types, and timber natures on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoryData = await getAllCategories();
        if (Array.isArray(categoryData)) {
          setCategories(categoryData);
          setFilteredCategories(categoryData);
        } else {
          throw new Error("Invalid data format received from API");
        }

        // Fetch tree types for the dropdown
        const treeTypeData = await getAllActiveTreeType();
        if (Array.isArray(treeTypeData)) {
          setTreeTypes(treeTypeData);
        } else {
          throw new Error("Invalid tree type data format received from API");
        }

        // Fetch timber natures for the dimensions dropdown
        const timberNatureData = await getAllActiveTimberNature();
        if (Array.isArray(timberNatureData)) {
          setTimberNatures(timberNatureData); // Set timber natures for the dropdown
        } else {
          throw new Error("Invalid timber nature data format received from API");
        }

        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    } else {
      setDimensionOptions([]);
    }
  };

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
      updateDimensionOptions(timberNatuerQuery);
      console.log("timberNatuerQuery:",timberNatuerQuery);
      filteredData = filteredData.filter((category) =>
        category.timberNature.toLowerCase().includes(lowercasedTimberNatuerQuery)
      );
    }

    if (dimensionsQuery) {
      const lowercasedDimensionsQuery = dimensionsQuery.toLowerCase();
      const [queryLength, queryWidth] = lowercasedDimensionsQuery.split('x').map(part => part.trim());
      filteredData = filteredData.filter((category) =>
        category.areaLength.toString().toLowerCase().includes(queryLength) &&
        category.areaWidth.toString().toLowerCase().includes(queryWidth)
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
  }, [generalQuery, timberTypeQuery, timberNatuerQuery, dimensionsQuery]);

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
        <Grid item xs={12} p={1}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight="bold" color="primary">
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
                {treeTypes.map((treeType) => (
                  <MenuItem key={treeType.typeId} value={treeType.typeName}>
                    {treeType.typeName}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                size="small"
                value={timberNatuerQuery}
                onChange={(e) => {
                  setTimberNatuerQuery(e.target.value);
                  updateDimensionOptions(e.target.value);
                }}
                label="Timber Nature"
                sx={{
                  minWidth: "180px",
                }}
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

              <TextField
                select
                size="small"
                value={dimensionsQuery}
                onChange={(e) => setDimensionsQuery(e.target.value)}
                label="Dimensions"
                sx={{
                  minWidth: "180px",
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {dimensionOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              
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

        <Grid item xs={12} p={1}>
          <DataGrid
            sx={{
              bgcolor: "background.default",
            }}
            rows={filteredCategories}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
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
