const db = require("../db/queries/gamesQueries");
const { body, validationResult, matchedData } = require("express-validator");
const CustomNotFoundError = require("../errors/CustomNotFoundError");
const CustomInternalServerError = require("../errors/CustomInternalServerError");

const gameValidators = [
  body("gameName")
    .trim()
    .notEmpty()
    .withMessage("Game name is required")
    .isAlphanumeric(undefined, { ignore: `^[ -:'\.&!?]` })
    .withMessage("Game name must only contain letters, numbers, -:'.&!?"),
  body("releaseYear").trim().notEmpty(),
  body("developer").trim().notEmpty().withMessage("Developer is required"),
  body("genres").trim().notEmpty().withMessage("Genre(s) is required"),
  body("platforms").trim().notEmpty().withMessage("Platform(s) is required"),
  body("modes").trim().notEmpty().withMessage("Mode(s) is required"),
];

async function getAllGames(req, res) {
  const games = await db.getAllGames();

  if (!games || games.length === 0) {
    throw new CustomInternalServerError("Could not load games");
  }

  res.render("gamesList", { title: "Games", games: games });
}

async function getGameById(req, res) {
  const [game] = await db.getGameById(req.params.gameId);

  if (!game || game.length === 0) {
    throw new CustomNotFoundError("Game not found");
  }

  res.render("game", { title: game.game_name, game: game });
}

async function getCreateGame(req, res) {
  const categories = await db.getAllGamesCategories();

  if (!categories || categories.length === 0) {
    throw new CustomInternalServerError("Could not load categories");
  }

  res.render("createGame", { title: "Add Game", categories: categories });
}

async function getUpdateGameById(req, res) {
  const [data] = await db.getUpdateGameById(req.params.gameId);

  if (!data || data.length === 0) {
    throw new CustomNotFoundError("Game not found");
  }

  res.render("updateGame", { title: "Update Game", data: data });
}

async function createGame(req, res) {
  const categories = await db.getAllGamesCategories();
  if (!categories || categories.length === 0) {
    throw new CustomInternalServerError("Could not load categories");
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("createGame", { title: "Add Game", categories: categories, errors: errors.array() });
  }

  const { gameName, releaseYear, developer, genres, platforms, modes } = matchedData(req);
  await db.createGame({
    gameName: gameName,
    releaseYear: releaseYear,
    developerId: developer,
    genreId: [].concat(genres),
    platformId: [].concat(platforms),
    modeId: [].concat(modes),
  });

  res.redirect("/games");
}

async function deleteGame(req, res) {
  await db.deleteGame(req.params.gameId);
  res.redirect("/games");
}

async function updateGame(req, res) {
  const [data] = await db.getUpdateGameById(req.params.gameId);
  if (!data || data.length === 0) {
    throw new CustomNotFoundError("Game not found");
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("updateGame", { title: "Update Game", data: data, errors: errors.array() });
  }

  const { gameName, releaseYear, developer, genres, platforms, modes } = matchedData(req);
  await db.updateGame({
    gameId: req.body.gameId,
    gameName: gameName,
    releaseYear: releaseYear,
    developerId: developer,
    genreIds: [].concat(genres),
    platformIds: [].concat(platforms),
    modeIds: [].concat(modes),
  });

  res.redirect("/games");
}

module.exports = { getAllGames, getGameById, getCreateGame, getUpdateGameById, createGame, deleteGame, updateGame, gameValidators };
