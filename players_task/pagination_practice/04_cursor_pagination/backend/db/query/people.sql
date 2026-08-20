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
ORDER BY playerID
LIMIT ?
OFFSET ?;

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

-- name: CountPlayers :one
SELECT COUNT(*)
FROM people;
-- name: GetPlayersByName :many
SELECT
    *
FROM people
WHERE
    LOWER(nameFirst) LIKE CONCAT('%', LOWER(sqlc.arg(search)), '%')
    OR LOWER(nameLast) LIKE CONCAT('%', LOWER(sqlc.arg(search)), '%')
    OR LOWER(nameGiven) LIKE CONCAT('%', LOWER(sqlc.arg(search)), '%')
    OR LOWER(
        CONCAT(nameFirst, ' ', nameLast)
    ) LIKE CONCAT(
        '%',
        LOWER(sqlc.arg(search)),
        '%'
    )
    OR LOWER(
        REPLACE(
            CONCAT(nameFirst, nameLast),
            ' ',
            ''
        )
    ) LIKE CONCAT(
        '%',
        REPLACE(LOWER(sqlc.arg(search)), ' ', ''),
        '%'
    )
ORDER BY nameLast, nameFirst;

-- name: GetPlayersByCursor :many
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
WHERE playerID > ?
ORDER BY playerID
LIMIT ?;