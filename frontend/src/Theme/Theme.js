import { createTheme } from "@mui/material/styles";

const Theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      xsm: 300,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    primary: {
      main: "#0d66e4",
      mainBgS1: "#f9f9f9",
    },
    background: {
      default: "#fff",
    },
  },
  typography: {
    fontFamily: "Poppins",
    button: {
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: "#f9f9f9",
        },
      },
    },
    // MuiListItemButton: {
    //   styleOverrides: {
    //     root: {
    //       "&:hover": {
    //         backgroundColor: "transparent",
    //       },
    //     },
    //   },
    // },
  },
});

export default Theme;
