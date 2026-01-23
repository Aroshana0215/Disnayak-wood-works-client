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
import { useNavigate } from "react-router-dom";
import { getAllCategories } from "../../services/PriceCardService"; // Import the API call

const GetWantsWood = () => {
  const [payloadBulk, setPayloadBulk] = useState([
    { categoryId: "", length: "", amount: "" },
  ]);
  const [categories, setCategories] = useState([]); // State to store categories

  console.log("categories:", categories);

  const navigate = useNavigate();

  // Fetch categories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories();
        setCategories(response); // Assuming the response is an array of categories
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
    setPayloadBulk([...payloadBulk, { categoryId: "", length: "", amount: "" }]);
  };

  const removeRow = (index) => {
    const values = [...payloadBulk];
    values.splice(index, 1);
    setPayloadBulk(values);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    navigate("/bill/show-remain-wood", { state: { payloadBulk } });
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
                Create Bill
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
              <Grid item xs={12} md={4} p={1}>
                <FormControl fullWidth>
                  <FormLabel>Category ID</FormLabel>
                  <Select
                    size="small"
                    name="categoryId"
                    value={row.categoryId}
                    onChange={(event) => handleInputChange(index, event)}
                    fullWidth
                    required
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 200, // Set the max height for the dropdown list
                        },
                      },
                    }}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.categoryId} value={category.categoryId}>
                        {category.categoryId} {/* Assuming the category has an id and name */}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4} p={1}>
                <FormControl fullWidth>
                  <FormLabel>Length</FormLabel>
                  <Select
                    size="small"
                    name="length"
                    value={row.length}
                    onChange={(event) => handleInputChange(index, event)}
                    fullWidth
                    required
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 200, // Set the max height for the dropdown list
                        },
                      },
                    }}
                  >
                    {[...Array(25).keys()].map((num) => (
                      <MenuItem key={num + 1} value={num + 1}>
                        {num + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4} p={1}>
                <FormControl fullWidth>
                  <FormLabel>Amount</FormLabel>
                  <Select
                    size="small"
                    name="amount"
                    value={row.amount}
                    onChange={(event) => handleInputChange(index, event)}
                    fullWidth
                    required
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 200, // Set the max height for the dropdown list
                        },
                      },
                    }}
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
              Create
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
};

export default GetWantsWood;
