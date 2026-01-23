import React, { useState } from "react";
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useSelector } from "react-redux";
import { createExpenseType, getAllActiveExpenseType } from "../../../services/SettingManagementService/ExpenseTypeService";
import { toast } from "react-toastify";

const CreateExpenseType = () => {
  const { user } = useSelector((state) => state.auth);

  let currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
  let day = ("0" + currentDate.getDate()).slice(-2);
  let formattedDate = `${year}-${month}-${day}`;

  const [formData, setFormData] = useState({
    typeName: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateInputs = async () => {
    let tempErrors = {};

    if (!formData.typeName.trim()) {
      tempErrors.typeName = "Type name is required";
    } else {
      const expenseTypeList = await getAllActiveExpenseType();
      const isDuplicate = expenseTypeList.some(
        (expenseType) => expenseType.typeName.toLowerCase() === formData.typeName.trim().toLowerCase()
      );

      if (isDuplicate) {
        tempErrors.typeName = "Type name already exists";
        toast.error("Type name already exists");
      }
    }

    if (!formData.description.trim()) {
      tempErrors.description = "Description is required";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const validationResult = await validateInputs();
    
    if (!validationResult) return;
    
    try {
      let formattedFormData = {
        ...formData,
        status: "A",
        createdBy: user.displayName,
        createdDate: formattedDate,
      };
      
      await createExpenseType(formattedFormData);
      window.location.href = "/setting/expenseType";
    } catch (error) {
      console.error("Error creating expense type:", error.message);
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
            Add Expense Type
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
                  placeholder="Enter type name"
                  sx={{ mt: 2 }}
                  error={!!errors.typeName}
                  helperText={errors.typeName}
                />
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
                  error={!!errors.description}
                  helperText={errors.description}
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
                Create
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CreateExpenseType;
