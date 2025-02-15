export const checkAnswerAccess = async (req, res, next) => {
  const user = req.user;

  if (user.role !== "ADMIN") {
    return res.status(403).json({ message: "Only admin can manage answers" });
  }

  next();
};
