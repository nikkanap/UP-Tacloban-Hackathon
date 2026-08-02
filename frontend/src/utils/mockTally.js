// Placeholder vote data for the admin monitoring and results screens.
//
// Deterministic on purpose: the numbers must stay stable across re-renders and
// must agree between Live Monitoring and Results. Swap buildTally out for the
// real tallies once the backend lands — nothing else needs to change.

const TURNOUT_RATE = 0.67;

const hashString = (value) => {
    let hash = 7;
    for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 31 + value.charCodeAt(index)) % 100003;
    }
    return hash;
};

export function buildTally(candidates, voterCount) {
    const votesCast = Math.round(voterCount * TURNOUT_RATE);

    if (candidates.length === 0 || votesCast === 0) {
        return { votesCast, standings: [] };
    }

    const weights = candidates.map(
        (candidate) => (hashString(candidate.id) % 50) + 10
    );
    const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);

    let allocated = 0;
    const standings = candidates.map((candidate, index) => {
        const isLast = index === candidates.length - 1;
        const votes = isLast
            ? Math.max(0, votesCast - allocated)
            : Math.round((weights[index] / weightTotal) * votesCast);
        allocated += votes;

        return {
            id: candidate.id,
            name: candidate.name,
            position: candidate.position,
            party: candidate.party,
            votes,
            percentage: Math.round((votes / votesCast) * 100),
        };
    });

    return {
        votesCast,
        standings: standings.sort((a, b) => b.votes - a.votes),
    };
}
