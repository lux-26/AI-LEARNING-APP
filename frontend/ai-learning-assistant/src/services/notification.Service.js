import axiosInstance from "../utils/axiosInstance.js";
import { API_PATHS } from "../utils/apiPaths.js";

const getNotifications = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.NOTIFICATIONS.GET_ALL);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Impossible de charger les notifications.",
    };
  }
};

const markAllAsRead = async () => {
  try {
    const response = await axiosInstance.patch(
      API_PATHS.NOTIFICATIONS.MARK_ALL_READ,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: "Impossible de marquer les notifications comme lues.",
    };
  }
};

export default { getNotifications, markAllAsRead };
