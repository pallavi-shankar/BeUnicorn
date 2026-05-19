import WalletTransaction from "../models/WalletTransaction.js";

export const getWalletBalance = async (userId) => {
  const result = await WalletTransaction.aggregate([
    {
      $match: {
        userId: userId,
      },
    },
    {
      $group: {
        _id: "$direction",
        total: { $sum: "$amount" },
      },
    },
  ]);

  const credits =
    result.find((item) => item._id === "credit")?.total || 0;

  const debits =
    result.find((item) => item._id === "debit")?.total || 0;

  return credits - debits;
};

export const createWalletTransaction = async ({
  userId,
  type,
  direction,
  amount,
  description,
  bookingId = null,
  actorId = null,
  source = "system",
  reason = "",
}) => {
  if (!userId || !type || !direction || amount === undefined || !description) {
    throw new Error("Missing required wallet transaction fields.");
  }

  if (!["credit", "debit"].includes(direction)) {
    throw new Error("Invalid wallet transaction direction.");
  }

  const cleanAmount = Number(amount);

  if (Number.isNaN(cleanAmount) || cleanAmount <= 0) {
    throw new Error("Wallet transaction amount must be greater than zero.");
  }

  const transaction = await WalletTransaction.create({
    userId,
    type,
    direction,
    amount: cleanAmount,
    description,
    bookingId,
    actorId,
    source,
    reason,
  });

  return transaction;
};

export const hasSufficientWalletBalance = async (userId, amount) => {
  const balance = await getWalletBalance(userId);
  return balance >= Number(amount);
};