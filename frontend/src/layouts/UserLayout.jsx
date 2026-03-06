import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardNavbar from '../components/DashboardNavbar';

export default function UserLayout() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} role="user" />
            <div className="flex-1 flex flex-col min-w-0">
                <DashboardNavbar collapsed={collapsed} setCollapsed={setCollapsed} />
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
