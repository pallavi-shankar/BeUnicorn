import mongoose from "mongoose";
import User from "../models/User.js";
import WalletTransaction from "../models/WalletTransaction.js";
import createNotification from "../utils/createNotification.js";
import {
  createWalletTransaction,
  getWalletBalance,
} from "../utils/wallet.js";

const formatTransaction = (transaction) => ({
  id: transaction._id,
  userId: transaction.userId,
  type: transaction.type,
  direction: transaction.direction,
  amount: transaction.amount,
  description: transaction.description,
  bookingId: transaction.bookingId,
  actorId: transaction.actorId,
  source: transaction.source,
  reason: transaction.reason,
  createdAt: transaction.createdAt,
});

export const getMyWallet = async (req, res) => {
  try {
    const balance = await getWalletBalance(req.user._id);

    const transactions = await WalletTransaction.find({
      userId: req.user._id,
    })
      .populate("actorId", "name email role")
      .populate({
        path: "bookingId",
        select: "bookingDate startTime endTime status amount roomId",
        populate: {
          path: "roomId",
          select: "name type imageUrl",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      balance,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wallet details.",
      error: error.message,
    });
  }
};

export const getUserWalletByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(userId).select(
      "name email phone role companyName status"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const balance = await getWalletBalance(user._id);

    const transactions = await WalletTransaction.find({
      userId: user._id,
    })
      .populate("actorId", "name email role")
      .populate({
        path: "bookingId",
        select: "bookingDate startTime endTime status amount roomId",
        populate: {
          path: "roomId",
          select: "name type imageUrl",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      user,
      balance,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user wallet.",
      error: error.message,
    });
  }
};

export const adminAdjustWallet = async (req, res) => {
  try {
    const { userId, direction, amount, reason } = req.body;

    if (!userId || !direction || !amount || !reason) {
      return res.status(400).json({
        success: false,
        message: "User, direction, amount and reason are required.",
      });
    }

    if (!["credit", "debit"].includes(direction)) {
      return res.status(400).json({
        success: false,
        message: "Direction must be credit or debit.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const cleanAmount = Number(amount);

    if (Number.isNaN(cleanAmount) || cleanAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero.",
      });
    }

    if (direction === "debit") {
      const currentBalance = await getWalletBalance(user._id);

      if (currentBalance < cleanAmount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient wallet balance. Current balance is ₹${currentBalance}.`,
        });
      }
    }

    const transaction = await createWalletTransaction({
      userId: user._id,
      type:
        direction === "credit"
          ? "admin_adjustment_credit"
          : "admin_adjustment_debit",
      direction,
      amount: cleanAmount,
      description:
        direction === "credit"
          ? `Admin credited ₹${cleanAmount}`
          : `Admin debited ₹${cleanAmount}`,
      actorId: req.user._id,
      source: "admin",
      reason,
    });

    await createNotification({
      recipientId: user._id,
      actorId: req.user._id,
      title:
        direction === "credit"
          ? "Wallet Credited"
          : "Wallet Debited",
      message:
        direction === "credit"
          ? `₹${cleanAmount} has been credited to your wallet. Reason: ${reason}`
          : `₹${cleanAmount} has been debited from your wallet. Reason: ${reason}`,
      type: "wallet",
    });

    const balance = await getWalletBalance(user._id);

    return res.status(201).json({
      success: true,
      message: "Wallet adjustment completed successfully.",
      balance,
      transaction: formatTransaction(transaction),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to adjust wallet.",
      error: error.message,
    });
  }
};

export const getAllWalletTransactionsByAdmin = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find()
      .populate("userId", "name email phone role companyName")
      .populate("actorId", "name email role")
      .populate({
        path: "bookingId",
        select: "bookingDate startTime endTime status amount roomId",
        populate: {
          path: "roomId",
          select: "name type imageUrl",
        },
      })
      .sort({ createdAt: -1 });

    const totalCreditAgg = await WalletTransaction.aggregate([
      { $match: { direction: "credit" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalDebitAgg = await WalletTransaction.aggregate([
      { $match: { direction: "debit" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalCredit = totalCreditAgg?.[0]?.total || 0;
    const totalDebit = totalDebitAgg?.[0]?.total || 0;

    return res.status(200).json({
      success: true,
      count: transactions.length,
      totalCredit,
      totalDebit,
      netBalance: totalCredit - totalDebit,
      transactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wallet transactions.",
      error: error.message,
    });
  }
};