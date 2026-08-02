import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

const asArray = (data) => Array.isArray(data) ? data : data?.results ?? [];

const toDate = (value) => {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date : null;
};

const getStatus = (startTime, endTime) => {
    const now = new Date();
    if (startTime && now < startTime) return "upcoming";
    if (endTime && now > endTime) return "completed";
    return "ongoing";
};

const formatDateTime = (value) => {
    const date = toDate(value);
    if (!date) return "Not scheduled";

    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};

const getCurrentVoter = () => {
    try {
        return JSON.parse(localStorage.getItem("currentVoter") || "null");
    } catch {
        localStorage.removeItem("currentVoter");
        return null;
    }
};

function VoterDashboardPage(){
    const navigate = useNavigate();
    const [elections, setElections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const currentVoter = getCurrentVoter();

    useEffect(() => {
        let isMounted = true;

        const loadElections = async () => {
            setIsLoading(true);
            setError("");

            try {
                const data = asArray(await apiRequest("elections/"));
                if (isMounted) {
                    setElections(data);
                }
            } catch (loadError) {
                if (isMounted) {
                    setError(loadError.message);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadElections();

        return () => {
            isMounted = false;
        };
    }, []);

    return(
        <div className="flex flex-col gap-6 min-h-full">
            <div className="flex flex-col gap-2">
                <h1>Voter Dashboard</h1>
                <p className="text-muted max-w-2xl">
                    {currentVoter?.full_name ? `Welcome, ${currentVoter.full_name}.` : "Select an election to continue."}
                </p>
            </div>

            {isLoading && (
                <div className="bg-surface rounded-2xl px-4 py-3 text-sm text-muted">
                    Loading elections...
                </div>
            )}

            {error && (
                <div className="bg-surface rounded-2xl px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {elections.map((election) => {
                    const startTime = toDate(election.date_start);
                    const endTime = toDate(election.date_end);
                    const status = getStatus(startTime, endTime);
                    const canVote = status === "ongoing";

                    return (
                        <div key={election.id} className="flex flex-col gap-4 bg-surface rounded-2xl p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-xl">{election.name || `Election ${election.id}`}</h2>
                                    <p className="text-sm text-muted">
                                        {formatDateTime(election.date_start)} - {formatDateTime(election.date_end)}
                                    </p>
                                </div>
                                <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold uppercase text-muted">
                                    {status}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/election-details?election=${election.id}`)}
                                    className="px-4 py-2 rounded-lg font-medium border border-border text-foreground transition hover:bg-background"
                                >
                                    View Details
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(`/election-voting?election=${election.id}`)}
                                    disabled={!canVote}
                                    className="px-4 py-2 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Vote
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(`/election-results?election=${election.id}`)}
                                    className="px-4 py-2 rounded-lg font-medium border border-border text-foreground transition hover:bg-background"
                                >
                                    Results
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {!isLoading && elections.length === 0 && !error && (
                <div className="bg-surface rounded-2xl px-4 py-3 text-sm text-muted">
                    No elections are available yet.
                </div>
            )}
        </div>
    )
}

export default VoterDashboardPage;
