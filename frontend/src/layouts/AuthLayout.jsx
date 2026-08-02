import { Outlet } from "react-router-dom";

function DashboardLayout() {
    return (
        <div className="flex flex-col w-full h-screen">
            <main className="flex-1 min-h-0 overflow-y-auto flex justify-center items-center">
                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;
