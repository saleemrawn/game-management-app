const db = require("../db/queries/gamesQueries");
const dbFilters = require("../db/queries/filtersQueries");
const CustomInternalServerError = require("../errors/CustomInternalServerError");

async function getAllGames(req, res) {
  const games = await db.getAllGames();
  const filters = await dbFilters.getAllFilters();

  if (!games || games.length === 0) {
    throw new CustomInternalServerError("Could not load games");
  }

  res.render("gamesList", { title: "Dashboard", games: games, filters: filters });
}

module.exports = { getAllGames };
