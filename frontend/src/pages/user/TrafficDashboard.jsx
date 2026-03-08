import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    ArrowRight01Icon as ArrowRight,
    Car01Icon as CarIcon,
    Delete02Icon as DeleteIcon,
    Add01Icon as AddIcon,
    MoneyReceiveSquareIcon as FineIcon,
    Alert02Icon as AlertIcon,
    Tick02Icon as TickIcon,
    Cancel01Icon as CancelIcon,
    InformationCircleIcon as InfoIcon,
    SecurityCheckIcon as ShieldIcon,
} from 'hugeicons-react';
import { RichButton } from '../../components/ui/rich-button';
import { getVehicles, addVehicle, removeVehicle, getChallans, getFines } from '../../api/traffic';
import { getMyComplaints } from '../../api/bribery';

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const statusConfig = {
    unpaid: { label: 'Unpaid', class: 'bg-red-100 text-red-700 border-red-200', icon: AlertIcon },
    paid: { label: 'Paid', class: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: TickIcon },
    contested: { label: 'Contested', class: 'bg-amber-100 text-amber-700 border-amber-200', icon: InfoIcon },
    cancelled: { label: 'Cancelled', class: 'bg-zinc-100 text-zinc-500 border-zinc-200', icon: CancelIcon },
};

export default function TrafficDashboard() {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [challans, setChallans] = useState([]);
    const [summary, setSummary] = useState({});
    const [topFines, setTopFines] = useState([]);
    const [vehicleInput, setVehicleInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [addingVehicle, setAddingVehicle] = useState(false);
    const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
    const [recentReports, setRecentReports] = useState([]);

    const fetchAll = async () => {
        try {
            const [vRes, cRes, fRes] = await Promise.all([
                getVehicles(),
                getChallans(),
                getFines({ limit: 5 }),
            ]);
            setVehicles(vRes.vehicles || []);
            setChallans(cRes.challans || []);
            setSummary(cRes.summary || {});
            setTopFines(fRes.fines || []);
            // Fetch recent bribery reports (silently)
            try {
                const bRes = await getMyComplaints();
                setRecentReports((bRes.complaints || []).slice(0, 3));
            } catch {}
        } catch {
            // Silently handle — user may have no vehicles yet
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleAddVehicle = async () => {
        const num = vehicleInput.trim().toUpperCase().replace(/\s+/g, '');
        if (num.length < 4) {
            toast.error('Enter a valid vehicle number');
            return;
        }
        setAddingVehicle(true);
        try {
            await addVehicle(num);
            toast.success(`Vehicle ${num} linked!`);
            setVehicleInput('');
            fetchAll();
        } catch (err) {
            toast.error(err.message || 'Failed to add vehicle');
        } finally {
            setAddingVehicle(false);
        }
    };

    const handleRemoveVehicle = async (id, number) => {
        try {
            await removeVehicle(id);
            toast.success(`Vehicle ${number} removed`);
            fetchAll();
        } catch {
            toast.error('Failed to remove vehicle');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const summaryCards = [
        { title: 'Total Challans', value: summary.total || 0, color: 'text-primary', bg: 'bg-primary/10' },
        { title: 'Unpaid', value: summary.unpaid || 0, color: 'text-red-600', bg: 'bg-red-100' },
        { title: 'Paid', value: summary.paid || 0, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { title: 'Outstanding Fine', value: `₹${(summary.unpaidFine || 0).toLocaleString('en-IN')}`, color: 'text-chart-5', bg: 'bg-chart-5/10' },
    ];

    return (
        <div className="w-full space-y-8">
            {/* Header with My Vehicles Dropdown */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">Traffic Dashboard</h1>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-medium mt-1">View e-challans and manage your vehicles</p>
                </div>

                {/* My Vehicles Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setVehicleDropdownOpen(!vehicleDropdownOpen)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border hover:border-primary/30 bg-muted/30 hover:bg-muted/50 transition-all text-xs font-bold uppercase tracking-wider text-foreground"
                    >
                        <CarIcon size={16} className="text-primary" />
                        My Vehicles ({vehicles.length})
                        <span
                            className={`inline-block transition-transform ${vehicleDropdownOpen ? 'rotate-180' : ''}`}
                        >
                            ▼
                        </span>
                    </button>

                    {/* Dropdown Content */}
                    <AnimatePresence>
                        {vehicleDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-40"
                            >
                                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                                    {/* Add Vehicle Input */}
                                    <div className="flex gap-2">
                                        <input
                                            placeholder="e.g. MH01CP6748"
                                            value={vehicleInput}
                                            onChange={(e) => setVehicleInput(e.target.value.toUpperCase())}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddVehicle()}
                                            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 font-mono text-sm tracking-widest text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                        <RichButton
                                            color="primary"
                                            size="sm"
                                            onClick={handleAddVehicle}
                                            disabled={addingVehicle}
                                            className="shrink-0"
                                        >
                                            <AddIcon size={14} />
                                        </RichButton>
                                    </div>

                                    {/* Vehicles List */}
                                    {vehicles.length === 0 ? (
                                        <p className="text-xs text-muted-foreground text-center py-6 font-medium">
                                            No vehicles linked.<br />Add one above.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {vehicles.map((v) => {
                                                const challanCount = v.challans?.length || 0;
                                                return (
                                                    <div
                                                        key={v.id}
                                                        className="flex items-center gap-2.5 p-2.5 border border-border rounded-lg bg-muted/30 hover:border-primary/30 hover:bg-muted/50 transition-all group"
                                                    >
                                                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                                            <CarIcon size={16} className="text-primary" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-mono text-xs font-bold tracking-widest text-foreground truncate">
                                                                {v.vehicleNumber}
                                                            </p>
                                                            {challanCount > 0 && (
                                                                <p className="text-xs font-medium text-red-500">
                                                                    {challanCount} challan{challanCount !== 1 ? 's' : ''}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveVehicle(v.id, v.vehicleNumber)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1"
                                                            aria-label={`Remove ${v.vehicleNumber}`}
                                                        >
                                                            <DeleteIcon size={13} className="text-red-400 hover:text-red-600" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryCards.map((card, i) => (
                    <motion.div key={card.title} initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: i * 0.08 }}>
                        <div className="border border-border rounded-xl hover:border-primary/20 transition-all p-5">
                            <p className="text-[10px] uppercase tracking-[0.25em] font-medium text-muted-foreground">{card.title}</p>
                            <p className={`text-2xl font-black mt-1 ${card.color}`}>{card.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Report Misconduct CTA */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.35 }}>
                <div className="border border-red-200 rounded-xl bg-red-50/50 hover:shadow-lg transition-all p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-red-100 shrink-0">
                            <ShieldIcon size={24} className="text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-foreground uppercase tracking-wide">Report Police Misconduct</h3>
                            <p className="text-xs text-muted-foreground font-medium mt-1 max-w-md">
                                Experienced bribery, unfair treatment, or corruption by traffic police? File a confidential report with proof.
                                You can even fill the entire form using just your voice.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <RichButton color="zinc" size="sm" onClick={() => navigate('/user/traffic/my-reports')} className="font-bold uppercase tracking-wider text-xs">
                            My Reports
                        </RichButton>
                        <RichButton color="red" size="sm" onClick={() => navigate('/user/traffic/report-bribery')} className="font-bold uppercase tracking-wider text-xs">
                            File Report <ArrowRight size={14} />
                        </RichButton>
                    </div>
                </div>
            </motion.div>

            {/* Recent Reports — moved here */}
            {recentReports.length > 0 && (
                <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.4 }}>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <ShieldIcon size={16} /> My Recent Reports
                        </h2>
                        <button onClick={() => navigate('/user/traffic/my-reports')} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline underline-offset-4 cursor-pointer">
                            View All <ArrowRight size={12} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {recentReports.map((report) => {
                            const statusCfg = {
                                submitted: { label: 'Submitted', class: 'bg-blue-100 text-blue-700' },
                                under_review: { label: 'Under Review', class: 'bg-amber-100 text-amber-700' },
                                action_taken: { label: 'Action Taken', class: 'bg-purple-100 text-purple-700' },
                                resolved: { label: 'Resolved', class: 'bg-emerald-100 text-emerald-700' },
                                dismissed: { label: 'Dismissed', class: 'bg-red-100 text-red-700' },
                            };
                            const rs = statusCfg[report.status] || statusCfg.submitted;
                            return (
                                <div
                                    key={report.id}
                                    onClick={() => navigate('/user/traffic/my-reports')}
                                    className="border border-border rounded-xl p-4 bg-card hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer group flex items-center justify-between gap-3"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold font-mono text-foreground">#{report.id}</span>
                                            <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${rs.class}`}>{rs.label}</span>
                                        </div>
                                        <p className="text-xs font-bold text-foreground truncate">
                                            {report.complaintType === 'Other' ? report.otherComplaintType || 'Other' : report.complaintType}
                                        </p>
                                        <p className="text-xs text-muted-foreground/60 mt-0.5">
                                            Badge: {report.badgeNumber} · {new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                    <ArrowRight size={14} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            <div className="border-t border-border" />

            {/* Common Traffic Fines */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.45 }}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <FineIcon size={16} /> Common Traffic Fines
                    </h2>
                    <button onClick={() => navigate('/user/traffic/fines')} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline underline-offset-4 cursor-pointer">
                        View All Fines <ArrowRight size={12} />
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {topFines.map((fine, i) => (
                        <motion.div key={fine.id} initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.4 + i * 0.06 }}>
                            <div className="border border-border rounded-xl hover:border-primary/20 hover:shadow-md transition-all cursor-pointer h-full p-4 flex flex-col" onClick={() => navigate('/user/traffic/fines')}>
                                <p className="text-[10px] font-medium text-muted-foreground mb-1">{fine.offenseSection}</p>
                                <p className="text-xs font-black text-foreground mb-3 line-clamp-2 flex-1">{fine.offenseName}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-black text-chart-5">₹{fine.fineAmount.toLocaleString('en-IN')}</span>
                                    <span className="text-[9px] font-medium text-muted-foreground">Repeat: {fine.repetitiveFine === 'Same' ? 'Same' : `₹${fine.repetitiveFine}`}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <div className="border-t border-border" />

            {/* E-Challans Section */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.5 }}>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                    <AlertIcon size={16} /> Your E-Challans
                </h2>

                {challans.length === 0 ? (
                    <div className="border border-border rounded-xl py-12 text-center bg-card">
                        <p className="text-sm text-muted-foreground font-medium">
                            {vehicles.length === 0
                                ? 'Link a vehicle above to see challans.'
                                : 'No challans found for your vehicles. Drive safe!'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {challans.map((challan, i) => {
                            const sc = statusConfig[challan.status] || statusConfig.unpaid;
                            return (
                                <motion.div
                                    key={challan.id}
                                    initial="hidden"
                                    animate="visible"
                                    variants={fadeIn}
                                    transition={{ delay: 0.5 + i * 0.04 }}
                                    onClick={() => navigate(`/user/traffic/challan/${challan.id}`)}
                                    className="border border-border rounded-xl p-5 bg-card hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="text-xs font-black font-mono tracking-wider text-foreground">{challan.challanNumber}</span>
                                                <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${sc.class}`}>{sc.label}</span>
                                            </div>
                                            <p className="text-sm font-black text-foreground truncate">{challan.fine?.offenseName}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/60">
                                                <span>{challan.vehicleNumber}</span>
                                                {challan.location && <span>{challan.location}</span>}
                                                <span>{new Date(challan.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl font-black text-chart-5">₹{challan.amount.toLocaleString('en-IN')}</span>
                                            <ArrowRight size={16} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
