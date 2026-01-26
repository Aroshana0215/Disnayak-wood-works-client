import React, { useState, useEffect } from "react";
import {
  Stack,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { getAllCategories, getCategoryById } from "../../../services/PriceCardService";
import { NewInventory } from "../../../services/InventoryManagementService/StockManagementService";
import {
  createStockSummary,
  getActiveStockSummaryDetails,
  updateStockSummaryDetails,
} from "../../../services/InventoryManagementService/StockSummaryManagementService";
import { useSelector } from "react-redux";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

const CreateNewStock = () => {
  const { user } = useSelector((state) => state.auth);

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
  const day = ("0" + currentDate.getDate()).slice(-2);
  const formattedDate = `${year}-${month}-${day}`;

  // (Kept to avoid breaking anything if used elsewhere later)
  const [formData, setFormData] = useState({
    categoryId_fk: { bpMD: 3 },
    length: { bpMD: 3 },
    sectionNumber: { bpMD: 3 },
    amountOfPieces: { bpMD: 3 },
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories();
        setCategories(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const [payloadBulk, setPayloadBulk] = useState([
    {
      categoryId_fk: "",
      sectionNumber: "",
      amountOfPieces: "",
      length: "",
      status: "A",
      createdBy: user?.displayName ?? "",
      createdDate: formattedDate,
    },
  ]);

  // Helpers for length dropdown
  const getSelectedCategory = (categoryId) =>
    categories.find((c) => String(c.categoryId) === String(categoryId));

  const buildLengthOptions = (min, max) => {
    const minNum = Number(min);
    const maxNum = Number(max);

    if (Number.isNaN(minNum) || Number.isNaN(maxNum) || minNum > maxNum) return [];

    const options = [];
    for (let i = minNum; i <= maxNum; i += 1) options.push(i);
    return options;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };

    const totalTimerValue =
      parseFloat(newFormData.cubicAmount) * parseFloat(newFormData.unitPrice);

    newFormData.totalTimerValue = isNaN(totalTimerValue) ? "" : totalTimerValue.toFixed(2);
    setFormData(newFormData);
  };

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;

    const values = [...payloadBulk];
    values[index][name] = value;

    // If category changes, reset length
    if (name === "categoryId_fk") {
      values[index].length = "";
    }

    setPayloadBulk(values);
  };

  const addRow = () => {
    setPayloadBulk([
      ...payloadBulk,
      {
        categoryId_fk: "",
        sectionNumber: "",
        amountOfPieces: "",
        length: "",
      },
    ]);
  };

  const removeRow = (index) => {
    const values = [...payloadBulk];
    values.splice(index, 1);
    setPayloadBulk(values);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      for (const item of payloadBulk) {
        const newItemData = {
          ...item,
          status: "A",
          createdBy: user.displayName,
          createdDate: formattedDate,
        };

        const catogoryDatat = await getCategoryById(newItemData.categoryId_fk);

        if (catogoryDatat == null) {
          console.error("Invalid category:", newItemData.categoryId_fk);
          continue;
        }

        const stockData = await NewInventory(newItemData);

        if (stockData != null) {
          const resultData = await getActiveStockSummaryDetails(
            stockData.categoryId_fk,
            stockData.length
          );

          if (resultData == null) {
            const stockSumData = {
              totalPieces: stockData.amountOfPieces,
              changedAmount: stockData.amountOfPieces,
              previousAmount: "0",
              stk_id_fk: stockData.inventoryId,
              length: stockData.length,
              toBeCutAmount: 0,
              status: "A",
              billId_fk: "",
              categoryId_fk: stockData.categoryId_fk,
              maxlength: catogoryDatat.maxlength,
              minlength: catogoryDatat.minlength,
              timberNature: catogoryDatat.timberNature,
              timberType: catogoryDatat.timberType,
              areaLength: catogoryDatat.areaLength,
              areaWidth: catogoryDatat.areaWidth,
              createdBy: user.displayName,
              createdDate: formattedDate,
            };

            await createStockSummary(stockSumData);
          } else {
            const stockUpdateData = { status: "D" };
            await updateStockSummaryDetails(resultData.id, stockUpdateData);

            const stockSumData = {
              totalPieces: Number(resultData.totalPieces) + Number(stockData.amountOfPieces),
              changedAmount: stockData.amountOfPieces,
              previousAmount: resultData.totalPieces,
              categoryId_fk: resultData.categoryId_fk,
              maxlength: catogoryDatat.maxlength,
              minlength: catogoryDatat.minlength,
              timberNature: catogoryDatat.timberNature,
              timberType: catogoryDatat.timberType,
              areaLength: catogoryDatat.areaLength,
              areaWidth: catogoryDatat.areaWidth,
              stk_id_fk: resultData.stk_id_fk,
              length: resultData.length,
              toBeCutAmount: resultData.toBeCutAmount,
              status: "A",
              billId_fk: "",
              createdBy: user.displayName,
              createdDate: formattedDate,
            };

            await createStockSummary(stockSumData);
          }
        }
      }

      window.location.href = "/activeStock";
    } catch (error) {
      console.error("Error creating category:", error.message);
    }
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
            <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
              <Typography variant="h6" sx={{ color: "#9C6B3D" }} align="center">
                create stock
              </Typography>
            </Stack>
          </Grid>

          {payloadBulk.map((row, index) => {
            const selectedCat = getSelectedCategory(row.categoryId_fk);
            const lengthOptions = selectedCat
              ? buildLengthOptions(selectedCat.minlength, selectedCat.maxlength)
              : [];

            return (
              <Grid container key={index} sx={{ marginBottom: 2 }}>
                <Grid item xs={12}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1" color="textSecondary">
                      Row {index + 1}
                    </Typography>
                    <IconButton
                      color="error"
                      onClick={() => removeRow(index)}
                      disabled={payloadBulk.length === 1}
                    >
                      <HighlightOffIcon />
                    </IconButton>
                  </Stack>
                </Grid>

                {/* Category */}
                <Grid item xs={12} sm={6} md={3} p={1}>
                  <FormControl size="small" fullWidth required>
                    <InputLabel id={`category-label-${index}`}>Category</InputLabel>
                    <Select
                      labelId={`category-label-${index}`}
                      label="Category"
                      name="categoryId_fk"
                      value={row.categoryId_fk}
                      onChange={(event) => handleInputChange(index, event)}
                    >
                      {categories.map((cat) => {
                        const value = cat.categoryId;
                        const label = `${cat.categoryId}`;
                        return (
                          <MenuItem key={value} value={value}>
                            {label}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Timber Length */}
                <Grid item xs={12} sm={6} md={3} p={1}>
                  <FormControl size="small" fullWidth required disabled={!row.categoryId_fk}>
                    <InputLabel id={`length-label-${index}`}>Timber Length</InputLabel>
                    <Select
                      labelId={`length-label-${index}`}
                      label="Timber Length"
                      name="length"
                      value={row.length}
                      onChange={(event) => handleInputChange(index, event)}
                    >
                      {lengthOptions.map((len) => (
                        <MenuItem key={len} value={len}>
                          {len}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* ✅ Section No (scroll up/down like Amount of pieces) */}
                <Grid item xs={12} sm={6} md={3} p={1}>
                  <TextField
                    size="small"
                    label="Section No"
                    name="sectionNumber"
                    value={row.sectionNumber}
                    onChange={(event) => handleInputChange(index, event)}
                    fullWidth
                    required
                    type="number"
                    inputProps={{ min: 1, max: 20, step: 1 }}
                  />
                </Grid>

                {/* Amount of pieces */}
                <Grid item xs={12} sm={6} md={3} p={1}>
                  <TextField
                    size="small"
                    label="Amount of pieces"
                    name="amountOfPieces"
                    value={row.amountOfPieces}
                    onChange={(event) => handleInputChange(index, event)}
                    fullWidth
                    required
                    type="number"
                    inputProps={{ min: 1 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>
              </Grid>
            );
          })}

          <IconButton sx={{ color: "#9C6B3D" }} onClick={addRow}>
            <AddCircleOutlineOutlinedIcon />
          </IconButton>

          <Grid
            item
            xs={12}
            padding={2}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end",
            }}
          >
            <Button type="submit" variant="contained">
              create
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
};

export default CreateNewStock;
