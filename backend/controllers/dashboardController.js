import { getDashboardService } from "../services/dashboardService.js";
import { handleError } from "../utils/errorHandler.js";

export const getDashboard = async (req, res) => {
  try {
    const dashboardData = await getDashboardService(req.user.id);
    res.json(dashboardData);
  } catch (error) {
    handleError(res, error.message, 500);
  }
};
