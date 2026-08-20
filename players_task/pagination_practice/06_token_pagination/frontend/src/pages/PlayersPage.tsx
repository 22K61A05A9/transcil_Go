import {
  useEffect,
  useState,
} from "react";

import {
  getPlayers,
  getPlayerById,
} from "../api/playerApi";

import type { Player } from "../types/player";

import Navbar from "../components/Navbar";
import PlayerTable from "../components/PlayerTable";
import SearchBar from "../components/SearchBar";

import "../styles/players.css";

function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);

  const [search, setSearch] = useState("");

  // ========================================================
  // TOKEN PAGINATION STATE
  // ========================================================

  const [token, setToken] = useState("");

  const [nextToken, setNextToken] =
    useState("");

  const [hasNextPage, setHasNextPage] =
    useState(true);

  // ========================================================
  // LOADING / ERROR STATE
  // ========================================================

  const [loading, setLoading] = useState(true);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [error, setError] = useState("");

  // ========================================================
  // PLAYER DETAILS STATE
  // ========================================================

  const [selectedPlayer, setSelectedPlayer] =
    useState<Player | null>(null);

  const [playerLoading, setPlayerLoading] =
    useState(false);

  const limit = 20;

  // ========================================================
  // SEARCH STATE
  // ========================================================

  const trimmedSearch = search.trim();

  const isSearching =
    trimmedSearch.length >= 2;

  // ========================================================
  // LOAD PLAYERS
  // ========================================================

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        if (isSearching) {
          setSearchLoading(true);
        } else {
          setLoading(true);
        }

        setError("");

        /*
         * TOKEN PAGINATION
         *
         * First request:
         *
         * GET /players?limit=20
         *
         * token = ""
         *
         * Next request:
         *
         * GET /players?limit=20&token=<nextToken>
         */

        const response = await getPlayers(
          token,
          limit,
          isSearching
            ? trimmedSearch
            : ""
        );

        /*
         * If token is empty:
         *
         * This is the first page.
         *
         * Replace the existing players.
         */

        if (token === "") {
          setPlayers(response.data);
        } else {
          /*
           * This is a continuation request.
           *
           * Append the next page.
           */

          setPlayers(
            (previousPlayers) => [
              ...previousPlayers,
              ...response.data,
            ]
          );
        }

        /*
         * Save token returned by backend.
         *
         * This token will be used
         * for the next request.
         */

        setNextToken(
          response.pagination.nextToken
        );

        setHasNextPage(
          response.pagination.hasNextPage
        );

      } catch (error) {
        console.error(
          "Failed to load players:",
          error
        );

        setError(
          "Failed to load players."
        );

      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    };

    /*
     * Don't search for only one character.
     */

    if (trimmedSearch.length === 1) {
      return;
    }

    /*
     * Search waits 300ms.
     *
     * Normal initial loading happens immediately.
     */

    const delay =
      trimmedSearch.length >= 2
        ? 300
        : 0;

    const timer =
      window.setTimeout(
        loadPlayers,
        delay
      );

    return () => {
      window.clearTimeout(timer);
    };

  }, [
    token,
    search,
  ]);

  // ========================================================
  // SEARCH CHANGE
  // ========================================================

  const handleSearchChange = (
    value: string
  ) => {

    setSearch(value);

    /*
     * Every new search must start
     * from the beginning.
     *
     * Therefore reset token.
     */

    setToken("");

    setNextToken("");

    setHasNextPage(true);

    /*
     * Clear old results immediately
     * while new search results load.
     */

    setPlayers([]);
  };

  // ========================================================
  // LOAD MORE
  // ========================================================

  const handleLoadMore = () => {

    if (
      loading ||
      !hasNextPage ||
      !nextToken
    ) {
      return;
    }

    /*
     * Move to the next page.
     *
     * The backend-generated token
     * represents the position after
     * the current page.
     */

    setToken(nextToken);

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  // ========================================================
  // VIEW PLAYER
  // ========================================================

  const handleViewPlayer = async (
    playerID: string
  ) => {

    try {
      setPlayerLoading(true);
      setError("");

      const player =
        await getPlayerById(playerID);

      setSelectedPlayer(player);

    } catch (error) {

      console.error(
        "Failed to load player:",
        error
      );

      setError(
        "Failed to load player details."
      );

    } finally {
      setPlayerLoading(false);
    }
  };

  // ========================================================
  // CLOSE PLAYER DETAILS
  // ========================================================

  const handleClosePlayer = () => {
    setSelectedPlayer(null);
  };

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <div className="players-page">

      <Navbar />

      <main className="players-main">

        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <section className="page-header">

          <div>

            <h1>
              Players
            </h1>

            <p>
              Browse and search players
            </p>

          </div>

          <SearchBar
            value={search}
            onChange={
              handleSearchChange
            }
          />

        </section>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* ==================================================
            INITIAL LOADING
        ================================================== */}

        {loading &&
          players.length === 0 && (
            <div className="loading">
              Loading players...
            </div>
          )}

        {/* ==================================================
            SEARCH STATUS
        ================================================== */}

        {searchLoading && (
          <div className="search-status">
            Searching players...
          </div>
        )}

        {/* ==================================================
            TABLE SECTION
        ================================================== */}

        <section className="table-section">

          {/* TABLE HEADER */}

          <div className="table-header">

            <div>

              <h2>
                Players
              </h2>

              <p>
                {isSearching
                  ? `Search results for "${trimmedSearch}"`
                  : "Token pagination"}
              </p>

            </div>

          </div>

          {/* ==================================================
              PLAYER TABLE
          ================================================== */}

          {players.length > 0 ? (

            <PlayerTable
              players={players}
              onView={
                handleViewPlayer
              }
            />

          ) : (

            !loading &&
            !searchLoading && (

              <div className="no-results">

                <div className="no-results-icon">
                  ⌕
                </div>

                <h3>
                  No players found
                </h3>

                <p>
                  {isSearching
                    ? `No players match "${trimmedSearch}".`
                    : "No players are available."}
                </p>

                <p>
                  Try searching with another name.
                </p>

              </div>

            )
          )}

          {/* ==================================================
              LOAD MORE
          ================================================== */}

          {!isSearching &&
            hasNextPage &&
            players.length > 0 && (

              <div className="load-more-container">

                <button
                  type="button"
                  className="load-more-button"
                  onClick={
                    handleLoadMore
                  }
                  disabled={
                    loading ||
                    !nextToken
                  }
                >

                  {loading
                    ? "Loading..."
                    : "Load More"}

                </button>

              </div>
            )}

          {/* ==================================================
              END OF RESULTS
          ================================================== */}

          {!isSearching &&
            !hasNextPage &&
            players.length > 0 && (

              <div className="end-results">

                <p>
                  No more players to load.
                </p>

              </div>
            )}

        </section>

      </main>

      {/* ====================================================
          PLAYER DETAILS MODAL
      ==================================================== */}

      {selectedPlayer && (

        <div
          className="player-modal-overlay"
          onClick={
            handleClosePlayer
          }
        >

          <div
            className="player-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="modal-close"
              onClick={
                handleClosePlayer
              }
            >
              ×
            </button>

            <h2>
              {selectedPlayer.nameFirst}{" "}
              {selectedPlayer.nameLast}
            </h2>

            {playerLoading ? (

              <p>
                Loading player details...
              </p>

            ) : (

              <div className="player-details">

                <p>
                  <strong>
                    Player ID:
                  </strong>{" "}
                  {selectedPlayer.playerID}
                </p>

                <p>
                  <strong>
                    Name:
                  </strong>{" "}
                  {selectedPlayer.nameFirst}{" "}
                  {selectedPlayer.nameLast}
                </p>

                <p>
                  <strong>
                    Country:
                  </strong>{" "}
                  {selectedPlayer.birthCountry}
                </p>

                <p>
                  <strong>
                    Birth City:
                  </strong>{" "}
                  {selectedPlayer.birthCity}
                </p>

                <p>
                  <strong>
                    Height:
                  </strong>{" "}
                  {selectedPlayer.height}
                </p>

                <p>
                  <strong>
                    Weight:
                  </strong>{" "}
                  {selectedPlayer.weight}
                </p>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default PlayersPage;