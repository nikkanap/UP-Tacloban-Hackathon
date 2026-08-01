import { useEffect, useState } from "react";

function getTimeLeft(target) {
    const totalMs = Math.max(0, target - new Date());
    const totalMinutes = Math.floor(totalMs / (1000 * 60));

    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    return { totalMs, days, hours, minutes };
}

function useCountdown(target) {
    const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(target));

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(getTimeLeft(target));
        }, 1000 * 30);

        return () => clearInterval(interval);
    }, [target]);

    return timeLeft;
}

export default useCountdown;
