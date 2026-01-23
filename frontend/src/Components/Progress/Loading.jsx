import { CircularProgress, Grid, Stack } from "@mui/material";
import React from "react";

const Loading = () => {
  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};

export default Loading;
