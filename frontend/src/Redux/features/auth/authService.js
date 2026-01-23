import { signIn, signUp } from "../../../services/AuthService";

// Register user
const register = async (payload) => {
  const user = await signUp(payload);
  localStorage.setItem("user", JSON.stringify(user));

  return user;
};

// Login user
const login = async (payload) => {
  const user = await signIn(payload);
  localStorage.setItem("user", JSON.stringify(user));
  return user;
};

const updateUserInfo = async (payload) => {
  const user = JSON.parse(localStorage.getItem("user"));

  Object.keys(payload).forEach((key) => {
    const uppercaseKey = key.toUpperCase();
    if (user.hasOwnProperty(uppercaseKey)) {
      user[uppercaseKey] = payload[key];
    }
  });
  localStorage.setItem("user", JSON.stringify(user));

  return user;
};

// Logout user
const logout = () => {
  localStorage.removeItem("user");
};

const authService = {
  register,
  logout,
  login,
  updateUserInfo,
};

export default authService;
