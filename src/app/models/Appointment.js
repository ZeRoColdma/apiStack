import Sequelize, { Model } from "sequelize";

import User from "../models/User";

class Appointment extends Model {
  static init(sequelize) {
    super.init(
      {
        date: Sequelize.DATE,
        canceled_ad: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    this.belongsTo(models.User, { foreignKey: "provider_id", as: "provider" });
  }
}
export default Appointment;