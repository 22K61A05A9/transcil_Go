package repository

import (
	"context"

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
// WINDOW PAGINATION
// ========================================================

func (r *PlayerRepository) GetPlayersByWindow(
	ctx context.Context,
	limit int32,
	offset int32,
) ([]db.Person, error) {

	return r.queries.GetPlayersByWindow(
		ctx,
		db.GetPlayersByWindowParams{
			Limit:  limit,
			Offset: offset,
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

// ========================================================
// COUNT PLAYERS
// ========================================================

func (r *PlayerRepository) CountPlayers(
	ctx context.Context,
) (int64, error) {

	return r.queries.CountPlayers(ctx)
}