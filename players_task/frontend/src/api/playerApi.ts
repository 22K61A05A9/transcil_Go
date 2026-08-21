import api from "./axios";

import type {
  Player,
  PlayersResponse,
  UpdatePlayerRequest,
} from "../types/player";

// ========================================================
// SORT TYPES
// ========================================================

export type SortField =
  | "firstName"
  | "birthYear"
  | "height";

export type SortOrder =
  | "asc"
  | "desc";

// ========================================================
// FILTER TYPES
// ========================================================

export interface PlayerFilters {
  birthCountry?: string;
  birthState?: string;

  bats?: "R" | "L" | "B";
  throws?: "R" | "L";

  minBirthYear?: number;
  maxBirthYear?: number;

  minHeight?: number;
  maxHeight?: number;

  minWeight?: number;
  maxWeight?: number;
}

// ========================================================
// GET PLAYERS
// ========================================================

export const getPlayers = async (
  page: number,
  limit: number,
  search: string = "",
  sortBy: SortField = "firstName",
  sortOrder: SortOrder = "asc",
  filters: PlayerFilters = {}
): Promise<PlayersResponse> => {

  const params: Record<string, string | number> = {
    page,
    limit,
    sortBy,
    sortOrder,
  };

  // ======================================================
  // SEARCH
  // ======================================================

  if (search.trim()) {
    params.search = search.trim();
  }

  // ======================================================
  // BIRTH COUNTRY
  // ======================================================

  if (filters.birthCountry?.trim()) {
    params.birthCountry = filters.birthCountry.trim();
  }

  // ======================================================
  // BIRTH STATE
  // ======================================================

  if (filters.birthState?.trim()) {
    params.birthState = filters.birthState.trim();
  }

  // ======================================================
  // BATS
  // ======================================================

  if (filters.bats) {
    params.bats = filters.bats;
  }

  // ======================================================
  // THROWS
  // ======================================================

  if (filters.throws) {
    params.throws = filters.throws;
  }

  // ======================================================
  // BIRTH YEAR
  // ======================================================

  if (filters.minBirthYear !== undefined) {
    params.minBirthYear = filters.minBirthYear;
  }

  if (filters.maxBirthYear !== undefined) {
    params.maxBirthYear = filters.maxBirthYear;
  }

  // ======================================================
  // HEIGHT
  // ======================================================

  if (filters.minHeight !== undefined) {
    params.minHeight = filters.minHeight;
  }

  if (filters.maxHeight !== undefined) {
    params.maxHeight = filters.maxHeight;
  }

  // ======================================================
  // WEIGHT
  // ======================================================

  if (filters.minWeight !== undefined) {
    params.minWeight = filters.minWeight;
  }

  if (filters.maxWeight !== undefined) {
    params.maxWeight = filters.maxWeight;
  }

  // ======================================================
  // API REQUEST
  // ======================================================

  const response =
    await api.get<PlayersResponse>(
      "/players",
      {
        params,
      }
    );

  return response.data;
};

// ========================================================
// GET PLAYER BY ID
// ========================================================

export const getPlayerById = async (
  playerID: string
): Promise<Player> => {

  const response =
    await api.get<Player>(
      `/players/${playerID}`
    );

  return response.data;
};

// ========================================================
// UPDATE PLAYER
// ========================================================

export const updatePlayer = async (
  playerID: string,
  data: UpdatePlayerRequest
): Promise<Player> => {

  const response =
    await api.put<Player>(
      `/players/${playerID}`,
      data
    );

  return response.data;
};