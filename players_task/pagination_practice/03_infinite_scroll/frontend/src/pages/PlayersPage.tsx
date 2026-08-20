import {
  useEffect,
  useRef,
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

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalPlayers, setTotalPlayers] = useState(0);

  const [loading, setLoading] = useState(true);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [selectedPlayer, setSelectedPlayer] =
    useState<Player | null>(null);

  const [playerLoading, setPlayerLoading] =
    useState(false);

  /*
   * ========================================================
   * INFINITE SCROLL SENTINEL
   * ========================================================
   *
   * This element is placed near the bottom of the page.
   *
   * IntersectionObserver watches this element.
   *
   * When it becomes visible:
   *
   *     sentinel visible
   *          ↓
   *     currentPage + 1
   *          ↓
   *     API request
   *          ↓
   *     next page appended
   */

  const loadMoreRef =
    useRef<HTMLDivElement | null>(null);

  const limit = 20;

  /*
   * ========================================================
   * LOAD PLAYERS / BACKEND SEARCH
   * ========================================================
   *
   * Normal:
   *
   * GET /players?page=1&limit=20
   *
   * Next page:
   *
   * GET /players?page=2&limit=20
   *
   * Search:
   *
   * GET /players?page=1&limit=20&search=Bob
   *
   * Search starts after 2 characters.
   */

  useEffect(() => {
    const trimmedSearch = search.trim();

    const isCurrentlySearching =
      trimmedSearch.length >= 2;

    const loadPlayers = async () => {
      try {
        if (isCurrentlySearching) {
          setSearchLoading(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getPlayers(
          currentPage,
          limit,
          isCurrentlySearching
            ? trimmedSearch
            : ""
        );

        /*
         * Page 1:
         *
         * Replace the existing players.
         *
         * This is important when:
         * - application first loads
         * - user starts a new search
         */

        if (currentPage === 1) {
          setPlayers(response.data);
        }

        /*
         * Page 2, 3, 4...
         *
         * Append the new players to
         * the existing players.
         *
         * This is the main requirement
         * for infinite scrolling.
         */

        else {
          setPlayers(
            (previousPlayers) => [
              ...previousPlayers,
              ...response.data,
            ]
          );
        }

        setTotalPages(
          response.pagination.totalPages
        );

        setTotalPlayers(
          response.pagination.totalPlayers
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
     * Don't send a search request
     * for only one character.
     */

    if (
      trimmedSearch.length === 1
    ) {
      return;
    }

    /*
     * Normal loading:
     * immediate request.
     *
     * Search:
     * wait 300ms.
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
  }, [currentPage, search]);

  /*
   * ========================================================
   * INFINITE SCROLL
   * ========================================================
   *
   * IntersectionObserver watches the sentinel.
   *
   * When the sentinel enters the viewport:
   *
   *     entry.isIntersecting
   *              ↓
   *        currentPage + 1
   *              ↓
   *        useEffect above
   *              ↓
   *        GET /players?page=next
   */

  useEffect(() => {
    const element =
      loadMoreRef.current;

    if (!element) {
      return;
    }

    /*
     * Calculate search state inside
     * this effect.
     *
     * This avoids using a variable
     * declared later in the component.
     */

    const trimmedSearch =
      search.trim();

    const isCurrentlySearching =
      trimmedSearch.length >= 2;

    /*
     * Don't use infinite scroll
     * while searching.
     */

    if (isCurrentlySearching) {
      return;
    }

    /*
     * Don't request another page
     * when we already reached the
     * final page.
     */

    if (
      currentPage >= totalPages
    ) {
      return;
    }

    /*
     * Create IntersectionObserver.
     */

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry =
            entries[0];

          /*
           * Sentinel entered viewport
           * and no request is currently
           * loading.
           */

          if (
            entry.isIntersecting &&
            !loading
          ) {
            setCurrentPage(
              (page) => page + 1
            );
          }
        },
        {
          /*
           * Observe against browser
           * viewport.
           */
          root: null,

          /*
           * Start loading slightly
           * before the user reaches
           * the exact bottom.
           */
          rootMargin: "200px",

          threshold: 0,
        }
      );

    /*
     * Start observing sentinel.
     */

    observer.observe(element);

    /*
     * Cleanup observer whenever
     * dependencies change or the
     * component unmounts.
     */

    return () => {
      observer.disconnect();
    };
  }, [
    currentPage,
    totalPages,
    loading,
    search,
  ]);

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
     * Every new search starts
     * from page 1.
     */

    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  /*
   * ========================================================
   * VIEW PLAYER
   * ========================================================
   *
   * GET /players/:id
   *
   * Gets the complete player record.
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
   * SEARCH STATE
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

  if (
    loading &&
    currentPage === 1
  ) {
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
    !selectedPlayer
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
              {isSearching
                ? players.length
                : totalPlayers}
            </strong>

            <span>
              {isSearching
                ? "Matching Players"
                : "Total Players"}
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
                  : `Showing ${players.length} of ${totalPlayers} players`}
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
              INFINITE SCROLL SENTINEL
          ================================================== */}

          {!isSearching &&
            currentPage < totalPages && (

              <div
                ref={loadMoreRef}
                className="infinite-scroll-sentinel"
              >

                {loading && (
                  <p>
                    Loading more players...
                  </p>
                )}

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
              onClick={
                closePlayerDetails
              }
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
                PLAYER DETAILS
            ================================================== */}

            <div className="player-details-grid">

              {/* PLAYER ID */}

              <div>
                <span>
                  Player ID
                </span>

                <strong>
                  {selectedPlayer.playerID || "—"}
                </strong>
              </div>

              {/* BIRTH YEAR */}

              <div>
                <span>
                  Birth Year
                </span>

                <strong>
                  {selectedPlayer.birthYear ?? "—"}
                </strong>
              </div>

              {/* BIRTH MONTH */}

              <div>
                <span>
                  Birth Month
                </span>

                <strong>
                  {selectedPlayer.birthMonth ?? "—"}
                </strong>
              </div>

              {/* BIRTH DAY */}

              <div>
                <span>
                  Birth Day
                </span>

                <strong>
                  {selectedPlayer.birthDay ?? "—"}
                </strong>
              </div>

              {/* BIRTH COUNTRY */}

              <div>
                <span>
                  Birth Country
                </span>

                <strong>
                  {selectedPlayer.birthCountry || "—"}
                </strong>
              </div>

              {/* BIRTH STATE */}

              <div>
                <span>
                  Birth State
                </span>

                <strong>
                  {selectedPlayer.birthState || "—"}
                </strong>
              </div>

              {/* BIRTH CITY */}

              <div>
                <span>
                  Birth City
                </span>

                <strong>
                  {selectedPlayer.birthCity || "—"}
                </strong>
              </div>

              {/* DEATH YEAR */}

              <div>
                <span>
                  Death Year
                </span>

                <strong>
                  {selectedPlayer.deathYear ?? "—"}
                </strong>
              </div>

              {/* DEATH MONTH */}

              <div>
                <span>
                  Death Month
                </span>

                <strong>
                  {selectedPlayer.deathMonth ?? "—"}
                </strong>
              </div>

              {/* DEATH DAY */}

              <div>
                <span>
                  Death Day
                </span>

                <strong>
                  {selectedPlayer.deathDay ?? "—"}
                </strong>
              </div>

              {/* DEATH COUNTRY */}

              <div>
                <span>
                  Death Country
                </span>

                <strong>
                  {selectedPlayer.deathCountry || "—"}
                </strong>
              </div>

              {/* DEATH STATE */}

              <div>
                <span>
                  Death State
                </span>

                <strong>
                  {selectedPlayer.deathState || "—"}
                </strong>
              </div>

              {/* DEATH CITY */}

              <div>
                <span>
                  Death City
                </span>

                <strong>
                  {selectedPlayer.deathCity || "—"}
                </strong>
              </div>

              {/* FIRST NAME */}

              <div>
                <span>
                  First Name
                </span>

                <strong>
                  {selectedPlayer.nameFirst || "—"}
                </strong>
              </div>

              {/* LAST NAME */}

              <div>
                <span>
                  Last Name
                </span>

                <strong>
                  {selectedPlayer.nameLast || "—"}
                </strong>
              </div>

              {/* GIVEN NAME */}

              <div>
                <span>
                  Given Name
                </span>

                <strong>
                  {selectedPlayer.nameGiven || "—"}
                </strong>
              </div>

              {/* WEIGHT */}

              <div>
                <span>
                  Weight
                </span>

                <strong>
                  {selectedPlayer.weight != null
                    ? `${selectedPlayer.weight} lb`
                    : "—"}
                </strong>
              </div>

              {/* HEIGHT */}

              <div>
                <span>
                  Height
                </span>

                <strong>
                  {selectedPlayer.height != null
                    ? `${selectedPlayer.height} in`
                    : "—"}
                </strong>
              </div>

              {/* BATS */}

              <div>
                <span>
                  Bats
                </span>

                <strong>
                  {selectedPlayer.bats || "—"}
                </strong>
              </div>

              {/* THROWS */}

              <div>
                <span>
                  Throws
                </span>

                <strong>
                  {selectedPlayer.throws || "—"}
                </strong>
              </div>

              {/* DEBUT */}

              <div>
                <span>
                  Debut
                </span>

                <strong>
                  {selectedPlayer.debut || "—"}
                </strong>
              </div>

              {/* FINAL GAME */}

              <div>
                <span>
                  Final Game
                </span>

                <strong>
                  {selectedPlayer.finalGame || "—"}
                </strong>
              </div>

              {/* RETRO ID */}

              <div>
                <span>
                  Retro ID
                </span>

                <strong>
                  {selectedPlayer.retroID || "—"}
                </strong>
              </div>

              {/* BBREF ID */}

              <div>
                <span>
                  BBRef ID
                </span>

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