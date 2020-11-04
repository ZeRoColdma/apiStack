import Appointment from "../models/Appointment";
import User from "../models/User";

import { Op } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

class ScheduleController {
  async index(request, response) {
    const checkUserProvider = await User.findOne({
      where: { id: request.userId, provider: true },
    });

    if (!checkUserProvider) {
      return response
        .status(401)
        .json({ error: "Usuario nao é prestador de serviço" });
    }

    const { date } = request.query;
    const parserdDate = parseISO(date);

    const appointments = await Appointment.findAll({
      where: {
        provider_id: request.userId,
        canceled_ad: null,
        date: {
          [Op.between]: [startOfDay(parserdDate), endOfDay(parserdDate)],
        },
      },
      order: ["date"],
    });

    return response.json(appointments);
  }
}

export default new ScheduleController();
