import type { Player } from "../types/player";
import type {
  SortField,
  SortOrder,
} from "../api/playerApi";

interface PlayerTableProps {
  players: Player[];

  onView: (playerID: string) => void;

  sortBy: SortField;

  sortOrder: SortOrder;

  onSort: (field: SortField) => void;
}

function PlayerTable({
  players,
  onView,
  sortBy,
  sortOrder,
  onSort,
}: PlayerTableProps) {

  // ======================================================
  // SORT ICON
  // ======================================================

  const getSortIcon = (
    field: SortField
  ) => {

    // Field is not currently sorted.
    if (sortBy !== field) {
      return "↕";
    }

    // Current field is sorted.
    return sortOrder === "asc"
      ? "↑"
      : "↓";
  };

  // ======================================================
  // SORT HEADER
  // ======================================================

  const renderSortHeader = (
    label: string,
    field: SortField
  ) => {

    const isActive =
      sortBy === field;

    return (
      <button
        type="button"
        className={
          isActive
            ? "sort-button sort-button-active"
            : "sort-button"
        }
        onClick={() =>
          onSort(field)
        }
        aria-label={`Sort by ${label}`}
      >

        <span>
          {label}
        </span>

        <span
          className="sort-icon"
          aria-hidden="true"
        >
          {getSortIcon(field)}
        </span>

      </button>
    );
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="table-wrapper">

      <table className="players-table">

        {/* ==================================================
            TABLE HEADER
        ================================================== */}

        <thead>
          <tr>

            {/* PLAYER ID */}

            <th scope="col">
              PLAYER ID
            </th>

            {/* FIRST NAME */}

            <th scope="col">
              {renderSortHeader(
                "NAME",
                "firstName"
              )}
            </th>

            {/* COUNTRY */}

            <th scope="col">
              COUNTRY
            </th>

            {/* BIRTH YEAR */}

            <th scope="col">
              {renderSortHeader(
                "BIRTH YEAR",
                "birthYear"
              )}
            </th>

            {/* BATS */}

            <th scope="col">
              BATS
            </th>

            {/* THROWS */}

            <th scope="col">
              THROWS
            </th>

            {/* DEBUT */}

            <th scope="col">
              DEBUT
            </th>

            {/* HEIGHT */}

            <th scope="col">
              {renderSortHeader(
                "HEIGHT",
                "height"
              )}
            </th>

            {/* ACTION */}

            <th scope="col">
              ACTION
            </th>

          </tr>
        </thead>

        {/* ==================================================
            TABLE BODY
        ================================================== */}

        <tbody>

          {players.map((player) => {

            const fullName = [
              player.nameFirst,
              player.nameLast,
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <tr
                key={player.playerID}
              >

                {/* PLAYER ID */}

                <td className="player-id">
                  {player.playerID || "—"}
                </td>

                {/* NAME */}

                <td className="player-name">
                  {fullName ||
                    "Unknown Player"}
                </td>

                {/* COUNTRY */}

                <td>
                  {player.birthCountry ||
                    "—"}
                </td>

                {/* BIRTH YEAR */}

                <td>
                  {player.birthYear ??
                    "—"}
                </td>

                {/* BATS */}

                <td>

                  <span
                    className={
                      player.bats
                        ? "badge"
                        : "badge badge-empty"
                    }
                  >
                    {player.bats || "—"}
                  </span>

                </td>

                {/* THROWS */}

                <td>

                  <span
                    className={
                      player.throws
                        ? "badge"
                        : "badge badge-empty"
                    }
                  >
                    {player.throws || "—"}
                  </span>

                </td>

                {/* DEBUT */}

                <td>
                  {player.debut || "—"}
                </td>

                {/* HEIGHT */}

                <td>
                  {player.height ?? "—"}
                </td>

                {/* ACTION */}

                <td className="action-cell">

                  <button
                    type="button"
                    className="view-button"
                    onClick={() =>
                      onView(
                        player.playerID
                      )
                    }
                    aria-label={
                      `View details for ${
                        fullName ||
                        player.playerID
                      }`
                    }
                  >
                    View
                  </button>

                </td>

              </tr>
            );
          })}

        </tbody>

      </table>

    </div>
  );
}

export default PlayerTable;