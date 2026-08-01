function CandidateCard({ name, party, image, selected, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`candidate-card relative flex flex-col items-center gap-2 w-60 rounded-3xl p-3 text-left transition ${
                selected
                    ? "bg-surface shadow-lg ring-2 ring-accent"
                    : "bg-surface shadow-lg ring-1 ring-transparent hover:ring-border"
            }`}
        >
            {selected && (
                <span className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold">
                    ✓
                </span>
            )}
            <div className="flex items-center justify-center w-full aspect-square overflow-hidden rounded-2xl border border-border bg-background">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="font-semibold text-muted text-center px-2">{name}</span>
                )}
            </div>
            <div className="flex flex-col items-center">
                <span className="font-semibold text-foreground text-center">{name}</span>
                {party && <span className="text-sm text-muted">{party}</span>}
            </div>
        </button>
    );
}

export default CandidateCard;
