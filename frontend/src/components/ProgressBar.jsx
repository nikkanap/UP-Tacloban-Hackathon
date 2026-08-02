function ProgressBar({ value, total }) {
    const percentage = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-sm text-muted">
                <span>{value.toLocaleString()} / {total.toLocaleString()} voted</span>
                <span>{percentage}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-background overflow-hidden">
                <div
                    className="h-full rounded-full bg-accent transition-[width]"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export default ProgressBar;
