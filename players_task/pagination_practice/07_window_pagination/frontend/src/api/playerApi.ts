import api from "./axios";
import type { Player } from "../types/player";

interface PlayersResponse {
  data: Player[];

  pagination: {
    start: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const getPlayers = async (
  start: number = 0,
  limit: number = 20,
  search: string = ""
): Promise<PlayersResponse> => {
  const response = await api.get("/players", {
    params: {
      start,
      limit,
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