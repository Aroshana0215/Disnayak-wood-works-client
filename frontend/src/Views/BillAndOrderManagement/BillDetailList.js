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
import UpdateBillAdvance from './UpdateBillAdvance'; // Import the dialog component
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

  const formatLocalDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

  const columns = [
    { field: "billID", headerName: "ID", width: 90 },
    { field: "billBookNo", headerName: "Bill No", width: 80 },
    { field: "cusName", headerName: "Customer Name", width: 140 },
    {
      field: "totalAmount",
      headerName: "Total (RS:)",
      width: 130,
      renderCell: ({ row }) => {
        const formattedAmount = new Intl.NumberFormat('en-GB', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(row.totalAmount);

        return formattedAmount;
      },
    },
    {
      field: "advance",
      headerName: "Advance (RS:)",
      width: 130,
      renderCell: ({ row }) => {
        const formattedAmount = new Intl.NumberFormat('en-GB', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(row.advance);

        return formattedAmount;
      },
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
    {
      field: "billCreatedDate",
      headerName: "Bill Date",
      width: 140,
      renderCell: ({ row }) => {
        if (!row.billCreatedDate || !row.billCreatedDate.seconds) {
          return "N/A"; // Fallback in case the date is missing or improperly formatted
        }

        // Convert timestamp (seconds) to Date object
        const date = new Date(row.billCreatedDate.seconds * 1000); // Convert seconds to milliseconds
        const formattedDate = date.toLocaleString('en-GB', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        return formattedDate; // Output: "01/10/2023, 23:39:00"
      },
    },
    {
      field: "time",
      headerName: "Time",
      width: 100,
      renderCell: ({ row }) => {
        // Extract time (HH:MM) from 'billCreatedDate'
        if (!row.billCreatedDate || !row.billCreatedDate.seconds) {
          return "N/A"; // Fallback if timestamp is missing
        }

        const date = new Date(row.billCreatedDate.seconds * 1000); // Convert seconds to milliseconds
        const hours = String(date.getHours()).padStart(2, '0'); // Add leading zero if needed
        const minutes = String(date.getMinutes()).padStart(2, '0'); // Add leading zero if needed
        return `${hours}:${minutes}`; // Output: "23:39"
      },
    },
    { field: "createdBy", headerName: "Created By", width: 100 },
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
      const selectedDateStr = formatLocalDate(createdDate);

      filteredData = filteredData.filter((category) => {
        const categoryDateStr = formatLocalDate(
          category.billCreatedDate?.toDate()
        );

        return categoryDateStr === selectedDateStr;
        const categoryDate = category.billCreatedDate?.toDate().toISOString().split('T')[0];
        const selectedDate = createdDate.toISOString().split('T')[0];

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
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#9C6B3D" }}>
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
                  label="Bill date"
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

      {/* Dialog to update bill (updateAdvance)*/}
      {selectedBillId && (
        <UpdateBillAdvance
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
