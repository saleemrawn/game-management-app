const { Router } = require("express");
const modesRouter = Router();
const modesControllers = require("../controllers/modesControllers");

modesRouter.get("/", modesControllers.getAllModes);
modesRouter.get("/create", modesControllers.getCreateMode);
modesRouter.get("/:modeId", modesControllers.getGamesByModeId);
modesRouter.get("/edit/:modeId", modesControllers.getUpdateModeById);

modesRouter.post("/create", modesControllers.modesValidators, modesControllers.createMode);
modesRouter.post("/edit/:modeId", modesControllers.modesValidators, modesControllers.updateMode);
modesRouter.post("/delete/:modeId", modesControllers.deleteMode);

module.exports = modesRouter;
