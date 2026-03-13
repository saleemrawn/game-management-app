const { Router } = require("express");
const developersRouter = Router();
const developersControllers = require("../controllers/developersControllers");

developersRouter.get("/", developersControllers.getAllDevelopers);
developersRouter.get("/:developerId", developersControllers.getDeveloperById);

module.exports = developersRouter;
