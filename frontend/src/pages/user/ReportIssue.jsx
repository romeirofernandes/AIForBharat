import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle, MapPin, Upload, Loader2, ArrowLeft, Info, CheckCircle2,
    Truck, Trash2, Droplets, Zap, Building2, HelpCircle, Mic, MicOff, Search, Sparkles,
    Image as ImageIcon, ImageIcon as ImageFileIcon, Check, Map as MapIcon, Type,
    ChevronRight, ChevronLeft, Camera, Video
} from 'lucide-react';
import Button from '../../components/common/Button';
import LocationPicker from '../../components/common/LocationPicker';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const DEPARTMENT_ICONS = {
    'Roads & Transport': Truck,
    'Sanitation & Cleaning': Trash2,
    'Water Supply & Sewerage': Droplets,
    'Electricity & Street Lighting': Zap,
    'Public Works Department': Building2,
    'Other': HelpCircle
};

const DEPARTMENT_INCIDENTS = {
    'Roads & Transport': ['Pothole', 'Damaged Signage', 'Traffic Signal Failure', 'Broken Footpath'],
    'Sanitation & Cleaning': ['Garbage Dump', 'Overflowing Bin', 'Dead Animal', 'Unsanitary Condition'],
    'Water Supply & Sewerage': ['Pipeline Leak', 'No Water Supply', 'Contaminated Water', 'Sewer Blockage'],
    'Electricity & Street Lighting': ['Street Light Failure', 'Loose Hanging Wires', 'Power Outage'],
    'Public Works Department': ['Building Maintenance', 'Public Infrastructure Damage'],
    'Other': ['Other']
};

const steps = [
    { id: 'category', title: 'Classification', icon: AlertTriangle },
    { id: 'evidence', title: 'Media & Details', icon: Camera },
    { id: 'location', title: 'Pinpoint Location', icon: MapIcon }
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
        longitude: ''
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
    const [recognition, setRecognition] = useState(null);
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
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListening(false);
            return;
        }

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            // Re-enabling continuous = true as the user requested it to keep listening even during pauses
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
                        description: (prev.description + ' ' + finalTranscript).replace(/\s+/g, ' ').trim()
                    }));
                    setInterimTranscript('');
                } else if (interim) {
                    setInterimTranscript(interim);
                }
            };

            recognition.onerror = (event) => {
                console.error("Speech error: ", event.error);
                if (event.error === 'network') {
                    setVoiceError('Microphone disconnected by browser (Check Ad-Blockers or try Chrome).');
                    toast.error('Voice input interrupted by browser network error.');
                }
                else if (event.error === 'not-allowed') setVoiceError('Microphone access denied.');
                else if (event.error !== 'no-speech') setVoiceError(`Error: ${event.error}`);
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
            console.error("Voice input error:", err);
            setVoiceError("Could not start voice input.");
            setIsListening(false);
        }
    };


    const handleGenerateDescription = async () => {
        if (!formData.description && !image) {
            toast.error("Please provide some text or upload an image first.");
            return;
        }

        setIsGeneratingAI(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('currentDescription', formData.description);
            formDataToSend.append('department', formData.department);
            formDataToSend.append('incidentType', formData.incident_type);
            if (image) formDataToSend.append('image', image);

            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/gemini/generate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataToSend
            });

            if (!response.ok) throw new Error('Failed to generate description');

            const data = await response.json();
            setFormData(prev => ({ ...prev, description: data.description }));
            toast.success("Description expertly drafted by AI!");
        } catch (error) {
            toast.error("Failed to generate description.");
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
                    toast.success("GPS Location Acquired");
                },
                (err) => {
                    toast.error('Failed to get location. Provide it manually.');
                    setFetchingLocation(false);
                }
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
        if (value.length < 3) {
            setAddressSuggestions([]);
            return;
        }
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&addressdetails=1&limit=5&countrycodes=in`);
            const data = await response.json();
            setAddressSuggestions(data);
        } catch (err) {
            console.error(err);
        }
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
            if (data && data.length > 0) {
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
            const response = await fetch(`http://localhost:8000/api/issues`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to report incident');
            }

            toast.success('Incident successfully reported. Thank you for making our city better.');
            navigate('/user/dashboard');
        } catch (err) {
            toast.error(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    // Navigation Logic
    const nextStep = () => {
        if (currentStep === 0 && (!formData.department || !formData.incident_type)) {
            toast.error("Please classify the incident to continue.");
            return;
        }
        if (currentStep === 1 && !formData.description.trim()) {
            toast.error("Please provide a description of the issue.");
            return;
        }
        if (currentStep < 2) setCurrentStep(c => c + 1);
        else handleSubmit();
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(c => c - 1);
    };

    // Animation Variants
    const pageVariants = {
        initial: { opacity: 0, x: 20 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: -20 }
    };

    return (
        <div className="max-w-5xl mx-auto py-4 lg:py-6 px-4 sm:px-6 relative">

            <div className="text-center space-y-4 mb-8">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
                    Report an <span className="text-primary">Incident</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
                    Help us build a better city. Provide clear details to ensure rapid response from civic workers.
                </p>
            </div>

            {/* Stepper Wizard Indicator */}
            <div className="relative mb-16 max-w-3xl mx-auto">
                <div className="absolute top-1/2 left-0 w-full h-1.5 bg-muted -translate-y-1/2 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-primary"
                        initial={{ width: '0%' }}
                        animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>
                <div className="relative flex justify-between z-10 w-full px-2">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const isPast = currentStep > idx;
                        const isCurrent = currentStep === idx;
                        const isFuture = currentStep < idx;
                        
                        return (
                            <div key={step.id} className="flex flex-col items-center">
                                <motion.div 
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border-4 backdrop-blur-sm transition-all duration-500
                                    ${isPast ? 'bg-primary border-primary/20 text-primary-foreground shadow-lg shadow-primary/30' : 
                                      isCurrent ? 'bg-card border-primary text-primary shadow-xl shadow-primary/20 scale-110' : 
                                      'bg-card border-muted text-muted-foreground'}`}
                                >
                                    {isPast ? <Check className="w-6 h-6 stroke-[3]" /> : <Icon className="w-6 h-6" />}
                                </motion.div>
                                <span className={`mt-4 text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${isCurrent || isPast ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {step.title}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Wizard Form Container */}
            <div className="bg-card rounded-[2rem] border border-border/50 shadow-2xl shadow-black/5 p-6 md:p-10 min-h-[500px] relative overflow-hidden backdrop-blur-xl">

                <AnimatePresence mode="wait">
                    {/* STEP 1: CLASSIFICATION */}
                    {currentStep === 0 && (
                        <motion.div key="step0" variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.3 }} className="space-y-8 relative z-10">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">What happened?</h2>
                                <p className="text-muted-foreground font-medium">Select the department that best fits the issue you are reporting.</p>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.keys(DEPARTMENT_INCIDENTS).map((dept) => {
                                    const Icon = DEPARTMENT_ICONS[dept] || HelpCircle;
                                    const isSelected = formData.department === dept;
                                    return (
                                        <button
                                            key={dept}
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, department: dept, incident_type: '' }))}
                                            className={`
                                                relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 gap-3 group overflow-hidden
                                                ${isSelected
                                                    ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                                                    : 'border-border bg-background hover:border-primary/30 hover:bg-accent/30 tracking-tight cursor-pointer'
                                                }
                                            `}
                                        >
                                            {isSelected && <div className="absolute inset-0 bg-primary/5 pointer-events-none" />}
                                            <div className={`p-4 rounded-xl transition-colors duration-300 ${isSelected ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground group-hover:text-foreground'}`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <span className={`text-sm font-bold text-center leading-tight ${isSelected ? 'text-primary' : 'text-foreground'}`}>{dept}</span>
                                            
                                            {isSelected && (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3 text-primary">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </motion.div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <AnimatePresence>
                                {formData.department && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="pt-4 border-t border-border"
                                    >
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Specify Incident Type</label>
                                        <div className="flex flex-wrap gap-3">
                                            {DEPARTMENT_INCIDENTS[formData.department].map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setFormData(p => ({ ...p, incident_type: type }))}
                                                    className={`
                                                        px-5 py-3 rounded-xl text-sm font-semibold transition-all border
                                                        ${formData.incident_type === type 
                                                            ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20' 
                                                            : 'bg-background border-border text-foreground hover:border-primary/50 hover:bg-accent cursor-pointer'}
                                                    `}
                                                >
                                                    {type}
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
                        <motion.div key="step1" variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.3 }} className="relative z-10 w-full">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                
                                {/* Image & Video Columns */}
                                <div className="lg:col-span-5 space-y-6">
                                    <div className="bg-background rounded-2xl border border-border p-5">
                                        <h3 className="text-sm font-bold flex items-center gap-2 mb-4"><Camera className="w-4 h-4 text-primary" /> Visual Evidence</h3>
                                        
                                        <div className="relative group cursor-pointer aspect-video">
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                                            <div className={`
                                                w-full h-full rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center overflow-hidden
                                                ${imagePreview ? 'border-primary/50 bg-black/5' : 'border-border hover:border-primary/50 hover:bg-primary/5 bg-background'}
                                            `}>
                                                {imagePreview ? (
                                                    <div className="relative w-full h-full">
                                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                                            <Upload className="w-8 h-8 text-white mb-2" />
                                                            <p className="text-white font-bold text-sm">Replace Photo</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-primary/10">
                                                            <ImageFileIcon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                                        </div>
                                                        <p className="font-bold text-foreground">Drop a photo here</p>
                                                        <p className="text-xs text-muted-foreground font-medium mt-1">JPEG, PNG up to 10MB</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-border">
                                            <div className="relative group flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:border-indigo-500/30 transition-colors cursor-pointer overflow-hidden">
                                                <input type="file" accept="video/*" onChange={(e) => setVrImage(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${vrImage ? 'bg-indigo-500/20 text-indigo-500' : 'bg-muted text-muted-foreground'}`}>
                                                        <Video className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground truncate max-w-[150px]">{vrImage ? vrImage.name : 'Add 360° / VR Video'}</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Optional</p>
                                                    </div>
                                                </div>
                                                {vrImage && <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Description Column */}
                                <div className="lg:col-span-7 flex flex-col h-full">
                                    <div className="bg-background rounded-2xl border border-border p-1 flex-1 flex flex-col shadow-inner">
                                        <div className="p-4 flex items-center justify-between border-b border-border/50 bg-muted/20 rounded-t-xl">
                                            <h3 className="text-sm font-bold flex items-center gap-2"><Type className="w-4 h-4 text-muted-foreground" /> Describe the Issue</h3>
                                            <div className="flex items-center gap-2">
                                                {speechSupported && (
                                                    <button
                                                        type="button"
                                                        onClick={toggleListening}
                                                        className={`p-2 rounded-lg transition-all border ${
                                                            isListening 
                                                            ? 'bg-red-500/20 border-red-500/30 text-red-500 animate-pulse outline outline-4 outline-red-500/20' 
                                                            : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer'
                                                        }`}
                                                        title="Dictate description"
                                                    >
                                                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={handleGenerateDescription}
                                                    disabled={isGeneratingAI || (!formData.description && !image)}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer bg-primary text-white hover:opacity-90 transition-opacity border-none shadow-[0_0_15px_-3px_rgba(var(--primary),0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                                >
                                                    {isGeneratingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                                    {isGeneratingAI ? 'Writing...' : 'AI Enhance'}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="relative flex-1 p-4 bg-transparent">
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full h-full min-h-[200px] bg-transparent resize-none outline-none text-foreground font-medium placeholder:text-muted-foreground/40 leading-relaxed text-base"
                                                placeholder={isListening ? "Listening natively... start speaking" : "Type, dictate via voice, or let Gemini AI analyze your uploaded image..."}
                                            />
                                            {interimTranscript && (
                                                <div className="absolute inset-x-4 bottom-4 pointer-events-none">
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-muted/80 backdrop-blur rounded-xl border border-border shadow-sm">
                                                        <p className="text-sm font-medium text-muted-foreground italic truncate">"{interimTranscript}"</p>
                                                    </motion.div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {voiceError && <p className="text-xs font-bold text-destructive flex items-center gap-1 mt-2 px-2"><AlertTriangle className="w-3 h-3" /> {voiceError}</p>}
                                </div>

                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: LOCATION MAP */}
                    {currentStep === 2 && (
                        <motion.div key="step3" variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.3 }} className="relative z-10 h-full flex flex-col space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Where is the issue?</h2>
                                <p className="text-muted-foreground font-medium max-w-2xl">Use your GPS or search the address manually to drop a pin.</p>
                            </div>

                            <div className="flex-1 min-h-[400px] relative rounded-3xl overflow-hidden border border-border shadow-inner bg-card">
                                {/* Map Component */}
                                <div className="absolute inset-0 z-0">
                                    <LocationPicker position={mapPosition} setPosition={handleMapClick} />
                                </div>
                                
                                {/* Overlay Controls */}
                                <div className="absolute top-4 left-4 z-[400] w-full max-w-[320px] space-y-3">
                                    <div className="bg-background/80 backdrop-blur-xl p-3 border border-border rounded-2xl shadow-xl">
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
                                                className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                                            >
                                                {isGeocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                            </button>
                                            
                                            {/* Autocomplete Dropdown */}
                                            <AnimatePresence>
                                                {addressSuggestions.length > 0 && (
                                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                                                        {addressSuggestions.map((suggestion, idx) => (
                                                            <div key={idx} onClick={() => selectSuggestion(suggestion)} className="p-3 text-xs font-medium hover:bg-accent border-b border-border last:border-0 cursor-pointer flex gap-3">
                                                                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                                <span className="line-clamp-2">{suggestion.display_name}</span>
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleLocation}
                                        disabled={fetchingLocation}
                                        className="w-full flex items-center justify-center gap-2 p-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all cursor-pointer border border-primary-foreground/20"
                                    >
                                        {fetchingLocation ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5 fill-primary-foreground/20" />}
                                        Use Current Location
                                    </button>
                                </div>

                                {mapPosition && (
                                     <div className="absolute bottom-4 left-4 right-4 z-[400] md:right-auto md:w-auto bg-card/90 backdrop-blur-xl border border-border px-4 py-3 rounded-2xl shadow-xl flex items-center justify-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_2px_rgba(34,197,94,0.5)] animate-pulse" />
                                        <span className="text-xs font-mono font-bold tracking-widest uppercase">
                                            {Number(formData.latitude).toFixed(4)}, {Number(formData.longitude).toFixed(4)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Sticky/Fixed Navigation Footer */}
            <div className="flex items-center justify-between mt-8 border-t border-border pt-6 pb-12 gap-4">
                <Button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    variant="outline"
                    className={`h-14 px-8 rounded-2xl font-bold uppercase tracking-wider ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity border-bordertext-foreground hover:bg-muted cursor-pointer`}
                >
                    <ChevronLeft className="w-5 h-5 mr-2" /> Back
                </Button>

                <Button
                    onClick={nextStep}
                    disabled={loading}
                    className="h-14 px-10 rounded-2xl bg-primary font-extrabold text-white text-base shadow-[0_10px_30px_-10px_rgba(var(--primary),0.6)] hover:shadow-[0_15px_40px_-10px_rgba(var(--primary),0.8)] transition-all cursor-pointer border-none overflow-hidden group"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading && currentStep === 2 ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Submitting</>
                        ) : currentStep === 2 ? (
                            'Submit Report'
                        ) : (
                            <div className="flex items-center gap-1 group-hover:gap-2 transition-all">Continue <ChevronRight className="w-5 h-5" /></div>
                        )}
                    </span>
                 </Button>
            </div>
        </div>
    );
};

export default ReportIncident;
