package services

import (
	"context"
	"database/sql"
	"errors"

	"players_task/db"
	"players_task/repository"
)

var (
	ErrInvalidStart   = errors.New("start must be zero or a positive integer")
	ErrInvalidLimit   = errors.New("limit must be a positive integer")
	ErrPlayerNotFound = errors.New("player not found")
)

type PlayerService struct {
	repository *repository.PlayerRepository
}

func NewPlayerService(
	repository *repository.PlayerRepository,
) *PlayerService {
	return &PlayerService{
		repository: repository,
	}
}

// ========================================================
// WINDOW PAGINATION RESULT
// ========================================================

type WindowPlayerListResult struct {
	Players         []db.Person
	Start           int
	Limit           int
	HasNextPage     bool
	HasPreviousPage bool
}

// ========================================================
// WINDOW PAGINATION
// ========================================================
//
// First request:
//
// GET /players?start=0&limit=20
//
// Second window:
//
// GET /players?start=20&limit=20
//
// Third window:
//
// GET /players?start=40&limit=20
//
// Here:
//
//     start = starting position
//     limit = number of records
//
// The database uses:
//
//     LIMIT limit OFFSET start
//

func (s *PlayerService) GetPlayersByWindow(
	ctx context.Context,
	start int,
	limit int,
) (*WindowPlayerListResult, error) {

	// ========================================================
	// VALIDATE START
	// ========================================================

	if start < 0 {
		return nil, ErrInvalidStart
	}

	// ========================================================
	// VALIDATE LIMIT
	// ========================================================

	if limit < 1 {
		return nil, ErrInvalidLimit
	}

	// ========================================================
	// MAXIMUM LIMIT
	// ========================================================

	// Maximum 100 records per request.
	if limit > 100 {
		limit = 100
	}

	// ========================================================
	// GET TOTAL PLAYERS
	// ========================================================

	totalPlayers, err := s.repository.CountPlayers(ctx)

	if err != nil {
		return nil, err
	}

	// ========================================================
	// GET CURRENT WINDOW
	// ========================================================

	players, err := s.repository.GetPlayersByWindow(
		ctx,
		int32(limit),
		int32(start),
	)

	if err != nil {
		return nil, err
	}

	// ========================================================
	// PREVIOUS WINDOW
	// ========================================================

	/*
	 * If start is greater than zero,
	 * there is a previous window.
	 *
	 * Example:
	 *
	 * start = 0
	 *     Previous = false
	 *
	 * start = 20
	 *     Previous = true
	 */

	hasPreviousPage := start > 0

	// ========================================================
	// NEXT WINDOW
	// ========================================================

	/*
	 * Example:
	 *
	 * totalPlayers = 19370
	 *
	 * start = 0
	 * limit = 20
	 *
	 * 0 + 20 < 19370
	 *
	 * true
	 *
	 * Therefore another window exists.
	 */

	hasNextPage := int64(start+limit) < totalPlayers

	// ========================================================
	// RETURN RESULT
	// ========================================================

	return &WindowPlayerListResult{
		Players:         players,
		Start:           start,
		Limit:           limit,
		HasNextPage:     hasNextPage,
		HasPreviousPage: hasPreviousPage,
	}, nil
}

// ========================================================
// GET PLAYER BY ID
// ========================================================

func (s *PlayerService) GetPlayerByID(
	ctx context.Context,
	playerID string,
) (db.Person, error) {

	player, err := s.repository.GetPlayerByID(
		ctx,
		playerID,
	)

	if err != nil {

		if errors.Is(err, sql.ErrNoRows) {
			return db.Person{}, ErrPlayerNotFound
		}

		return db.Person{}, err
	}

	return player, nil
}
