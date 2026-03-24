const pool = require("../pool");

async function getAllPlatforms() {
  const { rows } = await pool.query(`
      SELECT pl.id, pl.name, COUNT(gp.game_id) AS number_of_games
      FROM platforms AS pl
      LEFT JOIN games_platforms AS gp ON pl.id = gp.platform_id
      GROUP BY pl.id
      ORDER BY number_of_games DESC, updated_at DESC;`);

  return rows;
}

async function getPlatformById(id) {
  const { rows } = await pool.query(
    `
    SELECT id, name
    FROM platforms
    WHERE id = ($1)
    `,
    [id],
  );

  return rows;
}

async function getGamesByPlatformId(id) {
  const { rows } = await pool.query(
    `
    WITH genres AS (
      SELECT game_id, json_agg(json_build_object('id', ge.id, 'name', ge.name)) AS genres
      FROM games_genres AS gg
      JOIN genres AS ge ON ge.id = gg.genre_id
      GROUP BY game_id
    ),
    platforms AS (
      SELECT game_id, pl.id, json_agg(json_build_object('id', pl.id, 'name', pl.name) ORDER BY pl.id) AS platforms
      FROM games_platforms AS gp
      JOIN platforms AS pl ON pl.id = gp.platform_id
      GROUP BY game_id, pl.id
    ),
    modes AS (
      SELECT game_id, json_agg(json_build_object('id', mo.id, 'name', mo.name)) AS modes
      FROM games_modes AS gm
      JOIN modes AS mo ON mo.id = gm.mode_id
      GROUP BY game_id
    )
    SELECT
      ga.id AS game_id,
      ga.name AS game_name,
      ga.release_year,
      de.name AS developer_name,
      gen.genres,
      mo.modes,
      plt.id AS platform_id,
      plt.platforms
    FROM games AS ga
    LEFT JOIN developers AS de ON de.id = ga.developer_id
    LEFT JOIN genres AS gen ON gen.game_id = ga.id
    LEFT JOIN platforms AS plt ON plt.game_id = ga.id
    LEFT JOIN modes AS mo ON mo.game_ID = ga.id
    WHERE plt.id = ($1)
    ORDER BY ga.id;`,
    [id],
  );

  return rows;
}

async function createPlatform(platformName) {
  await pool.query("INSERT INTO platforms (name) VALUES ($1)", [platformName]);
}

async function updatePlatform({ platformId, platformName }) {
  await pool.query(
    `
    UPDATE platforms
    SET name = ($2), updated_at = NOW()
    WHERE id = ($1)
    `,
    [platformId, platformName],
  );
}

async function deletePlatform(platformId) {
  await pool.query("DELETE FROM platforms WHERE id = ($1)", [platformId]);
}

module.exports = { getAllPlatforms, getGamesByPlatformId, getPlatformById, createPlatform, updatePlatform, deletePlatform };
