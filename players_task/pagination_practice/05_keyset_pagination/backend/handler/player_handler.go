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

// GET /players?limit=20&lastName=Abreu&lastPlayerID=abrew001
func (h *PlayerHandler) GetAllPlayers(c *gin.Context) {

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
	// GET KEYSET POSITION
	// ========================================================
	//
	// The keyset consists of TWO values:
	//
	//     lastName
	//     lastPlayerID
	//
	// First request:
	//
	// GET /players?limit=20
	//
	// lastName     = ""
	// lastPlayerID = ""
	//
	// Next request:
	//
	// GET /players?limit=20
	//     &lastName=Abreu
	//     &lastPlayerID=abrew001
	//

	lastName := c.Query("lastName")
	lastPlayerID := c.Query("lastPlayerID")

	// ========================================================
	// GET PLAYERS
	// ========================================================

	result, err := h.service.GetPlayersByKeyset(
		c.Request.Context(),
		lastName,
		lastPlayerID,
		limit,
	)

	if err != nil {

		if errors.Is(
			err,
			services.ErrInvalidLimit,
		) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		// Don't expose internal database errors.
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
	// BUILD KEYSET RESPONSE
	// ========================================================

	apiResponse := response.KeysetPlayerListResponse{
		Data: playerResponses,

		Pagination: response.KeysetPaginationResponse{
			Limit:        result.Limit,
			NextLastName: result.NextLastName,
			NextPlayerID: result.NextPlayerID,
			HasNextPage:  result.HasNextPage,
		},
	}

	c.JSON(
		http.StatusOK,
		apiResponse,
	)
}

// GET /players/:id
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

	playerResponse :=
		response.ToPlayerResponse(player)

	c.JSON(
		http.StatusOK,
		playerResponse,
	)
}
