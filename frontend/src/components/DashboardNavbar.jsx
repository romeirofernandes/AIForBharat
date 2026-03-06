import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SidebarLeft01Icon as SidebarToggle } from 'hugeicons-react';

export default function DashboardNavbar({ collapsed, setCollapsed }) {
    const { user } = useAuth();

    return (
       <header className="sticky top-0 z-20 h-16 bg-background/95 backdrop-blur-md border-b border-sidebar-border flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer"
                    aria-label="Toggle sidebar"
                >
                    <SidebarToggle size={18}/>
                </button>
                <div className="hidden sm:block w-px h-6 bg-border" />
                <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {user?.role === 'admin' ? 'Admin Panel' : 'Citizen Portal'}
                </span>
            </div>

            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-xs font-semibold text-foreground">{user?.email}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{user?.role}</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase">
                    {user?.email?.[0]}
                </div>
            </div>
        </header>
    );
}
