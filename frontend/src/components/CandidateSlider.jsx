import { useRef } from "react";

function CandidateSlider({ position, candidates }) {
    const trackRef = useRef(null);

    const scrollByCard = (direction) => {
        const track = trackRef.current;
        if (!track) return;
        const card = track.querySelector("[data-card]");
        const amount = card ? card.offsetWidth + 16 : track.clientWidth;
        track.scrollBy({ left: direction * amount, behavior: "smooth" });
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3>{position}</h3>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => scrollByCard(-1)}
                        className="flex items-center justify-center w-8 h-8 rounded-full border border-border bg-surface text-foreground transition hover:bg-accent hover:text-accent-foreground"
                        aria-label={`Previous ${position} candidate`}
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollByCard(1)}
                        className="flex items-center justify-center w-8 h-8 rounded-full border border-border bg-surface text-foreground transition hover:bg-accent hover:text-accent-foreground"
                        aria-label={`Next ${position} candidate`}
                    >
                        ›
                    </button>
                </div>
            </div>

            <div
                ref={trackRef}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {candidates.map((candidate) => (
                    <div
                        key={candidate.name}
                        data-card
                        className="flex flex-col gap-1 shrink-0 w-48 snap-start bg-surface border border-border rounded-2xl p-4"
                    >
                        <span className="font-semibold text-foreground">{candidate.name}</span>
                        <span className="text-sm text-muted">{candidate.party}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CandidateSlider;
