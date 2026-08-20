import api from "./axios";
import type { Player } from "../types/player";

interface PlayersResponse {
  data: Player[];

  pagination: {
    limit: number;
    nextLastName: string;
    nextPlayerID: string;
    hasNextPage: boolean;
  };
}

export const getPlayers = async (
  lastName: string = "",
  lastPlayerID: string = "",
  limit: number = 20,
  search: string = ""
): Promise<PlayersResponse> => {
  const response = await api.get("/players", {
    params: {
      limit,

      ...(lastName
        ? { lastName }
        : {}),

      ...(lastPlayerID
        ? { lastPlayerID }
        : {}),

      ...(search.trim()
        ? { search: search.trim() }
        : {}),
    },
  });

  return response.data;
};

export const getPlayerById = async (
  playerID: string
): Promise<Player> => {
  const response = await api.get(
    `/players/${playerID}`
  );

  return response.data;
};