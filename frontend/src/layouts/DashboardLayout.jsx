import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";

function DashboardLayout() {
    return (
        <div className="flex flex-col w-full h-screen">
            <Navbar />
            <main className="flex-1 min-h-0 overflow-y-auto flex justify-center">
                <div className="w-full max-w-[var(--safe-width)] p-5">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default DashboardLayout;
