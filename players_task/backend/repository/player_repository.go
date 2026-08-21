package repository

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"players_task/db"
)

var ErrPlayerNotFound = errors.New("player not found")

type PlayerRepository struct {
	queries *db.Queries
}

func NewPlayerRepository(
	queries *db.Queries,
) *PlayerRepository {
	return &PlayerRepository{
		queries: queries,
	}
}

// ========================================================
// GET ALL PLAYERS
//
// Supports:
//
// Search
// Birth Country
// Birth State
// Bats
// Throws
// Birth Year range
// Height range
// Weight range
// Sorting
// Pagination
// ========================================================

func (r *PlayerRepository) GetAllPlayers(
	ctx context.Context,
	limit int32,
	offset int32,
	search string,
	birthCountry string,
	birthState string,
	bats string,
	throws string,
	minBirthYear *int32,
	maxBirthYear *int32,
	minHeight *int32,
	maxHeight *int32,
	minWeight *int32,
	maxWeight *int32,
	sortBy string,
	sortOrder string,
) ([]db.Person, error) {

	/*
		Convert optional filter values into sql.NullInt32.

		nil means:
		"No filter has been provided."
	*/

	toNullInt32 := func(
		value *int32,
	) sql.NullInt32 {

		if value == nil {
			return sql.NullInt32{
				Valid: false,
			}
		}

		return sql.NullInt32{
			Int32: *value,
			Valid: true,
		}
	}

	/*
		Convert string filters into sql.NullString.

		Empty string means:
		"No filter has been provided."
	*/

	toNullString := func(
		value string,
	) sql.NullString {

		value = strings.TrimSpace(value)

		if value == "" {
			return sql.NullString{
				Valid: false,
			}
		}

		return sql.NullString{
			String: value,
			Valid:  true,
		}
	}

	/*
		Keep search behaviour case-insensitive.
	*/

	search = strings.TrimSpace(search)

	/*
		Default sorting.

		If frontend does not send sorting information,
		we keep the old behaviour:
		playerID ASC.
	*/

	sortBy = strings.TrimSpace(sortBy)
	sortOrder = strings.TrimSpace(sortOrder)

	if sortBy == "" {
		sortBy = "playerID"
	}

	if sortOrder == "" {
		sortOrder = "asc"
	}

	/*
		Only allow supported sorting fields.
		This prevents unexpected SQL behaviour.
	*/

	switch sortBy {

	case "firstName":
		// Valid.

	case "birthYear":
		// Valid.

	case "height":
		// Valid.

	default:
		sortBy = "playerID"
	}

	/*
		Only allow ASC / DESC.
	*/

	if sortOrder != "asc" &&
		sortOrder != "desc" {

		sortOrder = "asc"
	}

	/*
		Call sqlc-generated query.
	*/

	return r.queries.GetAllPlayers(
		ctx,
		db.GetAllPlayersParams{

			Search: search,

			Birthcountry: toNullString(
				birthCountry,
			),

			Birthstate: toNullString(
				birthState,
			),

			Bats: toNullString(
				bats,
			),

			Throws: toNullString(
				throws,
			),

			Minbirthyear: toNullInt32(
				minBirthYear,
			),

			Maxbirthyear: toNullInt32(
				maxBirthYear,
			),

			Minheight: toNullInt32(
				minHeight,
			),

			Maxheight: toNullInt32(
				maxHeight,
			),

			Minweight: toNullInt32(
				minWeight,
			),

			Maxweight: toNullInt32(
				maxWeight,
			),

			Sortby: sortBy,

			Sortorder: sortOrder,

			Limit: limit,

			Offset: offset,
		},
	)
}

// ========================================================
// COUNT PLAYERS
//
// Uses the same filters as GetAllPlayers.
//
// This is required so pagination displays the
// correct number of pages after filtering.
// ========================================================

func (r *PlayerRepository) CountPlayers(
	ctx context.Context,
	search string,
	birthCountry string,
	birthState string,
	bats string,
	throws string,
	minBirthYear *int32,
	maxBirthYear *int32,
	minHeight *int32,
	maxHeight *int32,
	minWeight *int32,
	maxWeight *int32,
) (int64, error) {

	toNullInt32 := func(
		value *int32,
	) sql.NullInt32 {

		if value == nil {
			return sql.NullInt32{
				Valid: false,
			}
		}

		return sql.NullInt32{
			Int32: *value,
			Valid: true,
		}
	}

	toNullString := func(
		value string,
	) sql.NullString {

		value = strings.TrimSpace(value)

		if value == "" {
			return sql.NullString{
				Valid: false,
			}
		}

		return sql.NullString{
			String: value,
			Valid:  true,
		}
	}

	search = strings.TrimSpace(search)

	return r.queries.CountPlayers(
		ctx,
		db.CountPlayersParams{

			Search: search,

			Birthcountry: toNullString(
				birthCountry,
			),

			Birthstate: toNullString(
				birthState,
			),

			Bats: toNullString(
				bats,
			),

			Throws: toNullString(
				throws,
			),

			Minbirthyear: toNullInt32(
				minBirthYear,
			),

			Maxbirthyear: toNullInt32(
				maxBirthYear,
			),

			Minheight: toNullInt32(
				minHeight,
			),

			Maxheight: toNullInt32(
				maxHeight,
			),

			Minweight: toNullInt32(
				minWeight,
			),

			Maxweight: toNullInt32(
				maxWeight,
			),
		},
	)
}

// ========================================================
// GET PLAYER BY ID
// ========================================================

func (r *PlayerRepository) GetPlayerByID(
	ctx context.Context,
	playerID string,
) (db.Person, error) {

	player, err :=
		r.queries.GetPlayerByID(
			ctx,
			playerID,
		)

	if err != nil {

		if errors.Is(
			err,
			sql.ErrNoRows,
		) {
			return db.Person{}, ErrPlayerNotFound
		}

		return db.Person{}, err
	}

	return player, nil
}

// ========================================================
// UPDATE PLAYER
// ========================================================

func (r *PlayerRepository) UpdatePlayer(
	ctx context.Context,
	playerID string,
	nameFirst sql.NullString,
	nameLast sql.NullString,
	nameGiven sql.NullString,
	birthYear sql.NullInt32,
	birthMonth sql.NullInt32,
	birthDay sql.NullInt32,
	birthCountry sql.NullString,
	birthState sql.NullString,
	birthCity sql.NullString,
	weight sql.NullInt32,
	height sql.NullInt32,
	bats sql.NullString,
	throws sql.NullString,
	debut sql.NullString,
	finalGame sql.NullString,
) error {

	return r.queries.UpdatePlayer(
		ctx,
		db.UpdatePlayerParams{
			Namefirst:    nameFirst,
			Namelast:     nameLast,
			Namegiven:    nameGiven,
			Birthyear:    birthYear,
			Birthmonth:   birthMonth,
			Birthday:     birthDay,
			Birthcountry: birthCountry,
			Birthstate:   birthState,
			Birthcity:    birthCity,
			Weight:       weight,
			Height:       height,
			Bats:         bats,
			Throws:       throws,
			Debut:        debut,
			Finalgame:    finalGame,
			Playerid:     playerID,
		},
	)
}
