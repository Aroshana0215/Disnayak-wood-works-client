import React from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Stack,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { Link } from "react-router-dom";
import { isValidLogin } from "../../utils/validate";
import { useDispatch } from "react-redux";
import { login } from "../../Redux/features/auth/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const [error, setError] = React.useState({});
  const [payload, setPayload] = React.useState({
    email: "",
    password: "",
  });
  const onChangeInput = (e) => {
    setError({ ...error, [e.target.name]: false });
    setPayload({
      ...payload,
      [e.target.name]: e.target.value,
    });
  };
  const onClickLogin = (e) => {
    e.preventDefault();
    if (!isValidLogin(payload, error, setError)) {
      return;
    } else {
      dispatch(login(payload));
    }
  };
  return (
    <Container>
      <Card sx={{ maxWidth: 400, mx: "auto", mt: 5 }}>
        <CardContent>
          <Typography
            variant="h5"
            component="div"
            sx={{ textAlign: "center", mb: 2 }}
          >
            Welcome back
          </Typography>
          <Typography variant="subtitle1" sx={{ textAlign: "center", mb: 2 }}>
            Glad to see you again 👋
          </Typography>
          <Button
            variant="contained"
            startIcon={<GoogleIcon />}
            fullWidth
            sx={{ mb: 2 }}
          >
            Continue with Google
          </Button>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            name="email"
            error={error.email}
            helperText={error.email ? error.email : " "}
            onChange={(e) => onChangeInput(e)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            name="password"
            error={error.password}
            helperText={error.password ? error.password : " "}
            onChange={(e) => onChangeInput(e)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={(e) => onClickLogin(e)}
          >
            Login
          </Button>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={1}
            mt={2}
          >
            <Typography variant="body2" sx={{ textAlign: "center" }}>
              Don't have an account?
            </Typography>
            <Typography
              component={Link}
              to={"/auth/sign-up"}
              variant="body2"
              sx={{ textAlign: "center", textDecoration: "none" }}
            >
              Sign up
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;
