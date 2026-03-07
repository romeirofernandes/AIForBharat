import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/auth';
import { toast } from 'sonner';

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function Profile() {
    const { user, login } = useAuth();
    const profile = user?.profile || {};
    
    const [isEditing, setIsEditing] = useState(!profile.name);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: profile.name || '',
        age: profile.age || '',
        gender: profile.gender || '',
    });
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = React.useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let dataToSend = formData;
            if (profileImage) {
                const fd = new FormData();
                fd.append('name', formData.name);
                fd.append('age', formData.age);
                fd.append('gender', formData.gender);
                fd.append('profileImage', profileImage);
                dataToSend = fd;
            }

            const data = await updateProfile(dataToSend);
            login(localStorage.getItem('token'), data.user); // updates context
            toast.success('Profile updated successfully');
            setIsEditing(false);
        } catch (err) {
            toast.error(err.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full space-y-6">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">Profile</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">Your civic identity</p>
            </motion.div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ delay: 0.1 }}
                className="border border-border rounded-lg p-6 md:p-8 bg-card space-y-6"
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div 
                            className={`relative ${isEditing ? 'cursor-pointer group' : ''}`}
                            onClick={() => isEditing && fileInputRef.current?.click()}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                            />
                            {imagePreview || profile.imageUrl ? (
                                <img src={imagePreview || profile.imageUrl} alt="Profile" className="w-16 h-16 rounded-lg object-cover bg-muted/40" onError={(e) => { e.target.src = '' }} />
                            ) : (
                                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold uppercase">
                                    {profile.name?.[0] || user?.email?.[0] || 'U'}
                                </div>
                            )}
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-[10px] uppercase font-bold text-center leading-tight tracking-wider">Change<br/>Photo</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-lg font-bold text-foreground">{profile.name || 'Citizen Identity'}</p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{user?.email}</p>
                        </div>
                    </div>
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-bold text-[10px] uppercase tracking-wider rounded-md transition-all cursor-pointer"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="border-t border-border pt-6 mt-6">
                    {isEditing ? (
                        <form onSubmit={handleSave} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="h-12 px-4 rounded-lg bg-muted/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                                        placeholder="e.g., Rajesh Kumar"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        className="h-12 px-4 rounded-lg bg-muted/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                                        placeholder="e.g., 34"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="h-12 px-4 rounded-lg bg-muted/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium cursor-pointer"
                                >
                                    <option value="" disabled>Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer_not_to_say">Prefer not to say</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="h-10 px-6 bg-primary text-primary-foreground rounded-lg font-bold text-[10px] uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                                >
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                                {profile.name && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({ name: profile.name || '', age: profile.age || '', gender: profile.gender || '' });
                                            setProfileImage(null);
                                            setImagePreview(null);
                                        }}
                                        className="h-10 px-6 bg-muted/50 text-muted-foreground hover:text-foreground rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-border/50">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Full Name</span>
                                <span className="text-sm font-medium text-foreground">{profile.name || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-border/50">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Age</span>
                                <span className="text-sm font-medium text-foreground">{profile.age || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-border/50">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Gender</span>
                                <span className="text-sm font-medium text-foreground capitalize">{profile.gender ? profile.gender.replace(/_/g, ' ') : '—'}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-border/50">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Member Since</span>
                                <span className="text-sm font-medium text-foreground">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
