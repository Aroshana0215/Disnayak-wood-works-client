import React, { useState, useEffect } from 'react';
import { getAllbillDetails } from '../../services/BillAndOrderService/BilllManagemntService';
import { Stack, Typography, InputAdornment, Box } from "@mui/material";
import { Link } from "react-router-dom";
import { Grid, Button, MenuItem, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers";
import Loading from "../../Components/Progress/Loading";
import ErrorAlert from "../../Components/Alert/ErrorAlert";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { Chip } from "@mui/material";
import UpdateBill from './UpdateBill'; // Import the dialog component
import { useSelector } from "react-redux";

const BillDetailList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [billStatusQuery, setBillStatusQuery] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [generalQuery, setGeneralQuery] = useState("");
  const [createdDate, setCreatedDate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false); // State to manage dialog visibility
  const [selectedBillId, setSelectedBillId] = useState(null); // State to manage selected bill ID
  const [selectedBill, setSelectedBill] = useState(null); 
  const { user } = useSelector((state) => state.auth);

  const columns = [
    { field: "billID", headerName: "ID", width: 90 },
    { field: "cusName", headerName: "Customer Name", width: 150 },
    {
      field: "totalAmount",
      headerName: "Total (RS:)",
      width: 130,
      renderCell: ({ row }) => `${row.totalAmount}.00`,
    },
    {
      field: "advance",
      headerName: "Advance (RS:)",
      width: 130,
      renderCell: ({ row }) => `${row.advance}.00`,
    },
    {
      field: "billStatus",
      headerName: "Bill Status",
      width: 130,
      renderCell: ({ value }) => {
        let chipProps = { label: value, size: "small", variant: "outlined" };
    
        switch (value) {
          case "ORDER":
            chipProps = { 
              ...chipProps, 
              sx: { borderColor: "#FFA726", color: "#E65100", backgroundColor: "#FFECB3" } // Brighter orange
            };
            break;
          case "INTERNAL":
            chipProps = { 
              ...chipProps, 
              sx: { borderColor: "#42A5F5", color: "#0D47A1", backgroundColor: "#BBDEFB" } // Brighter blue
            };
            break;
          case "CANCEL":
            chipProps = { 
              ...chipProps, 
              sx: { borderColor: "#E57373", color: "#C62828", backgroundColor: "#FFCDD2" } // Brighter red
            };
            break;
          case "COMPLETE":
            chipProps = { 
              ...chipProps, 
              sx: { borderColor: "#66BB6A", color: "#1B5E20", backgroundColor: "#C8E6C9" } // Brighter green
            };
            break;
          default:
            chipProps = { 
              ...chipProps, 
              sx: { borderColor: "#9E9E9E", color: "#424242", backgroundColor: "#EEEEEE" } // Brighter gray
            };
        }
    
        return <Chip {...chipProps} />;
      },
    },
    { field: "createdDate", headerName: "Created Date", width: 140 },
    { field: "time", headerName: "Time", width: 100 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <>
            <Button
              component={Link}
              to={`/bill/view/${params.row.id}`}
              variant="contained"
              size="small"
              sx={{marginX:1}}
            >
              View
            </Button>
            {params.row.billStatus === "ORDER" && (
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setSelectedBillId(params.row.id);
                  setSelectedBill(params.row);
                  setDialogOpen(true);
                }}
              >
                Update
              </Button>
            )}
        </>
      ),
    },
  ];

  const handleComplete = (billID) => {
    console.log(`Complete action triggered for bill ID: ${billID}`);
  };

  const formatDate = (dateObject) => {
    const date = new Date(dateObject);
    return date.toISOString().slice(0, 10);
  };

  const formatTime = (dateObject) => {
    const date = new Date(dateObject);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Extracting only the time part
  };

  useEffect(() => {
    const fetchData = async () => {
      // window.location.href = `/bill`;
    };

    fetchData();
  }, [dialogOpen === false]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllbillDetails();
        console.log("Fetched data:", data);
        if (Array.isArray(data)) {
          const formattedData = data.map((item) => ({
            ...item,
            createdDate: formatDate(item.createdDate),
            time: formatTime(item.createdDate),
          }));
          setCategories(formattedData);
          setFilteredCategories(formattedData);
          setLoading(false);
        } else {
          throw new Error("Invalid data format received from API");
        }
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    let filteredData = categories;

    if (billStatusQuery) {
      const lowercasedBillStatusQuery = billStatusQuery.toLowerCase();
      filteredData = filteredData.filter((category) =>
        category.billStatus.toLowerCase().includes(lowercasedBillStatusQuery)
      );
    }

    if (generalQuery) {
      const lowercasedGeneralQuery = generalQuery.toLowerCase();
      filteredData = filteredData.filter((category) =>
        Object.values(category).some((value) =>
          String(value).toLowerCase().includes(lowercasedGeneralQuery)
        )
      );
    }

    if (createdDate) {
      filteredData = filteredData.filter((category) => {
        const categoryDate = new Date(
          category.createdDate
        ).toLocaleDateString();
        const selectedDate = createdDate.toLocaleDateString();
        return categoryDate === selectedDate;
      });
    }

    setFilteredCategories(filteredData);
  };

  useEffect(() => {
    handleSearch();
  }, [generalQuery, billStatusQuery, createdDate]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearDateFilter = () => {
    setCreatedDate(null);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorAlert error={error} />;
  }

  return (
    <>
      <Grid container>
        <Grid item xs={12} p={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight="bold" color="primary">
              Bill & Order Details
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              component={Link}
              to={"/bill/wants/wood"}
            >
              New
            </Button>
          </Stack>
        </Grid>

        <Grid item xs={12} p={1}>
          <Stack
            p={2}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              bgcolor: "background.default",
              borderRadius: 1,
              border: "1px solid rgba(0, 0, 0, 0.12)",
            }}
          >
            <Stack direction="row" spacing={2}>
              <TextField
                select
                size="small"
                value={billStatusQuery}
                onChange={(e) => {
                  setBillStatusQuery(e.target.value);
                }}
                label="BILL Status"
                sx={{
                  minWidth: "180px",
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="ORDER">ORDER</MenuItem>
                <MenuItem value="COMPLETE">COMPLETE</MenuItem>
                <MenuItem value="INTERNAL">INTERNAL</MenuItem>
                <MenuItem value="CANCEL">CANCEL</MenuItem>
              </TextField>
              <Box sx={{ height: "40px" }}>
                <DatePicker sx={{ height: "40px" }}
                  size="small"
                  label="Created Date"
                  value={createdDate} 
                  onChange={(newValue) => setCreatedDate(newValue)}
                />
              </Box>
              <Button variant="outlined" onClick={clearDateFilter}>
                Clear
              </Button>
            </Stack>
            <TextField
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Search All Fields"
              variant="outlined"
              value={generalQuery}
              onChange={(e) => setGeneralQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} p={2}>
          <DataGrid
            sx={{
              bgcolor: "background.default",
            }}
            rows={filteredCategories}
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

      {/* Dialog to update bill */}
      {selectedBillId && (
        <UpdateBill
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          user={user}
          bill={selectedBill}
        />
      )}
    </>
  );
};

export default BillDetailList;
