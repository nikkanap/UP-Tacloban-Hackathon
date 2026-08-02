// Status for an election record as it comes back from the API.
//
// The backend stores no lock/publish flags — only date_start and date_end — so
// status is derived purely from the schedule: an election that has not opened
// yet is still a draft, one inside its window is live, one past its window has
// ended.
export const ELECTION_STATUS = {
  DRAFT: "draft",
  LIVE: "live",
  ENDED: "ended",
};

export const STATUS_LABELS = {
  [ELECTION_STATUS.DRAFT]: "Draft",
  [ELECTION_STATUS.LIVE]: "Live",
  [ELECTION_STATUS.ENDED]: "Ended",
};

const toDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export function getElectionStatus(election, now = new Date()) {
  const start = toDate(election?.date_start);
  const end = toDate(election?.date_end);

  // Unscheduled elections are drafts by definition.
  if (!start || !end) return ELECTION_STATUS.DRAFT;
  if (now < start) return ELECTION_STATUS.DRAFT;
  if (now > end) return ELECTION_STATUS.ENDED;
  return ELECTION_STATUS.LIVE;
}

export const formatElectionDate = (value) => {
  const parsed = toDate(value);
  if (!parsed) return null;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// "Aug 1 – Aug 3, 2026", degrading gracefully when only one bound is set.
export function formatElectionRange(election) {
  const start = formatElectionDate(election?.date_start);
  const end = formatElectionDate(election?.date_end);

  if (start && end) return `${start} – ${end}`;
  if (start) return `From ${start}`;
  if (end) return `Until ${end}`;
  return "Not scheduled";
}
