const { validationResult, matchedData, body } = require("express-validator");
const db = require("../db/queries/developersQueries");
const CustomNotFoundError = require("../errors/CustomNotFoundError");
const CustomInternalServerError = require("../errors/CustomInternalServerError");

const developersValidators = [
  body("developerName")
    .trim()
    .notEmpty()
    .withMessage("Developer name is required")
    .isAlphanumeric(undefined, { ignore: "^[ '@/&-]" })
    .withMessage("Developer name must only contain letters, numbers, '@/&-"),
];

async function getAllDevelopers(req, res) {
  const developers = await db.getAllDevelopers();

  if (!developers || developers.length === 0) {
    throw new CustomInternalServerError("Could not load developers");
  }

  res.render("developersList", { title: "Developers", developers: developers });
}

async function getGamesByDeveloperId(req, res) {
  const games = await db.getGamesByDeveloperId(req.params.developerId);

  if (!games || games.length === 0) {
    throw new CustomNotFoundError("No games found");
  }

  res.render("gamesList", { title: games[0].developer_name, games: games });
}

function getCreateDeveloper(req, res) {
  res.render("createDeveloper", { title: "Add Developer" });
}

async function getUpdateDeveloperById(req, res) {
  const [developer] = await db.getDeveloperById(req.params.developerId);

  if (!developer || developer.length === 0) {
    throw new CustomNotFoundError("Developer not found");
  }

  res.render("updateDeveloper", { title: "Update Developer", developer: developer });
}

async function createDeveloper(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("createDeveloper", { title: "Create Developer", errors: errors.array() });
  }

  const { developerName } = matchedData(req);
  await db.createDeveloper(developerName);
  res.redirect("/developers");
}

async function updateDeveloper(req, res) {
  const [developer] = await db.getDeveloperById(req.params.developerId);
  if (!developer || developer.length === 0) {
    throw new CustomNotFoundError("Developer not found");
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("updateDeveloper", { title: "Update Developer", developer: developer, errors: errors.array() });
  }

  const { developerName } = matchedData(req);
  await db.updateDeveloper({ developerName: developerName, developerId: req.body.developerId });
  res.redirect("/developers");
}

async function deleteDeveloper(req, res) {
  await db.deleteDeveloper(req.params.developerId);
  res.redirect("/developers");
}

module.exports = {
  getAllDevelopers,
  getGamesByDeveloperId,
  getCreateDeveloper,
  getUpdateDeveloperById,
  createDeveloper,
  updateDeveloper,
  deleteDeveloper,
  developersValidators,
};
