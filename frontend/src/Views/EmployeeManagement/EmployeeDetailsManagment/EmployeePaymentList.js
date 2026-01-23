import React, { useState, useEffect } from 'react';
import { getPaysheetDetailsByEmployee } from '../../../services/EmployeeManagementService/EmployeePaySheetService';
import {
  Button,
  Grid,
  Stack,
  Typography,
  InputAdornment,
  TextField,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Loading from '../../../Components/Progress/Loading';
import ErrorAlert from '../../../Components/Alert/ErrorAlert';

const EPaymentList = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generalQuery, setGeneralQuery] = useState('');
  const { eid } = useParams();

  const formatDateOfBirth = (dateObject) => {
    const date = new Date(dateObject.seconds * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const columns = [
    { field: 'paySheetID', headerName: 'ID', width: 90 },
    {
      field: 'fromDate',
      headerName: 'From Date',
      width: 150,
      renderCell: ({ row }) => formatDateOfBirth(row.fromDate),
    },
    {
      field: 'toDate',
      headerName: 'To Date',
      width: 150,
      renderCell: ({ row }) => formatDateOfBirth(row.toDate),
    },
    { field: 'paymentStatus', headerName: 'Payment Status', width: 150 },
    { field: 'employeeName', headerName: 'Employee Name', width: 160 },
    { field: 'totalPayment', headerName: 'Total Payment', width: 150 },
    { field: 'totalAdvance', headerName: 'Total Advance', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <Tooltip title="View Paysheet Details">
          <IconButton
            component={Link}
            to={`/payment/view/${row.id}`}
            color="info"
            size="small"
            sx={{
              backgroundColor: '#E3F2FD',
              '&:hover': { backgroundColor: '#BBDEFB' },
            }}
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPaysheetDetailsByEmployee(eid);
        console.log('Fetched data:', data);
        if (Array.isArray(data)) {
          setCategories(data);
          setFilteredCategories(data);
          setLoading(false);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [eid]);

  useEffect(() => {
    handleSearch();
  }, [generalQuery]);

  const handleSearch = () => {
    const lowercasedGeneralQuery = generalQuery.toLowerCase();
    const filteredData = categories.filter((category) =>
      Object.values(category).some((value) =>
        String(value).toLowerCase().includes(lowercasedGeneralQuery)
      )
    );
    setFilteredCategories(filteredData);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
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
        <Grid item xs={12} p={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold" color="primary">
              Employee Payment Details
            </Typography>
            <Button
              variant="contained"
              startIcon={<MonetizationOnIcon />}
              component={Link}
              to={`/employee/payment/add/${eid}`}
              sx={{
                padding: '6px 16px',
                backgroundColor: '#43A047',
                '&:hover': { backgroundColor: '#388E3C' },
              }}
            >
              Process Payment
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
              bgcolor: 'background.default',
              borderRadius: 1,
              border: '1px solid rgba(0, 0, 0, 0.12)',
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

        <Grid item xs={12} p={2}>
          <DataGrid
            sx={{
              bgcolor: 'background.default',
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#f5f5f5',
              },
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
    </>
  );
};

export default EPaymentList;
