import axios from "axios";

import type { Player } from "../types/player";

const API_URL = "http://localhost:8081";

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
  limit: number
): Promise<PlayersResponse> => {
  const response = await axios.get(
    `${API_URL}/players`,
    {
      params: {
        page,
        limit,
      },
    }
  );

  return response.data;
};


export const getPlayerById = async (
  playerID: string
): Promise<Player> => {

  const response = await axios.get(
    `${API_URL}/players/${playerID}`
  );

  return response.data;
};