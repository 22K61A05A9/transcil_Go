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
  // WINDOW PAGINATION STATE
  // ========================================================

  const [start, setStart] = useState(0);

  const [hasNextPage, setHasNextPage] =
    useState(true);

  const [hasPreviousPage, setHasPreviousPage] =
    useState(false);

  const limit = 20;

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

  // ========================================================
  // SEARCH STATE
  // ========================================================

  const trimmedSearch = search.trim();

  const isSearching =
    trimmedSearch.length >= 2;

  // ========================================================
  // CURRENT WINDOW NUMBER
  // ========================================================

  const currentWindow =
    Math.floor(start / limit) + 1;

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
         * WINDOW PAGINATION
         *
         * First request:
         *
         * GET /players?start=0&limit=20
         *
         * Second request:
         *
         * GET /players?start=20&limit=20
         *
         * Third request:
         *
         * GET /players?start=40&limit=20
         */

        const response = await getPlayers(
          start,
          limit,
          isSearching
            ? trimmedSearch
            : ""
        );

        /*
         * Window pagination replaces
         * the current records.
         *
         * We DO NOT append records.
         */

        setPlayers(response.data);

        /*
         * Save pagination information
         * returned by the backend.
         */

        setHasNextPage(
          response.pagination.hasNextPage
        );

        setHasPreviousPage(
          response.pagination.hasPreviousPage
        );

      } catch (error) {
        console.error(
          "Failed to load players:",
          error
        );

        setError(
          "Failed to load players."
        );

        setPlayers([]);

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
     * Normal pagination requests happen
     * immediately.
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
    start,
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
     * Every new search starts
     * from the first window.
     */

    setStart(0);

    setHasPreviousPage(false);
    setHasNextPage(true);

    /*
     * Clear old results immediately
     * while new results load.
     */

    setPlayers([]);
  };

  // ========================================================
  // NEXT WINDOW
  // ========================================================

  const handleNext = () => {
    if (
      loading ||
      !hasNextPage
    ) {
      return;
    }

    /*
     * Move forward by one window.
     *
     * Example:
     *
     * start = 0
     *     ↓
     * start = 20
     */

    setStart(
      (currentStart) =>
        currentStart + limit
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ========================================================
  // PREVIOUS WINDOW
  // ========================================================

  const handlePrevious = () => {
    if (
      loading ||
      !hasPreviousPage
    ) {
      return;
    }

    /*
     * Move backward by one window.
     *
     * Example:
     *
     * start = 20
     *     ↓
     * start = 0
     */

    setStart(
      (currentStart) =>
        Math.max(
          0,
          currentStart - limit
        )
    );

    window.scrollTo({
      top: 0,
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
                  : `Window pagination — Window ${currentWindow}`}
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
              PREVIOUS / NEXT PAGINATION
          ================================================== */}

          {!isSearching &&
            players.length > 0 && (

              <div className="load-more-container">

                <button
                  type="button"
                  className="load-more-button"
                  onClick={
                    handlePrevious
                  }
                  disabled={
                    loading ||
                    !hasPreviousPage
                  }
                >
                  Previous
                </button>

                <span
                  style={{
                    margin: "0 20px",
                    fontWeight: 600,
                  }}
                >
                  Window {currentWindow}
                </span>

                <button
                  type="button"
                  className="load-more-button"
                  onClick={
                    handleNext
                  }
                  disabled={
                    loading ||
                    !hasNextPage
                  }
                >
                  {loading
                    ? "Loading..."
                    : "Next"}
                </button>

              </div>
            )}

          {/* ==================================================
              SEARCH RESULT MESSAGE
          ================================================== */}

          {isSearching &&
            players.length > 0 && (

              <div className="end-results">

                <p>
                  Search results shown above.
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