import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Grid,
  Typography,
  Button,
  Stack,
  FormControl,
  FormLabel,
  OutlinedInput,
  Divider,
} from "@mui/material";
import { getCategoryById } from "../../services/PriceCardService";
import { createStockSummary, getActiveStockSummaryDetails } from "../../services/InventoryManagementService/StockSummaryManagementService";
import { useSelector } from "react-redux";

const ShowRemainWood = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { payloadBulk } = location.state;
  console.log("payloadBulk:", payloadBulk);
  const [woodData, setWoodData] = useState([]);

  const { user } = useSelector((state) => state.auth);
  let currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
  let day = ('0' + currentDate.getDate()).slice(-2);
  let formattedDate = `${year}-${month}-${day}`;

  useEffect(() => {
    const fetchData = async () => {
      const woodDetails = await Promise.all(
        payloadBulk.map(async (payload) => {
          const categoryData = await getCategoryById(payload.categoryId);

          if (categoryData) {
            const data = await getActiveStockSummaryDetails(
              categoryData.categoryId,
              payload.length
            );
            console.log("data:", data);

            let toBeCut = 0;

            if (!data) {
              toBeCut = 0 - payload.amount;
            } else {
              toBeCut =
                data?.totalPieces > payload.amount
                  ? 0
                  : payload.amount - (data?.totalPieces || 0);
            }
            console.log("toBeCut:", toBeCut);

            // Initialize billPrice as unitPrice by default
            return {
              ...payload,
              timberType: categoryData.timberType,
              length: categoryData.areaLength,
              width: categoryData.areaWidth,
              totalPieces: data?.totalPieces || 0,
              unitPrice: categoryData.unitPrice,
              billPrice: categoryData.unitPrice, // Set billPrice as unitPrice by default
              changedAmount: data?.changedAmount || 0,
              categoryId_fk: data?.categoryId_fk || categoryData.categoryId,
              previousAmount: data?.previousAmount || "0",
              stk_id_fk: data?.stk_id_fk || null,
              toBeCut: Math.abs(toBeCut),
              summaryId: data?.id || null,
              requestLength: payload.length,
            };
          }
          return null;
        })
      );
      setWoodData(woodDetails.filter((detail) => detail !== null));
    };

    fetchData();
  }, [payloadBulk]);

  // Handle change in Bill Price input
  const handleBillPriceChange = (index, event) => {
    const { value } = event.target;
    setWoodData((prevWoodData) => {
      const updatedWoodData = [...prevWoodData];
      updatedWoodData[index].billPrice = value; // Update the billPrice
      console.log("🚀 ~ setWoodData ~ value:", value);
      return updatedWoodData;
    });
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    const updatedWoodData = await Promise.all(
      woodData.map(async (payload) => {
        const categoryData = await getCategoryById(payload.categoryId);
        const data = await getActiveStockSummaryDetails(
          categoryData.categoryId,
          payload.requestLength
        );

        let updatedPayload = { ...payload };

        // If no stock summary exists, create it
        if (!data) {
          const stockSumData = {
            totalPieces: "0",
            changedAmount: "0",
            previousAmount: "0",
            toBeCutAmount: 0,
            categoryId_fk: categoryData.categoryId,
            maxlength: categoryData.minlength,
            minlength: categoryData.minlength,
            timberNature: categoryData.timberNature,
            timberType: categoryData.timberType,
            areaLength: categoryData.areaLength,
            areaWidth: categoryData.areaWidth,
            stk_id_fk: null,
            length: String(payload.requestLength),
            status: "A",
            billId_fk: "",
            createdBy: user.displayName,
            createdDate: formattedDate,
          };

          const stockSummaryData = await createStockSummary(stockSumData);

          updatedPayload.summaryId = stockSummaryData;
        }

        // Ensure billPrice is passed as unitPrice if not updated
        if (!updatedPayload.billPrice || updatedPayload.billPrice === "") {
          updatedPayload.billPrice = updatedPayload.unitPrice;
        }

        return updatedPayload;
      })
    );

    setWoodData(updatedWoodData);

    // Navigate to next route and send updatedWoodData with both unitPrice and billPrice
    navigate("/bill/add", { state: { woodData: updatedWoodData } });
  };


  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid
          container
          sx={{
            bgcolor: "background.default",
            borderRadius: 2,
            p: 2,
          }}
        >
          <Grid item xs={12} padding={1}>
            <Stack
              direction="row"
              justifyContent="flex-start"
              alignItems="center"
              spacing={2}
            >
              <Typography variant="h6" color="primary" align="center">
                Update Category
              </Typography>
            </Stack>
          </Grid>
          {woodData.map((wood, index) => (
            <Grid container key={index} sx={{ marginBottom: 2 }}>
              <Grid item xs={12}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body1" color="textSecondary">
                    Entry {index + 1}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={1} p={1}>
                <FormControl fullWidth>
                  <FormLabel>Type</FormLabel>
                  <OutlinedInput
                    size="small"
                    name="timberType"
                    value={wood.timberType}
                    disabled
                    fullWidth
                  />
                </FormControl>
              </Grid>
              <Grid item xs={10} md={1} p={1}>
                <FormControl fullWidth>
                  <FormLabel>Dimensions</FormLabel>
                  <OutlinedInput
                    size="small"
                    name="dimensions"
                    value={`${wood.length} x ${wood.width}`}
                    disabled
                    fullWidth
                  />
                </FormControl>
              </Grid>
              <Grid item xs={10} md={1} p={1}>
                <FormControl fullWidth>
                  <FormLabel>length</FormLabel>
                  <OutlinedInput
                    size="small"
                    name="dimensions"
                    value={wood.requestLength}
                    disabled
                    fullWidth
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={1} p={1}>
                <FormControl fullWidth>
                  <FormLabel>Amount</FormLabel>
                  <OutlinedInput
                    size="small"
                    name="amount"
                    value={wood.amount}
                    disabled
                    fullWidth
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={1} p={1}>
                <FormControl fullWidth>
                  <FormLabel>Total</FormLabel>
                  <OutlinedInput
                    size="small"
                    name="totalPieces"
                    value={wood.totalPieces}
                    disabled
                    fullWidth
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={1} p={1}>
                <FormControl fullWidth>
                  <FormLabel>ToBeCut</FormLabel>
                  <OutlinedInput
                    size="small"
                    name="toBeCut"
                    value={Math.abs(wood.toBeCut)}
                    disabled
                    fullWidth
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={1} p={1}>
                <FormControl fullWidth>
                  <FormLabel>Unit Price</FormLabel>
                  <OutlinedInput
                    size="small"
                    name="unitPrice"
                    value={wood.unitPrice}
                    disabled
                    fullWidth
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={1} p={1}>
                <FormControl fullWidth>
                  <FormLabel>Bill Price</FormLabel>
                  <OutlinedInput
                    size="small"
                    name="billPrice"
                    value={wood.billPrice}  // Change this from wood.unitPrice to wood.billPrice
                    onChange={(event) => handleBillPriceChange(index, event)}
                    fullWidth
                  />

                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
            </Grid>
          ))}
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
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
};

export default ShowRemainWood;
