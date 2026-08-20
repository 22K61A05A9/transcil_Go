package services

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"players_task/db"
	"players_task/repository"
)

var (
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
// CURSOR PAGINATION RESULT
// ========================================================

type CursorPlayerListResult struct {
	Players     []db.Person
	Limit       int
	NextCursor  string
	HasNextPage bool
}

// ========================================================
// CURSOR PAGINATION
// ========================================================

func (s *PlayerService) GetPlayersByCursor(
	ctx context.Context,
	cursor string,
	limit int,
) (*CursorPlayerListResult, error) {

	if limit < 1 {
		return nil, ErrInvalidLimit
	}

	// Maximum 100 records per request.
	if limit > 100 {
		limit = 100
	}

	cursor = strings.TrimSpace(cursor)

	/*
	 * Request one extra record.
	 *
	 * Example:
	 *
	 * limit = 20
	 *
	 * We fetch 21 records.
	 *
	 * If 21 records exist:
	 *     first 20 -> response
	 *     21st      -> proves another page exists
	 *
	 * If only 20 or fewer exist:
	 *     there is no next page.
	 */

	fetchLimit := limit + 1

	players, err := s.repository.GetPlayersByCursor(
		ctx,
		cursor,
		int32(fetchLimit),
	)

	if err != nil {
		return nil, err
	}

	hasNextPage := len(players) > limit

	/*
	 * Remove the extra record.
	 */

	if hasNextPage {
		players = players[:limit]
	}

	/*
	 * The last player in the current response
	 * becomes the cursor for the next request.
	 */

	nextCursor := ""

	if hasNextPage && len(players) > 0 {
		nextCursor = players[len(players)-1].Playerid
	}

	return &CursorPlayerListResult{
		Players:     players,
		Limit:       limit,
		NextCursor:  nextCursor,
		HasNextPage: hasNextPage,
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
