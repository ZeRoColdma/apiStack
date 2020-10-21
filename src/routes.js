import { Router } from "express";
import multer from "multer";
import multerConfig from "./config/multer";

import UserController from "./app/controllers/UserController";
import SessionController from "./app/controllers/SessionController";
import FileController from "./app/controllers/FileController";
import ProviderCotnroller from "./app/controllers/ProviderController";
import AppointmentController from "./app/controllers/AppointmentController";

import authMiddleware from "./app/middlewares/auth";

const routes = Router();
const upload = multer(multerConfig);

routes.post("/users", UserController.store);
routes.post("/sessions", SessionController.store);

routes.use(authMiddleware);

routes.put("/users", UserController.update);

routes.get("/providers", ProviderCotnroller.index);

routes.post("/files", upload.single("file"), FileController.store);

routes.post("/appointments", AppointmentController.store);

export default routes;
