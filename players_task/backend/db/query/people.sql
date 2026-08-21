-- ========================================================
-- GET ALL PLAYERS
--
-- Supports:
--   Search
--   Birth Country
--   Birth State
--   Bats
--   Throws
--   Birth Year range
--   Height range
--   Weight range
--   Sorting
--   Pagination
-- ========================================================

-- name: GetAllPlayers :many

SELECT
    playerID,
    birthYear,
    birthMonth,
    birthDay,
    birthCountry,
    birthState,
    birthCity,
    deathYear,
    deathMonth,
    deathDay,
    deathCountry,
    deathState,
    deathCity,
    nameFirst,
    nameLast,
    nameGiven,
    weight,
    height,
    bats,
    throws,
    debut,
    finalGame,
    retroID,
    bbrefID

FROM people

WHERE

    -- ====================================================
    -- SEARCH
    -- ====================================================

    (
        sqlc.arg(search) = ''

        OR LOWER(nameFirst)
            LIKE CONCAT(
                '%',
                LOWER(sqlc.arg(search)),
                '%'
            )

        OR LOWER(nameLast)
            LIKE CONCAT(
                '%',
                LOWER(sqlc.arg(search)),
                '%'
            )

        OR LOWER(nameGiven)
            LIKE CONCAT(
                '%',
                LOWER(sqlc.arg(search)),
                '%'
            )

        OR LOWER(
            CONCAT(
                nameFirst,
                ' ',
                nameLast
            )
        )
        LIKE CONCAT(
            '%',
            LOWER(sqlc.arg(search)),
            '%'
        )

        OR LOWER(
            REPLACE(
                CONCAT(
                    nameFirst,
                    nameLast
                ),
                ' ',
                ''
            )
        )
        LIKE CONCAT(
            '%',
            REPLACE(
                LOWER(sqlc.arg(search)),
                ' ',
                ''
            ),
            '%'
        )
    )

    -- ====================================================
    -- BIRTH COUNTRY
    --
    -- NULL = no filter selected
    -- ====================================================

    AND (
        sqlc.arg(birthCountry) IS NULL
        OR birthCountry = sqlc.arg(birthCountry)
    )

    -- ====================================================
    -- BIRTH STATE
    -- ====================================================

    AND (
        sqlc.arg(birthState) IS NULL
        OR birthState = sqlc.arg(birthState)
    )

    -- ====================================================
    -- BATS
    -- R / L / B
    -- ====================================================

    AND (
        sqlc.arg(bats) IS NULL
        OR bats = sqlc.arg(bats)
    )

    -- ====================================================
    -- THROWS
    -- R / L
    -- ====================================================

    AND (
        sqlc.arg(throws) IS NULL
        OR throws = sqlc.arg(throws)
    )

    -- ====================================================
    -- BIRTH YEAR
    -- ====================================================

    AND (
        sqlc.arg(minBirthYear) IS NULL
        OR birthYear >= sqlc.arg(minBirthYear)
    )

    AND (
        sqlc.arg(maxBirthYear) IS NULL
        OR birthYear <= sqlc.arg(maxBirthYear)
    )

    -- ====================================================
    -- HEIGHT
    -- ====================================================

    AND (
        sqlc.arg(minHeight) IS NULL
        OR height >= sqlc.arg(minHeight)
    )

    AND (
        sqlc.arg(maxHeight) IS NULL
        OR height <= sqlc.arg(maxHeight)
    )

    -- ====================================================
    -- WEIGHT
    -- ====================================================

    AND (
        sqlc.arg(minWeight) IS NULL
        OR weight >= sqlc.arg(minWeight)
    )

    AND (
        sqlc.arg(maxWeight) IS NULL
        OR weight <= sqlc.arg(maxWeight)
    )

-- ========================================================
-- SORTING
-- ========================================================

ORDER BY

    -- First Name ASC

    CASE
        WHEN
            sqlc.arg(sortBy) = 'firstName'
            AND sqlc.arg(sortOrder) = 'asc'
        THEN nameFirst
    END ASC,

    -- First Name DESC

    CASE
        WHEN
            sqlc.arg(sortBy) = 'firstName'
            AND sqlc.arg(sortOrder) = 'desc'
        THEN nameFirst
    END DESC,

    -- Birth Year ASC

    CASE
        WHEN
            sqlc.arg(sortBy) = 'birthYear'
            AND sqlc.arg(sortOrder) = 'asc'
        THEN birthYear
    END ASC,

    -- Birth Year DESC

    CASE
        WHEN
            sqlc.arg(sortBy) = 'birthYear'
            AND sqlc.arg(sortOrder) = 'desc'
        THEN birthYear
    END DESC,

    -- Height ASC

    CASE
        WHEN
            sqlc.arg(sortBy) = 'height'
            AND sqlc.arg(sortOrder) = 'asc'
        THEN height
    END ASC,

    -- Height DESC

    CASE
        WHEN
            sqlc.arg(sortBy) = 'height'
            AND sqlc.arg(sortOrder) = 'desc'
        THEN height
    END DESC,

    -- Stable fallback ordering

    playerID ASC

LIMIT ?
OFFSET ?;


-- ========================================================
-- COUNT PLAYERS
--
-- IMPORTANT:
-- Same filters as GetAllPlayers.
-- This keeps pagination correct.
-- ========================================================

-- name: CountPlayers :one

SELECT COUNT(*)

FROM people

WHERE

    -- ====================================================
    -- SEARCH
    -- ====================================================

    (
        sqlc.arg(search) = ''

        OR LOWER(nameFirst)
            LIKE CONCAT(
                '%',
                LOWER(sqlc.arg(search)),
                '%'
            )

        OR LOWER(nameLast)
            LIKE CONCAT(
                '%',
                LOWER(sqlc.arg(search)),
                '%'
            )

        OR LOWER(nameGiven)
            LIKE CONCAT(
                '%',
                LOWER(sqlc.arg(search)),
                '%'
            )

        OR LOWER(
            CONCAT(
                nameFirst,
                ' ',
                nameLast
            )
        )
        LIKE CONCAT(
            '%',
            LOWER(sqlc.arg(search)),
            '%'
        )

        OR LOWER(
            REPLACE(
                CONCAT(
                    nameFirst,
                    nameLast
                ),
                ' ',
                ''
            )
        )
        LIKE CONCAT(
            '%',
            REPLACE(
                LOWER(sqlc.arg(search)),
                ' ',
                ''
            ),
            '%'
        )
    )

    -- ====================================================
    -- BIRTH COUNTRY
    -- ====================================================

    AND (
        sqlc.arg(birthCountry) IS NULL
        OR birthCountry = sqlc.arg(birthCountry)
    )

    -- ====================================================
    -- BIRTH STATE
    -- ====================================================

    AND (
        sqlc.arg(birthState) IS NULL
        OR birthState = sqlc.arg(birthState)
    )

    -- ====================================================
    -- BATS
    -- ====================================================

    AND (
        sqlc.arg(bats) IS NULL
        OR bats = sqlc.arg(bats)
    )

    -- ====================================================
    -- THROWS
    -- ====================================================

    AND (
        sqlc.arg(throws) IS NULL
        OR throws = sqlc.arg(throws)
    )

    -- ====================================================
    -- BIRTH YEAR
    -- ====================================================

    AND (
        sqlc.arg(minBirthYear) IS NULL
        OR birthYear >= sqlc.arg(minBirthYear)
    )

    AND (
        sqlc.arg(maxBirthYear) IS NULL
        OR birthYear <= sqlc.arg(maxBirthYear)
    )

    -- ====================================================
    -- HEIGHT
    -- ====================================================

    AND (
        sqlc.arg(minHeight) IS NULL
        OR height >= sqlc.arg(minHeight)
    )

    AND (
        sqlc.arg(maxHeight) IS NULL
        OR height <= sqlc.arg(maxHeight)
    )

    -- ====================================================
    -- WEIGHT
    -- ====================================================

    AND (
        sqlc.arg(minWeight) IS NULL
        OR weight >= sqlc.arg(minWeight)
    )

    AND (
        sqlc.arg(maxWeight) IS NULL
        OR weight <= sqlc.arg(maxWeight)
    );


-- ========================================================
-- GET PLAYER BY ID
-- ========================================================

-- name: GetPlayerByID :one

SELECT
    playerID,
    birthYear,
    birthMonth,
    birthDay,
    birthCountry,
    birthState,
    birthCity,
    deathYear,
    deathMonth,
    deathDay,
    deathCountry,
    deathState,
    deathCity,
    nameFirst,
    nameLast,
    nameGiven,
    weight,
    height,
    bats,
    throws,
    debut,
    finalGame,
    retroID,
    bbrefID

FROM people

WHERE playerID = ?;


-- ========================================================
-- UPDATE PLAYER
-- ========================================================

-- name: UpdatePlayer :exec

UPDATE people

SET
    nameFirst = ?,
    nameLast = ?,
    nameGiven = ?,
    birthYear = ?,
    birthMonth = ?,
    birthDay = ?,
    birthCountry = ?,
    birthState = ?,
    birthCity = ?,
    weight = ?,
    height = ?,
    bats = ?,
    throws = ?,
    debut = ?,
    finalGame = ?

WHERE playerID = ?;