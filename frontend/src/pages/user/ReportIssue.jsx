import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createIssue } from '../../api/issues';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function ReportIssue() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ title: '', description: '', location: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createIssue(formData);
            toast.success('Grievance reported successfully');
            navigate('/user/complaints');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">Report Issue</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">Submit a civic grievance for resolution</p>
            </motion.div>

            <motion.form
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ delay: 0.1 }}
                onSubmit={handleSubmit}
                className="border border-border rounded-lg p-6 md:p-8 bg-card space-y-5"
            >
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Issue Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="h-12 px-4 rounded-lg bg-muted/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                        placeholder="e.g., Pothole on Main Road"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="px-4 py-3 rounded-lg bg-muted/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium resize-none"
                        placeholder="Describe the issue in detail..."
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Location <span className="text-muted-foreground/50">(Optional)</span></label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="h-12 px-4 rounded-lg bg-muted/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                        placeholder="e.g., Ward 12, Sector 5"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                    {isLoading ? 'Submitting...' : 'Submit Grievance'}
                </button>
            </motion.form>
        </div>
    );
}
