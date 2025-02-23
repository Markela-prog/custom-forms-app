import { getUserDashboardData } from "../repositories/dashboardRepository.js";

export const getDashboardService = async (userId) => {
  return getUserDashboardData(userId);
};
