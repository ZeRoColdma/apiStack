import Mail from "../../lib/Mail";
import { format, parseISO } from "date-fns";
import pt from "date-fns/locale/pt";

class CancellationMain {
  get key() {
    return "CancellationMain";
  }

  async handle({ data }) {
    const { appointment } = data;

    console.log("A fila executou");

    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: "Agendamento Cancelado",
      template: "cancellation",
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(
          parseISO(appointment.date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new CancellationMain();
