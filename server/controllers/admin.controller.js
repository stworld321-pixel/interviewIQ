import User from "../models/user.model.js";
import Payment from "../models/payment.model.js";
import Interview from "../models/interview.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalAdmins, totalInterviews, paidPayments] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      Interview.countDocuments(),
      Payment.find({ status: "paid" }).select("amount credits"),
    ]);

    const totalRevenue = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalCreditsSold = paidPayments.reduce((sum, p) => sum + (p.credits || 0), 0);

    return res.status(200).json({
      totalUsers,
      totalAdmins,
      totalInterviews,
      totalPayments: paidPayments.length,
      totalRevenue,
      totalCreditsSold,
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to load dashboard stats ${error}` });
  }
};

export const getEarningsOverview = async (req, res) => {
  try {
    const monthly = await Payment.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$amount" },
          payments: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const recentPayments = await Payment.find({ status: "paid" })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("userId", "name email");

    return res.status(200).json({
      monthly: monthly.map((m) => ({
        label: `${m._id.month}/${m._id.year}`,
        revenue: m.revenue,
        payments: m.payments,
      })),
      recentPayments,
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to load earnings overview ${error}` });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email role authType credits createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get users ${error}` });
  }
};

export const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { credits, role } = req.body;

    const updateData = {};

    if (typeof credits === "number" && credits >= 0) {
      updateData.credits = credits;
    }

    if (role && ["user", "admin"].includes(role)) {
      updateData.role = role;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select(
      "name email role authType credits createdAt"
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: `Failed to update user ${error}` });
  }
};

export const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === String(req.userId)) {
      return res.status(400).json({ message: "Admin cannot delete own account" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Failed to delete user ${error}` });
  }
};
