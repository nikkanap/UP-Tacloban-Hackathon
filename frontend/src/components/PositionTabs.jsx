import { useRef } from "react";

function PositionTabs({ positions, activeIndex, onSelect, completed = [] }) {
    const trackRef = useRef(null);

    const scrollByAmount = (direction) => {
        const track = trackRef.current;
        if (!track) return;
        track.scrollBy({ left: direction * 160, behavior: "smooth" });
    };

    return (
        <div className="flex items-center gap-2">
            <div
                ref={trackRef}
                className="flex gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {positions.map((position, index) => {
                    const isActive = index === activeIndex;
                    const isCompleted = completed[index];
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
                                    isCompleted
                                        ? "bg-accent text-accent-foreground"
                                        : isActive
                                        ? "bg-accent/20 text-foreground"
                                        : "bg-background text-muted"
                                }`}
                            >
                                {isCompleted ? "✓" : index + 1}
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
                className="flex items-center justify-center w-9 h-9 shrink-0 rounded-full border border-border bg-surface text-foreground transition hover:bg-accent hover:text-accent-foreground"
                aria-label="Scroll positions right"
            >
                ›
            </button>
        </div>
    );
}

export default PositionTabs;
