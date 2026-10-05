import axiosInstance from "../utils/axiosInstance.js";
import { API_PATHS } from "../utils/apiPaths.js";

const login = async (email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Une erreur inconnue est survenue" };
  }
};

const register = async (username, email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Une erreur inconnue est survenue" };
  }
};

const getProfile = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Une erreur inconnue est survenue" };
  }
};

const updateProfile = async (userData) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.AUTH.UPDATE_PROFILE,
      userData,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Une erreur inconnue est survenue" };
  }
};

const changePassword = async (passwords) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AUTH.CHANGE_PASSWORD,
      passwords,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Une erreur inconnue est survenue" };
  }
};

const authService = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
};

export default authService;
