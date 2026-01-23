import React from "react";
import { Box, Stack, AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import sawMillLogo from "../../assets/images/sawMillLogo.png";

export default function HeaderAuth() {
  const location = useLocation();
  const isInSignUp = location.pathname.includes("sign-up");
  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          boxShadow: 0,
          bgcolor: "background.default",
        }}
      >
        <Toolbar>
          <Box component={Link} to={"/"} paddingX={2}>
            <img alt="Logo" src={sawMillLogo} width={60} />
          </Box>

          <Stack
            spacing={3}
            direction={"row"}
            marginX={2}
            sx={{ display: { xs: "none", sm: "flex" }, mr: 1 }}
          >
            <Button
              variant="text"
              sx={{ color: "#111" }}
              //TODO:
              // component={Link}
              // to={"/where/to"}
            >
              About Us
            </Button>
            <Button
              variant="text"
              sx={{ color: "#111" }}
              //TODO:
              // component={Link}
              // to={"/where/to"}
            >
              Contact Us
            </Button>
          </Stack>
          <Typography component="div" sx={{ flexGrow: 1 }}></Typography>
          <Stack
            direction={"row"}
            justifyContent="center"
            alignItems="center"
            columnGap={2}
          >
            <Button
              variant="contained"
              component={Link}
              to={isInSignUp ? "/" : "/auth/sign-up"}
            >
              {isInSignUp ? "Sign In" : "Sign Up"}
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
    </>
  );
}
