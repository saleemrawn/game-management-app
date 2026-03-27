const { validationResult, matchedData, body } = require("express-validator");
const db = require("../db/queries/modesQueries");
const CustomNotFoundError = require("../errors/CustomNotFoundError");
const CustomInternalServerError = require("../errors/CustomInternalServerError");

const modesValidators = [
  body("modeName")
    .trim()
    .notEmpty()
    .withMessage("Mode name is required")
    .isAlpha(undefined, { ignore: "^[ -]" })
    .withMessage("Mode name must only contain letters and hyphens"),
];

async function getAllModes(req, res) {
  const modes = await db.getAllModes();

  if (!modes || modes.length === 0) {
    throw new CustomInternalServerError("Could not load modes");
  }

  res.render("modesList", { title: "Modes", modes: modes });
}

async function getGamesByModeId(req, res) {
  const games = await db.getGamesByModeId(req.params.modeId);

  if (!games || games.length === 0) {
    throw new CustomNotFoundError("No games found");
  }

  const modeName = games[0].modes[0].name;
  res.render("gamesList", { title: modeName, games: games });
}

function getCreateMode(req, res) {
  res.render("createMode", { title: "Add Mode" });
}

async function getUpdateModeById(req, res) {
  const [mode] = await db.getModeById(req.params.modeId);

  if (!mode || mode.length === 0) {
    throw new CustomNotFoundError("Mode not found");
  }

  res.render("updateMode", { title: "Update Mode", mode: mode });
}

async function createMode(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("createMode", { title: "Create Mode", errors: errors.array() });
  }

  const { modeName } = matchedData(req);
  await db.createMode(modeName);
  res.redirect("/modes");
}

async function updateMode(req, res) {
  const [mode] = await db.getModeById(req.params.modeId);
  if (!mode || mode.length === 0) {
    throw new CustomNotFoundError("Mode not found");
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("updateMode", { title: "Update Mode", mode: mode, errors: errors.array() });
  }

  const { modeName } = matchedData(req);
  await db.updateMode({ modeName: modeName, modeId: req.body.modeId });
  res.redirect("/modes");
}

async function deleteMode(req, res) {
  await db.deleteMode(req.params.modeId);
  res.redirect("/modes");
}

module.exports = { getAllModes, getGamesByModeId, getCreateMode, getUpdateModeById, createMode, updateMode, deleteMode, modesValidators };
