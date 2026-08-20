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
  // ========================================================
  // WINDOW PAGINATION
  // ========================================================

  /*
   * Number of records loaded from backend per window.
   *
   * Example:
   *
   * Window 1:
   * start=0     limit=100
   *
   * Window 2:
   * start=100   limit=100
   *
   * Window 3:
   * start=200   limit=100
   */

  const WINDOW_SIZE = 100;

  const [start, setStart] = useState(0);

  // ========================================================
  // PLAYERS
  // ========================================================

  const [players, setPlayers] =
    useState<Player[]>([]);

  // ========================================================
  // PAGINATION STATE
  // ========================================================

  const [hasNextPage, setHasNextPage] =
    useState(false);

  const [hasPreviousPage, setHasPreviousPage] =
    useState(false);

  // ========================================================
  // SEARCH
  // ========================================================

  const [search, setSearch] =
    useState("");

  const trimmedSearch =
    search.trim();

  const isSearching =
    trimmedSearch.length >= 2;

  // ========================================================
  // LOADING / ERROR
  // ========================================================

  const [loading, setLoading] =
    useState(true);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ========================================================
  // PLAYER DETAILS
  // ========================================================

  const [selectedPlayer, setSelectedPlayer] =
    useState<Player | null>(null);

  const [playerLoading, setPlayerLoading] =
    useState(false);

  // ========================================================
  // LOAD CURRENT WINDOW
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
         * Backend request:
         *
         * GET /players?start=0&limit=100
         *
         * or:
         *
         * GET /players?start=100&limit=100
         *
         * or with search:
         *
         * GET /players?start=0&limit=100&search=Abreu
         */

        const response = await getPlayers(
          start,
          WINDOW_SIZE,
          isSearching
            ? trimmedSearch
            : ""
        );

        setPlayers(response.data);

        setHasNextPage(
          response.pagination.hasNextPage
        );

        setHasPreviousPage(
          response.pagination.hasPreviousPage
        );

      } catch (err) {
        console.error(
          "Failed to load players:",
          err
        );

        setError(
          "Failed to load players."
        );

        setPlayers([]);

        setHasNextPage(false);
        setHasPreviousPage(false);

      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    };

    /*
     * Don't call backend for a single
     * search character.
     */

    if (
      trimmedSearch.length === 1
    ) {
      setPlayers([]);
      return;
    }

    /*
     * Search debounce.
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
    trimmedSearch,
    isSearching,
  ]);

  // ========================================================
  // SEARCH CHANGE
  // ========================================================

  const handleSearchChange = (
    value: string
  ) => {
    setSearch(value);

    /*
     * Whenever search changes,
     * start from the first window.
     */

    setStart(0);

    /*
     * Clear old records immediately.
     */

    setPlayers([]);
  };

  // ========================================================
  // PREVIOUS WINDOW
  // ========================================================

  const handlePrevious = () => {
    if (!hasPreviousPage) {
      return;
    }

    setStart(
      Math.max(
        0,
        start - WINDOW_SIZE
      )
    );

    /*
     * Scroll position is reset automatically
     * when PlayerTable receives new players.
     */
  };

  // ========================================================
  // NEXT WINDOW
  // ========================================================

  const handleNext = () => {
    if (!hasNextPage) {
      return;
    }

    setStart(
      start + WINDOW_SIZE
    );
  };

  // ========================================================
  // CURRENT WINDOW NUMBER
  // ========================================================

  const currentWindow =
    Math.floor(
      start / WINDOW_SIZE
    ) + 1;

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
        await getPlayerById(
          playerID
        );

      setSelectedPlayer(player);

    } catch (err) {
      console.error(
        "Failed to load player:",
        err
      );

      setError(
        "Failed to load player details."
      );

    } finally {
      setPlayerLoading(false);
    }
  };

  // ========================================================
  // CLOSE PLAYER
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
            LOADING
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
                  : `Window ${currentWindow} • ${players.length} players loaded`}
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
              PAGINATION
          ================================================== */}

          {players.length > 0 && (

            <div
              className="pagination-controls"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "12px",
                padding: "14px",
              }}
            >

              <button
                type="button"
                onClick={
                  handlePrevious
                }
                disabled={
                  !hasPreviousPage ||
                  loading
                }
              >
                Previous
              </button>

              <span>
                Window {currentWindow}
              </span>

              <button
                type="button"
                onClick={
                  handleNext
                }
                disabled={
                  !hasNextPage ||
                  loading
                }
              >
                Next
              </button>

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