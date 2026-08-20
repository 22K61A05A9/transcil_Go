package response

import "players_task/db"

func ToPlayerResponse(p db.Person) PlayerResponse {

	playerResponse := PlayerResponse{
		PlayerID:     p.Playerid,
		BirthCountry: p.Birthcountry.String,
		BirthState:   p.Birthstate.String,
		BirthCity:    p.Birthcity.String,

		DeathCountry: p.Deathcountry.String,
		DeathState:   p.Deathstate.String,
		DeathCity:    p.Deathcity.String,

		NameFirst: p.Namefirst.String,
		NameLast:  p.Namelast.String,
		NameGiven: p.Namegiven.String,

		Bats:   p.Bats.String,
		Throws: p.Throws.String,

		Debut:     p.Debut.String,
		FinalGame: p.Finalgame.String,

		RetroID: p.Retroid.String,
		BbrefID: p.Bbrefid.String,
	}

	if p.Birthyear.Valid {
		playerResponse.BirthYear = &p.Birthyear.Int32
	}

	if p.Birthmonth.Valid {
		playerResponse.BirthMonth = &p.Birthmonth.Int32
	}

	if p.Birthday.Valid {
		playerResponse.BirthDay = &p.Birthday.Int32
	}

	if p.Deathyear.Valid {
		playerResponse.DeathYear = &p.Deathyear.Int32
	}

	if p.Deathmonth.Valid {
		playerResponse.DeathMonth = &p.Deathmonth.Int32
	}

	if p.Deathday.Valid {
		playerResponse.DeathDay = &p.Deathday.Int32
	}

	if p.Weight.Valid {
		playerResponse.Weight = &p.Weight.Int32
	}

	if p.Height.Valid {
		playerResponse.Height = &p.Height.Int32
	}

	return playerResponse
}