import Notification from "../schemas/Notification";
import User from "../models/User";

class NotificationController {
  async index(request, response) {
    const isProvider = await User.findOne({
      where: { id: request.userId, provider: true },
    });

    if (!isProvider) {
      return respone.status(401).json({
        error: "Apenas prestadores de serviço podem carregar notificaçoes",
      });
    }

    const notifications = await Notification.find({
      user: request.userId,
    })
      .sort({ createdAt: "desc" })
      .limit(20);

    return response.json(notifications);
  }

  async update(request, response) {
    const notification = await Notification.findByIdAndUpdate(
      request.params.id,
      { reader: true },
      { new: true }
    );

    return response.json(notification);
  }
}

export default new NotificationController();
