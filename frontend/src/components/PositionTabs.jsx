import { useRef } from "react";

function PositionTabs({
    positions,
    activeIndex,
    onSelect,
    voteCounts = [],
    alwaysShowArrows = false,
}) {
    const trackRef = useRef(null);

    const scrollByAmount = (direction) => {
        const track = trackRef.current;
        if (!track) return;
        track.scrollBy({ left: direction * 160, behavior: "smooth" });
    };

    const arrowVisibility = alwaysShowArrows ? "flex" : "flex md:hidden";

    return (
        <div className="flex items-center justify-center gap-2">
            <button
                type="button"
                onClick={() => scrollByAmount(-1)}
                className={`${arrowVisibility} items-center justify-center w-9 h-9 shrink-0 rounded-full border border-border bg-surface text-foreground transition hover:bg-accent hover:text-accent-foreground`}
                aria-label="Scroll positions left"
            >
                ‹
            </button>

            <div
                ref={trackRef}
                className="flex gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {positions.map((position, index) => {
                    const isActive = index === activeIndex;
                    const voteCount = voteCounts[index] ?? 0;
                    const hasSelection = voteCount > 0;
                    const icon = hasSelection ? "✓" : index + 1;

                    return (
                        <button
                            key={position}
                            type="button"
                            onClick={() => onSelect(index)}
                            className={`flex items-center gap-2 shrink-0 pl-1.5 pr-4 py-1.5 rounded-full border transition ${
                                isActive
                                    ? "bg-background border-border shadow"
                                    : "bg-surface border-transparent text-muted hover:text-foreground"
                            }`}
                        >
                            <span
                                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                                    hasSelection
                                        ? "bg-accent text-accent-foreground"
                                        : isActive
                                        ? "bg-accent/20 text-foreground"
                                        : "bg-background text-muted"
                                }`}
                            >
                                {icon}
                            </span>
                            <span className={isActive ? "text-foreground font-medium" : ""}>
                                {position}
                            </span>
                        </button>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={() => scrollByAmount(1)}
                className={`${arrowVisibility} items-center justify-center w-9 h-9 shrink-0 rounded-full border border-border bg-surface text-foreground transition hover:bg-accent hover:text-accent-foreground`}
                aria-label="Scroll positions right"
            >
                ›
            </button>
        </div>
    );
}

export default PositionTabs;
