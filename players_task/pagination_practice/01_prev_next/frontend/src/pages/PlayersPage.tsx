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
import Pagination from "../components/Pagination";
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

  const limit = 20;

  /*
   * ========================================================
   * LOAD PLAYERS / BACKEND SEARCH
   * ========================================================
   *
   * Normal:
   * GET /players?page=1&limit=20
   *
   * Search:
   * GET /players?page=1&limit=20&search=Bob
   *
   * Backend search starts only after 2 characters.
   */

  useEffect(() => {
    const trimmedSearch = search.trim();

    const isSearching =
      trimmedSearch.length >= 2;

    const loadPlayers = async () => {
      try {
        if (isSearching) {
          setSearchLoading(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getPlayers(
          currentPage,
          limit,
          isSearching ? trimmedSearch : ""
        );

        setPlayers(response.data);

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
     * Don't send a search request for
     * only one character.
     */

    if (
      trimmedSearch.length === 1
    ) {
      return;
    }

    /*
     * Normal loading happens immediately.
     *
     * Search waits 300ms so that we don't
     * send a request for every keystroke.
     */

    const delay =
      trimmedSearch.length >= 2
        ? 300
        : 0;

    const timer = window.setTimeout(
      loadPlayers,
      delay
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [currentPage, search]);

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
   * PAGE CHANGE
   * ========================================================
   */

  const handlePageChange = (
    page: number
  ) => {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * ========================================================
   * VIEW PLAYER
   * ========================================================
   *
   * GET /players/:id
   *
   * This gets the complete player record.
   */

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
   * LOADING STATE
   * ========================================================
   */

  if (loading) {
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
                  : `Showing page ${currentPage} of ${totalPages}`}

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
              PAGINATION
          ================================================== */}

          {!isSearching &&
            totalPages > 1 && (

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />

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
                ALL 24 PLAYER DETAILS
            ================================================== */}

            <div className="player-details-grid">

              {/* 1. PLAYER ID */}

              <div>

                <span>
                  Player ID
                </span>

                <strong>
                  {selectedPlayer.playerID || "—"}
                </strong>

              </div>


              {/* 2. BIRTH YEAR */}

              <div>

                <span>
                  Birth Year
                </span>

                <strong>
                  {selectedPlayer.birthYear ?? "—"}
                </strong>

              </div>


              {/* 3. BIRTH MONTH */}

              <div>

                <span>
                  Birth Month
                </span>

                <strong>
                  {selectedPlayer.birthMonth ?? "—"}
                </strong>

              </div>


              {/* 4. BIRTH DAY */}

              <div>

                <span>
                  Birth Day
                </span>

                <strong>
                  {selectedPlayer.birthDay ?? "—"}
                </strong>

              </div>


              {/* 5. BIRTH COUNTRY */}

              <div>

                <span>
                  Birth Country
                </span>

                <strong>
                  {selectedPlayer.birthCountry || "—"}
                </strong>

              </div>


              {/* 6. BIRTH STATE */}

              <div>

                <span>
                  Birth State
                </span>

                <strong>
                  {selectedPlayer.birthState || "—"}
                </strong>

              </div>


              {/* 7. BIRTH CITY */}

              <div>

                <span>
                  Birth City
                </span>

                <strong>
                  {selectedPlayer.birthCity || "—"}
                </strong>

              </div>


              {/* 8. DEATH YEAR */}

              <div>

                <span>
                  Death Year
                </span>

                <strong>
                  {selectedPlayer.deathYear ?? "—"}
                </strong>

              </div>


              {/* 9. DEATH MONTH */}

              <div>

                <span>
                  Death Month
                </span>

                <strong>
                  {selectedPlayer.deathMonth ?? "—"}
                </strong>

              </div>


              {/* 10. DEATH DAY */}

              <div>

                <span>
                  Death Day
                </span>

                <strong>
                  {selectedPlayer.deathDay ?? "—"}
                </strong>

              </div>


              {/* 11. DEATH COUNTRY */}

              <div>

                <span>
                  Death Country
                </span>

                <strong>
                  {selectedPlayer.deathCountry || "—"}
                </strong>

              </div>


              {/* 12. DEATH STATE */}

              <div>

                <span>
                  Death State
                </span>

                <strong>
                  {selectedPlayer.deathState || "—"}
                </strong>

              </div>


              {/* 13. DEATH CITY */}

              <div>

                <span>
                  Death City
                </span>

                <strong>
                  {selectedPlayer.deathCity || "—"}
                </strong>

              </div>


              {/* 14. FIRST NAME */}

              <div>

                <span>
                  First Name
                </span>

                <strong>
                  {selectedPlayer.nameFirst || "—"}
                </strong>

              </div>


              {/* 15. LAST NAME */}

              <div>

                <span>
                  Last Name
                </span>

                <strong>
                  {selectedPlayer.nameLast || "—"}
                </strong>

              </div>


              {/* 16. GIVEN NAME */}

              <div>

                <span>
                  Given Name
                </span>

                <strong>
                  {selectedPlayer.nameGiven || "—"}
                </strong>

              </div>


              {/* 17. WEIGHT */}

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


              {/* 18. HEIGHT */}

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


              {/* 19. BATS */}

              <div>

                <span>
                  Bats
                </span>

                <strong>
                  {selectedPlayer.bats || "—"}
                </strong>

              </div>


              {/* 20. THROWS */}

              <div>

                <span>
                  Throws
                </span>

                <strong>
                  {selectedPlayer.throws || "—"}
                </strong>

              </div>


              {/* 21. DEBUT */}

              <div>

                <span>
                  Debut
                </span>

                <strong>
                  {selectedPlayer.debut || "—"}
                </strong>

              </div>


              {/* 22. FINAL GAME */}

              <div>

                <span>
                  Final Game
                </span>

                <strong>
                  {selectedPlayer.finalGame || "—"}
                </strong>

              </div>


              {/* 23. RETRO ID */}

              <div>

                <span>
                  Retro ID
                </span>

                <strong>
                  {selectedPlayer.retroID || "—"}
                </strong>

              </div>


              {/* 24. BBREF ID */}

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