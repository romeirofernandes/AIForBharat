import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search01Icon as SearchIcon,
    InformationCircleIcon as InfoIcon,
} from 'hugeicons-react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Button } from '../../components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import { getFines } from '../../api/traffic';

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const actAbbreviations = [
    { abbr: 'MVA', full: 'Motor Vehicles Act, 1988 (as amended 2019)' },
    { abbr: 'MMVR', full: 'Maharashtra Motor Vehicles Rules' },
    { abbr: 'CMVR', full: 'Central Motor Vehicles Rules, 1989' },
];

export default function AllFines() {
    const [fines, setFines] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getFines()
            .then((data) => setFines(data.fines || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = search.trim()
        ? fines.filter(
            (f) =>
                f.offenseName.toLowerCase().includes(search.toLowerCase()) ||
                f.offenseSection.toLowerCase().includes(search.toLowerCase()) ||
                f.srNo.includes(search)
        )
        : fines;

    return (
        <div className="w-full space-y-6">

            {/* Search */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }}>
                <div className="relative">
                    <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by offense name, section, or Sr. No..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 text-sm"
                    />
                </div>
            </motion.div>

            {/* Table */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.2 }}>
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-sm text-muted-foreground font-medium">No offenses match your search.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-[0.15em] w-[60px]">Sr.</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-[0.15em] w-[180px]">Section</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-[0.15em]">Offense</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-[0.15em] text-right w-[100px]">Fine (₹)</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-[0.15em] text-right w-[140px]">Repeat Fine</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((fine) => (
                                        <TableRow key={fine.id} className="hover:bg-muted/30">
                                            <TableCell className="text-xs font-bold text-muted-foreground">{fine.srNo}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[9px] font-bold tracking-wider whitespace-nowrap">
                                                    {fine.offenseSection}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs font-medium text-foreground max-w-xs">{fine.offenseName}</TableCell>
                                            <TableCell className="text-right text-sm font-bold text-chart-5">₹{fine.fineAmount.toLocaleString('en-IN')}</TableCell>
                                            <TableCell className="text-right text-xs font-medium text-muted-foreground">
                                                {fine.repetitiveFine === 'Same' ? (
                                                    <span className="text-muted-foreground/60">Same</span>
                                                ) : (
                                                    <span className="text-red-600 font-bold">₹{fine.repetitiveFine}</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                )}
            </motion.div>

            <Separator />

            {/* Notes Section */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.3 }}>
                <Card>
                    <CardContent className="p-6 space-y-5">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <InfoIcon size={16} /> Important Notes
                        </h3>

                        {/* Act Abbreviations */}
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2">Act Abbreviations</p>
                            <div className="flex flex-wrap gap-2">
                                {actAbbreviations.map((a) => (
                                    <div key={a.abbr} className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md bg-muted/30">
                                        <span className="text-xs font-bold text-primary">{a.abbr}</span>
                                        <span className="text-[10px] text-muted-foreground">{a.full}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fine Structure Notes */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Fine Structure</p>
                            <ul className="space-y-1.5 text-xs text-muted-foreground font-medium list-disc list-inside">
                                <li>The fine structure distinguishes between the <span className="text-foreground font-bold">first offence</span> and a <span className="text-red-600 font-bold">"Repetitive Fine"</span> for subsequent violations.</li>
                                <li>Some offenses include additional penalties such as <span className="text-foreground font-bold">license disqualification for 3 months</span> (e.g., helmet and triple seat violations).</li>
                                <li>"Same" in the Repeat Fine column means the fine amount does not change for subsequent offenses.</li>
                                <li>Fines are as per the <span className="text-foreground font-bold">Motor Vehicles (Amendment) Act, 2019</span> and applicable state rules.</li>
                            </ul>
                        </div>

                        {/* Sources */}
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2">Sources</p>
                            <ul className="space-y-1 text-xs text-muted-foreground font-medium list-disc list-inside">
                                <li>Motor Vehicles Act, 1988 (as amended by Motor Vehicles Amendment Act, 2019)</li>
                                <li>Central Motor Vehicles Rules, 1989 (CMVR)</li>
                                <li>Maharashtra Motor Vehicles Rules (MMVR)</li>
                                <li>Ministry of Road Transport & Highways, Government of India — <a href="https://morth.nic.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">morth.nic.in</a></li>
                                <li>E-Challan Portal — <a href="https://echallan.parivahan.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">echallan.parivahan.gov.in</a></li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
