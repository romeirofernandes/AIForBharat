import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SidebarLeft01Icon as SidebarToggle } from 'hugeicons-react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from './ui/breadcrumb';

// ─── Route → breadcrumb config ────────────────────────────────
function getBreadcrumbs(pathname) {
    const exact = {
        '/user/dashboard':  [{ label: 'Dashboard' }],
        '/user/report':     [{ label: 'Report Issue' }],
        '/user/complaints': [{ label: 'My Complaints' }],
        '/user/forum':      [{ label: 'The Civic Wire' }],
        '/user/traffic':    [{ label: 'Traffic' }],
        '/user/traffic/fines': [
            { label: 'Traffic', to: '/user/traffic' },
            { label: 'All Fines' },
        ],
        '/user/traffic/report-bribery': [
            { label: 'Traffic', to: '/user/traffic' },
            { label: 'Report Misconduct' },
        ],
        '/user/traffic/my-reports': [
            { label: 'Traffic', to: '/user/traffic' },
            { label: 'My Reports' },
        ],
        '/user/profile':      [{ label: 'Profile' }],
        '/admin/dashboard':   [{ label: 'Dashboard' }],
        '/admin/issues':      [{ label: 'Issue Queue' }],
        '/admin/users':       [{ label: 'Users' }],
        '/admin/analytics':   [{ label: 'Analytics' }],
        '/admin/profile':     [{ label: 'Profile' }],
    };

    if (exact[pathname]) return exact[pathname];

    if (pathname.startsWith('/user/traffic/challan/')) {
        return [
            { label: 'Traffic', to: '/user/traffic' },
            { label: 'Challan Details' },
        ];
    }

    return [{ label: 'Portal' }];
}

// ─── Main Component ───────────────────────────────────────────
export default function DashboardNavbar({ collapsed, setCollapsed }) {
    const { user } = useAuth();
    const location = useLocation();
    const breadcrumbs = getBreadcrumbs(location.pathname);

    return (
        <header className="sticky top-0 z-20 h-16 bg-background/95 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-6">
            {/* ── Left: sidebar toggle + breadcrumb ── */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer"
                    aria-label="Toggle sidebar"
                >
                    <SidebarToggle size={18} />
                </button>
                <div className="hidden sm:block w-px h-6 bg-border" />

                <Breadcrumb className="hidden sm:flex">
                    <BreadcrumbList>
                        {breadcrumbs.map((crumb, i) => {
                            const isLast = i === breadcrumbs.length - 1;
                            return (
                                <React.Fragment key={i}>
                                    {i > 0 && <BreadcrumbSeparator />}
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">
                                                {crumb.label}
                                            </BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink
                                                render={<Link to={crumb.to} />}
                                                className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
                                            >
                                                {crumb.label}
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                </React.Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* ── Right: user info ── */}
            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-foreground">{user?.email}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{user?.role}</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase shrink-0">
                    {user?.email?.[0]}
                </div>
            </div>
        </header>
    );
}
