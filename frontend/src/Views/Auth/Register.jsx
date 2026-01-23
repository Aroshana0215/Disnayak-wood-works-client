import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Stack,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { register } from "../../Redux/features/auth/authSlice";

const Register = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setErrors({});
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length === 0) {
      dispatch(register(formData));
      console.log("Form submitted successfully!");
    } else {
      setErrors(validationErrors);
    }
  };

  const validate = (data) => {
    const errors = {};
    if (!data.fullName.trim()) {
      errors.fullName = "Full Name is required";
    }
    if (!data.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Email is invalid";
    }
    if (!data.phoneNumber.trim()) {
      errors.phoneNumber = "Phone Number is required";
    }
    if (!data.password.trim()) {
      errors.password = "Password is required";
    }
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    return errors;
  };

  return (
    <Container>
      <Card sx={{ maxWidth: 500, mx: "auto", mt: 5 }}>
        <CardContent>
          <Typography
            variant="h5"
            component="div"
            sx={{ textAlign: "center", mb: 3 }}
          >
            Sign up
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Full Name"
                  variant="outlined"
                  fullWidth
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  variant="outlined"
                  fullWidth
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Confirm Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                />
              </Grid>
            </Grid>
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={1}
              mt={2}
            >
              <Button variant="outlined" fullWidth component={Link} to="/">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Confirm
              </Button>
            </Stack>
          </form>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={1}
            mt={2}
          >
            <Typography variant="body2" sx={{ textAlign: "center" }}>
              Already have an account?
            </Typography>
            <Typography
              component={Link}
              to={"/auth/sign-in"}
              variant="body2"
              sx={{ textAlign: "center", textDecoration: "none" }}
            >
              Sign In
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register;
