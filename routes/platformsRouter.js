const { Router } = require("express");
const platformsRouter = Router();
const platformsControllers = require("../controllers/platformsControllers");

platformsRouter.get("/", platformsControllers.getAllPlatforms);
platformsRouter.get("/:platformId", platformsControllers.getPlatformById);

module.exports = platformsRouter;
