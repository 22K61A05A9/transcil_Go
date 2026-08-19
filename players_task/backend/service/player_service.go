package services

import (
	"context"
	"database/sql"
	"errors"
	"math"
	"strings"

	"players_task/db"
	"players_task/repository"
)

var (
	ErrInvalidPage    = errors.New("page must be a positive integer")
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

type PlayerListResult struct {
	Players      []db.Person
	Page         int
	Limit        int
	TotalPlayers int64
	TotalPages   int
}

func (s *PlayerService) GetAllPlayers(
	ctx context.Context,
	page int,
	limit int,
	search string,
) (*PlayerListResult, error) {

	if page < 1 {
		return nil, ErrInvalidPage
	}

	if limit < 1 {
		return nil, ErrInvalidLimit
	}

	// Maximum 100 records per normal request.
	if limit > 100 {
		limit = 100
	}

	search = strings.TrimSpace(search)

	// ========================================================
	// SEARCH BY NAME
	// ========================================================

	if search != "" {

		players, err := s.repository.GetPlayersByName(
			ctx,
			search,
		)

		if err != nil {
			return nil, err
		}

		/*
		 * GetPlayersByName currently returns a maximum
		 * of 20 matching players from the database.
		 *
		 * We intentionally don't calculate search
		 * pagination because CountPlayersByName
		 * was not added.
		 */

		totalPlayers := int64(len(players))

		return &PlayerListResult{
			Players:      players,
			Page:         1,
			Limit:        len(players),
			TotalPlayers: totalPlayers,
			TotalPages:   1,
		}, nil
	}

	// ========================================================
	// NORMAL PAGINATION
	// ========================================================

	offset := (page - 1) * limit

	totalPlayers, err := s.repository.CountPlayers(ctx)

	if err != nil {
		return nil, err
	}

	players, err := s.repository.GetAllPlayers(
		ctx,
		int32(limit),
		int32(offset),
	)

	if err != nil {
		return nil, err
	}

	totalPages := int(
		math.Ceil(
			float64(totalPlayers) /
				float64(limit),
		),
	)

	return &PlayerListResult{
		Players:      players,
		Page:         page,
		Limit:        limit,
		TotalPlayers: totalPlayers,
		TotalPages:   totalPages,
	}, nil
}

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
