// api response structure
package response

type PlayerResponse struct {
	PlayerID     string `json:"playerID"`
	BirthYear    *int32 `json:"birthYear,omitempty"`
	BirthMonth   *int32 `json:"birthMonth,omitempty"`
	BirthDay     *int32 `json:"birthDay,omitempty"`
	BirthCountry string `json:"birthCountry,omitempty"`
	BirthState   string `json:"birthState,omitempty"`
	BirthCity    string `json:"birthCity,omitempty"`
	DeathYear    *int32 `json:"deathYear,omitempty"`
	DeathMonth   *int32 `json:"deathMonth,omitempty"`
	DeathDay     *int32 `json:"deathDay,omitempty"`
	DeathCountry string `json:"deathCountry,omitempty"`
	DeathState   string `json:"deathState,omitempty"`
	DeathCity    string `json:"deathCity,omitempty"`
	NameFirst    string `json:"nameFirst,omitempty"`
	NameLast     string `json:"nameLast,omitempty"`
	NameGiven    string `json:"nameGiven,omitempty"`
	Weight       *int32 `json:"weight,omitempty"`
	Height       *int32 `json:"height,omitempty"`
	Bats         string `json:"bats,omitempty"`
	Throws       string `json:"throws,omitempty"`
	Debut        string `json:"debut,omitempty"`
	FinalGame    string `json:"finalGame,omitempty"`
	RetroID      string `json:"retroID,omitempty"`
	BbrefID      string `json:"bbrefID,omitempty"`
}
type PaginationResponse struct {
	Page         int   `json:"page"`
	Limit        int   `json:"limit"`
	TotalPlayers int64 `json:"totalPlayers"`
	TotalPages   int   `json:"totalPages"`
}

type PlayerListResponse struct {
	Data       []PlayerResponse   `json:"data"`
	Pagination PaginationResponse `json:"pagination"`
}

// Cursor pagination response
type CursorPaginationResponse struct {
	Limit       int    `json:"limit"`
	NextCursor  string `json:"nextCursor,omitempty"`
	HasNextPage bool   `json:"hasNextPage"`
}

type CursorPlayerListResponse struct {
	Data       []PlayerResponse         `json:"data"`
	Pagination CursorPaginationResponse `json:"pagination"`
}
