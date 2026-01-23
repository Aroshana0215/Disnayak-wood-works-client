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
import { createTimberNature, getAllActiveTimberNature } from "../../../services/SettingManagementService/TimberNatureService";
import { toast } from "react-toastify";

const CreateTimberNature = () => {
  const { user } = useSelector((state) => state.auth);

  let currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
  let day = ("0" + currentDate.getDate()).slice(-2);
  let formattedDate = `${year}-${month}-${day}`;

  const [formData, setFormData] = useState({
    natureName: "",
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

    if (!formData.natureName.trim()) {
      tempErrors.natureName = "Nature name is required";
    } else {
      const timberNatureList = await getAllActiveTimberNature();
      const isDuplicate = timberNatureList.some(
        (timberNature) => timberNature.natureName.toLowerCase() === formData.natureName.trim().toLowerCase()
      );

      if (isDuplicate) {
        tempErrors.natureName = "Nature name already exists";
        toast.error("Nature name already exists");
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
      
      await createTimberNature(formattedFormData);
      window.location.href = "/setting/timberNature";
    } catch (error) {
      console.error("Error creating timber nature:", error.message);
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
            Add Timber Nature
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
                <InputLabel shrink htmlFor="natureName">
                  Nature Name
                </InputLabel>
                <TextField
                  id="natureName"
                  name="natureName"
                  value={formData.natureName}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  placeholder="Enter nature name"
                  sx={{ mt: 2 }}
                  error={!!errors.natureName}
                  helperText={errors.natureName}
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

export default CreateTimberNature;
