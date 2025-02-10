import { getUserDashboardData } from "../repositories/dashboardRepository.js";
import { handleError } from "../utils/errorHandler.js";

export const getDashboardService = async (userId) => {
  return getUserDashboardData(userId);
};
