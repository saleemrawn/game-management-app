const db = require("../db/queries/genresQueries");
const { body, validationResult, matchedData } = require("express-validator");
const CustomNotFoundError = require("../errors/CustomNotFoundError");
const CustomInternalServerError = require("../errors/CustomInternalServerError");

const genreValidators = [
  body("genreName")
    .trim()
    .notEmpty()
    .withMessage("Genre name is required")
    .isAlphanumeric(undefined, { ignore: "^[ '/&-]" })
    .withMessage("Genre name must only contain letters, numbers, '/&-"),
];

async function getAllGenres(req, res) {
  const genres = await db.getAllGenres();

  if (!genres || genres.length === 0) {
    throw new CustomInternalServerError("Could not load genres");
  }

  res.render("genresList", { title: "Genres", genres: genres });
}

async function getGamesByGenreId(req, res) {
  const games = await db.getGamesByGenreId(req.params.genreId);

  if (!games || games.length === 0) {
    throw new CustomNotFoundError("No games found");
  }

  const genreName = games[0].genres[0].name;
  res.render("gamesList", { title: genreName, games: games });
}

async function getUpdateGenreById(req, res) {
  const [genre] = await db.getGenreById(req.params.genreId);

  if (!genre || genre.length === 0) {
    throw new CustomNotFoundError("Genre not found");
  }

  res.render("updateGenre", { title: "Update Genre", genre: genre });
}

function getCreateGenre(req, res) {
  res.render("createGenre", { title: "Add Genre" });
}

async function createGenre(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).render("createGenre", { title: "Add Genre", errors: errors.array() });
  }

  const { genreName } = matchedData(req);
  await db.createGenre(genreName);
  res.redirect("/genres");
}

async function updateGenre(req, res) {
  const [genre] = await db.getGenreById(req.params.genreId);
  const errors = validationResult(req);

  if (!genre || genre.length === 0) {
    throw new CustomNotFoundError("Genre not found");
  }

  if (!errors.isEmpty()) {
    res.status(400).render("updateGenre", { title: "Update Genre", genre: genre, errors: errors.array() });
  }

  const { genreName } = matchedData(req);
  await db.updateGenre({ genreName: genreName, genreId: req.body.genreId });
  res.redirect("/genres");
}

async function deleteGenre(req, res) {
  await db.deleteGenre(req.params.genreId);
  res.redirect("/genres");
}

module.exports = { getAllGenres, getGamesByGenreId, getUpdateGenreById, getCreateGenre, createGenre, updateGenre, deleteGenre, genreValidators };
