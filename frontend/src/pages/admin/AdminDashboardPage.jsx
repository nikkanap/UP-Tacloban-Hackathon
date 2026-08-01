import { useNavigate } from "react-router-dom";

function AdminDashboardPage() {
  const navigate = useNavigate();

  const stats = [
    { label: "Active Elections", value: 1 },
    {
      label: "Draft Elections",
      value: 1,
    },
    { label: "Total Registered Voters", value: 248 },
  ];

  const quickActions = [
    { label: "Create election", path: "/admin/create-election" },
    { label: "Register Candidates", path: "/admin/register-candidates" },
    { label: "Register Voters", path: "/admin/register-voters" },
  ];

  return (
    <div className="flex flex-col gap-6 min-h-full">
      <div className="flex flex-col gap-3">
        <span className="inline-flex items-center gap-1.5 self-start text-xs font-semibold uppercase tracking-wide text-accent-foreground bg-accent px-3 py-1 rounded-full">
          Admin Portal
        </span>
        <h1>Dashboard</h1>
        <p className="text-muted max-w-2xl">
          Set up elections, register candidates and voters, monitor turnout, and
          publish results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col gap-1 bg-surface rounded-2xl p-4"
          >
            <span className="text-2xl font-bold text-foreground tabular-nums">
              {value.toLocaleString()}
            </span>
            <span className="text-sm text-muted">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
        <h2>Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map(({ label, path }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate(path)}
              className="flex items-center justify-center gap-2 border border-dashed border-border rounded-2xl p-5 text-sm font-medium text-foreground transition hover:bg-background active:opacity-80"
            >
              <span className="text-muted">+</span>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify">
        <button
          type="button"
          onClick={() => navigate("/admin/elections")}
          className="px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80"
        >
          View Existing Elections →
        </button>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
