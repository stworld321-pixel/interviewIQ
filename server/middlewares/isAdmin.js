import User from "../models/user.model.js";

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("role email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const userEmail = user.email?.trim().toLowerCase();

    // Auto-heal role when ADMIN_EMAIL is configured after user was created.
    if (user.role !== "admin" && adminEmail && userEmail === adminEmail) {
      user.role = "admin";
      await user.save();
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required for this account" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: `isAdmin error ${error}` });
  }
};

export default isAdmin;
