import React from "react";
import { Grid, Stack } from "@mui/material";
import Alert from "@mui/material/Alert";
import CheckIcon from "@mui/icons-material/Check";

const ErrorAlert = ({ error }) => {
  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="center" alignItems="center">
            <Alert icon={<CheckIcon fontSize="inherit" />} severity="error">
              {error}
            </Alert>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};

export default ErrorAlert;
