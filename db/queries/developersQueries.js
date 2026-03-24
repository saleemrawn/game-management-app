const pool = require("../pool");

async function getAllDevelopers() {
  const { rows } = await pool.query(`
    SELECT de.id, de.name, COUNT(ga.id) AS number_of_games
    FROM developers AS de
    LEFT JOIN games AS ga ON de.id = ga.developer_id
    GROUP BY de.id
    ORDER BY number_of_games DESC, de.updated_at DESC;`);
  return rows;
}

async function getDeveloperById(id) {
  const { rows } = await pool.query("SELECT * FROM developers WHERE id = ($1)", [id]);
  return rows;
}

async function getGamesByDeveloperId(id) {
  const { rows } = await pool.query(
    `WITH genres AS (
      SELECT game_id, json_agg(json_build_object('id', ge.id, 'name', ge.name)) AS genres
      FROM games_genres AS gg
      LEFT JOIN genres AS ge ON ge.id = gg.genre_id
      GROUP BY game_id
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
      de.id AS developer_id,
      de.name AS developer_name,
      gen.genres,
      mo.modes,
      plt.platforms
    FROM games AS ga
    LEFT JOIN developers AS de ON de.id = ga.developer_id
    LEFT JOIN genres AS gen ON gen.game_id = ga.id
    LEFT JOIN platforms AS plt ON plt.game_id = ga.id
    LEFT JOIN modes AS mo ON mo.game_ID = ga.id
    WHERE de.id = ($1)
    ORDER BY ga.id;`,
    [id],
  );

  return rows;
}

async function createDeveloper(developerName) {
  await pool.query("INSERT INTO developers (name) VALUES ($1)", [developerName]);
}

async function updateDeveloper({ developerName, developerId }) {
  await pool.query("UPDATE developers SET name = ($1), updated_at = NOW() WHERE id = ($2)", [developerName, developerId]);
}

async function deleteDeveloper(developerId) {
  await pool.query("DELETE FROM developers WHERE id = ($1)", [developerId]);
}

module.exports = {
  getAllDevelopers,
  getDeveloperById,
  getGamesByDeveloperId,
  createDeveloper,
  updateDeveloper,
  deleteDeveloper,
};
