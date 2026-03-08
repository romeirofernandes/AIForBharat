import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllUsers } from '../../api/users';

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllUsers()
            .then((data) => setUsers(data.users))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="w-full space-y-6">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">Users</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">All registered citizens on the platform</p>
            </motion.div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }}>
                    <div className="border border-border rounded-lg overflow-hidden bg-card">
                        {/* Table header */}
                        <div className="hidden sm:grid grid-cols-[1fr_100px_80px_120px] gap-4 px-5 py-3 bg-muted/40 border-b border-border">
                            <span className="text-xs font-medium text-muted-foreground">Email</span>
                            <span className="text-xs font-medium text-muted-foreground">Role</span>
                            <span className="text-xs font-medium text-muted-foreground">Issues</span>
                            <span className="text-xs font-medium text-muted-foreground">Joined</span>
                        </div>

                        {/* Rows */}
                        {users.map((u) => (
                            <div key={u.id} className="grid grid-cols-1 sm:grid-cols-[1fr_100px_80px_120px] gap-2 sm:gap-4 px-5 py-4 border-b border-border/50 hover:bg-muted/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase shrink-0">
                                        {u.email[0]}
                                    </div>
                                    <span className="text-sm font-medium text-foreground truncate">{u.email}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        {u.role}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-foreground">{u._count?.issues ?? 0}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
