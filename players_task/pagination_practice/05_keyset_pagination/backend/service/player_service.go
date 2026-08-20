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
// KEYSET PAGINATION RESULT
// ========================================================

type KeysetPlayerListResult struct {
	Players      []db.Person
	Limit        int
	NextLastName string
	NextPlayerID string
	HasNextPage  bool
}

// ========================================================
// KEYSET PAGINATION
// ========================================================
//
// Keyset is based on:
//
//     nameLast + playerID
//
// SQL ordering:
//
//     ORDER BY nameLast, playerID
//
// The frontend sends the last record's:
//
//     nameLast
//     playerID
//
// as the keyset position for the next request.
//

func (s *PlayerService) GetPlayersByKeyset(
	ctx context.Context,
	lastName string,
	lastPlayerID string,
	limit int,
) (*KeysetPlayerListResult, error) {

	if limit < 1 {
		return nil, ErrInvalidLimit
	}

	// Maximum 100 records per request.
	if limit > 100 {
		limit = 100
	}

	lastName = strings.TrimSpace(lastName)
	lastPlayerID = strings.TrimSpace(lastPlayerID)

	/*
	 * Fetch one extra record.
	 *
	 * Example:
	 *
	 * limit = 20
	 *
	 * Fetch 21.
	 *
	 * If 21 records are returned:
	 *     first 20 -> send to frontend
	 *     21st      -> proves another page exists
	 *
	 * If <= 20:
	 *     there is no next page.
	 */

	fetchLimit := int32(limit + 1)

	players, err := s.repository.GetPlayersByKeyset(
		ctx,
		lastName,
		lastPlayerID,
		fetchLimit,
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
	 * becomes the keyset position for the next request.
	 *
	 * We need TWO values because the ordering is:
	 *
	 *     nameLast
	 *     playerID
	 */

	nextLastName := ""
	nextPlayerID := ""

	if hasNextPage && len(players) > 0 {

		lastPlayer := players[len(players)-1]

		// sqlc generated Namelast as sql.NullString.
		nextLastName = lastPlayer.Namelast.String

		nextPlayerID = lastPlayer.Playerid
	}

	return &KeysetPlayerListResult{
		Players:      players,
		Limit:        limit,
		NextLastName: nextLastName,
		NextPlayerID: nextPlayerID,
		HasNextPage:  hasNextPage,
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
