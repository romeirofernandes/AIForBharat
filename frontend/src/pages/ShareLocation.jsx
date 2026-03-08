import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Loader2, CheckCircle2, AlertCircle, Navigation, Search } from 'lucide-react';
import LocationPicker from '../components/common/LocationPicker';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ShareLocation() {
    const { token } = useParams();
    const [status, setStatus] = useState('loading');
    const [reportInfo, setReportInfo] = useState(null);
    const [mapPosition, setMapPosition] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [fetchingGPS, setFetchingGPS] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/whatsapp/pending-report/${token}`)
            .then((res) => {
                if (!res.ok) throw new Error('expired');
                return res.json();
            })
            .then((data) => {
                setReportInfo(data);
                setStatus('ready');
            })
            .catch(() => setStatus('expired'));
    }, [token]);

    // Handle map click
    const handleMapClick = (pos) => {
        setMapPosition(pos);
    };

    // Use GPS
    const handleUseGPS = () => {
        if (!('geolocation' in navigator)) {
            setErrorMsg('Geolocation not supported by your browser.');
            return;
        }
        setFetchingGPS(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setMapPosition([latitude, longitude]);
                setFetchingGPS(false);
            },
            (err) => {
                const messages = {
                    1: 'Location permission denied. Please enable location access.',
                    2: 'Location unavailable. Check your GPS.',
                    3: 'Location request timed out.',
                };
                setErrorMsg(messages[err.code] || 'Failed to get location');
                setFetchingGPS(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    // Search location by name using Nominatim
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
            );
            const data = await res.json();
            if (data.length > 0) {
                setMapPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                setErrorMsg('');
            } else {
                setErrorMsg('Location not found. Try a different search.');
            }
        } catch {
            setErrorMsg('Search failed. Please try again.');
        }
        setSearching(false);
    };

    // Submit location
    const handleSubmit = async () => {
        if (!mapPosition) {
            setErrorMsg('Please select a location on the map first.');
            return;
        }

        setStatus('submitting');
        try {
            const res = await fetch(`${API_URL}/whatsapp/submit-location/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude: mapPosition[0], longitude: mapPosition[1] }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Submission failed');
            }
            setStatus('success');
        } catch (err) {
            setErrorMsg(err.message || 'Failed to submit');
            setStatus('error');
        }
    };

    // ─── Expired ────────────────────────────────────────────────
    if (status === 'expired') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <motion.div initial="hidden" animate="visible" variants={fadeIn} className="max-w-md w-full text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Report Not Found</h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            This link has expired or the report has already been submitted. Go back to WhatsApp and start a new report.
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ─── Success ────────────────────────────────────────────────
    if (status === 'success') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <motion.div initial="hidden" animate="visible" variants={fadeIn} className="max-w-md w-full text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Report Submitted!</h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            Your incident has been reported successfully. You'll receive a confirmation on WhatsApp. You can close this page.
                        </p>
                    </div>
                    {mapPosition && (
                        <div className="bg-muted/40 border border-border rounded-lg p-3 inline-flex items-center gap-2 mx-auto">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="text-xs font-mono font-bold text-foreground">
                                {mapPosition[0].toFixed(5)}, {mapPosition[1].toFixed(5)}
                            </span>
                        </div>
                    )}
                    {reportInfo && (
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-primary/10 text-primary">
                                {reportInfo.department}
                            </span>
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-muted text-muted-foreground">
                                {reportInfo.incidentType}
                            </span>
                        </div>
                    )}
                </motion.div>
            </div>
        );
    }

    // ─── Error ──────────────────────────────────────────────────
    if (status === 'error') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <motion.div initial="hidden" animate="visible" variants={fadeIn} className="max-w-md w-full text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Submission Failed</h1>
                        <p className="text-sm text-muted-foreground mt-2">{errorMsg}</p>
                    </div>
                    <button onClick={() => setStatus('ready')} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer">
                        Try Again
                    </button>
                </motion.div>
            </div>
        );
    }

    // ─── Loading ────────────────────────────────────────────────
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // ─── Ready ──────────────────────────────────────────────────
    const isProcessing = status === 'submitting';

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border bg-card">
                <div className="max-w-lg mx-auto text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-primary text-xl">account_balance</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">Civic Intel</span>
                    </div>
                    <h1 className="text-lg font-bold text-foreground">Pinpoint Location</h1>
                    <p className="text-xs text-muted-foreground">
                        Tap on the map, use GPS, or search to select the incident location.
                    </p>
                </div>
            </div>

            {/* Report info bar */}
            {reportInfo && (
                <div className="p-3 border-b border-border bg-muted/30">
                    <div className="max-w-lg mx-auto flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-primary/10 text-primary">
                            {reportInfo.department}
                        </span>
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-muted text-muted-foreground">
                            {reportInfo.incidentType}
                        </span>
                        {reportInfo.description && (
                            <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                                {reportInfo.description}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Search bar */}
            <div className="p-3 border-b border-border bg-card">
                <div className="max-w-lg mx-auto flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search location (e.g. Andheri Station, Mumbai)"
                        className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={searching}
                        className="h-10 px-3 rounded-lg bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                    >
                        {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Map */}
            <div style={{ height: '50vh', width: '100%' }}>
                <LocationPicker position={mapPosition} setPosition={handleMapClick} />
            </div>

            {/* Bottom controls */}
            <div className="p-4 border-t border-border bg-card space-y-3">
                <div className="max-w-lg mx-auto space-y-3">
                    {/* Location display */}
                    {mapPosition && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                            <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                            <span className="text-xs font-mono font-bold text-green-700 dark:text-green-400">
                                {mapPosition[0].toFixed(5)}, {mapPosition[1].toFixed(5)}
                            </span>
                        </div>
                    )}

                    {errorMsg && (
                        <p className="text-xs text-destructive font-medium">{errorMsg}</p>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleUseGPS}
                            disabled={fetchingGPS}
                            className="flex items-center gap-2 h-11 px-4 rounded-lg border border-border bg-background text-foreground font-bold text-xs uppercase tracking-wider hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {fetchingGPS ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                            Use GPS
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={isProcessing || !mapPosition}
                            className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-lg font-bold text-sm uppercase tracking-wider transition-all cursor-pointer
                                ${!mapPosition
                                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                    : isProcessing
                                        ? 'bg-primary/60 text-primary-foreground cursor-wait'
                                        : 'bg-primary text-primary-foreground hover:opacity-90'
                                }`}
                        >
                            {isProcessing ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                            ) : (
                                <><CheckCircle2 className="w-4 h-4" /> Submit Report</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
