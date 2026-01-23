import React, { useState } from "react";
import { Stack, Grid, Typography, TextField, Button,IconButton, Divider,  } from "@mui/material";
import { Link } from "react-router-dom";
import { NewInventory } from "../../../services/InventoryManagementService/StockManagementService"; 
import { getCategoryById } from "../../../services/PriceCardService"; 
import { useSelector } from "react-redux";
import { createStockSummary, getActiveStockSummaryDetails, updateStockSummaryDetails } from "../../../services/InventoryManagementService/StockSummaryManagementService"; 
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

const CreateNewStock = () => {

const { user } = useSelector((state) => state.auth);
let currentDate = new Date();
let year = currentDate.getFullYear();
let month = ('0' + (currentDate.getMonth() + 1)).slice(-2); // Months are zero-based
let day = ('0' + currentDate.getDate()).slice(-2);
let formattedDate = `${year}-${month}-${day}`;


const [formData, setFormData] = useState({
  categoryId_fk: { bpMD: 3 },
  length: { bpMD: 3 },
  timberId_fk: { bpMD: 3 },
  sectionNumber: { bpMD: 3 },
  amountOfPieces: { bpMD: 3 },
  MachineNo: { bpMD: 3 },
});


  const [payloadBulk, setPayloadBulk] = useState([
    {
      categoryId_fk : "",
      timberId_fk : "",
      sectionNumber : "",
      amountOfPieces : "",
      MachineNo : "",
      length: "",
      status: "A",
      createdBy: user.displayName,
      createdDate: formattedDate,
    },
  ]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {

      for (const item of payloadBulk) {
        const newItemData = {
          ...item,
          status: "A",
          createdBy: user.displayName,
          createdDate: formattedDate,
        }
        const catogoryDatat = await getCategoryById(newItemData.categoryId_fk);

        if(catogoryDatat == null){
          console.error("Invalid category:", newItemData.categoryId_fk);
        }else{}
        const stockData = await NewInventory(newItemData);
        console.log("stockData:",stockData)
        if (stockData != null){
          
         const resultData  = await getActiveStockSummaryDetails(stockData.categoryId_fk, stockData.length);
          if(resultData == null){
            console.log("in");
            console.log("🚀 ~ handleSubmit ~ catogoryDatat:", catogoryDatat)
            const stockSumData = {
              totalPieces: stockData.amountOfPieces,
              changedAmount: stockData.amountOfPieces,
              previousAmount: "0",
              stk_id_fk: stockData.inventoryId,
              length : stockData.length,
              toBeCutAmount : 0,
              status: "A",
              billId_fk:"",
              categoryId_fk: stockData.categoryId_fk,
              maxlength : catogoryDatat.maxlength,
              minlength : catogoryDatat.minlength,
              timberNature : catogoryDatat.timberNature,
              timberType : catogoryDatat.timberType,
              areaLength : catogoryDatat.areaLength,
              areaWidth : catogoryDatat.areaWidth,
              createdBy: user.displayName,
              createdDate: formattedDate,
            };
            const stockSummarykData = await createStockSummary(stockSumData);
          }else{
            const stockUpdateData = {
              status: "D",
            };
            const updatedkData = await updateStockSummaryDetails(resultData.id, stockUpdateData);
        
            const stockSumData = {
              totalPieces: Number(resultData.totalPieces) + Number(stockData.amountOfPieces),
              changedAmount: stockData.amountOfPieces,
              previousAmount: resultData.totalPieces,
              categoryId_fk: resultData.categoryId_fk,
              maxlength : catogoryDatat.maxlength,
              minlength : catogoryDatat.minlength,
              timberNature : catogoryDatat.timberNature,
              timberType : catogoryDatat.timberType,
              areaLength : catogoryDatat.areaLength,
              areaWidth : catogoryDatat.areaWidth,
              stk_id_fk:  resultData.stk_id_fk,
              length : resultData.length,
              toBeCutAmount : resultData.toBeCutAmount,
              status: "A",
              billId_fk:"",
              createdBy: user.displayName,
              createdDate: formattedDate,
            };
            const newstockSummaryData = await createStockSummary(stockSumData);
            
          }
  
  
        }

      }


      window.location.href = "/activeStock";
    } catch (error) {
      console.error("Error creating category:", error.message);
      // Handle error
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
        categoryId_fk: "",
        timberId_fk: "",
        sectionNumber: "",
        amountOfPieces: "",
        MachineNo: "",
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
                create stock
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
                  label="Category Id"
                  name="categoryId_fk"
                  value={row.categoryId_fk}
                  onChange={(event) => handleInputChange(index, event)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3} p={1}>
                <TextField
                  size="small"
                  label="Timber Length"
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
                  label="Timber Number"
                  name="timberId_fk"
                  value={row.timberId_fk}
                  onChange={(event) => handleInputChange(index, event)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3} p={1}>
                <TextField
                  size="small"
                  label="Section No"
                  name="sectionNumber"
                  value={row.sectionNumber}
                  onChange={(event) => handleInputChange(index, event)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3} p={1}>
                <TextField
                  size="small"
                  label="Amount of pieces"
                  name="amountOfPieces"
                  value={row.amountOfPieces}
                  onChange={(event) => handleInputChange(index, event)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3} p={1}>
                <TextField
                  size="small"
                  label="Machin Number"
                  name="MachineNo"
                  value={row.MachineNo}
                  onChange={(event) => handleInputChange(index, event)}
                  fullWidth
                  required
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
              create
            </Button>
          </Grid>
        </Grid>
        </form>
      </>
  );
};

export default CreateNewStock;
