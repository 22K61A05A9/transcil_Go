export interface Player {
  playerID: string;

  birthYear?: number;
  birthMonth?: number;
  birthDay?: number;

  birthCountry?: string;
  birthState?: string;
  birthCity?: string;

  deathYear?: number;
  deathMonth?: number;
  deathDay?: number;

  deathCountry?: string;
  deathState?: string;
  deathCity?: string;

  nameFirst?: string;
  nameLast?: string;
  nameGiven?: string;

  weight?: number;
  height?: number;

  bats?: string;
  throws?: string;

  debut?: string;
  finalGame?: string;

  retroID?: string;
  bbrefID?: string;
}
export interface Pagination {
  page: number;
  limit: number;
  totalPlayers: number;
  totalPages: number;
}
export interface PlayersResponse {
  data: Player[];
  pagination: Pagination;
}