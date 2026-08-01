import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LockedNotice from "../../components/LockedNotice";
import { useAdminElection } from "../../context/AdminElectionContext";

const inputClass =
  "border border-border bg-background text-foreground p-2.5 rounded-lg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

function CreateElectionPage() {
  const navigate = useNavigate();
  const { election, updateElection, addPosition, removePosition, locked } =
    useAdminElection();

  const [positionName, setPositionName] = useState("");
  const [positionSeats, setPositionSeats] = useState(1);

  if (locked) return <LockedNotice />;

  const handleAddPosition = () => {
    if (!positionName.trim()) return;
    addPosition(positionName.trim(), Number(positionSeats) || 1);
    setPositionName("");
    setPositionSeats(1);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/admin/register-candidates");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 min-h-full">
      <div className="flex flex-col gap-2">
        <h1>Create Election</h1>
        <p className="text-muted max-w-2xl">
          Define the election, its positions, and when voting opens and closes.
        </p>
      </div>

      <div className="flex flex-col gap-5 bg-surface rounded-3xl p-5">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="title"
            className="text-sm font-medium text-foreground"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={election.title}
            onChange={(event) => updateElection({ title: event.target.value })}
            placeholder="Student Government Election"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="description"
            className="text-sm font-medium text-foreground"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={election.description}
            onChange={(event) =>
              updateElection({ description: event.target.value })
            }
            placeholder="Describe what members are voting on"
            className={`${inputClass} resize-y`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="startTime"
              className="text-sm font-medium text-foreground"
            >
              Opens
            </label>
            <input
              id="startTime"
              type="datetime-local"
              value={election.startTime}
              onChange={(event) =>
                updateElection({ startTime: event.target.value })
              }
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="endTime"
              className="text-sm font-medium text-foreground"
            >
              Closes
            </label>
            <input
              id="endTime"
              type="datetime-local"
              value={election.endTime}
              onChange={(event) =>
                updateElection({ endTime: event.target.value })
              }
              className={inputClass}
            />
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-sm text-foreground">
          <input
            type="checkbox"
            checked={election.requireCredential}
            onChange={(event) =>
              updateElection({ requireCredential: event.target.checked })
            }
            className="w-4 h-4 accent-[var(--color-accent)]"
          />
          Require one voting credential (NFT) per member
        </label>
      </div>

      <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
        <h2>Positions</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={positionName}
            onChange={(event) => setPositionName(event.target.value)}
            placeholder="Position name"
            className={`${inputClass} flex-1`}
          />
          <input
            type="number"
            min={1}
            value={positionSeats}
            onChange={(event) => setPositionSeats(event.target.value)}
            placeholder="Seats"
            className={`${inputClass} sm:w-28`}
          />
          <button
            type="button"
            onClick={handleAddPosition}
            className="px-4 py-2.5 rounded-lg font-medium border border-border text-foreground transition hover:bg-background active:opacity-80"
          >
            + Add
          </button>
        </div>

        {election.positions.length === 0 ? (
          <p className="text-sm text-muted">No positions added yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {election.positions.map((position) => (
              <li
                key={position.id}
                className="flex items-center justify-between gap-3 bg-background rounded-xl px-4 py-3"
              >
                <span className="font-medium text-foreground">
                  {position.name}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted">
                    {position.seats} {position.seats === 1 ? "seat" : "seats"}
                  </span>
                  <button
                    type="button"
                    onClick={() => removePosition(position.id)}
                    className="text-sm text-muted transition hover:text-foreground"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80"
        >
          Save &amp; Continue →
        </button>
      </div>
    </form>
  );
}

export default CreateElectionPage;
