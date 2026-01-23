import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Button,
  Stack,
  FormControl,
  FormLabel,
  OutlinedInput,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import {
  newBill,
  getbillDetailsById,
} from "../../services/BillAndOrderService/BilllManagemntService";
import {
  createStockSummary,
  updateStockSummaryDetails,
  getStockSummaryById
} from "../../services/InventoryManagementService/StockSummaryManagementService";
import { createOrder } from "../../services/BillAndOrderService/OrderManagmentService";
import { newIncome } from "../../services/AccountManagementService/IncomeManagmentService";
import {
  newAccountSummary,
  updateAccountSummary,
  getActiveAccountSummaryDetails,
} from "../../services/AccountManagementService/AccountSummaryManagmentService";
import { getCategoryById } from "../../services/PriceCardService";
import { ToastContainer, toast } from "react-toastify";
import {createbillAdvance } from "../../services/BillAndOrderService/BilllAdvanceService";

const CreateNewBill = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { woodData } = location.state;
  console.log("woodData:",woodData);
  const { user } = useSelector((state) => state.auth);
  const currentDate = new Date();
  const currentDateTime = currentDate.toISOString();

  let year = currentDate.getFullYear();
  let month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Months are zero-based
  let day = ("0" + currentDate.getDate()).slice(-2);
  let formattedDate = `${year}-${month}-${day}`;

  // Calculate total amount and remaining amount from wood data
  const calculateTotals = (advance) => {
    const totalAmount = woodData.reduce(
      (sum, wood) => sum + Number(wood.amount) * Number(wood.billPrice),
      0
    );
    const remainningAmount = totalAmount - Number(advance || 0);
    return { totalAmount, remainningAmount };
  };

  const [formData, setFormData] = useState({
    cusName: "",
    cusAddress: "",
    cusNIC: "",
    cusPhoneNumber: "",
    totalAmount: 0,
    advance: 0,
    remainningAmount: 0,
    PromizeDate: "",
    description: "",
    billStatus: "", // Default empty, to be updated with dropdown value
  });

  // Update totalAmount and remainningAmount when woodData or advance changes
  useEffect(() => {
    const { totalAmount, remainningAmount } = calculateTotals(formData.advance);
    setFormData((prevFormData) => ({
      ...prevFormData,
      totalAmount,
      remainningAmount,
    }));
  }, [woodData, formData.advance]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const validateBillInputs = (woodData,formData) => {
    let status = false;
    
    if(!formData.cusName || formData.cusName === ""){
      toast.error("Customer Name required");
      status = true;
    }else{
      if(!formData.cusAddress || formData.cusAddress === ""){
        toast.error("Customer Address required");
        status = true;
      }else{
        if(!formData.cusNIC || formData.cusNIC === ""){
          toast.error("NIC required");
          status = true;
        }else{
          if(!formData.cusPhoneNumber || formData.cusPhoneNumber === ""){
            toast.error("Customer Phone Number required");
            status = true;
          }else{
            if(!formData.totalAmount || formData.totalAmount === ""){
              toast.error("Total amount required");
              status = true;
            }else{
                if(!formData.remainningAmount || formData.remainningAmount === ""){
                  toast.error("Remaining amount required");
                  status = true;
                }else{
                  if(!formData.PromizeDate || formData.PromizeDate === ""){
                    toast.error("Promized date required");
                    status = true;
                  }else{
                    if(!formData.billStatus || formData.billStatus === ""){
                      toast.error("Status required");
                      status = true;
                    }
                  }
                }
            }
          }
        }          
      }
    }

    if(formData.billStatus == "COMPLETE"){
      if (formData.advance > 0) {
        toast.error("Cannot have advance for Complete bill !!",);
        status = true;
      }   
    }

    for (const wood of woodData) {
      if(formData.billStatus != "ORDER"){
        if (wood.toBeCut > 0) {
          toast.error("No stock for timber!!",);
          status = true;
        }   
      }
    }

    // if(formData.billStatus == "ORDER" || formData.billStatus == "ORDER" ){
    //   if(formData.advance < 1){
    //     toast.error("advance amount should be greater than 0 for ORDER");
    //     status = true;
    //   }
    // } 

            return status;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const result = validateBillInputs(woodData, formData);
      if (result) {
        console.error("Input Validation Error");
        return;
      }
  
      const formattedData = {
        ...formData,
        dateAndTime: currentDateTime,
        status: "A",
        createdBy: user.displayName,
        createdDate: currentDateTime
      };
  
      console.log("woodData:", woodData);
      const bill = await newBill(formattedData);
  
      if (bill != null) {

        if(formData.advance > 0){
          const payLoad = {
            amount: formData.advance,
            description: "Initial Advance",
            date: formattedDate,
            BillId : bill.id, 
            status: "A",
            createdBy: user.displayName,
            createdDate: formattedDate,
          }
         const advanceId = await createbillAdvance(payLoad);
        }
      
        for (const wood of woodData) {
          if (formData.billStatus != "ORDER") {
            const data = await getStockSummaryById(wood.summaryId);
            if (!data) {
              console.error("No data for stock summaryId:", wood.summaryId);
              continue;
            }
  
            const stockUpdateData = {
              status: "D",
              modifiedBy: user.displayName,
              modifiedDate: currentDateTime
            };
            await updateStockSummaryDetails(data.id, stockUpdateData);
  
            const categoryData = await getCategoryById(data.categoryId_fk);
            if (!categoryData) {
              console.error("Invalid category:", data.categoryId_fk);
              continue;
            }
  
            const stockSummaryData = {
              totalPieces: wood.totalPieces - wood.amount,
              changedAmount: wood.amount,
              previousAmount: wood.totalPieces,
              categoryId_fk: wood.categoryId_fk,
              maxlength: categoryData.minlength,
              minlength: categoryData.minlength,
              timberNature: categoryData.timberNature,
              timberType: categoryData.timberType,
              areaLength: categoryData.areaLength,
              areaWidth: categoryData.areaWidth,
              length: String(wood.requestLength),
              toBeCutAmount: wood.toBeCut,
              stk_id_fk: "",
              status: "A",
              billId_fk: bill.id,
              createdBy: user.displayName,
              createdDate: currentDateTime
            };
            await createStockSummary(stockSummaryData);
  
          } else {

            const data = await getStockSummaryById(wood.summaryId);
            if (!data) {
              console.error("No data for stock summaryId:", wood.summaryId);
              continue;
            }

              const stockUpdateData = {
                toBeCutAmount: wood.amount,
                modifiedBy: user.displayName,
                modifiedDate: currentDateTime
              };
              await updateStockSummaryDetails(data.id, stockUpdateData);

          }

  
          const saveOrderData = {
            discountPrice: wood.billPrice || 0,
            categoryId_fk: wood.categoryId_fk || 0,
            availablePiecesAmount: wood.totalPieces || 0,
            neededPiecesAmount: wood.amount || 0,
            tobeCut: wood.toBeCut,
            woodLength: wood.requestLength,
            isComplete: formData.billStatus == "ORDER" ? false : true,
            status: "A",
            billId_fk: bill.id,
            createdBy: user.displayName,
            createdDate: currentDateTime
          };
          await createOrder(saveOrderData);
          
        }
  
        if (formData.billStatus !== "INTERNAL") {

          let incomeAmount = 0;

          if(formData.billStatus === "COMPLETE"){
            incomeAmount = formData.totalAmount;
  
          }else
          {
            if(formData.advance > 0){
                incomeAmount = formData.advance;
            }else{
                incomeAmount = incomeAmount; 
            }
          }

          const saveIncomeData = {
            date: currentDateTime,
            type: `${formData.billStatus}-Bill`,
            des: "Nothing",
            amount:  incomeAmount,
            BilId: bill.billID || "",
            status: "A",
            createdBy: user.displayName,
            createdDate: currentDateTime
          };
          const incomeId = await newIncome(saveIncomeData);
  
          if (incomeId) {
            const data = await getActiveAccountSummaryDetails();
  
            if (data) {
              const accountSummaryData = {
                status: "D",
                modifiedBy: user.displayName,
                modifiedDate: currentDateTime
              };
              await updateAccountSummary(data.id, accountSummaryData);
  
              const newAccountSummaryData = {
                totalAmount: Number(data.totalAmount) + Number(formData.totalAmount),
                changedAmount: formData.totalAmount,
                previousAmount: data.totalAmount,
                expId_fk: "",
                incId_fk: incomeId,
                status: "A",
                createdBy: user.displayName,
                createdDate: currentDateTime
              };
              await newAccountSummary(newAccountSummaryData);
            }
          }
        }
      }
  
      navigate(`/bill/view/${bill.id}`);
    } catch (error) {
      console.error("Error creating bill:", error.message);
    }
  };
  

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "Timber Type",
      headerName: "Timber Type",
      width: 130,
      renderCell: ({ row }) => {
        return `${row.timberType} - ${row.length} x ${row.width}`;
      },
    },
    { field: "requestLength", headerName: "Length", width: 150 },
    { field: "totalPieces", headerName: "Total Pieces", width: 150 },
    { field: "unitPrice", headerName: "Unit Price", width: 150 },
    { field: "amount", headerName: "Amount", width: 150 },
    { field: "toBeCut", headerName: "To Be Cut", width: 150 },
    { field: "billPrice", headerName: "Bill Price", width: 150 },
    { field: "total", headerName: "Total", width: 150 },
  ];

  const rows = woodData.map((wood, index) => ({
    id: index + 1,
    ...wood,
    total: Number(wood.amount) * Number(wood.billPrice),
  }));

  return (
    <>
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
      >
        <Grid item xs={12}>
          <Grid
            container
            padding={2}
            sx={{
              bgcolor: "background.default",
              borderRadius: 2,
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
                  Create a new bill
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <form onSubmit={handleSubmit}>
                <Grid container>
                  <Grid item xs={12} p={1}>
                    <Typography variant="h6">Customer Data</Typography>
                  </Grid>
                  {Object.entries(formData).map(([key, value]) => (
                    <Grid key={key} item xs={12} md={4} p={1}>
                      <FormControl
                        fullWidth
                        sx={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <FormLabel>
                          {key.charAt(0).toUpperCase() +
                            key.slice(1).replace(/([A-Z])/g, " $1")}
                        </FormLabel>
                        {key === "billStatus" ? (
                          <FormControl fullWidth sx={{ minWidth: 120 }}>
                            <InputLabel>Bill Status</InputLabel>
                            <Select
                              name={key}
                              value={value}
                              onChange={handleChange}
                              size="small"
                              sx={{
                                height: 40, // Adjust height to match OutlinedInput (same as other fields)
                                width : 250,
                              }}
                            >
                              <MenuItem value="ORDER">ORDER</MenuItem>
                              <MenuItem value="COMPLETE">COMPLETE</MenuItem>
                              <MenuItem value="INTERNAL">INTERNAL</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <OutlinedInput
                            size="small"
                            name={key}
                            value={value}
                            onChange={handleChange}
                            readOnly={key === "totalAmount" || key === "remainningAmount"} // Make fields read-only
                            sx={{ height: 40 }} // Ensure height consistency for text input fields
                          />
                        )}


                      </FormControl>
                    </Grid>
                  ))}
                  <Grid item xs={12} p={1}>
                    <Typography variant="h6">Wood Data</Typography>
                  </Grid>
                  <Grid item xs={12} p={1}>
                    <DataGrid
                      rows={rows}
                      columns={columns}
                      pageSize={5}
                      rowsPerPageOptions={[5]}
                    />
                  </Grid>
                  <Grid item xs={12} p={1}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button
                        variant="contained"
                        type="submit"
                        color="primary"
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => navigate("/bill")}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </form>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default CreateNewBill;
