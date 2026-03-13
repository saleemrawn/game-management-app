const { Router } = require("express");
const gamesRouter = Router();
const gamesControllers = require("../controllers/gamesControllers");

gamesRouter.get("/", gamesControllers.getAllGames);
gamesRouter.get("/:gameId", gamesControllers.getGameById);

module.exports = gamesRouter;
