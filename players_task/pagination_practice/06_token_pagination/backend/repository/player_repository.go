package repository

import (
	"context"
	"database/sql"

	"players_task/db"
)

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
// KEYSET PAGINATION
// ========================================================

func (r *PlayerRepository) GetPlayersByKeyset(
	ctx context.Context,
	lastName string,
	lastPlayerID string,
	limit int32,
) ([]db.Person, error) {

	var cursorName sql.NullString

	if lastName != "" {
		cursorName = sql.NullString{
			String: lastName,
			Valid:  true,
		}
	}

	return r.queries.GetPlayersByKeyset(
		ctx,
		db.GetPlayersByKeysetParams{
			LastName:     cursorName,
			LastPlayerID: lastPlayerID,
			Limit:        limit,
		},
	)
}

// ========================================================
// SEARCH BY NAME
// ========================================================

func (r *PlayerRepository) GetPlayersByName(
	ctx context.Context,
	search string,
) ([]db.Person, error) {

	return r.queries.GetPlayersByName(
		ctx,
		db.GetPlayersByNameParams{
			Search: search,
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

	return r.queries.GetPlayerByID(
		ctx,
		playerID,
	)
}
