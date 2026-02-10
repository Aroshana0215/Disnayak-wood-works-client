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
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getincomeById, updateincome } from "../../../services/AccountManagementService/IncomeManagmentService";
import { getAllActiveIncomeType } from "../../../services/SettingManagementService/IncomeTypeService";

const UpdateIncome = () => {
  const { user } = useSelector((state) => state.auth);
  const { incomeId } = useParams(); // Get income ID from URL params
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: "",
    type: "",
    des: "",
    amount: "",
  });

  const [incomeTypes, setIncomeTypes] = useState([]);

  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        const incomeData = await getincomeById(incomeId);
        setFormData({
          date: incomeData.date,
          type: incomeData.type,
          des: incomeData.des,
          amount: incomeData.amount,
        }); // Populate form with existing data for the fields we want to update
      } catch (error) {
        console.error("Error fetching income data:", error.message);
      }
    };

    const fetchIncomeTypes = async () => {
      try {
        const response = await getAllActiveIncomeType();
        setIncomeTypes(response || []);
      } catch (error) {
        console.error("Error fetching income types:", error.message);
      }
    };

    fetchIncomeData();
    fetchIncomeTypes();
  }, [incomeId]);

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
      const updatedData = {
        ...formData, // Only include fields that are updated
        status: "A",
        modifiedBy: user.displayName,
      };

      await updateincome(incomeId, updatedData); // Update the income with the new data

      navigate("/income"); // Redirect back to income list
    } catch (error) {
      console.error("Error updating income:", error.message);
    }
  };

  return (
    <Container>
      <Grid container direction="row" justifyContent="center" alignItems="stretch" spacing={2} p={2}>
        <Grid item xs={12}>
          <Typography variant="h4" color="primary" align="center">
            Update Income
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
            {/* Loop over only the fields we want to update */}
            {["date", "type", "des", "amount"].map((key) => (
              <Grid item key={key} xs={12} padding={1}>
                <FormControl fullWidth>
                  <Typography>
                    {key.charAt(0).toUpperCase() +
                      key.slice(1).replace(/([A-Z])/g, " $1")}
                  </Typography>
                  {key === "type" ? (
                    <FormControl fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                        variant="outlined"
                        fullWidth
                      >
                        {incomeTypes.map((type) => (
                          <MenuItem key={type.id} value={type.typeName}>
                            {type.typeName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      name={key}
                      value={formData[key]}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                      type={key === "date" ? "date" : "text"}
                      InputLabelProps={{
                        shrink: key === "date",
                      }}
                      sx={{ mt: 2 }}
                    />
                  )}
                </FormControl>
              </Grid>
            ))}

            <Grid
              item
              xs={12}
              padding={2}
              sx={{
                display: "flex",
                direction: "row",
                justifyContent: "flex-end",
                alignItems: "flex-end",
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

export default UpdateIncome;
