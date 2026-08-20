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

  // Cursor pagination state
  const [nextCursor, setNextCursor] =
    useState<string>("");

  const [hasNextPage, setHasNextPage] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedPlayer, setSelectedPlayer] =
    useState<Player | null>(null);

  const [playerLoading, setPlayerLoading] =
    useState(false);

  const limit = 20;

  /*
   * ========================================================
   * LOAD PLAYERS
   * ========================================================
   *
   * First request:
   *
   * GET /players?limit=20
   *
   * Next request:
   *
   * GET /players?limit=20&cursor=abstebi01
   *
   * The backend uses playerID as the keyset/cursor.
   */

  useEffect(() => {
    const trimmedSearch = search.trim();

    const isSearching =
      trimmedSearch.length >= 2;

    /*
     * Search starts a completely new cursor sequence.
     */

    if (isSearching) {
      setNextCursor("");
      setHasNextPage(true);
    }

    const loadInitialPlayers = async () => {
      try {
        if (isSearching) {
          setSearchLoading(true);
        } else {
          setLoading(true);
        }

        setError("");

        /*
         * Initial request always starts
         * from an empty cursor.
         */
        const response = await getPlayers(
          "",
          limit,
          isSearching
            ? trimmedSearch
            : ""
        );

        setPlayers(response.data);

        setNextCursor(
          response.pagination.nextCursor
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
    if (
      trimmedSearch.length === 1
    ) {
      return;
    }

    /*
     * Search waits 300ms.
     */
    const delay =
      trimmedSearch.length >= 2
        ? 300
        : 0;

    const timer =
      window.setTimeout(
        loadInitialPlayers,
        delay
      );

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  /*
   * ========================================================
   * LOAD MORE
   * ========================================================
   *
   * This is the important cursor-pagination operation.
   *
   * Current:
   *
   * nextCursor = "abstebi01"
   *
   * Request:
   *
   * GET /players?limit=20&cursor=abstebi01
   *
   * New records are appended to the existing players.
   */

  const handleLoadMore = async () => {
    if (
      loading ||
      !hasNextPage
    ) {
      return;
    }

    try {
      setLoading(true);

      setError("");

      const trimmedSearch =
        search.trim();

      const isSearching =
        trimmedSearch.length >= 2;

      const response =
        await getPlayers(
          nextCursor,
          limit,
          isSearching
            ? trimmedSearch
            : ""
        );

      /*
       * IMPORTANT:
       *
       * Cursor pagination appends the
       * new records instead of replacing
       * the existing records.
       */

      setPlayers(
        (previousPlayers) => [
          ...previousPlayers,
          ...response.data,
        ]
      );

      /*
       * Save the cursor returned by
       * the backend for the next request.
       */

      setNextCursor(
        response.pagination.nextCursor
      );

      setHasNextPage(
        response.pagination.hasNextPage
      );
    } catch (error) {
      console.error(
        "Failed to load more players:",
        error
      );

      setError(
        "Failed to load more players."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ========================================================
   * SEARCH CHANGE
   * ========================================================
   */

  const handleSearchChange = (
    value: string
  ) => {
    setSearch(value);

    /*
     * Whenever search changes, the old
     * cursor sequence becomes invalid.
     *
     * The useEffect above will start
     * a new request from cursor "".
     */

    setNextCursor("");
    setHasNextPage(true);
  };

  /*
   * ========================================================
   * VIEW PLAYER
   * ========================================================
   *
   * GET /players/:id
   */

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
    } catch (error) {
      console.error(
        "Failed to load player details:",
        error
      );

      setError(
        "Failed to load player details."
      );
    } finally {
      setPlayerLoading(false);
    }
  };

  /*
   * ========================================================
   * CLOSE PLAYER DETAILS
   * ========================================================
   */

  const closePlayerDetails = () => {
    setSelectedPlayer(null);
  };

  /*
   * ========================================================
   * SEARCH STATUS
   * ========================================================
   */

  const trimmedSearch =
    search.trim();

  const isSearching =
    trimmedSearch.length >= 2;

  /*
   * ========================================================
   * INITIAL LOADING STATE
   * ========================================================
   */

  if (loading && players.length === 0) {
    return (
      <div className="page-state">

        <div className="loader"></div>

        <p>
          Loading players...
        </p>

      </div>
    );
  }

  /*
   * ========================================================
   * ERROR STATE
   * ========================================================
   */

  if (
    error &&
    !selectedPlayer &&
    players.length === 0
  ) {
    return (
      <div className="page-state error-state">

        <h2>
          Something went wrong
        </h2>

        <p>
          {error}
        </p>

      </div>
    );
  }

  /*
   * ========================================================
   * MAIN UI
   * ========================================================
   */

  return (
    <div className="app">

      <Navbar />

      <main className="players-page">

        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <section className="page-header">

          <div>

            <p className="page-label">
              PLAYER DATABASE
            </p>

            <h1>
              Player Directory
            </h1>

            <p className="page-description">
              Search and discover players
              from the database.
            </p>

          </div>

          <div className="player-count">

            <strong>
              {players.length}
            </strong>

            <span>
              {isSearching
                ? "Loaded Matching Players"
                : "Loaded Players"}
            </span>

          </div>

        </section>


        {/* ==================================================
            SEARCH
        ================================================== */}

        <SearchBar
          value={search}
          onChange={handleSearchChange}
        />

        {search.trim().length === 1 && (

          <div className="search-status">
            Type at least 2 characters to search.
          </div>

        )}

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
                  : `Loaded ${players.length} players`}
              </p>

            </div>

          </div>


          {/* ==================================================
              PLAYER TABLE
          ================================================== */}

          {players.length > 0 ? (

            <PlayerTable
              players={players}
              onView={handleViewPlayer}
            />

          ) : (

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

          )}


          {/* ==================================================
              CURSOR PAGINATION
          ================================================== */}

          {!isSearching &&
            hasNextPage && (

              <div className="load-more-container">

                <button
                  type="button"
                  className="load-more-button"
                  onClick={handleLoadMore}
                  disabled={loading}
                >

                  {loading
                    ? "Loading..."
                    : "Load More"}

                </button>

              </div>

          )}

          {isSearching &&
            hasNextPage &&
            players.length > 0 && (

              <div className="load-more-container">

                <button
                  type="button"
                  className="load-more-button"
                  onClick={handleLoadMore}
                  disabled={loading}
                >

                  {loading
                    ? "Loading..."
                    : "Load More"}

                </button>

              </div>

          )}

          {!hasNextPage &&
            players.length > 0 && (

              <div className="search-status">
                All available players loaded.
              </div>

          )}

        </section>

      </main>


      {/* ====================================================
          PLAYER DETAILS MODAL
      ==================================================== */}

      {selectedPlayer && (

        <div
          className="modal-overlay"
          onClick={closePlayerDetails}
        >

          <div
            className="player-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              className="modal-close"
              onClick={closePlayerDetails}
              aria-label="Close player details"
            >
              ×
            </button>


            {/* HEADER */}

            <p className="modal-label">
              PLAYER DETAILS
            </p>

            <h2>

              {selectedPlayer.nameFirst ?? ""}

              {" "}

              {selectedPlayer.nameLast ?? ""}

            </h2>

            <p className="modal-player-id">
              {selectedPlayer.playerID}
            </p>


            {/* ==================================================
                ALL PLAYER DETAILS
            ================================================== */}

            <div className="player-details-grid">

              <div>
                <span>Player ID</span>
                <strong>
                  {selectedPlayer.playerID || "—"}
                </strong>
              </div>

              <div>
                <span>Birth Year</span>
                <strong>
                  {selectedPlayer.birthYear ?? "—"}
                </strong>
              </div>

              <div>
                <span>Birth Month</span>
                <strong>
                  {selectedPlayer.birthMonth ?? "—"}
                </strong>
              </div>

              <div>
                <span>Birth Day</span>
                <strong>
                  {selectedPlayer.birthDay ?? "—"}
                </strong>
              </div>

              <div>
                <span>Birth Country</span>
                <strong>
                  {selectedPlayer.birthCountry || "—"}
                </strong>
              </div>

              <div>
                <span>Birth State</span>
                <strong>
                  {selectedPlayer.birthState || "—"}
                </strong>
              </div>

              <div>
                <span>Birth City</span>
                <strong>
                  {selectedPlayer.birthCity || "—"}
                </strong>
              </div>

              <div>
                <span>Death Year</span>
                <strong>
                  {selectedPlayer.deathYear ?? "—"}
                </strong>
              </div>

              <div>
                <span>Death Month</span>
                <strong>
                  {selectedPlayer.deathMonth ?? "—"}
                </strong>
              </div>

              <div>
                <span>Death Day</span>
                <strong>
                  {selectedPlayer.deathDay ?? "—"}
                </strong>
              </div>

              <div>
                <span>Death Country</span>
                <strong>
                  {selectedPlayer.deathCountry || "—"}
                </strong>
              </div>

              <div>
                <span>Death State</span>
                <strong>
                  {selectedPlayer.deathState || "—"}
                </strong>
              </div>

              <div>
                <span>Death City</span>
                <strong>
                  {selectedPlayer.deathCity || "—"}
                </strong>
              </div>

              <div>
                <span>First Name</span>
                <strong>
                  {selectedPlayer.nameFirst || "—"}
                </strong>
              </div>

              <div>
                <span>Last Name</span>
                <strong>
                  {selectedPlayer.nameLast || "—"}
                </strong>
              </div>

              <div>
                <span>Given Name</span>
                <strong>
                  {selectedPlayer.nameGiven || "—"}
                </strong>
              </div>

              <div>
                <span>Weight</span>
                <strong>
                  {selectedPlayer.weight != null
                    ? `${selectedPlayer.weight} lb`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Height</span>
                <strong>
                  {selectedPlayer.height != null
                    ? `${selectedPlayer.height} in`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Bats</span>
                <strong>
                  {selectedPlayer.bats || "—"}
                </strong>
              </div>

              <div>
                <span>Throws</span>
                <strong>
                  {selectedPlayer.throws || "—"}
                </strong>
              </div>

              <div>
                <span>Debut</span>
                <strong>
                  {selectedPlayer.debut || "—"}
                </strong>
              </div>

              <div>
                <span>Final Game</span>
                <strong>
                  {selectedPlayer.finalGame || "—"}
                </strong>
              </div>

              <div>
                <span>Retro ID</span>
                <strong>
                  {selectedPlayer.retroID || "—"}
                </strong>
              </div>

              <div>
                <span>BBRef ID</span>
                <strong>
                  {selectedPlayer.bbrefID || "—"}
                </strong>
              </div>

            </div>

          </div>

        </div>

      )}


      {/* ====================================================
          VIEW PLAYER LOADING
      ==================================================== */}

      {playerLoading && (

        <div className="modal-overlay">

          <div className="player-loading">

            <div className="loader"></div>

            <p>
              Loading player details...
            </p>

          </div>

        </div>

      )}

    </div>
  );
}

export default PlayersPage;