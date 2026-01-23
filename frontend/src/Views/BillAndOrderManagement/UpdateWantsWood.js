import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Button,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Divider,
  OutlinedInput,
} from "@mui/material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { useLocation, useNavigate } from "react-router-dom";
import { getAllCategories } from "../../services/PriceCardService"; // API import

const UpdateWantsWood = () => {
  const location = useLocation();
  const payloadBulkFromUpdate = location?.state?.payloadBulkFromUpdate || [
    {
      categoryId: "",
      length: "",
      amount: "",
    },
  ];
  const { currentLoadData, currentCategoriesData } = location?.state;
  console.log("🚀 ~ UpdateWantsWood ~ location?.state:", location.state);
  console.log(
    "🚀 ~ UpdateWantsWood ~ payloadBulkFromUpdate:",
    payloadBulkFromUpdate
  );
  const [payloadBulk, setPayloadBulk] = useState(payloadBulkFromUpdate);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories();
        setCategories(response);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (index, event) => {
    const values = [...payloadBulk];
    values[index][event.target.name] = event.target.value;
    setPayloadBulk(values);
  };

  const addRow = () => {
    setPayloadBulk([
      ...payloadBulk,
      { categoryId: "", length: "", amount: "" },
    ]);
  };

  const removeRow = (index) => {
    const values = [...payloadBulk];
    values.splice(index, 1);
    setPayloadBulk(values);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/bill/update-remain-wood", {
      state: { payloadBulk, currentLoadData, currentCategoriesData },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid
        container
        p={2}
        sx={{ bgcolor: "background.default", borderRadius: 2 }}
      >
        <Grid item xs={12} padding={1}>
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="h6" color="primary" align="center">
              Update Timber
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
            {/* Category ID */}
            <Grid item xs={12} md={4} p={1}>
              <FormControl fullWidth>
                <FormLabel>Category ID</FormLabel>
                <Select
                  size="small"
                  name="categoryId"
                  value={row.categoryId}
                  onChange={(event) => handleInputChange(index, event)}
                  required
                >
                  {categories.map((category) => (
                    <MenuItem
                      key={category.categoryId}
                      value={category.categoryId}
                    >
                      {category.categoryId}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Length */}
            <Grid item xs={12} md={4} p={1}>
              <FormControl fullWidth>
                <FormLabel>Length</FormLabel>
                <Select
                  size="small"
                  name="length"
                  value={row.length}
                  onChange={(event) => handleInputChange(index, event)}
                  required
                >
                  {[...Array(25).keys()].map((num) => (
                    <MenuItem key={num + 1} value={num + 1}>
                      {num + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Amount */}
            <Grid item xs={12} md={4} p={1}>
              <FormControl fullWidth>
                <FormLabel>Amount</FormLabel>
                <Select
                  size="small"
                  name="amount"
                  value={row.amount}
                  onChange={(event) => handleInputChange(index, event)}
                  required
                >
                  {[...Array(101).keys()].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
          </Grid>
        ))}
        <IconButton color="primary" onClick={addRow}>
          <AddCircleOutlineOutlinedIcon />
        </IconButton>
        <Grid
          item
          xs={12}
          p={2}
          sx={{ display: "flex", justifyContent: "flex-end" }}
        >
          <Button type="submit" variant="contained">
            Proceed
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default UpdateWantsWood;
