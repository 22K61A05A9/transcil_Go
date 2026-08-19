import api from "./axios";
import type { Player } from "../types/player";

interface PlayersResponse {
  data: Player[];

  pagination: {
    limit: number;
    page: number;
    totalPages: number;
    totalPlayers: number;
  };
}

export const getPlayers = async (
  page: number,
  limit: number,
  search: string = ""
): Promise<PlayersResponse> => {
  const response = await api.get("/players", {
    params: {
      page,
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