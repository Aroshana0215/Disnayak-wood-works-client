import { Box, CssBaseline } from "@mui/material";
import React from "react";
import { Outlet } from "react-router-dom";
import HeaderAuth from "../Components/Headers/HeaderAuth";

const AuthLayout = () => {
  return (
    <>
      <CssBaseline />
      <Box>
        <HeaderAuth />
        <Outlet />
      </Box>
    </>
  );
};

export default AuthLayout;
