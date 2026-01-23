import React, { useState, useEffect } from 'react';
import { getAllemployeeDetails } from '../../../services/EmployeeManagementService/EmployeeDetailService';
import { Avatar, Stack, Typography, InputAdornment, TextField, Grid, Button, Chip, Box, Tooltip, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import Loading from "../../../Components/Progress/Loading";
import ErrorAlert from "../../../Components/Alert/ErrorAlert";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";
import PaymentIcon from "@mui/icons-material/Payment";
import VisibilityIcon from "@mui/icons-material/Visibility";

const EmployeeList = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generalQuery, setGeneralQuery] = useState("");

const columns = [
  { field: "empID", headerName: "ID", width: 90 },
  { 
    field: "firstName", 
    headerName: "First Name", 
    width: 150,
    renderCell: ({ value }) => (
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          width: "100%", 
          height: "100%", 
          paddingTop: "2px"
        }}
      >
        <Typography fontWeight="bold">{value}</Typography>
      </Box>
    ),
    align: "center",
    headerAlign: "center",
  },
  { field: "lastName", headerName: "Last Name", width: 120 },
  { field: "phoneNo", headerName: "Phone No", width: 120 },
  {
    field: "salaryPerDay",
    headerName: "Salary (RS:)",
    width: 130,
    renderCell: ({ row }) => `${row.salaryPerDay}.00`,
  },
  { field: "createdBy", headerName: "Created By", width: 120 },
  {
    field: "employeeImage",
    headerName: "Image",
    width: 100,
    renderCell: ({ row }) => (
      <Box sx={{ paddingTop: "5px", paddingLeft: "20px" }}> 
        <Avatar
          src={row.employeeImage || "/default-profile.png"} // Default image if empty
          alt="Employee"
          sx={{ width: 40, height: 40, border: "1px solid #ddd" }}
        />
      </Box>
    ),
    align: "center",
    headerAlign: "center",
  },,  
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: ({ row }) => {
      let chipProps = { label: row.status === "A" ? "Active" : "Inactive", size: "small", variant: "outlined" };
  
      if (row.status === "A") {
        chipProps = { 
          ...chipProps, 
          sx: { borderColor: "#66BB6A", color: "#1B5E20", backgroundColor: "#C8E6C9" } // Green for Active
        };
      } else {
        chipProps = { 
          ...chipProps, 
          sx: { borderColor: "#E57373", color: "#C62828", backgroundColor: "#FFCDD2" } // Red for Inactive
        };
      }
  
      return <Chip {...chipProps} />;
    }
  },
  {
    field: "actions",
    headerName: "Actions",
    renderCell: ({ row }) => {
      const isInactive = row.status !== "A";
  
      return (
        <Box sx={{ display: "flex", gap: 1, marginTop: "4px" }}>
          {/* Payment Button with Tooltip */}
          <Tooltip title="Make Payment">
            <span>
              <IconButton
                component={Link}
                to={`/employee/payment/${row.id}`}
                color="success"
                size="medium"
                disabled={isInactive}
                sx={{
                  "&:hover": { backgroundColor: "#C8E6C9" },
                }}
              >
                <PaymentIcon />
              </IconButton>
            </span>
          </Tooltip>
  
          {/* View Button with Tooltip */}
          <Tooltip title="View Details">
            <span>
              <IconButton
                component={Link}
                to={`/employee/view/${row.id}`}
                color="info"
                size="medium"
                sx={{
                  borderRadius: "50%",
                  backgroundColor: "#E3F2FD",
                  "&:hover": { backgroundColor: "#BBDEFB" },
                }}
              >
                <VisibilityIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      );
    }
  }  
  
];


  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllemployeeDetails();
        console.log("Fetched data:", data);
        if (Array.isArray(data)) {
          setCategories(data);
          setFilteredCategories(data);
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
    const lowercasedGeneralQuery = generalQuery.toLowerCase();
    const filteredData = categories.filter(category =>
      Object.values(category).some(value =>
        String(value).toLowerCase().includes(lowercasedGeneralQuery)
      )
    );
    setFilteredCategories(filteredData);
  };

  useEffect(() => {
    handleSearch();
  }, [generalQuery]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
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
        <Grid item xs={12} p={1}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight="bold" color="primary">
              Employee Details
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              component={Link}
              to={"/employee/add"}
              sx={{ padding: "5px 15px", height: "45px" }}
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

        <Grid item xs={12} p={1}>
          <DataGrid
            sx={{ bgcolor: "background.default" }}
            rows={filteredCategories}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 8 },
              },
            }}
            pageSizeOptions={[8]}
            disableRowSelectionOnClick
          />
        </Grid>
      </Grid>
    </>
  );
};

export default EmployeeList;