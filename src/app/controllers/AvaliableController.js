import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from "date-fns";
import { Op } from "sequelize";

import Appointment from "../models/Appointment";

class AvailableController {
  async index(request, response) {
    const { date } = request.query;

    if (!date) {
      return response.status(401).json({ erro: "Data invalida" });
    }

    const searchDate = Number(date);

    const appointment = await Appointment.findAll({
      where: {
        provider_id: request.params.providerId,
        canceled_ad: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    const schelude = [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
      "22:00",
      "23:00",
      "00:00",
    ];

    const avaliable = schelude.map((time) => {
      const [hour, minute] = time.split(":");
      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minute),
        0
      );

      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        avaliable:
          isAfter(value, new Date()) &&
          !appointments.find((a) => format(a.date, "HH:mm" === time)),
      };
    });

    return response.json(avaliable);
  }
}

export default new AvailableController();
