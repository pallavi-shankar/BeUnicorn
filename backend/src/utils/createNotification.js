import Notification from "../models/Notification.js";

const createNotification = async ({
  recipientId,
  actorId = null,
  title,
  message,
  type = "system",
  bookingId = null,
}) => {
  try {
    if (!recipientId || !title || !message) {
      return null;
    }

    const notification = await Notification.create({
      recipientId,
      actorId,
      title,
      message,
      type,
      bookingId,
    });

    return notification;
  } catch (error) {
    console.error("Notification creation failed:", error.message);
    return null;
  }
};

export default createNotification;