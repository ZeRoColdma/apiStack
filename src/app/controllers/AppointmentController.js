import Appointment from "../models/Appointment";
import * as Yup from "yup";
import User from "../models/User";
import File from "../models/File";
import Notification from "../schemas/Notification";

import { startOfHour, parseISO, isBefore, format, subHours } from "date-fns";
import pt from "date-fns/locale/pt";

import CancellationMain from "../jobs/CancellationMail";
import Queue from "../../lib/Queue";

class AppointmentController {
  async index(request, response) {
    const { page = 1 } = request.query;

    const appointments = await Appointment.findAll({
      where: { user_id: request.userId, canceled_ad: null },
      order: ["date"],
      attributes: ["id", "date"],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: "provider",
          attributes: ["id", "name"],
          include: [
            {
              model: File,
              as: "avatar",
              attributes: ["id", "path", "url"],
            },
          ],
        },
      ],
    });

    return response.json(appointments);
  }

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

    const user = await User.findByPk(request.userId);
    const formatedDate = format(hourStart, "'dia' dd 'de' MMMM', às' H:mm'h'", {
      locale: pt,
    });

    await Notification.create({
      content: `Novo agendamento de ${user.name} para  ${formatedDate}`,
      user: provider_id,
    });

    return response.json(appointment);
  }

  async delete(request, response) {
    const appointment = await Appointment.findByPk(request.params.id, {
      include: [
        {
          model: User,
          as: "provider",
          attributes: ["name", "email"],
        },
        {
          model: User,
          as: "user",
          attributes: ["name"],
        },
      ],
    });

    if (appointment.user_id !== request.userId) {
      return response.status(401).json({
        error: "Voce nao tem perminssão para cacelar essa agendamento",
      });
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return response.status(401).json({
        error: "Você so pode cancelar agendamentos ate 2 horas da hora marcada",
      });
    }

    appointment.canceled_ad = new Date();
    await appointment.save();

    await Queue.add(CancellationMain.key, {
      appointment,
    });

    return response.json(appointment);
  }
}

export default new AppointmentController();
