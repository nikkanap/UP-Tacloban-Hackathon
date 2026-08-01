import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { electionDataContext } from "../App";
import ProgressBar from "../components/ProgressBar";
import CurrentPollsPanel from "../components/CurrentPollsPanel";
import StatusBadge from "../components/StatusBadge";
import useCountdown from "../hooks/useCountdown";

function ElectionDetailsPage(){
    const navigate = useNavigate();
    const { electionData, electionCandidates, electionResults } = useContext(electionDataContext);
    const timeLeft = useCountdown(electionData.endTime);

    const totalPositions = electionCandidates.length;
    const totalCandidates = electionCandidates.reduce(
        (sum, position) => sum + position.candidates.length,
        0
    );

    const formatDateTime = (date) =>
        date.toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });

    return(
        <div className="flex flex-col gap-6 min-h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-3">
                    <h1>
                        {electionData.title}{" "}
                        <StatusBadge status={electionData.status} />
                    </h1>
                    <p className="text-muted max-w-2xl">{electionData.description}</p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/election-voting")}
                    disabled={timeLeft.totalMs === 0}
                    className="shrink-0 px-12 py-4 rounded-xl font-semibold text-lg bg-accent text-accent-foreground shadow-lg transition hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {timeLeft.totalMs === 0 ? "Voting Closed" : "Vote Now"}
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Positions", value: totalPositions },
                    { label: "Candidates", value: totalCandidates },
                    { label: "Total Voters", value: electionData.totalVoters.toLocaleString() },
                    { label: "Votes Cast", value: electionData.totalVotersVoted.toLocaleString() },
                ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col gap-1 bg-surface rounded-2xl p-4">
                        <span className="text-2xl font-bold text-foreground">{value}</span>
                        <span className="text-sm text-muted">{label}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-4 md:col-span-2">
                    <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
                        <h2>Schedule</h2>
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted">Opens</span>
                                <span className="font-medium text-foreground">{formatDateTime(electionData.startTime)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted">Closes</span>
                                <span className="font-medium text-foreground">{formatDateTime(electionData.endTime)}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {[
                                { label: "days", value: timeLeft.days },
                                { label: "hrs", value: timeLeft.hours },
                                { label: "min", value: timeLeft.minutes },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex-1 flex flex-col items-center gap-0.5 bg-background rounded-xl py-2">
                                    <span className="text-xl font-bold text-foreground tabular-nums">
                                        {String(value).padStart(2, "0")}
                                    </span>
                                    <span className="text-[11px] uppercase tracking-wide text-muted">{label}</span>
                                </div>
                            ))}
                        </div>

                        {timeLeft.totalMs === 0 && (
                            <span className="text-sm font-medium text-foreground">Voting has closed</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
                        <h2>Turnout</h2>
                        <ProgressBar value={electionData.totalVotersVoted} total={electionData.totalVoters} />

                        <h2 className="mt-2">Positions up for vote</h2>
                        <ul className="flex flex-wrap gap-2">
                            {electionCandidates.map((position) => (
                                <li
                                    key={position.position}
                                    className="text-sm font-medium text-foreground bg-background px-3 py-1.5 rounded-full"
                                >
                                    {position.position}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <CurrentPollsPanel electionResults={electionResults} />
            </div>
        </div>
    )
}

export default ElectionDetailsPage;