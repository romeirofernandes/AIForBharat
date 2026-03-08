import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin, Upload, Loader2, CheckCircle2,
    Mic, MicOff, Search, Sparkles,
    Image as ImageIcon, Check, Map as MapIcon,
    ChevronRight, ChevronLeft, Camera, Video,
    ClipboardList
} from 'lucide-react';
import { RichButton } from '../../components/ui/rich-button';
import LocationPicker from '../../components/common/LocationPicker';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const departments = [
    'Roads & Transport',
    'Sanitation & Cleaning',
    'Water Supply & Sewerage',
    'Electricity & Street Lighting',
    'Public Works Department',
    'Other',
];

const incidentTypes = {
    'Roads & Transport': ['Pothole', 'Broken Road', 'Missing Sign', 'Traffic Signal Malfunction', 'Waterlogging', 'Other'],
    'Sanitation & Cleaning': ['Garbage Dump', 'Overflowing Drain', 'Unclean Public Area', 'Dead Animal', 'Other'],
    'Water Supply & Sewerage': ['Pipe Burst', 'No Water Supply', 'Contaminated Water', 'Sewage Overflow', 'Other'],
    'Electricity & Street Lighting': ['Street Light Out', 'Exposed Wire', 'Power Outage', 'Faulty Meter', 'Other'],
    'Public Works Department': ['Broken Footpath', 'Damaged Bridge', 'Construction Hazard', 'Other'],
    'Other': ['Noise Complaint', 'Encroachment', 'Illegal Dumping', 'Other'],
};

const steps = [
    { id: 'classify', title: 'Classify Issue', icon: ClipboardList },
    { id: 'evidence', title: 'Evidence & Details', icon: Camera },
    { id: 'location', title: 'Pinpoint Location', icon: MapIcon },
];

const ReportIncident = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const [mapPosition, setMapPosition] = useState(null);
    const [formData, setFormData] = useState({
        department: '',
        incident_type: '',
        description: '',
        latitude: '',
        longitude: '',
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [vrImage, setVrImage] = useState(null);
    const [manualAddress, setManualAddress] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [isGeocoding, setIsGeocoding] = useState(false);

    // Voice Recognition State
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [voiceError, setVoiceError] = useState('');
    const recognitionRef = useRef(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setSpeechSupported(true);
        }
    }, []);

    const toggleListening = () => {
        setVoiceError('');
        if (isListening) {
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsListening(false);
            return;
        }
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                let finalTranscript = '';
                let interim = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript + ' ';
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setFormData(prev => ({
                        ...prev,
                        description: (prev.description + ' ' + finalTranscript).replace(/\s+/g, ' ').trim(),
                    }));
                    setInterimTranscript('');
                } else if (interim) {
                    setInterimTranscript(interim);
                }
            };

            recognition.onerror = (event) => {
                if (event.error === 'network') {
                    setVoiceError('Microphone disconnected by browser.');
                    toast.error('Voice input interrupted.');
                } else if (event.error === 'not-allowed') {
                    setVoiceError('Microphone access denied.');
                } else if (event.error !== 'no-speech') {
                    setVoiceError(`Error: ${event.error}`);
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
                setInterimTranscript('');
            };

            recognitionRef.current = recognition;
            recognition.start();
            setIsListening(true);
        } catch (err) {
            setVoiceError('Could not start voice input.');
            setIsListening(false);
        }
    };

    const handleGenerateDescription = async () => {
        if (!image) {
            toast.error('Please upload a photo first.');
            return;
        }
        setIsGeneratingAI(true);
        try {
            const fd = new FormData();
            fd.append('currentDescription', formData.description);
            fd.append('department', formData.department);
            fd.append('incidentType', formData.incident_type);
            fd.append('image', image);

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/gemini/generate', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });

            if (!response.ok) throw new Error('Failed to generate description');

            const data = await response.json();
            setFormData(prev => ({ ...prev, description: data.description }));
            if (data.department) setFormData(prev => ({ ...prev, department: data.department }));
            if (data.incident_type) setFormData(prev => ({ ...prev, incident_type: data.incident_type }));
            toast.success('AI analysis complete.');
        } catch (error) {
            toast.error('Failed to generate description.');
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleLocation = () => {
        setFetchingLocation(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
                    setMapPosition([lat, lng]);
                    setFetchingLocation(false);
                    toast.success('GPS location acquired.');
                },
                () => {
                    toast.error('Failed to get location. Provide it manually.');
                    setFetchingLocation(false);
                },
            );
        } else {
            toast.error('Geolocation is not supported by your browser.');
            setFetchingLocation(false);
        }
    };

    const handleMapClick = (latlng) => {
        if (!latlng) return;
        setMapPosition(latlng);
        setFormData(prev => ({ ...prev, latitude: latlng[0], longitude: latlng[1] }));
    };

    const handleAddressInputChange = async (value) => {
        setManualAddress(value);
        if (value.length < 3) { setAddressSuggestions([]); return; }
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&addressdetails=1&limit=5&countrycodes=in`);
            const data = await response.json();
            setAddressSuggestions(data);
        } catch (err) { /* silent */ }
    };

    const selectSuggestion = (suggestion) => {
        const latitude = parseFloat(suggestion.lat);
        const longitude = parseFloat(suggestion.lon);
        setMapPosition([latitude, longitude]);
        setFormData(prev => ({ ...prev, latitude, longitude }));
        setManualAddress(suggestion.display_name);
        setAddressSuggestions([]);
    };

    const handleAddressSearch = async () => {
        if (!manualAddress.trim()) return;
        setIsGeocoding(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}&countrycodes=in`);
            const data = await response.json();
            if (data?.length > 0) {
                const { lat, lon } = data[0];
                setMapPosition([parseFloat(lat), parseFloat(lon)]);
                setFormData(prev => ({ ...prev, latitude: parseFloat(lat), longitude: parseFloat(lon) }));
            } else {
                toast.error('Address not found.');
            }
        } catch (err) {
            toast.error('Failed to fetch address.');
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!formData.latitude || !formData.longitude) {
            toast.error('Please pinpoint the location before submitting.');
            return;
        }
        setLoading(true);
        try {
            const data = new FormData();
            data.append('department', formData.department);
            data.append('incident_type', formData.incident_type);
            data.append('description', formData.description);
            data.append('latitude', formData.latitude);
            data.append('longitude', formData.longitude);
            if (image) data.append('image', image);
            if (vrImage) data.append('vr_image', vrImage);

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/issues', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: data,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to report incident');
            }

            toast.success('Incident reported successfully.');
            navigate('/user/dashboard');
        } catch (err) {
            toast.error(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (currentStep === 0) {
            if (!formData.department || !formData.incident_type) {
                toast.error('Please select a department and incident type.');
                return;
            }
        }
        if (currentStep === 1) {
            if (!formData.description.trim()) {
                toast.error('Please describe the issue before continuing.');
                return;
            }
        }
        if (currentStep < steps.length - 1) setCurrentStep(c => c + 1);
        else handleSubmit();
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(c => c - 1);
    };

    const pageVariants = {
        initial: { opacity: 0, x: 20 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: -20 },
    };

    return (
        <div className="w-full space-y-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">Report an Incident</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">Classify, document, and locate the issue for rapid civic response.</p>
            </motion.div>

            {/* Step Indicator */}
            <div className="flex items-center gap-3">
                {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isPast = currentStep > idx;
                    const isCurrent = currentStep === idx;
                    return (
                        <div key={step.id} className="flex items-center gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all shrink-0
                                ${isPast ? 'bg-primary border-primary text-primary-foreground' :
                                  isCurrent ? 'bg-card border-primary text-primary' :
                                  'bg-card border-border text-muted-foreground'}`}>
                                {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${isCurrent || isPast ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    Step {idx + 1}
                                </p>
                                <p className={`text-xs font-bold truncate ${isCurrent || isPast ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                                    {step.title}
                                </p>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`h-px flex-1 ${isPast ? 'bg-primary' : 'bg-border'}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Form Container */}
            <div className="border border-border rounded-lg bg-card p-6 md:p-8 min-h-[480px]">
                <AnimatePresence mode="wait">
                    {/* STEP 1: CLASSIFICATION */}
                    {currentStep === 0 && (
                        <motion.div key="step0" variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.25 }} className="space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-foreground mb-1">Select Department & Type</h2>
                                <p className="text-xs text-muted-foreground font-medium">
                                    Choose the department this issue belongs to and specify the incident type.
                                </p>
                            </div>

                            {/* Department Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Department</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                                    {departments.map(dept => (
                                        <button
                                            key={dept}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, department: dept, incident_type: '' }))}
                                            className={`p-3 rounded-lg border text-left transition-all cursor-pointer
                                                ${formData.department === dept
                                                    ? 'border-primary bg-primary/5 text-foreground'
                                                    : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
                                                }`}
                                        >
                                            <p className="text-xs font-bold">{dept}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Incident Type Selection */}
                            <AnimatePresence>
                                {formData.department && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3"
                                    >
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Incident Type</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                                            {(incidentTypes[formData.department] || []).map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, incident_type: type }))}
                                                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer
                                                        ${formData.incident_type === type
                                                            ? 'border-primary bg-primary/5 text-foreground'
                                                            : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
                                                        }`}
                                                >
                                                    <p className="text-xs font-bold">{type}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* STEP 2: EVIDENCE & DETAILS */}
                    {currentStep === 1 && (
                        <motion.div key="step1" variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.25 }} className="space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-foreground mb-1">Upload Evidence</h2>
                                <p className="text-xs text-muted-foreground font-medium">
                                    Upload a photo of the issue. AI will analyze it and draft a concise description.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="relative group cursor-pointer aspect-video">
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                                        <div className={`w-full h-full rounded-lg border-2 border-dashed transition-all flex flex-col items-center justify-center text-center overflow-hidden
                                            ${imagePreview ? 'border-primary/40' : 'border-border hover:border-primary/40 bg-muted/30'}`}>
                                            {imagePreview ? (
                                                <div className="relative w-full h-full">
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Upload className="w-6 h-6 text-white mb-1" />
                                                        <p className="text-white font-bold text-xs">Replace Photo</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                                                    <p className="text-sm font-bold text-foreground">Upload a photo</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">JPEG, PNG up to 10MB</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Video upload (optional) */}
                                    <div className="relative group flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:border-primary/30 transition-colors cursor-pointer overflow-hidden">
                                        <input type="file" accept="video/*" onChange={(e) => setVrImage(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-md flex items-center justify-center ${vrImage ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                                <Video className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-foreground truncate max-w-[180px]">{vrImage ? vrImage.name : 'Add Video'}</p>
                                                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Optional</p>
                                            </div>
                                        </div>
                                        {vrImage && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                    </div>

                                    {/* AI Analyze Button */}
                                    {image && (
                                        <RichButton
                                            color="primary"
                                            size="default"
                                            onClick={handleGenerateDescription}
                                            disabled={isGeneratingAI}
                                            className="w-full"
                                        >
                                            {isGeneratingAI ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> Analyze with AI</>}
                                        </RichButton>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="flex flex-col h-full min-h-[260px]">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                                        <div className="flex items-center gap-1.5">
                                            {speechSupported && (
                                                <button
                                                    type="button"
                                                    onClick={toggleListening}
                                                    className={`p-1.5 rounded-md transition-all border cursor-pointer ${
                                                        isListening
                                                            ? 'bg-destructive/10 border-destructive/30 text-destructive animate-pulse'
                                                            : 'bg-card border-border text-muted-foreground hover:text-foreground'
                                                    }`}
                                                    title="Dictate description"
                                                >
                                                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="relative flex-1 border border-border rounded-lg bg-background overflow-hidden">
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full h-full min-h-[220px] bg-transparent resize-none outline-none text-foreground font-medium placeholder:text-muted-foreground/40 text-sm leading-relaxed p-4"
                                            placeholder={isListening ? 'Listening... start speaking.' : 'Describe what you see. For example: "There is a large pothole on the main road near the school gate, approximately 2 feet wide."'}
                                        />
                                        {interimTranscript && (
                                            <div className="absolute inset-x-3 bottom-3 pointer-events-none">
                                                <div className="p-2 bg-muted/80 rounded-md border border-border">
                                                    <p className="text-xs font-medium text-muted-foreground italic truncate">"{interimTranscript}"</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {voiceError && (
                                        <p className="text-[10px] font-bold text-destructive mt-1.5">{voiceError}</p>
                                    )}

                                    {/* Classification badges */}
                                    {(formData.department || formData.incident_type) && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-primary/10 text-primary">
                                                {formData.department}
                                            </span>
                                            {formData.incident_type && (
                                                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-muted text-muted-foreground">
                                                    {formData.incident_type}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: LOCATION */}
                    {currentStep === 2 && (
                        <motion.div key="step2" variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.25 }} className="space-y-5 h-full flex flex-col">
                            <div>
                                <h2 className="text-lg font-bold text-foreground mb-1">Where is the issue?</h2>
                                <p className="text-xs text-muted-foreground font-medium">Use GPS or search manually to drop a pin on the map.</p>
                            </div>

                            <div className="flex-1 min-h-[400px] relative rounded-lg overflow-hidden border border-border bg-muted">
                                <div className="absolute inset-0 z-0">
                                    <LocationPicker position={mapPosition} setPosition={handleMapClick} />
                                </div>

                                {/* Overlay Controls */}
                                <div className="absolute top-3 left-3 z-[400] w-full max-w-[300px] space-y-2">
                                    <div className="bg-background/90 backdrop-blur-sm p-2.5 border border-border rounded-lg">
                                        <div className="flex gap-2 relative">
                                            <input
                                                type="text"
                                                value={manualAddress}
                                                onChange={(e) => handleAddressInputChange(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                                                placeholder="Search address..."
                                                className="w-full bg-transparent border-none text-sm font-medium outline-none placeholder:text-muted-foreground pl-1"
                                            />
                                            <button
                                                onClick={handleAddressSearch}
                                                disabled={isGeocoding}
                                                className="w-8 h-8 bg-muted rounded-md flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer shrink-0"
                                            >
                                                {isGeocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                            </button>

                                            <AnimatePresence>
                                                {addressSuggestions.length > 0 && (
                                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                                                        {addressSuggestions.map((suggestion, idx) => (
                                                            <div key={idx} onClick={() => selectSuggestion(suggestion)} className="p-2.5 text-xs font-medium hover:bg-accent border-b border-border last:border-0 cursor-pointer flex gap-2">
                                                                <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                                <span className="line-clamp-2">{suggestion.display_name}</span>
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <RichButton
                                        color="primary"
                                        size="sm"
                                        onClick={handleLocation}
                                        disabled={fetchingLocation}
                                        className="w-full"
                                    >
                                        {fetchingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                                        Use Current Location
                                    </RichButton>
                                </div>

                                {mapPosition && (
                                    <div className="absolute bottom-3 left-3 z-[400] bg-card/90 backdrop-blur-sm border border-border px-3 py-2 rounded-lg flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-chart-2 animate-pulse" />
                                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                                            {Number(formData.latitude).toFixed(4)}, {Number(formData.longitude).toFixed(4)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between border-t border-border pt-5 pb-8 gap-4">
                <div className={`${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity`}>
                    <RichButton color="slate" size="default" onClick={prevStep}>
                        <ChevronLeft className="w-4 h-4" /> Back
                    </RichButton>
                </div>

                <RichButton
                    color="primary"
                    size="default"
                    onClick={nextStep}
                    disabled={loading}
                >
                    {loading && currentStep === 2 ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Submitting</>
                    ) : currentStep === 2 ? (
                        'Submit Report'
                    ) : (
                        <>Continue <ChevronRight className="w-4 h-4" /></>
                    )}
                </RichButton>
            </div>
        </div>
    );
};

export default ReportIncident;
