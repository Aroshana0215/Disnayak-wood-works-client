import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    getExpenseTypeDocumentById,
    updateExpenseType,
} from "../../../services/SettingManagementService/ExpenseTypeService";

const UpdateExpenseType = () => {
  const { expenseTypeId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    status: "",
    typeName: "",
    description: "",
  });

  let currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
  let day = ("0" + currentDate.getDate()).slice(-2);
  let formattedDate = `${year}-${month}-${day}`;


  useEffect(() => {
    const fetchTreeType = async () => {
      try {
        const expenseTypeData = await getExpenseTypeDocumentById(expenseTypeId);
        console.log("expenseTypeData:", expenseTypeData);
        setFormData({
          typeName: expenseTypeData.typeName,
          description: expenseTypeData.description,
          status: expenseTypeData.status,
        });
      } catch (error) {
        console.error("Error fetching expense type data:", error);
      }
    };
    fetchTreeType();
  }, [expenseTypeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const updatedFormData = {
        ...formData,
        modifiedBy: user.displayName,
        modifiedDate: formattedDate,
      };
      await updateExpenseType(expenseTypeId, updatedFormData);
      navigate("/setting/expenseType"); // Redirect to tree type listing after successful update
    } catch (error) {
      console.error("Error updating expense type:", error.message);
    }
  };

  return (
    <Container>
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={2}
        p={2}
      >
        <Grid item xs={12}>
          <Typography variant="h4" color="primary" align="center">
            Update expense type
          </Typography>
        </Grid>
        <Grid item xs={12}>
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
              <FormControl fullWidth>
                <InputLabel shrink htmlFor="typeName">
                  Type Name
                </InputLabel>
                <TextField
                  id="typeName"
                  name="typeName"
                  value={formData.typeName}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  placeholder="Enter tree type name"
                  sx={{ mt: 2 }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} padding={1}>
              <FormControl fullWidth>
                <InputLabel shrink htmlFor="status">
                  Status
                </InputLabel>
                <Select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  <MenuItem value="A">A</MenuItem>
                  <MenuItem value="D">D</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} padding={1}>
              <FormControl fullWidth>
                <InputLabel shrink htmlFor="description">
                  Description
                </InputLabel>
                <TextField
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Enter description"
                  sx={{ mt: 2 }}
                />
              </FormControl>
            </Grid>
            <Grid
              item
              xs={12}
              padding={2}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button type="submit" variant="contained" color="primary">
                Update
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UpdateExpenseType;
