import React from "react";
import ReactDOM from "react-dom/client";
import "react-toastify/dist/ReactToastify.css";
import "typeface-poppins";
import Router from "./Routes/routes";
import Theme from "./Theme/Theme";
import { ThemeProvider } from "@mui/material";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { store } from "./Redux/store.js";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ToastContainer />
    <ThemeProvider theme={Theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Provider store={store}>
          <Router />
        </Provider>
      </LocalizationProvider>
    </ThemeProvider>
  </React.StrictMode>
);
