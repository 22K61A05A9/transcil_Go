import type { Player } from "../types/player";

interface PlayerTableProps {
  players: Player[];
  onView: (playerID: string) => void;
}

function PlayerTable({
  players,
  onView,
}: PlayerTableProps) {
  return (
    <div className="table-wrapper">
      <table className="players-table">

        <thead>
          <tr>
            <th scope="col">PLAYER ID</th>
            <th scope="col">NAME</th>
            <th scope="col">COUNTRY</th>
            <th scope="col">BIRTH YEAR</th>
            <th scope="col">BATS</th>
            <th scope="col">THROWS</th>
            <th scope="col">DEBUT</th>
            <th scope="col">ACTION</th>
          </tr>
        </thead>

        <tbody>
          {players.map((player) => {
            const fullName = [
              player.nameFirst,
              player.nameLast,
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <tr key={player.playerID}>

                {/* PLAYER ID */}
                <td className="player-id">
                  {player.playerID || "—"}
                </td>

                {/* NAME */}
                <td className="player-name">
                  {fullName || "Unknown Player"}
                </td>

                {/* COUNTRY */}
                <td>
                  {player.birthCountry || "—"}
                </td>

                {/* BIRTH YEAR */}
                <td>
                  {player.birthYear ?? "—"}
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

                {/* ACTION */}
                <td className="action-cell">
                  <button
                    type="button"
                    className="view-button"
                    onClick={() =>
                      onView(player.playerID)
                    }
                    aria-label={`View details for ${fullName || player.playerID}`}
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