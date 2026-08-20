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

// Old offset pagination.
// Keeping this temporarily while we build
// cursor pagination.
func (r *PlayerRepository) GetAllPlayers(
	ctx context.Context,
	limit int32,
	offset int32,
) ([]db.Person, error) {

	return r.queries.GetAllPlayers(
		ctx,
		db.GetAllPlayersParams{
			Limit:  limit,
			Offset: offset,
		},
	)
}

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

func (r *PlayerRepository) GetPlayerByID(
	ctx context.Context,
	playerID string,
) (db.Person, error) {

	return r.queries.GetPlayerByID(
		ctx,
		playerID,
	)
}

func (r *PlayerRepository) CountPlayers(
	ctx context.Context,
) (int64, error) {

	return r.queries.CountPlayers(ctx)
}
