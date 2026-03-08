import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/auth';
import { getMyReputation } from '../../api/users';
import ReputationBadge from '../../components/ReputationBadge';
import { toast } from 'sonner';
import {
    UserIcon,
    ChampionIcon,
    Camera01Icon,
    Edit01Icon,
    Calendar01Icon,
    Tick01Icon
} from 'hugeicons-react';

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

    const [reputation, setReputation] = useState(null);
    const [repLoading, setRepLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'reputation'

    useEffect(() => {
        getMyReputation()
            .then((data) => setReputation(data.reputation))
            .catch(() => { })
            .finally(() => setRepLoading(false));
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
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
            login(localStorage.getItem('token'), data.user);
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
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
                    <UserIcon size={28} className="text-primary" />
                    Profile
                </h1>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.25em] mt-1.5 ml-1">Your civic identity</p>
            </motion.div>

            {/* Tab switcher */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.05 }}>
                <div className="flex gap-1 bg-muted/30 border border-border/50 rounded-xl p-1 w-fit">
                    {[
                        { id: 'profile', label: 'Profile', icon: UserIcon },
                        { id: 'reputation', label: 'Reputation', icon: ChampionIcon }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === tab.id ? 'bg-card shadow-sm text-foreground border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <tab.icon size={14} variant={activeTab === tab.id ? 'solid' : 'linear'} className={activeTab === tab.id ? 'text-primary' : ''} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {activeTab === 'profile' && (
                <motion.div
                    initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }}
                    className="border border-border/80 rounded-2xl p-6 md:p-10 bg-card shadow-sm space-y-8"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className={`relative ${isEditing ? 'cursor-pointer group' : ''}`} onClick={() => isEditing && fileInputRef.current?.click()}>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                                <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-xl ring-4 ring-muted/20">
                                    {imagePreview || profile.imageUrl ? (
                                        <img src={imagePreview || profile.imageUrl} alt="Profile" className="w-full h-full object-cover" onError={(e) => { e.target.src = ''; }} />
                                    ) : (
                                        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-black uppercase">
                                            {profile.name?.[0] || user?.email?.[0] || 'U'}
                                        </div>
                                    )}
                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                            <Camera01Icon size={24} className="text-white mb-1" />
                                            <span className="text-white text-[8px] uppercase font-black tracking-widest text-center px-2">Update Photo</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-foreground mb-0.5">{profile.name || 'Citizen Identity'}</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{user?.email}</p>
                                {reputation && !repLoading && (
                                    <div className="mt-4">
                                        <ReputationBadge reputation={reputation} compact />
                                    </div>
                                )}
                            </div>
                        </div>
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="h-11 inline-flex items-center gap-2 px-6 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all border border-primary/20 shadow-lg shadow-primary/5 active:scale-[0.98] cursor-pointer">
                                <Edit01Icon size={14} /> Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="border-t border-border/50 pt-8">
                        {isEditing ? (
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                        <div className="relative group">
                                            <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <input type="text" name="name" value={formData.name} onChange={handleChange} required
                                                className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm font-bold transition-all"
                                                placeholder="e.g., Rajesh Kumar" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Age</label>
                                        <div className="relative group">
                                            <Calendar01Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <input type="number" name="age" value={formData.age} onChange={handleChange}
                                                className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm font-bold transition-all"
                                                placeholder="e.g., 34" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange}
                                        className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm font-bold transition-all cursor-pointer appearance-none">
                                        <option value="" disabled>Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="prefer_not_to_say">Prefer not to say</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                                    <button type="submit" disabled={isLoading}
                                        className="h-12 px-8 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
                                        {isLoading ? 'Processing...' : 'Save Profile Details'}
                                    </button>
                                    {profile.name && (
                                        <button type="button" onClick={() => { setIsEditing(false); setFormData({ name: profile.name || '', age: profile.age || '', gender: profile.gender || '' }); setProfileImage(null); setImagePreview(null); }}
                                            className="h-12 px-8 bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-border rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                                            Discard
                                        </button>
                                    )}
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                {[
                                    { label: 'Full Name', value: profile.name || '—', icon: UserIcon },
                                    { label: 'Age', value: profile.age || '—', icon: Calendar01Icon },
                                    { label: 'Gender', value: profile.gender ? profile.gender.replace(/_/g, ' ') : '—', icon: UserIcon },
                                    { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—', icon: Tick01Icon },
                                ].map(({ label, value, icon: Icon }) => (
                                    <div key={label} className="flex items-center justify-between py-4 border-b border-border/40 group hover:border-primary/20 transition-colors">
                                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                                            <Icon size={12} /> {label}
                                        </span>
                                        <span className="text-sm font-black text-foreground capitalize">{value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {activeTab === 'reputation' && (
                <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }}>
                    {repLoading ? (
                        <div className="grid grid-cols-1 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-32 rounded-2xl bg-muted/20 animate-pulse border border-border/50" />
                            ))}
                        </div>
                    ) : reputation ? (
                        <ReputationBadge reputation={reputation} />
                    ) : (
                        <div className="border border-dashed border-border rounded-2xl p-24 bg-card text-center flex flex-col items-center">
                            <ChampionIcon size={48} className="text-muted-foreground/20 mb-4" />
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Reputation data unavailable</p>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
