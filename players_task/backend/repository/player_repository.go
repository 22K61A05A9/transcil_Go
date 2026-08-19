package repository

import (
	"context"

	"players_task/db"
)

type PlayerRepository struct {
	queries *db.Queries
}

func NewPlayerRepository(queries *db.Queries) *PlayerRepository {
	return &PlayerRepository{
		queries: queries,
	}
}

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
