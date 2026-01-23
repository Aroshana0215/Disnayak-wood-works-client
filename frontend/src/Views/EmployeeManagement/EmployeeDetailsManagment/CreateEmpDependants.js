import React, { useState } from "react";
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  FormControl,
  Stack,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { newDependant } from "../../../services/EmployeeManagementService/EmployeeDependentService";

const EmpDependatnt = () => {
  const { user } = useSelector((state) => state.auth);
  const { eid } = useParams();

  let currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
  let day = ("0" + currentDate.getDate()).slice(-2);
  let formattedDate = `${year}-${month}-${day}`;

  const [formData, setFormData] = useState({
    name: { bpMD: 6 },
    nic: { bpMD: 6 },
    phoneNumber: { bpMD: 6 },
    relationship: { bpMD: 6 },
    dateOfBirth: { bpMD: 6 },
  });

  const [payload, setPayload] = useState({
    name: "",
    nic: "",
    phoneNumber: "",
    relationship: "",
    dateOfBirth: "",
    status: "A",
    createdBy: user.displayName,
    createdDate: formattedDate,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prevPayload) => ({
      ...prevPayload,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const combinedDateTime = new Date(payload.dateOfBirth);
    const newDependantPayload = {
      ...payload,
      eid_fk: eid,
      dateOfBirth: combinedDateTime,
    };

    try {
      const newDependantId = await newDependant(newDependantPayload);
      window.location.href = `/employee`;
    } catch (error) {
      console.error("Error creating dependent:", error.message);
    }
  };

  return (
    <Container>
      <Grid container direction="row" justifyContent="center" alignItems="stretch" spacing={2} p={2}>
        <Grid item xs={12}>
          <Typography variant="h4" color="primary" align="center">
            Create Dependent
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
            {Object.entries(formData).map(([key, item]) => (
              <Grid item key={key} xs={12} md={item.bpMD} padding={1}>
                <FormControl fullWidth>
                  <Typography>
                    {key.charAt(0).toUpperCase() +
                      key.slice(1).replace(/([A-Z])/g, " $1")}
                  </Typography>
                  <TextField
                    name={key}
                    value={payload[key]}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    type={
                      key === "dateOfBirth" ? "datetime-local" : "text"
                    }
                    InputLabelProps={{
                      shrink: key === "dateOfBirth",
                    }}
                    sx={{ mt: 2 }}
                  />
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
                Create Dependent
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EmpDependatnt;
