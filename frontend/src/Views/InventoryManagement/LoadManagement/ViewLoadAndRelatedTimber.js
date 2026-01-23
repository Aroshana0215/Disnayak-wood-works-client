import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Grid,
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  FormControl,
  OutlinedInput,
  Stack,
  Button,
  FormLabel,
} from "@mui/material";
import { getLoadDetailsById } from "../../../services/InventoryManagementService/LoadDetailsService";
import { getLdRelatedTimberByLoadId } from "../../../services/InventoryManagementService/LoadRelatedTimberDetailService";
import { Link } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import CancelIcon from "@mui/icons-material/Cancel";
import { DataGrid } from "@mui/x-data-grid";

const UpdateCategory = () => {
  const { loadId } = useParams();
  const [categories, setCategories] = useState([]);
  const [totalTimberValue, setTotalTimberValue] = useState(0);
  const [totalCubicValue, setTotalCubicValue] = useState(0);
  const [categoryData, setCategoryData] = useState({
    sellerName: "",
    permitNumber: "",
    region: "",
    lorryNumber: "",
    driver: "",
    unloadedDate: "",
    status: "",
    createdBy: "",
    otherDetails: "",
  });
  const [isLoadDataEditable, setIsLoadDataEditable] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [loadData, setLoadData] = useState({
    loadID: { editable: false, bpMD: 4 },
    sellerName: { editable: false, bpMD: 4 },
    permitNumber: { editable: false, bpMD: 4 },
    region: { editable: false, bpMD: 4 },
    lorryNumber: { editable: false, bpMD: 4 },
    driver: { editable: false, bpMD: 4 },
    unloadedDate: { editable: false, bpMD: 4 },
    status: { editable: false, bpMD: 4 },
    createdBy: { editable: false, bpMD: 4 },
    otherDetails: { editable: true, bpMD: 12 },
  });
  const columns = [
    { field: "timberNo", headerName: "Timber No", width: 120 },
    { field: "treeType", headerName: "Tree Type", width: 120 },
    { field: "perimeter", headerName: "Perimeter", width: 120 },
    { field: "length", headerName: "Length", width: 120 },
    { field: "cubicAmount", headerName: "Cubic Amount", width: 140 },
    { field: "unitPrice", headerName: "Unit Price", width: 120 },
    { field: "otherDetails", headerName: "Other Details", width: 140 },
    // { field: "totalTimerValue", headerName: "Total Timer Value", width: 160 },
    // {
    //   field: "totalCuttingValue",
    //   headerName: "Total Cutting Value",
    //   width: 180,
    // },
    // { field: "outComeValue", headerName: "Out Come Value", width: 150 },
    // { field: "status", headerName: "Status", width: 120 },
    { field: "createdBy", headerName: "Created By", width: 120 },
    { field: "modifiedBy", headerName: "Modified By", width: 130 },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <Button variant="contained" component={Link} size="small" to="/load">
          Update
        </Button>
      ),
    },
  ];
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoryData((prevPayload) => ({
      ...prevPayload,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLoadDetailsById(loadId);
        setCategoryData(data);
        const loadData = await getLdRelatedTimberByLoadId(loadId);
        if (Array.isArray(loadData)) {
          setCategories(loadData);
          // Calculate total timber value
          const totalValue = loadData.reduce(
            (acc, curr) => acc + parseFloat(curr.totalTimerValue || 0),
            0
          );
          setTotalTimberValue(totalValue.toFixed(2));
          const totalCValue = loadData.reduce(
            (acc, curr) => acc + parseFloat(curr.cubicAmount || 0),
            0
          );
          setTotalCubicValue(totalCValue.toFixed(2));
        } else {
          throw new Error("Invalid data format received from API");
        }
      } catch (error) {
        console.error("Error fetching category data:", error.message);
        // Handle error
      }
    };

    fetchData();
  }, [loadId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    //TODO: handle update load
  };

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
              Related Timber details
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} padding={2}>
          <Grid
            container
            component={"form"}
            onSubmit={handleSubmit}
            padding={2}
            sx={{
              bgcolor: "background.default",
              borderRadius: 2,
            }}
          >
            <Grid item xs={12} padding={1}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
              >
                <Typography variant="h6" color="primary" align="center">
                  Load Details
                </Typography>
                <Button
                  startIcon={isLoadDataEditable ? <CancelIcon /> : <EditIcon />}
                  variant="outlined"
                  onClick={() => {
                    setIsLoadDataEditable(!isLoadDataEditable);
                  }}
                >
                  {isLoadDataEditable ? "Cancel" : "Edit"}
                </Button>
              </Stack>
            </Grid>
            {Object.entries(loadData).map(([key, item]) => (
              <Grid item key={key} xs={12} md={item.bpMD} padding={2}>
                <FormControl fullWidth>
                  <FormLabel>
                    {key.charAt(0).toUpperCase() +
                      key.slice(1).replace(/([A-Z])/g, " $1")}
                  </FormLabel>
                  {!isLoadDataEditable || !item.editable ? (
                    <Typography color={"primary"} variant="h6">
                      {categoryData[key]}
                    </Typography>
                  ) : (
                    <OutlinedInput
                      size="small"
                      name={key}
                      value={categoryData[key]}
                      onChange={handleChange}
                    />
                  )}
                  {/* <FormHelperText/> */}
                </FormControl>
              </Grid>
            ))}
            {isLoadDataEditable && (
              <Grid item xs={12} padding={1}>
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  alignItems="center"
                  spacing={2}
                >
                  <Button variant="contained" type="submit">
                    Save
                  </Button>
                </Stack>
              </Grid>
            )}
          </Grid>
          <Grid
            container
            padding={2}
            sx={{
              bgcolor: "background.default",
              borderRadius: 2,
              marginY: 2,
            }}
          >
            <Grid item xs={12} padding={1}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
              >
                <Typography variant="h6" color="primary" align="center">
                  Load Details
                </Typography>
                <Button
                  startIcon={<AddCircleOutlineOutlinedIcon />}
                  component={Link}
                  variant="outlined"
                  to={`/load/timber/add/${loadId}`}
                >
                  Add Timber
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} padding={1}>
              <DataGrid
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
        </Grid>
      </Grid>
    </>
  );
};

export default UpdateCategory;
