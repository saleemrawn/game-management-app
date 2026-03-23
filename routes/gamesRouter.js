const { Router } = require("express");
const gamesRouter = Router();
const gamesControllers = require("../controllers/gamesControllers");

gamesRouter.get("/", gamesControllers.getAllGames);
gamesRouter.get("/createGame", gamesControllers.getCreateGame);
gamesRouter.get("/:gameId", gamesControllers.getGameById);
gamesRouter.get("/edit/:gameId", gamesControllers.getUpdateGameById);

gamesRouter.post("/createGame", gamesControllers.gameValidators, gamesControllers.createGame);
gamesRouter.post("/edit/:gameId", gamesControllers.gameValidators, gamesControllers.updateGame);
gamesRouter.post("/delete/:gameId", gamesControllers.deleteGame);

module.exports = gamesRouter;
