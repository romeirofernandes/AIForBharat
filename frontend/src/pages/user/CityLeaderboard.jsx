import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getLeaderboard } from '../../api/leaderboard';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } },
};

// Heatmap layer — uses city centroids with weight normalised to total issues
// so even a single issue in one city renders a fully-visible blob
function HeatLayer({ cities }) {
    const map = useMap();
    const layerRef = useRef(null);

    useEffect(() => {
        if (layerRef.current) {
            map.removeLayer(layerRef.current);
        }
        if (!cities || cities.length === 0) return;

        const maxTotal = Math.max(...cities.map((c) => c.total));
        const heatData = cities.map((c) => [
            c.lat,
            c.lng,
            // normalise so the busiest city = 1.0; floor at 0.6 so quiet cities still show
            Math.max(0.6, c.total / maxTotal),
        ]);

        layerRef.current = L.heatLayer(heatData, {
            radius: 45,
            blur: 35,
            maxZoom: 11,
            minOpacity: 0.55,
            gradient: {
                0.0: '#fde68a',
                0.3: '#f59e0b',
                0.6: '#f97316',
                0.85: '#ef4444',
                1.0: '#b91c1c',
            },
        }).addTo(map);

        return () => {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
            }
        };
    }, [cities, map]);

    return null;
}

// Map fly-to on city click
function FlyToCity({ city }) {
    const map = useMap();
    useEffect(() => {
        if (city) {
            map.flyTo([city.lat, city.lng], 11, { duration: 1.2 });
        }
    }, [city, map]);
    return null;
}

export default function CityLeaderboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [focusedCity, setFocusedCity] = useState(null);
    const [hoveredCity, setHoveredCity] = useState(null);

    useEffect(() => {
        getLeaderboard()
            .then(setData)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-32">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!data || data.cities.length === 0) {
        return (
            <div className="w-full space-y-6">
                <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                    <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">City Leaderboard</h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">No location-tagged issues yet</p>
                </motion.div>
            </div>
        );
    }

    const { cities, heatmapPoints, totalIssues, totalCities } = data;
    const topCity = cities[0];

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">City Leaderboard</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">Issue density and resolution across Indian cities</p>
            </motion.div>

            {/* Stats strip */}
            <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total Issues', value: totalIssues },
                    { label: 'Active Cities', value: totalCities },
                    { label: 'Most Active', value: topCity?.name || '--' },
                    { label: 'Avg Resolution', value: `${cities.length > 0 ? Math.round(cities.reduce((s, c) => s + c.resolutionRate, 0) / cities.length) : 0}%` },
                ].map((stat) => (
                    <motion.div
                        key={stat.label}
                        variants={fadeIn}
                        className="border border-border rounded-lg p-4 bg-card"
                    >
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-xl font-bold text-foreground tracking-tight">{stat.value}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Heatmap */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.15 }} className="border border-border rounded-lg overflow-hidden bg-card">
                <div className="px-5 py-3 border-b border-border">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Issue Heatmap</p>
                </div>
                <div className="h-[400px] md:h-[480px]">
                    <MapContainer
                        center={[22.5, 78.9]}
                        zoom={5}
                        scrollWheelZoom={true}
                        zoomControl={true}
                        attributionControl={false}
                        style={{ height: '100%', width: '100%', zIndex: 1 }}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        />
                        <HeatLayer cities={cities} />
                        <FlyToCity city={focusedCity} />
                    </MapContainer>
                </div>
            </motion.div>

            {/* Rankings Table */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.25 }} className="border border-border rounded-lg bg-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">City Rankings</p>
                </div>

                {/* Table header */}
                <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-2.5 border-b border-border bg-muted/30 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    <div className="col-span-1">#</div>
                    <div className="col-span-3">City</div>
                    <div className="col-span-2 text-right">Total</div>
                    <div className="col-span-1 text-right">Pending</div>
                    <div className="col-span-1 text-right">Active</div>
                    <div className="col-span-1 text-right">Resolved</div>
                    <div className="col-span-3">Resolution Rate</div>
                </div>

                {/* Rows */}
                <motion.div initial="hidden" animate="visible" variants={stagger}>
                    {cities.map((city, i) => (
                        <motion.div
                            key={city.name}
                            variants={fadeIn}
                            onClick={() => setFocusedCity(city)}
                            onMouseEnter={() => setHoveredCity(city.name)}
                            onMouseLeave={() => setHoveredCity(null)}
                            className={`grid grid-cols-2 md:grid-cols-12 gap-2 px-5 py-3 border-b border-border/50 cursor-pointer transition-colors ${
                                hoveredCity === city.name ? 'bg-primary/5' : ''
                            } ${focusedCity?.name === city.name ? 'bg-primary/8 border-l-2 border-l-primary' : ''}`}
                        >
                            {/* Rank */}
                            <div className="hidden md:flex col-span-1 items-center">
                                <span className={`text-sm font-bold tabular-nums ${i < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {i + 1}
                                </span>
                            </div>

                            {/* City name */}
                            <div className="col-span-1 md:col-span-3 flex items-center gap-2">
                                <span className="md:hidden text-xs font-bold text-muted-foreground tabular-nums w-5">{i + 1}.</span>
                                <span className="text-sm font-bold text-foreground">{city.name}</span>
                            </div>

                            {/* Total */}
                            <div className="col-span-1 md:col-span-2 flex items-center justify-end">
                                <span className="text-sm font-bold tabular-nums text-foreground">{city.total}</span>
                            </div>

                            {/* Status counts — hidden on mobile */}
                            <div className="hidden md:flex col-span-1 items-center justify-end">
                                <span className="text-xs tabular-nums text-amber-600 font-bold">{city.pending}</span>
                            </div>
                            <div className="hidden md:flex col-span-1 items-center justify-end">
                                <span className="text-xs tabular-nums text-blue-600 font-bold">{city.in_progress}</span>
                            </div>
                            <div className="hidden md:flex col-span-1 items-center justify-end">
                                <span className="text-xs tabular-nums text-emerald-600 font-bold">{city.resolved}</span>
                            </div>

                            {/* Resolution bar */}
                            <div className="hidden md:flex col-span-3 items-center gap-2">
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${city.resolutionRate}%`,
                                            background: city.resolutionRate > 60 ? '#10b981' : city.resolutionRate > 30 ? '#f59e0b' : '#ef4444',
                                        }}
                                    />
                                </div>
                                <span className="text-[10px] font-bold tabular-nums text-muted-foreground w-8 text-right">{city.resolutionRate}%</span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
}
