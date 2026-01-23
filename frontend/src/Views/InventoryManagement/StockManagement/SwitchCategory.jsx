import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Button,
  OutlinedInput,
  FormControl,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import { useSelector } from "react-redux";
import {  toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAllActiveTreeType } from "../../../services/SettingManagementService/TreeTypeService";
import { getAllActiveTimberNature } from "../../../services/SettingManagementService/TimberNatureService";
import { getCategorybasedOnLength } from "../../../services/PriceCardService";
import {updateStockSummaryDetails, createStockSummary, getActiveStockSummaryDetails} from "../../../services/InventoryManagementService/StockSummaryManagementService";
import { getCategoryById } from "../../../services/PriceCardService"; 

const SwitchCategory = () => {
  // eslint-disable-next-line no-unused-vars
  const { user } = useSelector((state) => state.auth);

  const [treeTypes, setTreeTypes] = useState([]);
  const [timberNature, setTimberNature] = useState([]);
  const [isRightColumnDisabled, setIsRightColumnDisabled] = useState(false);

  const initialData = {
    timberType: "",
    timberNature: "",
    areaLength: 0,
    areaWidth: 0,
    minlength: 0,
    maxlength: 0,
    unitPrice: "",
    amount: "",
  };

  const [existingData, setExistingData] = useState(initialData);
  const [updatedData, setUpdatedData] = useState(initialData);
  const [currentActiveData, setCurrentActiveData] = useState("");

  const currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Months are zero-based
  let day = ("0" + currentDate.getDate()).slice(-2);
  let formattedDate = `${year}-${month}-${day}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const treeTypeResponse = await getAllActiveTreeType();
        const timberNatureResponse = await getAllActiveTimberNature();
        setTreeTypes(treeTypeResponse);
        setTimberNature(timberNatureResponse);
      } catch (error) {
        toast.error("Error fetching data");
      }
    };
    fetchData();
  }, []);

  const handleExistingChange = (e) => {
    const { name, value } = e.target;
    setExistingData((prev) => ({ ...prev, [name]: name === "areaLength" || name === "areaWidth" || name === "length" ? Number(value) : value }));
  };

  const handleUpdatedChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prev) => ({ ...prev, [name]: name === "areaLength" || name === "areaWidth" || name === "length" ? Number(value) : value }));
  };

  const handleValidateCategory = async () => {
    try {
      const categoryData = await getCategorybasedOnLength(existingData);
      console.log("🚀 ~ handleValidateCategory ~ categoryData:", categoryData);

      if (categoryData) {
        const data = await getActiveStockSummaryDetails(
          categoryData.categoryId,
          existingData.length
        );

        if (data != null) {
          setUpdatedData(existingData);
          setIsRightColumnDisabled(true);
          setCurrentActiveData(data);
          toast.success("Category identified. You can now update the fields.");
        } else {
          toast.error("Category not found.");
        }
      } else {
        toast.error("Category not found.");
      }
    } catch (error) {
      toast.error("Error validating category.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      debugger;
      if (validateInputs() === true) {
        toast.error("input error");
      } else {
        const currentStockDeactivateDta = {
          status: "D",
        };
        const updatedkData = await updateStockSummaryDetails(
          currentActiveData.id,
          currentStockDeactivateDta
        );

        if (updatedkData) {
          const newCurrentData = {
            totalPieces:Number(currentActiveData.totalPieces) -Number(updatedData.amount),
            changedAmount: updatedData.amount,
            previousAmount: currentActiveData.totalPieces,
            stk_id_fk: currentActiveData.stk_id_fk,
            length: currentActiveData.length,
            toBeCutAmount: currentActiveData.toBeCutAmount,
            status: "A",
            billId_fk: "switch category",
            categoryId_fk: currentActiveData.categoryId_fk,
            maxlength: currentActiveData.maxlength,
            minlength: currentActiveData.minlength,
            timberNature: currentActiveData.timberNature,
            timberType: currentActiveData.timberType,
            areaLength: currentActiveData.areaLength,
            areaWidth: currentActiveData.areaWidth,
            createdBy: user.displayName,
            createdDate: formattedDate,
          };
          const stockSummarykData = await createStockSummary(newCurrentData);

          if (stockSummarykData) {
            let resultData;

            if (
              Number(currentActiveData.minlength) <= Number(updatedData.length) &&
              Number(updatedData.length) <= Number(currentActiveData.maxlength)
            ) {
              resultData = await getActiveStockSummaryDetails(
                currentActiveData.categoryId_fk,
                Number(updatedData.length)
              );
            } else {
              debugger
              const categoryData = await getCategorybasedOnLength(updatedData);

              if (!categoryData) {
                toast.error("No category found for updated data!");
              }

              resultData = await getActiveStockSummaryDetails(
                categoryData.categoryId,
                updatedData.length
              );
            }
            console.log("🚀 ~ handleSubmit ~ resultData:", resultData);
            if (resultData != null) {
              const formattedData = {
                status: "D",
              };
              const updatedStockData = await updateStockSummaryDetails(
                resultData.id,
                formattedData
              );

              if (updatedStockData) {
                const newCurrentData = {
                  totalPieces: Number(resultData.totalPieces) + Number(updatedData.amount),
                  changedAmount: updatedData.amount,
                  previousAmount: resultData.totalPieces,
                  stk_id_fk: resultData.stk_id_fk,
                  length:  String(resultData.length),
                  toBeCutAmount: resultData.toBeCutAmount,
                  status: "A",
                  billId_fk: "switch category",
                  categoryId_fk: resultData.categoryId_fk,
                  maxlength: resultData.maxlength,
                  minlength: resultData.minlength,
                  timberNature: resultData.timberNature,
                  timberType: resultData.timberType,
                  areaLength: resultData.areaLength,
                  areaWidth: resultData.areaWidth,
                  createdBy: user.displayName,
                  createdDate: formattedDate,
                };

                await createStockSummary(newCurrentData);
              }
            } 
            else {
              let catogoryData = null;

              if (
                Number(currentActiveData.minlength) <=
                  Number(updatedData.length) &&
                Number(updatedData.length) <=
                  Number(currentActiveData.maxlength)
              ) {
                catogoryData = await getCategoryById(
                  currentActiveData.categoryId_fk
                );
              } else {
                const data = await getCategorybasedOnLength(updatedData);

                if (!data) {
                  toast.error("No category found for updated data!");
                }
                catogoryData = await getCategoryById(data.categoryId);
              }

              if (catogoryData == null) {
                toast.error("Invalid category:");
              } else {
                const newCurrentData = {
                  totalPieces: updatedData.amount,
                  changedAmount: updatedData.amount,
                  previousAmount: "0",
                  stk_id_fk: "switch category",
                  length:  String(updatedData.length),
                  toBeCutAmount: 0,
                  status: "A",
                  billId_fk: "switch category",
                  categoryId_fk: catogoryData.categoryId,
                  maxlength: catogoryData.maxlength,
                  minlength: catogoryData.minlength,
                  timberNature: catogoryData.timberNature,
                  timberType: catogoryData.timberType,
                  areaLength: catogoryData.areaLength,
                  areaWidth: catogoryData.areaWidth,
                  createdBy: user.displayName,
                  createdDate: formattedDate,
                };
                const stockSummarykData = await createStockSummary(
                  newCurrentData
                );
              }
            }

            toast.success("Category created successfully!");
            setTimeout(() => {
              window.location.href = `/activeStock`;
            }, 200);
          }
        }
      }
    } catch (error) {
      toast.error("Error updating category.", error);
    }
  };

  const validateInputs = async () => {
   
    let error = false;

    if(Number(currentActiveData.totalPieces)  < Number(updatedData.amount) ){
      toast.error("Not enough stock to switch!");
      error = true;
    }

    if (!updatedData.amount || Number(updatedData.amount) < 0) {
      toast.error("Amount should be greater than 0 and cannot be empty");
      error = true;
    }
    

    if(existingData.length <= updatedData.length ){
      toast.error("update length should be changed");
      error = true;
    }
  console.log("error", error);
    return error

  };
  const renderFormFields = (data, handleChange, disabled = false, flow) => (
    <>
      <Grid item xs={12} padding={1}>
        <FormControl fullWidth>
          <Typography>Timber Type</Typography>
          <Select
            name="timberType"
            value={data.timberType}
            onChange={handleChange}
            disabled={disabled}
          >
            {treeTypes.map((type) => (
              <MenuItem key={type.id} value={type.typeName}>
                {type.typeName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} padding={1}>
        <FormControl fullWidth>
          <Typography>Timber Nature</Typography>
          <Select
            name="timberNature"
            value={data.timberNature}
            onChange={handleChange}
            disabled={disabled}
          >
            {timberNature.map((type) => (
              <MenuItem key={type.id} value={type.natureName}>
                {type.natureName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} padding={1}>
        <FormControl fullWidth>
          <Typography>Area Length</Typography>
          <OutlinedInput
            name="areaLength"
            value={data.areaLength}
            onChange={handleChange}
            disabled={disabled}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} padding={1}>
        <FormControl fullWidth>
          <Typography>Area Width</Typography>
          <OutlinedInput
            name="areaWidth"
            value={data.areaWidth}
            onChange={handleChange}
            disabled={disabled}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} padding={1}>
        <FormControl fullWidth>
          <Typography>Length</Typography>
          <OutlinedInput
            name="length"
            value={data.length}
            onChange={handleChange}
            disabled={disabled}
          />
        </FormControl>
      </Grid>
      {flow === "new" && (
        <Grid item xs={12} padding={1}>
          <FormControl fullWidth>
            <Typography>Amount</Typography>
            <OutlinedInput
              name="amount"
              value={data.amount}
              onChange={handleChange}
              disabled={disabled}
            />
          </FormControl>
        </Grid>
      )}
    </>
  );

  return (
    <Grid
      container
      spacing={2}
      padding={2}
      sx={{
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Grid item xs={12} md={5}>
        <Typography variant="h6">Enter Existing Category Details</Typography>
        <Grid container spacing={2} paddingX={8} paddingY={2}>
          {renderFormFields(
            existingData,
            handleExistingChange,
            isRightColumnDisabled,
            "existing"
          )}
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleValidateCategory}
              disabled={isRightColumnDisabled}
            >
              Validate Category
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Divider orientation="vertical" variant="middle" flexItem />
      <Grid item xs={12} md={5}>
        <Typography variant="h6">Update Category Details</Typography>
        <Grid
          container
          spacing={2}
          paddingX={8}
          paddingY={2}
          component="form"
          onSubmit={handleSubmit}
        >
          {renderFormFields(
            updatedData,
            handleUpdatedChange,
            !isRightColumnDisabled,
            "new"
          )}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              disabled={!isRightColumnDisabled}
            >
              Update Category
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default SwitchCategory;
