const { Router } = require("express");
const indexRouter = Router();
const indexControllers = require("../controllers/indexControllers");

indexRouter.get("/", indexControllers.getAllGames);

module.exports = indexRouter;
