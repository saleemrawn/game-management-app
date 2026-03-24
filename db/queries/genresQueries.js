const pool = require("../pool");

async function getAllGenres() {
  const { rows } = await pool.query(
    ` SELECT ge.id, ge.name, COUNT(gg.game_id) AS number_of_games
      FROM genres AS ge
      LEFT JOIN games_genres AS gg ON ge.id = gg.genre_id
      GROUP BY ge.id
      ORDER BY number_of_games DESC, updated_at DESC;`,
  );

  return rows;
}

async function getGenreById(id) {
  const { rows } = await pool.query("SELECT * FROM genres WHERE id = ($1)", [id]);
  return rows;
}

async function getGamesByGenreId(id) {
  const { rows } = await pool.query(
    `
    WITH genres AS (
      SELECT game_id, ge.id, json_agg(json_build_object('id', ge.id, 'name', ge.name)) AS genres
      FROM games_genres AS gg
      LEFT JOIN genres AS ge ON ge.id = gg.genre_id
      GROUP BY game_id, ge.id
    ),
    platforms AS (
      SELECT game_id, json_agg(json_build_object('id', pl.id, 'name', pl.name) ORDER BY pl.id) AS platforms
      FROM games_platforms AS gp
      LEFT JOIN platforms AS pl ON pl.id = gp.platform_id
      GROUP BY game_id
    ),
    modes AS (
      SELECT game_id, json_agg(json_build_object('id', mo.id, 'name', mo.name)) AS modes
      FROM games_modes AS gm
      LEFT JOIN modes AS mo ON mo.id = gm.mode_id
      GROUP BY game_id
    )
    SELECT
      ga.id AS game_id,
      ga.name AS game_name,
      ga.release_year,
      de.name AS developer_name,
      gen.id AS genre_id,
      gen.genres,
      mo.modes,
      plt.platforms
    FROM games AS ga
    LEFT JOIN developers AS de ON de.id = ga.developer_id
    LEFT JOIN genres AS gen ON gen.game_id = ga.id
    LEFT JOIN platforms AS plt ON plt.game_id = ga.id
    LEFT JOIN modes AS mo ON mo.game_ID = ga.id
    WHERE gen.id = ($1)
    ORDER BY ga.id;`,
    [id],
  );

  return rows;
}

async function createGenre(genreName) {
  await pool.query("INSERT INTO genres (name) VALUES ($1)", [genreName]);
}

async function updateGenre({ genreName, genreId }) {
  await pool.query("UPDATE genres SET name = ($1), updated_at = NOW() WHERE id = ($2)", [genreName, genreId]);
}

async function deleteGenre(genreId) {
  await pool.query("DELETE FROM genres WHERE id = ($1)", [genreId]);
}

module.exports = { getAllGenres, getGenreById, createGenre, updateGenre, deleteGenre, getGamesByGenreId };
