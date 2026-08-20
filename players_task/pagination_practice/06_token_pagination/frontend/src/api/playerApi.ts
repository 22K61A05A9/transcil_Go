import api from "./axios";
import type { Player } from "../types/player";

interface PlayersResponse {
  data: Player[];

  pagination: {
    limit: number;
    nextToken: string;
    hasNextPage: boolean;
  };
}

export const getPlayers = async (
  token: string = "",
  limit: number = 20,
  search: string = ""
): Promise<PlayersResponse> => {
  const response = await api.get("/players", {
    params: {
      limit,

      ...(token
        ? { token }
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
  const response = await api.get(`/players/${playerID}`);

  return response.data;
};