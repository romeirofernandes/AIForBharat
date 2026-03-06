import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import {
    Home09Icon as Home,
    FileSearchIcon as Schemes,
    Alert02Icon as Report,
    TaskDone01Icon as Complaints,
    UserCircleIcon as ProfileIcon,
    Logout03Icon as LogoutIcon,
    DashboardSquare01Icon as AdminDash,
    TaskEdit01Icon as IssueQueue,
    UserMultiple02Icon as UsersIcon,
    ChartHistogramIcon as Analytics,
    SidebarLeft01Icon as SidebarToggle,
} from 'hugeicons-react';

const userLinks = [
    { to: '/user/dashboard', label: 'Dashboard', icon: Home },
    { to: '/user/schemes', label: 'My Schemes', icon: Schemes },
    { to: '/user/report', label: 'Report Issue', icon: Report },
    { to: '/user/complaints', label: 'My Complaints', icon: Complaints },
    { to: '/user/profile', label: 'Profile', icon: ProfileIcon },
];

const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: AdminDash },
    { to: '/admin/issues', label: 'Issue Queue', icon: IssueQueue },
    { to: '/admin/users', label: 'Users', icon: UsersIcon },
    { to: '/admin/analytics', label: 'Analytics', icon: Analytics },
];

function SidebarItemTooltip({ children, collapsed, label }) {
    if (!collapsed) {
        return children;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="block">{children}</span>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
                {label}
            </TooltipContent>
        </Tooltip>
    );
}

export default function Sidebar({ collapsed, setCollapsed, role }) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const links = role === 'admin' ? adminLinks : userLinks;

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <TooltipProvider delayDuration={120}>
            {/* Desktop Sidebar */}
            <motion.aside
                animate={{ width: collapsed ? 70 : 240 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="hidden md:flex flex-col h-screen sticky top-0 bg-sidebar border-r border-border z-30 overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center gap-2 px-4 h-16 border-b border-border shrink-0">
                    <span className="material-symbols-outlined text-sidebar-primary text-xl">account_balance</span>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="text-[11px] font-bold uppercase tracking-widest text-sidebar-primary whitespace-nowrap overflow-hidden"
                            >
                                Civic Intel
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* Links */}
                <nav className="flex-1 flex flex-col gap-1 px-2 py-4 overflow-y-auto">
                    {links.map((link) => (
                        <SidebarItemTooltip key={link.to} collapsed={collapsed} label={link.label}>
                            <NavLink
                                to={link.to}
                                aria-label={link.label}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'text-sidebar-foreground/70 hover:bg-primary/10 hover:text-sidebar-foreground'
                                    }`
                                }
                            >
                                <link.icon size={18} className="shrink-0" />
                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="whitespace-nowrap overflow-hidden"
                                        >
                                            {link.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </NavLink>
                        </SidebarItemTooltip>
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-2 pb-4 border-t border-border pt-4">
                    <SidebarItemTooltip collapsed={collapsed} label="Logout">
                        <button
                            onClick={handleLogout}
                            aria-label="Logout"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 w-full cursor-pointer"
                        >
                            <LogoutIcon size={18} className="shrink-0" />
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="whitespace-nowrap overflow-hidden"
                                    >
                                        Logout
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    </SidebarItemTooltip>
                </div>
            </motion.aside>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {!collapsed && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setCollapsed(true)}
                            className="fixed inset-0 bg-black z-40 md:hidden"
                        />
                        <motion.aside
                            initial={{ x: -240 }}
                            animate={{ x: 0 }}
                            exit={{ x: -240 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="fixed top-0 left-0 w-60 h-screen bg-sidebar border-r border-border z-50 flex flex-col md:hidden"
                        >
                            <div className="flex items-center justify-between px-4 h-16 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sidebar-primary text-xl">account_balance</span>
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-sidebar-primary">Civic Intel</span>
                                </div>
                                <button onClick={() => setCollapsed(true)} className="text-sidebar-foreground/70 cursor-pointer">
                                    <SidebarToggle size={18} />
                                </button>
                            </div>

                            <nav className="flex-1 flex flex-col gap-1 px-2 py-4 overflow-y-auto">
                                {links.map((link) => (
                                    <NavLink
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setCollapsed(true)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200
                                            ${isActive
                                                ? 'bg-primary text-primary-foreground shadow-md'
                                                : 'text-sidebar-foreground/70 hover:bg-primary/10 hover:text-sidebar-foreground'
                                            }`
                                        }
                                    >
                                        <link.icon size={18} />
                                        <span>{link.label}</span>
                                    </NavLink>
                                ))}
                            </nav>

                            <div className="px-2 pb-4 border-t border-border pt-4">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 w-full cursor-pointer"
                                >
                                    <LogoutIcon size={18} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </TooltipProvider>
    );
}
