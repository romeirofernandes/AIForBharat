import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import {
    Car01Icon as CarIcon,
    Location04Icon as LocationIcon,
    Calendar03Icon as CalendarIcon,
    MoneyReceiveSquareIcon as FineIcon,
    InformationCircleIcon as InfoIcon,
    Image01Icon as ImageIcon,
} from 'hugeicons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { getChallanById } from '../../api/traffic';

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const statusConfig = {
    unpaid: { label: 'Unpaid', class: 'bg-red-100 text-red-700 border-red-200' },
    paid: { label: 'Paid', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    contested: { label: 'Contested', class: 'bg-amber-100 text-amber-700 border-amber-200' },
    cancelled: { label: 'Cancelled', class: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
};

function DetailRow({ icon: Icon, label, value, valueClass = '' }) {
    return (
        <div className="flex items-start gap-3 py-3">
            <div className="p-2 rounded-lg bg-muted/50">
                <Icon size={16} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
                <p className={`text-sm font-bold text-foreground mt-0.5 ${valueClass}`}>{value}</p>
            </div>
        </div>
    );
}

export default function ChallanDetails() {
    const { id } = useParams();
    const [challan, setChallan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getChallanById(id)
            .then((data) => setChallan(data.challan))
            .catch((err) => setError(err.message || 'Failed to load challan'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !challan) {
        return (
            <div className="w-full space-y-4">
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-sm text-red-600 font-medium">{error || 'Challan not found'}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const sc = statusConfig[challan.status] || statusConfig.unpaid;
    const issuedDate = new Date(challan.issuedAt);
    const paidDate = challan.paidAt ? new Date(challan.paidAt) : null;
    const formatDate = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="w-full space-y-6 max-w-3xl">

            {/* Evidence Image */}
            {challan.imageUrl && (
                <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }}>
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <ImageIcon size={16} /> Evidence / Capture
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <img
                                src={challan.imageUrl}
                                alt="Challan evidence"
                                className="w-full h-48 sm:h-64 object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Challan Info */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.2 }}>
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <InfoIcon size={16} /> Offense Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y divide-border">
                        <DetailRow
                            icon={InfoIcon}
                            label="Offense"
                            value={challan.fine?.offenseName || 'N/A'}
                        />
                        <DetailRow
                            icon={InfoIcon}
                            label="Section"
                            value={challan.fine?.offenseSection || 'N/A'}
                        />
                        <DetailRow
                            icon={CarIcon}
                            label="Vehicle Number"
                            value={challan.vehicleNumber}
                            valueClass="font-mono tracking-wider"
                        />
                        <DetailRow
                            icon={FineIcon}
                            label="Fine Amount"
                            value={`₹${challan.amount.toLocaleString('en-IN')}`}
                            valueClass="text-chart-5 text-lg"
                        />
                        {challan.fine?.repetitiveFine && (
                            <DetailRow
                                icon={FineIcon}
                                label="Repetitive Fine (Subsequent Offenses)"
                                value={challan.fine.repetitiveFine === 'Same' ? 'Same as first offense' : `₹${challan.fine.repetitiveFine}`}
                                valueClass="text-red-600"
                            />
                        )}
                        {challan.location && (
                            <DetailRow
                                icon={LocationIcon}
                                label="Location"
                                value={challan.location}
                            />
                        )}
                        <DetailRow
                            icon={CalendarIcon}
                            label="Issued On"
                            value={formatDate(issuedDate)}
                        />
                        {paidDate && (
                            <DetailRow
                                icon={CalendarIcon}
                                label="Paid On"
                                value={formatDate(paidDate)}
                                valueClass="text-emerald-600"
                            />
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Timeline */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.3 }}>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <CalendarIcon size={16} /> Timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative pl-6 space-y-4">
                            {/* Issued */}
                            <div className="relative">
                                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                                <div className="absolute -left-[14.5px] top-4 w-0.5 h-full bg-border" />
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Challan Issued</p>
                                <p className="text-xs font-medium text-foreground">{formatDate(issuedDate)}</p>
                            </div>

                            {/* Status update */}
                            <div className="relative">
                                <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-background ${challan.status === 'paid' ? 'bg-emerald-500' : challan.status === 'contested' ? 'bg-amber-500' : challan.status === 'cancelled' ? 'bg-zinc-400' : 'bg-red-500'}`} />
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Current Status</p>
                                <p className="text-xs font-bold text-foreground capitalize">{challan.status}</p>
                                {paidDate && <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(paidDate)}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Legal Note */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.4 }}>
                <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-700 mb-1">Legal Notice</p>
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                        This challan has been issued under the provisions of the Motor Vehicles Act, 1988 (as amended 2019).
                        Failure to pay within the prescribed period may result in additional penalties.
                        You may contest this challan at the nearest traffic court within 60 days of issuance.
                        For queries, visit <a href="https://echallan.parivahan.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-900 underline">echallan.parivahan.gov.in</a>.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
