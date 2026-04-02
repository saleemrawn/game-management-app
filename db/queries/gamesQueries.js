const { Client } = require("pg");
const pool = require("../pool");

async function getAllGames() {
  const { rows } = await pool.query(`
    WITH genres AS (
      SELECT game_id, json_agg(json_build_object('id', ge.id, 'name', ge.name)) AS genres
      FROM games_genres AS gg
      RIGHT JOIN genres AS ge ON ge.id = gg.genre_id
      GROUP BY game_id
    ),
    platforms AS (
      SELECT game_id, json_agg(json_build_object('id', pl.id, 'name', pl.name) ORDER BY pl.id) AS platforms
      FROM games_platforms AS gp
      RIGHT JOIN platforms AS pl ON pl.id = gp.platform_id
      GROUP BY game_id
    ),
    modes AS (
      SELECT game_id, json_agg(json_build_object('id', mo.id, 'name', mo.name)) AS modes
      FROM games_modes AS gm
      RIGHT JOIN modes AS mo ON mo.id = gm.mode_id
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
    ORDER BY ga.updated_at DESC;`);

  return rows;
}

async function getGameById(id) {
  const { rows } = await pool.query(
    `
    WITH genres AS (
      SELECT game_id, json_agg(json_build_object('id', ge.id, 'name', ge.name)) AS genres
      FROM games_genres AS gg
      RIGHT JOIN genres AS ge ON ge.id = gg.genre_id
      GROUP BY game_id
    ),
    platforms AS (
      SELECT game_id, json_agg(json_build_object('id', pl.id, 'name', pl.name) ORDER BY pl.id) AS platforms
      FROM games_platforms AS gp
      RIGHT JOIN platforms AS pl ON pl.id = gp.platform_id
      GROUP BY game_id
    ),
    modes AS (
      SELECT game_id, json_agg(json_build_object('id', mo.id, 'name', mo.name)) AS modes
      FROM games_modes AS gm
      RIGHT JOIN modes AS mo ON mo.id = gm.mode_id
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
    WHERE ga.id = ($1)
    ORDER BY ga.id;`,
    [id],
  );
  return rows;
}

async function getUpdateGameById(gameId) {
  const { rows } = await pool.query(
    `
    WITH selected_genres AS (
      SELECT game_id, jsonb_agg(jsonb_build_object('id', ge.id, 'name', ge.name)) AS selected_genres
      FROM games_genres AS gg
      LEFT JOIN genres AS ge ON ge.id = gg.genre_id
      GROUP BY game_id
    ),
    selected_platforms AS (
      SELECT game_id, jsonb_agg(jsonb_build_object('id', pl.id, 'name', pl.name) ORDER BY pl.id) AS selected_platforms
      FROM games_platforms AS gp
      LEFT JOIN platforms AS pl ON pl.id = gp.platform_id
      GROUP BY game_id
    ),
    selected_modes AS (
      SELECT game_id, jsonb_agg(jsonb_build_object('id', mo.id, 'name', mo.name)) AS selected_modes
      FROM games_modes AS gm
      LEFT JOIN modes AS mo ON mo.id = gm.mode_id
      GROUP BY game_id
    ),
    all_genres AS (
      SELECT jsonb_agg(jsonb_build_object('id', ge.id, 'name', ge.name)) AS genres
      FROM genres AS ge
    ),
    all_developers AS (
      SELECT jsonb_agg(jsonb_build_object('id', de.id, 'name', de.name)) AS developers
      FROM developers AS de
    ),
    all_platforms AS (
      SELECT jsonb_agg(jsonb_build_object('id', pl.id, 'name', pl.name)) AS platforms
      FROM platforms AS pl
    ),
    all_modes AS (
      SELECT jsonb_agg(jsonb_build_object('id', mo.id, 'name', mo.name)) AS modes
      FROM modes AS mo
    )
    SELECT
      ga.id AS game_id,
      ga.name AS game_name,
      ga.release_year,
      de.id AS developer_id,
      de.name AS developer_name,
      gen.selected_genres,
      mo.selected_modes,
      plt.selected_platforms,
      all_genres.genres AS all_genres,
      all_developers.developers AS all_developers,
      all_platforms.platforms AS all_platforms,
      all_modes.modes AS all_modes
    FROM games AS ga
    LEFT JOIN developers AS de ON de.id = ga.developer_id
    LEFT JOIN selected_genres AS gen ON gen.game_id = ga.id
    LEFT JOIN selected_platforms AS plt ON plt.game_id = ga.id
    LEFT JOIN selected_modes AS mo ON mo.game_ID = ga.id
    CROSS JOIN all_genres
    CROSS JOIN all_developers
    CROSS JOIN all_platforms
    CROSS JOIN all_modes
    WHERE ga.id = ($1)
    ORDER BY ga.id;
    `,
    [gameId],
  );

  return rows;
}

async function getAllGamesCategories() {
  const { rows } = await pool.query(`
    SELECT id, name, 'developer' AS type FROM developers
    UNION ALL
    SELECT id, name, 'genre' AS type FROM genres
    UNION ALL
    SELECT id, name, 'platform' AS type FROM platforms
    UNION ALL
    SELECT id, name, 'mode' AS type FROM modes;`);

  return rows;
}

async function createGame({ gameName, releaseYear, developerId, genreId, platformId, modeId }) {
  await pool.query(
    `
    WITH new_game AS (
    INSERT INTO games (name, release_year, developer_id)
    VALUES ($1, $2::int, $3::int)
    RETURNING id AS game_id
    ),
    insert_genre AS (
        INSERT INTO games_genres (game_id, genre_id)
        SELECT game_id, UNNEST($4::int[])
        FROM new_game
        WHERE $4::int[] IS NOT NULL AND array_length($4::int[], 1) > 0
    ),
    insert_platform AS (
        INSERT INTO games_platforms (game_id, platform_id)
        SELECT game_id, UNNEST($5::int[])
        FROM new_game
        WHERE $5::int[] IS NOT NULL AND array_length($5::int[], 1) > 0
    )
    INSERT INTO games_modes (game_id, mode_id)
    SELECT game_id, UNNEST($6::int[])
    FROM new_game
    WHERE $6::int[] IS NOT NULL AND array_length($6::int[], 1) > 0;`,
    [gameName, releaseYear, developerId, genreId.length ? genreId : null, platformId.length ? platformId : null, modeId.length ? modeId : null],
  );
}

async function deleteGame(id) {
  await pool.query("DELETE FROM games WHERE id = ($1)", [id]);
}

async function updateGame({ gameId, gameName, releaseYear, developerId, genreIds, platformIds, modeIds }) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    await client.query("BEGIN");
    await client.query(
      `
      UPDATE games
      SET name = $2, release_year = $3, developer_id = $4, updated_at = NOW()
      WHERE id = $1;
      `,
      [gameId, gameName, releaseYear, developerId],
    );

    await client.query(
      `
      DELETE FROM games_genres
      WHERE game_id = $1
      AND genre_id != ALL($2::int[]);
      `,
      [gameId, genreIds],
    );

    await client.query(
      `
      INSERT INTO games_genres (game_id, genre_id)
      SELECT $1, UNNEST($2::int[])
      ON CONFLICT (game_id, genre_id) DO NOTHING;
      `,
      [gameId, genreIds],
    );

    await client.query(
      `
      DELETE FROM games_platforms
      WHERE game_id = $1
      AND platform_id != ALL($2::int[]);
      `,
      [gameId, platformIds],
    );

    await client.query(
      `
      INSERT INTO games_platforms (game_id, platform_id)
      SELECT $1, UNNEST($2::int[])
      ON CONFLICT (game_id, platform_id) DO NOTHING;
      `,
      [gameId, platformIds],
    );

    await client.query(
      `
      DELETE FROM games_modes
      WHERE game_id = $1
      AND mode_id != ALL($2::int[]) ;
      `,
      [gameId, modeIds],
    );

    await client.query(
      `
      INSERT INTO games_modes (game_id, mode_id)
      SELECT $1, UNNEST($2::int[])
      ON CONFLICT (game_id, mode_id) DO NOTHING;
      `,
      [gameId, modeIds],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    throw error;
  } finally {
    await client.end();
  }
}

module.exports = { getAllGames, getGameById, getUpdateGameById, getAllGamesCategories, createGame, deleteGame, updateGame };
