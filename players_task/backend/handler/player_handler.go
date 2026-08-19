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

// GET /players?page=1&limit=20&search=da
func (h *PlayerHandler) GetAllPlayers(c *gin.Context) {

	// Get page number.
	page, err := strconv.Atoi(
		c.DefaultQuery("page", "1"),
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "page must be a positive integer",
		})
		return
	}

	// Get number of records per page.
	limit, err := strconv.Atoi(
		c.DefaultQuery("limit", "20"),
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "limit must be a positive integer",
		})
		return
	}

	// Get optional player name search.
	search := c.Query("search")

	// Call service.
	result, err := h.service.GetAllPlayers(
		c.Request.Context(),
		page,
		limit,
		search,
	)

	if err != nil {

		if errors.Is(err, services.ErrInvalidPage) ||
			errors.Is(err, services.ErrInvalidLimit) {

			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		// Do not expose internal database errors.
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to retrieve players",
		})
		return
	}

	// Convert database models into API response models.
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

	// Build final API response.
	apiResponse := response.PlayerListResponse{
		Data: playerResponses,

		Pagination: response.PaginationResponse{
			Page:         result.Page,
			Limit:        result.Limit,
			TotalPlayers: result.TotalPlayers,
			TotalPages:   result.TotalPages,
		},
	}

	c.JSON(http.StatusOK, apiResponse)
}

// GET /players/:id
func (h *PlayerHandler) GetPlayerByID(c *gin.Context) {

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

	c.JSON(http.StatusOK, playerResponse)
}
