package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"players_task/response"
	"players_task/service"
)

type PlayerHandler struct {
	service *services.PlayerService
}

func NewPlayerHandler(
	playerService *services.PlayerService,
) *PlayerHandler {
	return &PlayerHandler{
		service: playerService,
	}
}

// ========================================================
// GET /players?start=0&limit=20
// ========================================================
//
// Window pagination:
//
// First request:
//     /players?start=0&limit=20
//
// Next window:
//     /players?start=20&limit=20
//
// Previous window:
//     /players?start=0&limit=20
//

func (h *PlayerHandler) GetAllPlayers(c *gin.Context) {

	// ========================================================
	// GET START
	// ========================================================

	start, err := strconv.Atoi(
		c.DefaultQuery("start", "0"),
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "start must be zero or a positive integer",
		})
		return
	}

	// ========================================================
	// GET LIMIT
	// ========================================================

	limit, err := strconv.Atoi(
		c.DefaultQuery("limit", "20"),
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "limit must be a positive integer",
		})
		return
	}

	// ========================================================
	// GET PLAYERS
	// ========================================================

	result, err := h.service.GetPlayersByWindow(
		c.Request.Context(),
		start,
		limit,
	)

	if err != nil {

		if errors.Is(
			err,
			services.ErrInvalidStart,
		) || errors.Is(
			err,
			services.ErrInvalidLimit,
		) {

			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to retrieve players",
		})
		return
	}

	// ========================================================
	// CONVERT DATABASE MODELS
	// TO API RESPONSE MODELS
	// ========================================================

	playerResponses := make(
		[]response.PlayerResponse,
		0,
		len(result.Players),
	)

	for _, player := range result.Players {

		playerResponses = append(
			playerResponses,
			response.ToPlayerResponse(player),
		)
	}

	// ========================================================
	// BUILD WINDOW RESPONSE
	// ========================================================

	apiResponse := response.WindowPlayerListResponse{
		Data: playerResponses,

		Pagination: response.WindowPaginationResponse{
			Start:           result.Start,
			Limit:           result.Limit,
			HasNextPage:     result.HasNextPage,
			HasPreviousPage: result.HasPreviousPage,
		},
	}

	// ========================================================
	// SEND RESPONSE
	// ========================================================

	c.JSON(
		http.StatusOK,
		apiResponse,
	)
}

// ========================================================
// GET /players/:id
// ========================================================

func (h *PlayerHandler) GetPlayerByID(
	c *gin.Context,
) {

	playerID := c.Param("id")

	player, err := h.service.GetPlayerByID(
		c.Request.Context(),
		playerID,
	)

	if err != nil {

		if errors.Is(
			err,
			services.ErrPlayerNotFound,
		) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "player not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to retrieve player",
		})
		return
	}

	playerResponse := response.ToPlayerResponse(player)

	c.JSON(
		http.StatusOK,
		playerResponse,
	)
}
