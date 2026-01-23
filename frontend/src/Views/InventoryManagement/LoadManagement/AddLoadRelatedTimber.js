import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Grid,
  Typography,
  Button,
  Stack,
  TextField,
  Divider,
  IconButton,
} from "@mui/material";
import { NewLdRelatedTimber } from "../../../services/InventoryManagementService/LoadRelatedTimberDetailService";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

const AddLoadRelatedTimber = () => {
  const { loadId } = useParams();
  const [formData, setFormData] = useState({
    timberNo: { bpMD: 6 },
    treeType: { bpMD: 6 },
    perimeter: { bpMD: 6 },
    length: { bpMD: 6 },
    cubicAmount: { bpMD: 6 },
    otherDetails: { bpMD: 6 },
    unitPrice: { bpMD: 6 },
    totalTimerValue: { bpMD: 6 }, // Initialize totalTimerValue as empty string
    totalCuttingValue: { bpMD: 6 },
    outComeValue: { bpMD: 6 },
    cuttingDate: { bpMD: 6 },
    timberStatus: { bpMD: 6 },
    status: { bpMD: 6 },
    createdBy: { bpMD: 6 },
    createdDate: { bpMD: 6 },
    modifiedBy: { bpMD: 6 },
    modifiedDate: { bpMD: 6 },
    permitid_fk: { bpMD: 6 },
  });
  // eslint-disable-next-line no-unused-vars
  const [payload, setPayload] = useState({
    timberNo: "",
    treeType: "",
    perimeter: "",
    length: "",
    cubicAmount: "",
    otherDetails: "",
    unitPrice: "",
    totalTimerValue: "", // Initialize totalTimerValue as empty string
    totalCuttingValue: "",
    outComeValue: "",
    cuttingDate: "",
    timberStatus: "PENDING",
    status: "",
    createdBy: "",
    createdDate: "",
    modifiedBy: "",
    modifiedDate: "",
    permitid_fk: loadId,
  });
  const [payloadBulk, setPayloadBulk] = useState([
    {
      timberNo: "",
      treeType: "",
      perimeter: "",
      length: "",
      cubicAmount: "",
      otherDetails: "",
      unitPrice: "",
      permitid_fk: loadId,
    },
  ]);
  // eslint-disable-next-line no-unused-vars
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };
    // Calculate totalTimerValue
    const totalTimerValue =
      parseFloat(newFormData.cubicAmount) * parseFloat(newFormData.unitPrice);
    newFormData.totalTimerValue = isNaN(totalTimerValue)
      ? ""
      : totalTimerValue.toFixed(2); // Ensure it's a string with 2 decimal places
    setFormData(newFormData);
  };

  // eslint-disable-next-line no-unused-vars
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const TimberId = await NewLdRelatedTimber(payloadBulk, );
      window.location.href = `/load/timber/view/${loadId}`;
    } catch (error) {
      console.error("Error creating category:", error.message);
    }
  };
  const handleInputChange = (index, event) => {
    const values = [...payloadBulk];
    values[index][event.target.name] = event.target.value;
    setPayloadBulk(values);
  };

  const addRow = () => {
    setPayloadBulk([
      ...payloadBulk,
      {
        timberNo: "",
        treeType: "",
        perimeter: "",
        length: "",
        cubicAmount: "",
        otherDetails: "",
        unitPrice: "",
        permitid_fk: loadId,
      },
    ]);
  };

  const removeRow = (index) => {
    const values = [...payloadBulk];
    values.splice(index, 1);
    setPayloadBulk(values);
  };

  return (
    <>
  <form onSubmit={handleSubmit}>
      <Grid
        container
        sx={{
          bgcolor: "background.default",
          borderRadius: 2,
        }}
        p={2}
      >
        <Grid item xs={12} padding={1}>
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="h6" color="primary" align="center">
              Add Timber
            </Typography>
          </Stack>
        </Grid>
        {payloadBulk.map((row, index) => (
          <Grid container key={index} sx={{ marginBottom: 2 }}>
            <Grid item xs={12}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1" color="textSecondary">
                  Row {index + 1}
                </Typography>
                <IconButton color="error" onClick={() => removeRow(index)}>
                  <HighlightOffIcon />
                </IconButton>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3} p={1}>
              <TextField
                size="small"
                label="Timber No"
                name="timberNo"
                value={row.timberNo}
                onChange={(event) => handleInputChange(index, event)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} p={1}>
              <TextField
                size="small"
                label="Tree Type"
                name="treeType"
                value={row.treeType}
                onChange={(event) => handleInputChange(index, event)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} p={1}>
              <TextField
                size="small"
                label="Perimeter"
                name="perimeter"
                value={row.perimeter}
                onChange={(event) => handleInputChange(index, event)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} p={1}>
              <TextField
                size="small"
                label="Length"
                name="length"
                value={row.length}
                onChange={(event) => handleInputChange(index, event)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} p={1}>
              <TextField
                size="small"
                label="Cubic Amount"
                name="cubicAmount"
                value={row.cubicAmount}
                onChange={(event) => handleInputChange(index, event)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} p={1}>
              <TextField
                size="small"
                label="Unit Price"
                name="unitPrice"
                value={row.unitPrice}
                onChange={(event) => handleInputChange(index, event)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} p={1}>
              <TextField
                size="small"
                label="Other Details"
                name="otherDetails"
                value={row.otherDetails}
                onChange={(event) => handleInputChange(index, event)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
          </Grid>
        ))}
        <IconButton variant="contained" color="primary" onClick={addRow}>
          <AddCircleOutlineOutlinedIcon />
        </IconButton>
        <Grid
          item
          xs={12}
          padding={2}
          sx={{
            display: "flex",
            direction: "row",
            justifyContent: "flex-end",
            alignItems: "flex-end",
          }}
        >
          <Button type="submit" variant="contained">
            Add Timber
          </Button>
        </Grid>
      </Grid>
      </form>
    </>
  );
};

export default AddLoadRelatedTimber;
