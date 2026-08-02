// Real tallies computed from /api/votes/ — the replacement for mockTally.js.
//
// One Vote row is one candidate choice, so a voter filling a ballot with five
// positions produces five rows. Turnout must therefore count *distinct voters*,
// not rows, or it reads far above 100%.

// Percentages are within a position: a President vote and a Secretary vote are
// not competing for the same share.
export function buildTally(votes, candidates, positions = []) {
  const positionNameById = new Map(
    positions.map((position) => [position.id, position.name]),
  );

  const votesByCandidate = new Map();
  for (const vote of votes) {
    votesByCandidate.set(
      vote.candidate,
      (votesByCandidate.get(vote.candidate) ?? 0) + 1,
    );
  }

  const totalByPosition = new Map();
  for (const candidate of candidates) {
    const count = votesByCandidate.get(candidate.id) ?? 0;
    totalByPosition.set(
      candidate.position,
      (totalByPosition.get(candidate.position) ?? 0) + count,
    );
  }

  const standings = candidates
    .map((candidate) => {
      const count = votesByCandidate.get(candidate.id) ?? 0;
      const positionTotal = totalByPosition.get(candidate.position) ?? 0;

      return {
        id: candidate.id,
        name: candidate.full_name,
        subtitle: positionNameById.get(candidate.position) ?? null,
        votes: count,
        percentage: positionTotal
          ? Math.round((count / positionTotal) * 100)
          : 0,
      };
    })
    .sort((a, b) => b.votes - a.votes);

  return {
    votesCast: votes.length,
    ballotsCast: countBallots(votes),
    standings,
  };
}

// Distinct voters who have cast at least one vote. ballot_ref is an opaque
// per-voter-per-election handle — the API deliberately does not expose voter
// ids, so turnout is counted without learning who voted.
export const countBallots = (votes) =>
  new Set(votes.map((vote) => vote.ballot_ref)).size;

export const turnoutPercent = (ballotsCast, voterCount) =>
  voterCount > 0 ? Math.round((ballotsCast / voterCount) * 100) : 0;

// Newest first, for the ledger panel.
export const recentBallots = (votes, limit = 10) =>
  [...votes]
    .sort((a, b) => new Date(b.date_voted) - new Date(a.date_voted))
    .slice(0, limit);
