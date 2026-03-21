import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Grid,
  Typography,
  Stack,
  Button,
  FormControl,
  OutlinedInput,
  FormLabel,
} from "@mui/material";
import { getbillDetailsById, updatebillDetails } from "../../services/BillAndOrderService/BilllManagemntService";
import { getorderIdByBillId } from "../../services/BillAndOrderService/OrderManagmentService";
import { updateorder } from "../../services/BillAndOrderService/OrderManagmentService";
import { newIncome } from "../../services/AccountManagementService/IncomeManagmentService";
import { getActiveStockSummaryDetails, createStockSummary, updateStockSummaryDetails, getStockSummaryById } from "../../services/InventoryManagementService/StockSummaryManagementService";
import { getCategoryById } from "../../services/PriceCardService";
import { getAdvanceDetailsByBillId } from "../../services/BillAndOrderService/BilllAdvanceService";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CancelIcon from "@mui/icons-material/Cancel";
import { useSelector } from "react-redux";
import {  toast } from "react-toastify";

import CancelBillDialog from './CancelBillDialog'; // Import the dialog component
import CompleteBillDialog from './CompleteBillDialog'; // Import the dialog component
import AdvanceListDialog from './AdvanceListDialog';

const ViewBillDetails = () => {
  const { billId } = useParams();
  const [categories, setCategories] = useState([]);
  const [complete, setComplete] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [woodLength, setWoodLength] = useState(0);
  const [tobeCompleteAmount, setTobeCompleteAmount] = useState(0);
  const [toBeCompleteOrder, setToBeCompleteOrder ]= useState(0);
  const [rerun, setRerun ]= useState(false);
;
  const [openDialog, setOpenDialog] = useState(false);
  const [openCancelDialog, setCancelDialog] = useState(false);
  const [openAdvanceDialog, setOpenAdvanceDialog] = useState(false);


  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const currentDate = new Date();
  const currentDateTime = currentDate.toISOString();
  let year = currentDate.getFullYear();
  let month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Months are zero-based
  let day = ("0" + currentDate.getDate()).slice(-2);
  let formattedDate = `${year}-${month}-${day}`;

  const [categoryData, setCategoryData] = useState({
    id:"",
    cusName: "",
    cusAddress: "",
    billBookNo:"",
    cusNIC: "",
    cusPhoneNumber: "",
    totalAmount: "",
    advance: "",
    remainningAmount: "",
    billID: "",
    otherCharges: "",
    // PromizeDate: "",
    // billCreatedDate: "",
    description: "",
    billStatus: "",
    totalIncome: "",
    incomeAsPercentage: "",
    unloadedDate: "",
    status: "",
    createdBy: "",
    createdDate: "",
    modifiedBy: "",
    modifiedDate: "",
  });


const [billAdvance, setBillAdvance] = useState({
  BillId: "",
  amount: "0",  // Initialize with a default value
  date: "",
  description: "",
});

  const [isLoadDataEditable, setIsLoadDataEditable] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [loadData, setLoadData] = useState({
    dateAndTime: { editable: false, bpMD: 3 },
    cusName: { editable: false, bpMD: 3 },
    cusNIC: { editable: false, bpMD: 3 },
    billBookNo: { editable: false, bpMD: 3 },
    cusPhoneNumber: { editable: false, bpMD: 3 },
    cusPhoneNumber: { editable: false, bpMD: 3 },
    totalAmount: { editable: false, bpMD: 3 },
    advance: { editable: false, bpMD: 3 },
    remainningAmount: { editable: false, bpMD: 3 },
    // PromizeDate: { editable: false, bpMD: 3 },
    //  billCreatedDate: { editable: false, bpMD: 3 },
    otherCharges: { editable: false, bpMD: 3 },
    billStatus: { editable: false, bpMD: 3 },
    status: { editable: false, bpMD: 3 },
    createdBy: { editable: false, bpMD: 3 },
    modifiedBy: { editable: false, bpMD: 3 },
    cusAddress: { editable: false, bpMD: 6 },
    description: { editable: false, bpMD: 6 },
  });
  const columns = [
    { field: "categoryId_fk", headerName: "Category", width: 110 },
    { field: "timberType", headerName: "Timber Type", width: 110 },
    { field: "timberNature", headerName: "Nature", width: 150 },
    {
      field: "dimensions",
      headerName: "Dimensions",
      width: 130,
      renderCell: ({ row }) => {
        return `${row.areaLength} x ${row.areaWidth}`;
      },
    },
    { field: "woodLength", headerName: "Length", width: 110 },
    {
      field: "availablePiecesAmount",
      headerName: "Available",
      width: 110,
    },
    {
      field: "neededPiecesAmount",
      headerName: "Needed",
      width: 110,
    },
    { field: "unitPrice", headerName: "Unit Price", width: 110 },
    { field: "discountPrice", headerName: "Discount", width: 110 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          {params.row.isComplete == false && categoryData.billStatus == "ORDER" &&(
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setComplete(true);
                setWoodLength(params.row.woodLength);
                setCategoryId(params.row.categoryId_fk);
                setTobeCompleteAmount(params.row.neededPiecesAmount);
                setToBeCompleteOrder(params.row.id);
              }}
            >
              Complete
            </Button>
          )}
        </Stack>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getbillDetailsById(billId);
        setCategoryData(data);
        const loadData = await getorderIdByBillId(billId);
        processLoadData(loadData);
      } catch (error) {
        console.error("Error fetching category data:", error.message);
        // Handle error
      }
    };

    fetchData();
  }, [billId,rerun]);


    useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAdvanceDetailsByBillId(billId);
        setBillAdvance(data); 
      } catch (error) {
        toast.warn("Error fetching Advance data.");
        console.error("Error fetching Advance data:", error.message);
      }
    };

    fetchData();
  }, [openAdvanceDialog,billId]);

  useEffect(() => {
    const completeTimberStock = async () => {
      try {
        const activeData = await getActiveStockSummaryDetails(categoryId, woodLength);
        if (activeData != null) {
          // Check if total pieces in stock are sufficient
          if (Number(activeData.totalPieces) - Number(tobeCompleteAmount) < 0) {
            toast.error("Insufficient stock to complete the wood order!!");
          } 
          else {
            // Check if to-be-cut amount is sufficient
            if (Number(activeData.toBeCutAmount) - Number(tobeCompleteAmount) < 0) {
              toast.error("Order amount cannot go negative after processing!!");
              console.log("🚀 ~ completeTimberStock ~ tobeCompleteAmount:", tobeCompleteAmount)
              console.log("🚀 ~ completeTimberStock ~ activeData.totalPieces:", activeData.totalPieces)
            } 
            else {
              // Update the stock summary details to mark it as completed
              const stockUpdateData = {
                status: "D",  // D for completed
                modifiedBy: user.displayName,
                modifiedDate: currentDateTime
              };
              await updateStockSummaryDetails(activeData.id, stockUpdateData);

              const catogoryDatat = await getCategoryById(activeData.categoryId_fk);
              if(catogoryDatat == null){
                toast.error("Invalid category:!!");
              }

              // Create new stock summary with updated details
              const stockSumData = {
                totalPieces: Number(activeData.totalPieces) - Number(tobeCompleteAmount),
                changedAmount: tobeCompleteAmount,
                previousAmount: activeData.totalPieces,
                categoryId_fk: activeData.categoryId_fk,
                maxlength : catogoryDatat.maxlength,
                minlength : catogoryDatat.minlength,
                timberNature : catogoryDatat.timberNature,
                timberType : catogoryDatat.timberType,
                areaLength : catogoryDatat.areaLength,
                areaWidth : catogoryDatat.areaWidth,
                length: activeData.length,
                toBeCutAmount: Number(activeData.toBeCutAmount) - Number(tobeCompleteAmount),
                stk_id_fk: `CO_${categoryData.billID}`,
                status: "A",
                billId_fk: billId,
                createdBy: user.displayName,
                createdDate: currentDateTime
              };
  
              const newStockSummaryData = await createStockSummary(stockSumData);
  
              // If the new stock summary was created successfully, update the order
              if (newStockSummaryData) {
                const orderUpdateData = {
                  tobeCut: 0,
                  isComplete: true,
                  modifiedBy: user.displayName,
                  modifiedDate: currentDateTime
                };
                await updateorder(toBeCompleteOrder, orderUpdateData);
                toast.success("Order updated successfully!!");
                setRerun(!rerun);
              }
            }
          }
        } else {
          console.error("No active stock data for the given category:", categoryId);
        }
      } catch (error) {
        console.error("Error fetching category data:", error.message);
        // Handle error appropriately
      }
    };
  
    completeTimberStock();
  }, [complete, tobeCompleteAmount, woodLength, categoryId, billId]);
  


  const handleSubmit = async (event) => {
    event.preventDefault();
    //TODO: handle update load
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoryData((prevPayload) => ({
      ...prevPayload,
      [name]: value,
    }));
  };


  async function processLoadData(loadData) {
    if (Array.isArray(loadData)) {
      const updatedCategories = await Promise.all(
        loadData.map(async item => {
          const categoryDetails = await getCategoryById(item.categoryId_fk);
          return {
            ...item, // Destructure the original item
            timberType: categoryDetails.timberType,
            timberNature: categoryDetails.timberNature,
            areaLength: categoryDetails.areaLength,
            areaWidth: categoryDetails.areaWidth,
            unitPrice: categoryDetails.unitPrice,
            categoryId_fk: item.categoryId_fk,
          };
        })
      );
      setCategories(updatedCategories);
    } else {
      throw new Error("Invalid data format received from API");
    }
  }
  const onClickUpdate = (event) => {
    event.preventDefault();
    navigate(`/bill/update/wood`, {
      state: {
        payloadBulkFromUpdate: categories.map((item) => ({
          categoryId: item.categoryId_fk,
          length: item.areaLength,
          amount: item.neededPiecesAmount,
        })),
        currentCategoriesData: categories,
        currentLoadData: loadData,
      },
    });
  };

    const onClickLoadAdvance = async (event) => {
      try {
        const data = await getAdvanceDetailsByBillId(billId);
        setBillAdvance(data);
        setOpenAdvanceDialog(true); 
      } catch (error) {
        toast.warn("Error fetching Advance data.");
        console.error("Error fetching Advance data:", error.message);
      }
  };


  
  const handleComplete = async () => {
    // Get a list of categories where `isComplete` is false
    const incompleteCategories = categories.filter(category => !category.isComplete);
    if (incompleteCategories.length > 0) {
      toast.warn("There are incomplete categories.");
    } else {
      toast.success("Sucessfully Completed");

      const updateBillDetails = {
        ...categoryData,
        billStatus : "COMPLETE",
        remainningAmount: 0 ,
        modifiedBy: user.displayName,
        modifiedDate: formattedDate,
      }
      
       const incomeId = await newIncome({
                  date: formattedDate,
                  type: `Balance-Bill`,
                  des: "Bill balance cleared.",
                  amount: categoryData.remainningAmount,
                  BilId: categoryData.billID|| "",
                  status: "A",
                  createdBy: user.displayName,
                  createdDate: formattedDate,
                });
  
      if (incomeId) {
      updatebillDetails(billId , updateBillDetails);
      }

      // Navigate to the bill view page
      navigate(`/bill`);
    }
  };
  
  // Sample API function
  const sampleApiUpdateStatus = async (categoryId) => {
    // Simulate an API call with a delay
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };
  

  const handleDialogBoxOpen = () => {
      setOpenDialog(true); // Open the dialog when there are incomplete categories

  };

  const handleCancelDialogBoxOpen = () => {
      setCancelDialog(true); // Open the dialog when there are incomplete categories

  };

  const handleCancelDialogClose = () => {
    setCancelDialog(false);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

    const handleAdvanceDialogBoxOpen = () => {
      setOpenAdvanceDialog(true); // Open the dialog when there are incomplete categories

  };

  const handleAdvanceDialogClose = () => {
    setOpenAdvanceDialog(false);
  };


  const handleDialogConfirm = async () => {

    if (categories.length > 0) {
      for (const category of categories) {
        try {
          const data = await getActiveStockSummaryDetails(category.categoryId_fk, category.woodLength);
          console.log("🚀 ~ handleDialogConfirm ~ data:", data)
          if (!data) {
            console.error("No data for stock summaryId:", category.summaryId);
            continue;
          }

          if (category.isComplete)
            {
              const stockUpdateData = {
                status: "D",
                modifiedBy: user.displayName,
                modifiedDate: currentDateTime
              };
              await updateStockSummaryDetails(data.id, stockUpdateData);
    
              const categoryData = await getCategoryById(data.categoryId_fk);
              console.log("🚀 ~ handleDialogConfirm ~ categoryData:", categoryData)
              if (!categoryData) {
                console.error("Invalid category:", data.categoryId_fk);
                continue;
              }

              const stockSummaryData = {
                totalPieces: data.totalPieces + category.neededPiecesAmount,
                changedAmount: category.neededPiecesAmount,
                previousAmount: data.totalPieces,
                categoryId_fk: category.categoryId_fk,
                maxlength: categoryData.minlength,
                minlength: categoryData.minlength,
                timberNature: categoryData.timberNature,
                timberType: categoryData.timberType,
                areaLength: categoryData.woodLength,
                areaWidth: categoryData.areaWidth,
                length: category.requestLength,
                toBeCutAmount: data.toBeCutAmount - category.neededPiecesAmount,
                stk_id_fk: "",
                status: "A",
                billId_fk: billId,
                createdBy: user.displayName,
                createdDate: currentDateTime
              };

              await createStockSummary(stockSummaryData);

            }else
            {
             const stockSummaryData = {
                toBeCutAmount: data.toBeCutAmount - category.neededPiecesAmount,
                modifiedBy: user.displayName,
                modifiedDate: currentDateTime
              };

              await updateStockSummaryDetails(data.id , stockSummaryData);
            }

        } catch (error) {
          toast.error(`Failed to update category ID: ${category.categoryId_fk}`);
        }
      }
    }

    const updateBillDetails = {
      ...categoryData,
      billStatus : "CANCEL",
      remainningAmount: 0 ,
      modifiedBy: user.displayName,
      modifiedDate: formattedDate,
    }

    updatebillDetails(billId , updateBillDetails);

    navigate(`/bill`);

    setOpenDialog(false); // Close the dialog after confirmation
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
            <Typography variant="h4" sx={{ color: "#9C6B3D" }} align="center">
              Bill & Order details
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
                <Typography variant="h6" sx={{ color: "#9C6B3D" }} align="center">
                  Bill details
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
                justifyContent="space-between"  // This will space the buttons apart (left and right)
                alignItems="center"
                spacing={2}
              >
                <Typography variant="h6" sx={{ color: "#9C6B3D" }} align="center">
                  Order details
                </Typography>
                
                <Button
                  startIcon={<EditIcon />} // Changed icon to indicate an update
                  onClick={onClickUpdate}
                  variant="outlined"
                  disabled={categoryData.billStatus !== "ORDER"}
                >
                  Update Timber
                </Button>

                <Button
                  startIcon={<VisibilityIcon />}
                  onClick={handleAdvanceDialogBoxOpen}
                  variant="outlined"
                >
                  View Advance
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

          <Grid item xs={12} padding={2}>
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              {categoryData.billStatus === "ORDER" && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleDialogBoxOpen}
                  >
                    Complete
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleCancelDialogBoxOpen}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </Stack>
          </Grid>


        </Grid>
      </Grid>

      {/* Confirmation cancle Dialog */}
      <CancelBillDialog
        open={openCancelDialog}
        onClose={handleCancelDialogClose}
        onConfirm={handleDialogConfirm}
        />

      {/* Confirmation complete Dialog */}
      <CompleteBillDialog
        open={openDialog}
        onClose={handleDialogClose}
        onConfirm={handleComplete}
        remaingAmount={categoryData.remainningAmount}
        />
  
        {/* Confirmation Advance Dialog */}
      <AdvanceListDialog
        open={openAdvanceDialog}
        onClose={handleAdvanceDialogClose}
        onConfirm={handleComplete}
        billAdvance={billAdvance}
        />
  

    </>
  );
};

export default ViewBillDetails;
