import {
  useEffect,
  useRef,
  useState,
} from "react";

import type { Player } from "../types/player";

interface PlayerTableProps {
  players: Player[];
  onView: (playerID: string) => void;
}

// ========================================================
// VIRTUALIZATION CONFIGURATION
// ========================================================

const ROW_HEIGHT = 52;

// Visible table body height.
// Approximately 10 rows are visible at a time.
const CONTAINER_HEIGHT = 520;

// Extra rows rendered above/below the viewport.
const BUFFER = 5;

// ========================================================
// PLAYER TABLE
// ========================================================

function PlayerTable({
  players,
  onView,
}: PlayerTableProps) {

  // ======================================================
  // SCROLL CONTAINER
  // ======================================================

  const containerRef =
    useRef<HTMLDivElement | null>(null);

  // ======================================================
  // SCROLL POSITION
  // ======================================================

  const [scrollTop, setScrollTop] =
    useState(0);

  // ======================================================
  // RESET SCROLL WHEN NEW WINDOW IS LOADED
  // ======================================================

  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    container.scrollTop = 0;
    setScrollTop(0);
  }, [players]);

  // ======================================================
  // HANDLE SCROLL
  // ======================================================

  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    const handleScroll = () => {
      setScrollTop(
        container.scrollTop
      );
    };

    container.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      container.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  // ======================================================
  // CALCULATE VISIBLE RANGE
  // ======================================================

  const firstVisibleIndex =
    Math.floor(
      scrollTop / ROW_HEIGHT
    );

  const visibleRowCount =
    Math.ceil(
      CONTAINER_HEIGHT /
        ROW_HEIGHT
    );

  const startIndex =
    Math.max(
      0,
      firstVisibleIndex - BUFFER
    );

  const endIndex =
    Math.min(
      players.length,
      firstVisibleIndex +
        visibleRowCount +
        BUFFER
    );

  // ======================================================
  // ONLY RENDER VISIBLE PLAYERS
  // ======================================================

  const visiblePlayers =
    players.slice(
      startIndex,
      endIndex
    );

  // ======================================================
  // TOTAL VIRTUAL HEIGHT
  // ======================================================

  /*
   * Example:
   *
   * 100 records
   * × 52px
   * = 5200px
   *
   * The browser therefore knows that
   * the complete list is 5200px tall.
   *
   * React does NOT create 100 rows.
   *
   * It creates only the visible rows
   * plus BUFFER rows.
   */

  const totalHeight =
    players.length *
    ROW_HEIGHT;

  // ======================================================
  // CURRENT ROW OFFSET
  // ======================================================

  const offsetY =
    startIndex *
    ROW_HEIGHT;

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="player-table-wrapper">

      {/* ==================================================
          TABLE HEADER
      ================================================== */}

      <div
        className="player-table-header"
        style={{
          display: "grid",
          gridTemplateColumns:
            "150px 180px 150px 120px 100px 100px",
          alignItems: "center",
          minWidth: "800px",
          height: "48px",
          padding: "0 12px",
          boxSizing: "border-box",
          borderBottom:
            "1px solid #ddd",
          background:
            "#f8fafc",
          fontWeight: 600,
          fontSize: "13px",
        }}
      >
        <span>
          PLAYER ID
        </span>

        <span>
          NAME
        </span>

        <span>
          COUNTRY
        </span>

        <span>
          BIRTH YEAR
        </span>

        <span>
          BATS
        </span>

        <span>
          ACTION
        </span>
      </div>

      {/* ==================================================
          VIRTUALIZED BODY
      ================================================== */}

      <div
        ref={containerRef}
        className="player-table-body"
        style={{
          height:
            `${CONTAINER_HEIGHT}px`,
          overflowY: "auto",
          overflowX: "auto",
          position: "relative",
        }}
      >

        {/* ==================================================
            TOTAL SCROLLING SPACE
        ================================================== */}

        <div
          style={{
            height:
              `${totalHeight}px`,
            minWidth: "800px",
            position: "relative",
          }}
        >

          {/* ==================================================
              ONLY VISIBLE ROWS
          ================================================== */}

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              transform:
                `translateY(${offsetY}px)`,
            }}
          >

            {visiblePlayers.map(
              (player) => (
                <div
                  key={
                    player.playerID
                  }
                  className="player-table-row"
                  style={{
                    height:
                      `${ROW_HEIGHT}px`,
                    display: "grid",
                    gridTemplateColumns:
                      "150px 180px 150px 120px 100px 100px",
                    alignItems: "center",
                    padding: "0 12px",
                    boxSizing: "border-box",
                    borderBottom:
                      "1px solid #eee",
                    background:
                      "#fff",
                    fontSize: "13px",
                  }}
                >

                  {/* PLAYER ID */}

                  <span>
                    {player.playerID}
                  </span>

                  {/* NAME */}

                  <span
                    style={{
                      fontWeight: 500,
                    }}
                  >
                    {player.nameFirst}{" "}
                    {player.nameLast}
                  </span>

                  {/* COUNTRY */}

                  <span>
                    {player.birthCountry ||
                      "-"}
                  </span>

                  {/* BIRTH YEAR */}

                  <span>
                    {player.birthYear ||
                      "-"}
                  </span>

                  {/* BATS */}

                  <span>
                    {player.bats ||
                      "-"}
                  </span>

                  {/* VIEW */}

                  <span>
                    <button
                      type="button"
                      onClick={() =>
                        onView(
                          player.playerID
                        )
                      }
                    >
                      View
                    </button>
                  </span>

                </div>
              )
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default PlayerTable;