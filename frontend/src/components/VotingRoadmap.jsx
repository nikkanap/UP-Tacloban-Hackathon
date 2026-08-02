const STEPS = ["Cast Vote", "Review", "Submitted"];

function VotingRoadmap({ currentStep }) {
    return (
        <div className="flex items-center justify-center bg-surface p-4 rounded-2xl shadow-lg">
            <div className="flex items-center w-full max-w-md">
            {STEPS.map((step, index) => {
                const isLast = index === STEPS.length - 1;
                const isCompleted = index < currentStep || (isLast && index === currentStep);
                const isCurrent = index === currentStep && !isCompleted;

                return (
                    <div key={step} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
                        <div className="flex flex-col items-center gap-1.5">
                            <span
                                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0 ${
                                    isCompleted
                                        ? "bg-accent text-accent-foreground"
                                        : isCurrent
                                        ? "bg-accent/20 text-foreground border-2 border-accent"
                                        : "bg-background text-muted"
                                }`}
                            >
                                {isCompleted ? "✓" : index + 1}
                            </span>
                            <span
                                className={`text-xs font-medium whitespace-nowrap ${
                                    isCurrent || isCompleted ? "text-foreground" : "text-muted"
                                }`}
                            >
                                {step}
                            </span>
                        </div>

                        {!isLast && (
                            <div
                                className={`flex-1 h-0.5 mx-2 mb-5 rounded-full ${
                                    isCompleted ? "bg-accent" : "bg-border"
                                }`}
                            />
                        )}
                    </div>
                );
            })}
            </div>
        </div>
    );
}

export default VotingRoadmap;
