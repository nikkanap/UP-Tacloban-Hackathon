function ConfirmModal({
    open,
    title,
    message,
    confirmLabel = "OK",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    confirmDisabled = false,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">
            <div className="flex flex-col gap-4 w-full max-w-sm bg-surface rounded-3xl shadow-lg p-6">
                <div className="flex flex-col gap-1">
                    <h3 className="text-foreground">{title}</h3>
                    {message && <p className="text-sm text-muted">{message}</p>}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-5 py-2.5 rounded-lg font-medium text-foreground border border-border transition hover:bg-background"
                        >
                            {cancelLabel}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={confirmDisabled}
                        className="px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
