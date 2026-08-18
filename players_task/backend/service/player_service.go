package services

import (
	"context"
	"database/sql"
	"errors"
	"math"

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
) (*PlayerListResult, error) {

	if page < 1 {
		return nil, ErrInvalidPage
	}

	if limit < 1 {
		return nil, ErrInvalidLimit
	}

	// Maximum 100 records per request.
	if limit > 100 {
		limit = 100
	}

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
			float64(totalPlayers) / float64(limit),
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