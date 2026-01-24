import { Container, Grid, Stack, Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
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
        <Grid item>
          <Typography variant="h4"   sx={{ color: "#5A2E1A", fontWeight: 600,letterSpacing: "0.5px",}} >
            Welcome
          </Typography>
        </Grid>
      </Grid>
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        p={2}
      >
        <Grid item xs={12} sm={6} md={4} padding={2}>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            component={Link}
            to={"/price"}
            padding={2}
            sx={{
              textDecoration: "none",
              bgcolor: "background.default",
              borderRadius: 4,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={{ color: "#9C6B3D" }} align="center">
              Price card
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6} md={4} padding={2}>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            component={Link}
            to={"/load"}
            padding={2}
            sx={{
              textDecoration: "none",
              bgcolor: "background.default",
              borderRadius: 4,
            }}
          >
            <Typography variant="h6" sx={{ color: "#9C6B3D" }}>
              Load Management
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6} md={4} padding={2}>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            component={Link}
            to={"/stock"}
            padding={2}
            sx={{
              textDecoration: "none",
              bgcolor: "background.default",
              borderRadius: 4,
            }}
          >
            <Typography variant="h6" sx={{ color: "#9C6B3D" }}>
              Stock Management
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6} md={4} padding={2}>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            component={Link}
            to={"/bill"}
            padding={2}
            sx={{
              textDecoration: "none",
              bgcolor: "background.default",
              borderRadius: 4,
            }}
          >
            <Typography variant="h6" sx={{ color: "#9C6B3D" }}>
              Bill and Order Management
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6} md={4} padding={2}>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            component={Link}
            to={"/employee"}
            padding={2}
            sx={{
              textDecoration: "none",
              bgcolor: "background.default",
              borderRadius: 4,
            }}
          >
            <Typography variant="h6" sx={{ color: "#9C6B3D" }}>
              Employee Management
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6} md={4} padding={2}>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            component={Link}
            to={"/employee/daily"}
            padding={2}
            sx={{
              textDecoration: "none",
              bgcolor: "background.default",
              borderRadius: 4,
            }}
          >
            <Typography variant="h6" sx={{ color: "#9C6B3D" }}>
              Employee Daily Records
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6} md={4} padding={2}>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            component={Link}
            to={"/income"}
            padding={2}
            sx={{
              textDecoration: "none",
              bgcolor: "background.default",
              borderRadius: 4,
            }}
          >
            <Typography variant="h6" sx={{ color: "#9C6B3D" }}>
              Income Management
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6} md={4} padding={2}>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            component={Link}
            to={"/exp"}
            padding={2}
            sx={{
              textDecoration: "none",
              bgcolor: "background.default",
              borderRadius: 4,
            }}
          >
            <Typography variant="h6" sx={{ color: "#9C6B3D" }}>
              Expenses Management
            </Typography>
          </Stack>
        </Grid>
                <Grid item xs={12} sm={6} md={4} padding={2}>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            component={Link}
            to={"/cubicCalc"}
            padding={2}
            sx={{
              textDecoration: "none",
              bgcolor: "background.default",
              borderRadius: 4,
            }}
          >
            <Typography variant="h6" sx={{ color: "#9C6B3D" }}>
              Cubic Calculator
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Landing;
