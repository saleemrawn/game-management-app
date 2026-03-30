const pool = require("../pool");

async function getAllModes() {
  const { rows } = await pool.query(`
      SELECT mo.id, mo.name, COUNT(gm.game_id) AS number_of_games
      FROM modes AS mo
      LEFT JOIN games_modes AS gm ON mo.id = gm.mode_id
      GROUP BY mo.id
      ORDER BY number_of_games DESC;`);
  return rows;
}

async function getModeById(id) {
  const { rows } = await pool.query("SELECT * FROM modes WHERE id = ($1)", [id]);
  return rows;
}

async function getGamesByModeId(id) {
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
      SELECT game_id, mo.id, json_agg(json_build_object('id', mo.id, 'name', mo.name)) AS modes
      FROM games_modes AS gm
      LEFT JOIN modes AS mo ON mo.id = gm.mode_id
      GROUP BY game_id, mo.id
    )
    SELECT
      ga.id AS game_id,
      ga.name AS game_name,
      ga.release_year,
      de.name AS developer_name,
      gen.id AS genre_id,
      gen.genres,
      mo.id AS mode_id,
      mo.modes,
      plt.platforms
    FROM games AS ga
    LEFT JOIN developers AS de ON de.id = ga.developer_id
    LEFT JOIN genres AS gen ON gen.game_id = ga.id
    LEFT JOIN platforms AS plt ON plt.game_id = ga.id
    LEFT JOIN modes AS mo ON mo.game_ID = ga.id
    WHERE mo.id = ($1)
    ORDER BY ga.id;`,
    [id],
  );

  return rows;
}

async function createMode(modeName) {
  await pool.query("INSERT INTO modes (name) VALUES ($1)", [modeName]);
}

async function updateMode({ modeName, modeId }) {
  await pool.query("UPDATE modes SET name = ($1), updated_at = NOW() WHERE id = ($2)", [modeName, modeId]);
}

async function deleteMode(modeId) {
  await pool.query("DELETE FROM modes WHERE id = ($1)", [modeId]);
}

module.exports = { getAllModes, getModeById, getGamesByModeId, createMode, updateMode, deleteMode };
