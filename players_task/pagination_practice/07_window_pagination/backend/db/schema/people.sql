CREATE TABLE people (
    playerID VARCHAR(20) NOT NULL PRIMARY KEY,

    birthYear INT NULL,
    birthMonth INT NULL,
    birthDay INT NULL,

    birthCountry VARCHAR(100) NULL,
    birthState VARCHAR(100) NULL,
    birthCity VARCHAR(100) NULL,

    deathYear INT NULL,
    deathMonth INT NULL,
    deathDay INT NULL,

    deathCountry VARCHAR(100) NULL,
    deathState VARCHAR(100) NULL,
    deathCity VARCHAR(100) NULL,

    nameFirst VARCHAR(100) NULL,
    nameLast VARCHAR(100) NULL,
    nameGiven VARCHAR(150) NULL,

    weight INT NULL,
    height INT NULL,

    bats VARCHAR(10) NULL,
    throws VARCHAR(10) NULL,

    debut VARCHAR(20) NULL,
    finalGame VARCHAR(20) NULL,

    retroID VARCHAR(20) NULL,
    bbrefID VARCHAR(20) NULL
);
