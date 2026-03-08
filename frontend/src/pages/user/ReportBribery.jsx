import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Mic01Icon as MicIcon,
    StopIcon,
    Upload04Icon as UploadIcon,
    Delete02Icon as DeleteIcon,
    SparklesIcon,
    Loading03Icon as LoadingIcon,
    SecurityCheckIcon as BadgeIcon,
    Calendar03Icon as CalendarIcon,
    Location04Icon as LocationIcon,
    MoneyReceiveSquareIcon as MoneyIcon,
    File02Icon as FileIcon,
    Tick02Icon as TickIcon,
} from 'hugeicons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { createComplaint, transcribeAndParse } from '../../api/bribery';

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const COMPLAINT_TYPES = [
    'No Receipt Given',
    'Charged Excess Fine',
    'Demanded Bribe / Money',
    'Rude or Threatening Behavior',
    'Wrongful Challan Issued',
    'Confiscation Without Reason',
    'Other',
];

export default function ReportBribery() {
    const navigate = useNavigate();

    // Form state
    const [badgeNumber, setBadgeNumber] = useState('');
    const [complaintType, setComplaintType] = useState('');
    const [otherComplaintType, setOtherComplaintType] = useState('');
    const [description, setDescription] = useState('');
    const [incidentAt, setIncidentAt] = useState('');
    const [location, setLocation] = useState('');
    const [challanNumber, setChallanNumber] = useState('');
    const [amountDemanded, setAmountDemanded] = useState('');
    const [proofFiles, setProofFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // Voice state
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [voiceFilled, setVoiceFilled] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const fileInputRef = useRef(null);

    // ─── Voice Recording ────────────────────────────────────────
    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

                if (blob.size < 1000) {
                    toast.error('Recording too short. Please try again.');
                    return;
                }

                setIsTranscribing(true);
                try {
                    const formData = new FormData();
                    formData.append('audio', blob, 'recording.webm');
                    const { transcript, parsed } = await transcribeAndParse(formData);

                    if (!transcript) {
                        toast.error('Could not transcribe audio. Try again or type manually.');
                        return;
                    }

                    toast.success('Voice transcribed! Filling your form…');

                    // Auto-fill fields from parsed response
                    if (parsed) {
                        if (parsed.badgeNumber) setBadgeNumber(parsed.badgeNumber);
                        if (parsed.complaintType && COMPLAINT_TYPES.includes(parsed.complaintType)) {
                            setComplaintType(parsed.complaintType);
                        } else if (parsed.complaintType) {
                            setComplaintType('Other');
                            setOtherComplaintType(parsed.complaintType);
                        }
                        if (parsed.description) setDescription(parsed.description);
                        if (parsed.location) setLocation(parsed.location);
                        if (parsed.challanNumber) setChallanNumber(parsed.challanNumber);
                        if (parsed.amountDemanded) setAmountDemanded(String(parsed.amountDemanded));
                        if (parsed.incidentDate) {
                            // Convert to datetime-local format
                            const d = new Date(parsed.incidentDate);
                            if (!isNaN(d.getTime())) {
                                const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                                    .toISOString()
                                    .slice(0, 16);
                                setIncidentAt(local);
                            }
                        }
                        setVoiceFilled(true);
                    } else {
                        // Fallback: put transcript in description
                        setDescription(transcript);
                    }
                } catch (err) {
                    toast.error(err.message || 'Voice processing failed');
                } finally {
                    setIsTranscribing(false);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            toast.info('Recording… Speak your full complaint.');
        } catch (err) {
            toast.error('Microphone access denied. Please allow microphone permissions.');
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    }, []);

    // ─── File Upload ────────────────────────────────────────────
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (proofFiles.length + files.length > 5) {
            toast.error('Maximum 5 proof files allowed');
            return;
        }
        setProofFiles((prev) => [...prev, ...files]);
        e.target.value = '';
    };

    const removeFile = (index) => {
        setProofFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // ─── Submit ─────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!badgeNumber.trim()) { toast.error('Badge number is required'); return; }
        if (!complaintType) { toast.error('Select a complaint type'); return; }
        if (!description.trim()) { toast.error('Description is required'); return; }
        if (!incidentAt) { toast.error('Incident date/time is required'); return; }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('badgeNumber', badgeNumber.trim());
            formData.append('complaintType', complaintType);
            if (complaintType === 'Other') formData.append('otherComplaintType', otherComplaintType);
            formData.append('description', description.trim());
            formData.append('incidentAt', new Date(incidentAt).toISOString());
            if (location.trim()) formData.append('location', location.trim());
            if (challanNumber.trim()) formData.append('challanNumber', challanNumber.trim());
            if (amountDemanded) formData.append('amountDemanded', amountDemanded);
            proofFiles.forEach((file) => formData.append('proof', file));

            await createComplaint(formData);
            toast.success('Complaint filed successfully!');
            navigate('/user/traffic/my-reports');
        } catch (err) {
            toast.error(err.message || 'Failed to file complaint');
        } finally {
            setSubmitting(false);
        }
    };

    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) return '🖼️';
        if (file.type.startsWith('video/')) return '🎥';
        return '📄';
    };

    return (
        <div className="w-full space-y-6">

            {/* Header */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.05 }}>
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">Report Misconduct</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">
                    File a complaint against traffic police bribery or unfair behavior
                </p>
            </motion.div>

            {/* Voice Fill Card — full width */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }}>
                <Card className={`border-2 transition-all ${isRecording ? 'border-red-400 bg-red-50/30' : isTranscribing ? 'border-primary bg-primary/5' : voiceFilled ? 'border-emerald-400 bg-emerald-50/30' : 'border-dashed border-primary/30 hover:border-primary/60'}`}>
                    <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                        {isTranscribing ? (
                            <>
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <LoadingIcon size={28} className="text-primary animate-spin" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">AI is processing your voice…</p>
                                    <p className="text-xs text-muted-foreground mt-1">Transcribing and auto-filling the form</p>
                                </div>
                            </>
                        ) : voiceFilled ? (
                            <>
                                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                    <TickIcon size={28} className="text-emerald-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-emerald-700">Form auto-filled from voice!</p>
                                    <p className="text-xs text-muted-foreground mt-1">Review the fields below and make any corrections</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => { setVoiceFilled(false); }} className="text-xs cursor-pointer shrink-0">
                                    Record Again
                                </Button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg shrink-0 ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-red-200' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`}
                                >
                                    {isRecording ? <StopIcon size={26} className="text-white" /> : <MicIcon size={26} className="text-white" />}
                                </button>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                                        <SparklesIcon size={16} className="text-primary" />
                                        {isRecording ? 'Recording… Click to stop' : 'Voice Fill — Speak Your Complaint'}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {isRecording ? 'Describe everything: badge number, what happened, where, when, amount demanded…' : 'Just talk naturally — AI will transcribe and auto-fill all the fields below. No typing needed!'}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            <Separator />

            {/* 2-column form layout */}
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                    {/* ── Left Column ── */}
                    <div className="space-y-5">
                        {/* Complaint Type */}
                        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.15 }}>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                        Complaint Type *
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {COMPLAINT_TYPES.map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setComplaintType(type)}
                                                className={`px-4 py-3 rounded-lg border text-left text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${complaintType === type ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-border hover:border-primary/30 text-foreground/70 hover:text-foreground'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                    <AnimatePresence>
                                        {complaintType === 'Other' && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                                <Input
                                                    placeholder="Specify what happened…"
                                                    value={otherComplaintType}
                                                    onChange={(e) => setOtherComplaintType(e.target.value)}
                                                    className="mt-2"
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Badge + Incident Date */}
                        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.2 }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                            <BadgeIcon size={14} /> Badge Number *
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Input
                                            placeholder="e.g. TPC-1234"
                                            value={badgeNumber}
                                            onChange={(e) => setBadgeNumber(e.target.value)}
                                            className="font-mono tracking-wider"
                                        />
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                            <CalendarIcon size={14} /> Date & Time *
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Input
                                            type="datetime-local"
                                            value={incidentAt}
                                            onChange={(e) => setIncidentAt(e.target.value)}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>

                        {/* Location + Challan */}
                        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.25 }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                            <LocationIcon size={14} /> Location
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Input
                                            placeholder="e.g. Andheri Signal, Mumbai"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                        />
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                            <FileIcon size={14} /> Challan No.
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Input
                                            placeholder="e.g. MH01-2026-123456"
                                            value={challanNumber}
                                            onChange={(e) => setChallanNumber(e.target.value)}
                                            className="font-mono tracking-wider"
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>

                        {/* Amount Demanded */}
                        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.3 }}>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                        <MoneyIcon size={14} /> Amount Demanded (₹)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 500"
                                        value={amountDemanded}
                                        onChange={(e) => setAmountDemanded(e.target.value)}
                                        min="0"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1.5">
                                        If the officer demanded or took money, enter the amount here
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* ── Right Column ── */}
                    <div className="space-y-5">
                        {/* Description */}
                        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.2 }}>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                        Description *
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <textarea
                                        rows={6}
                                        placeholder="Describe what happened in detail…"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Proof Upload */}
                        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.25 }}>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                        <UploadIcon size={14} /> Proof / Evidence
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-border rounded-lg p-5 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/20 transition-all"
                                    >
                                        <UploadIcon size={22} className="mx-auto text-muted-foreground mb-2" />
                                        <p className="text-xs font-bold text-foreground">Click to upload / drag files here</p>
                                        <p className="text-xs text-muted-foreground mt-1">Images, videos · up to 5 files, 50MB each</p>
                                        <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={handleFileChange} className="hidden" />
                                    </div>
                                    {proofFiles.length > 0 && (
                                        <div className="space-y-2">
                                            {proofFiles.map((file, i) => (
                                                <div key={i} className="flex items-center gap-3 p-2.5 border border-border rounded-lg bg-muted/20">
                                                    <span className="text-lg">{getFileIcon(file)}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                                                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                                                    </div>
                                                    <button type="button" onClick={() => removeFile(i)} className="cursor-pointer p-1 hover:bg-red-100 rounded">
                                                        <DeleteIcon size={14} className="text-red-500" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Submit */}
                        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.35 }}>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-6 text-sm font-bold uppercase tracking-widest cursor-pointer"
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <LoadingIcon size={16} className="animate-spin" /> Filing Complaint…
                                    </span>
                                ) : (
                                    'File Complaint'
                                )}
                            </Button>
                        </motion.div>

                        {/* Legal Note */}
                        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.4 }}>
                            <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                                <p className="text-xs font-medium text-amber-700 mb-1">Important Notice</p>
                                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                    Filing a false complaint is a punishable offense. Ensure all information provided is accurate and truthful.
                                    Your complaint will be reviewed by our team. Attach as much evidence as possible for faster resolution.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </form>
        </div>
    );
}
