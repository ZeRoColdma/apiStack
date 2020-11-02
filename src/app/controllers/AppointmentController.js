import Appointment from "../models/Appointment";
import * as Yup from "yup";
import User from "../models/User";
import { startOfHour, parseISO, isBefore } from "date-fns";

class AppointmentController {
  async store(request, response) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: "Validation Fails" });
    }

    const { provider_id, date } = request.body;

    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return response.status(401).json({
        error: "Você so pode criar agendamentos com prestadores de serviço",
      });
    }

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return response
        .status(400)
        .json({ error: "Datas passadas nao são permitidas" });
    }

    const checkAvailable = await Appointment.findOne({
      where: { provider_id, canceled_ad: null, date: hourStart },
    });

    if (checkAvailable) {
      return response.status(400).json({ error: "Não está Vago" });
    }

    const appointment = await Appointment.create({
      user_id: request.userId,
      provider_id,
      date: hourStart,
    });

    return response.json(appointment);
  }
}

export default new AppointmentController();
