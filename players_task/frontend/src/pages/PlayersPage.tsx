import { useEffect, useState } from "react";

import { getPlayers, getPlayerById } from "../api/playerApi";

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
  const [error, setError] = useState("");

  const [selectedPlayer, setSelectedPlayer] =
    useState<Player | null>(null);

  const [playerLoading, setPlayerLoading] = useState(false);

  // Number of players displayed per page
  const limit = 20;

  /*
   * ========================================================
   * LOAD PLAYERS
   * ========================================================
   *
   * Backend API:
   * GET /players?page=<currentPage>&limit=20
   *
   * Whenever currentPage changes, this effect loads
   * the corresponding page from the backend.
   */

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getPlayers(
          currentPage,
          limit
        );

        setPlayers(response.data);

        setTotalPages(
          response.pagination.totalPages
        );

        setTotalPlayers(
          response.pagination.totalPlayers
        );
      } catch (error) {
        console.error(error);

        setError("Failed to load players.");
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, [currentPage]);

  /*
   * ========================================================
   * SEARCH
   * ========================================================
   *
   * Search is handled on the frontend.
   *
   * Since the backend currently returns only the players
   * belonging to the selected page, the search checks
   * the players currently loaded on that page.
   */

  const searchValue = search.trim().toLowerCase();

  const filteredPlayers = players.filter((player) => {
    if (!searchValue) {
      return true;
    }

    return (
      (player.playerID ?? "")
        .toLowerCase()
        .includes(searchValue) ||

      (player.nameFirst ?? "")
        .toLowerCase()
        .includes(searchValue) ||

      (player.nameLast ?? "")
        .toLowerCase()
        .includes(searchValue) ||

      (player.nameGiven ?? "")
        .toLowerCase()
        .includes(searchValue)
    );
  });

  /*
   * ========================================================
   * HANDLE SEARCH CHANGE
   * ========================================================
   *
   * When the user starts searching from another page,
   * return to page 1.
   *
   * SearchBar also uses this function when the user
   * clicks the clear (X) button.
   */

  const handleSearchChange = (value: string) => {
    setSearch(value);

    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  /*
   * ========================================================
   * PAGE CHANGE
   * ========================================================
   *
   * When the user changes page:
   * 1. Clear any current search.
   * 2. Change current page.
   * 3. Scroll the browser to the top.
   */

  const handlePageChange = (page: number) => {
    if (search) {
      setSearch("");
    }

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
   * Calls:
   * GET /players/:id
   *
   * The returned player is displayed inside the
   * player details modal.
   */

  const handleViewPlayer = async (playerID: string) => {
    try {
      setPlayerLoading(true);
      setError("");

      const player = await getPlayerById(playerID);

      setSelectedPlayer(player);
    } catch (error) {
      console.error(error);

      setError("Failed to load player details.");
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
   * LOADING STATE
   * ========================================================
   */

  if (loading) {
    return (
      <div className="page-state">
        <div className="loader"></div>

        <p>Loading players...</p>
      </div>
    );
  }

  /*
   * ========================================================
   * ERROR STATE
   * ========================================================
   */

  if (error && !selectedPlayer) {
    return (
      <div className="page-state error-state">
        <h2>Something went wrong</h2>

        <p>{error}</p>
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
              Explore and discover players from
              the database.
            </p>

          </div>

          <div className="player-count">

            <strong>
              {totalPlayers}
            </strong>

            <span>
              Total Players
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
                {searchValue
                  ? `${filteredPlayers.length} matching players on this page`
                  : `Showing page ${currentPage} of ${totalPages}`}
              </p>

            </div>

          </div>


          {/* ==================================================
              PLAYER TABLE
          ================================================== */}

          {filteredPlayers.length > 0 ? (

            <PlayerTable
              players={filteredPlayers}
              onView={handleViewPlayer}
            />

          ) : (

            /* ==================================================
               EMPTY SEARCH RESULT
            ================================================== */

            <div className="no-results">

              <div className="no-results-icon">
                ⌕
              </div>

              <h3>
                No players found
              </h3>

              <p>
                No players on this page match
                "{search}".
              </p>

              <p>
                Try another name or player ID,
                or move to another page.
              </p>

            </div>

          )}


          {/* ==================================================
              PAGINATION
          ================================================== */}

          {!searchValue && (

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

            {/* CLOSE BUTTON */}

            <button
              className="modal-close"
              onClick={closePlayerDetails}
              aria-label="Close player details"
            >
              ×
            </button>


            {/* MODAL HEADER */}

            <p className="modal-label">
              PLAYER DETAILS
            </p>

            <h2>
              {selectedPlayer.nameFirst ?? ""}{" "}
              {selectedPlayer.nameLast ?? ""}
            </h2>

            <p className="modal-player-id">
              {selectedPlayer.playerID}
            </p>


            {/* ==================================================
                PLAYER DETAILS
            ================================================== */}

            <div className="player-details-grid">

              {/* BIRTH YEAR */}

              <div>
                <span>
                  Birth Year
                </span>

                <strong>
                  {selectedPlayer.birthYear ?? "—"}
                </strong>
              </div>


              {/* COUNTRY */}

              <div>
                <span>
                  Country
                </span>

                <strong>
                  {selectedPlayer.birthCountry || "—"}
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


              {/* BIRTH STATE */}

              <div>
                <span>
                  Birth State
                </span>

                <strong>
                  {selectedPlayer.birthState || "—"}
                </strong>
              </div>


              {/* HEIGHT */}

              <div>
                <span>
                  Height
                </span>

                <strong>
                  {selectedPlayer.height
                    ? `${selectedPlayer.height} in`
                    : "—"}
                </strong>
              </div>


              {/* WEIGHT */}

              <div>
                <span>
                  Weight
                </span>

                <strong>
                  {selectedPlayer.weight
                    ? `${selectedPlayer.weight} lb`
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