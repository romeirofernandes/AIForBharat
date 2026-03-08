import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/auth';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function HomeLocationPicker({ lat, lng, onChange }) {
    function ClickHandler() {
        useMapEvents({
            click(e) {
                onChange(e.latlng.lat, e.latlng.lng);
            },
        });
        return null;
    }

    const center = lat && lng ? [lat, lng] : [20.5937, 78.9629];
    const zoom = lat && lng ? 14 : 5;

    return (
        <div className="h-[220px] rounded-lg overflow-hidden border border-border">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', zIndex: 1 }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ClickHandler />
                {lat && lng && <Marker position={[lat, lng]} />}
            </MapContainer>
        </div>
    );
}

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
    const [homeCoords, setHomeCoords] = useState({
        lat: profile.homeLatitude || null,
        lng: profile.homeLongitude || null,
    });
    const [emailNotifications, setEmailNotifications] = useState(profile.emailNotifications || false);
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
            const payload = {
                ...formData,
                homeLatitude: homeCoords.lat,
                homeLongitude: homeCoords.lng,
                emailNotifications,
            };
            let dataToSend = payload;
            if (profileImage) {
                const fd = new FormData();
                fd.append('name', formData.name);
                fd.append('age', formData.age);
                fd.append('gender', formData.gender);
                fd.append('homeLatitude', homeCoords.lat ?? '');
                fd.append('homeLongitude', homeCoords.lng ?? '');
                fd.append('emailNotifications', emailNotifications);
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

                            {/* Notification Preferences */}
                            <div className="space-y-4 pt-4 border-t border-border/50">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Notification Preferences</p>

                                <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setEmailNotifications(!emailNotifications)}>
                                    <div className={`w-10 h-5 rounded-full transition-colors relative ${emailNotifications ? 'bg-primary' : 'bg-muted border border-border'}`}>
                                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${emailNotifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                    </div>
                                    <span className="text-xs font-medium text-foreground">Email me about issues reported near my home</span>
                                </label>

                                {emailNotifications && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Home Location (click map to set)</p>
                                        <HomeLocationPicker
                                            lat={homeCoords.lat}
                                            lng={homeCoords.lng}
                                            onChange={(lat, lng) => setHomeCoords({ lat, lng })}
                                        />
                                        {homeCoords.lat && homeCoords.lng && (
                                            <p className="text-[10px] font-medium text-muted-foreground ml-1">
                                                {Number(homeCoords.lat).toFixed(5)}, {Number(homeCoords.lng).toFixed(5)}
                                            </p>
                                        )}
                                    </div>
                                )}
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
                                            setHomeCoords({ lat: profile.homeLatitude || null, lng: profile.homeLongitude || null });
                                            setEmailNotifications(profile.emailNotifications || false);
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
                            <div className="flex items-center justify-between py-3 border-b border-border/50">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Email Notifications</span>
                                <span className="text-sm font-medium text-foreground">{profile.emailNotifications ? 'Enabled' : 'Disabled'}</span>
                            </div>
                            {profile.homeLatitude && profile.homeLongitude && (
                                <div className="flex items-center justify-between py-3 border-b border-border/50">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Home Location</span>
                                    <span className="text-sm font-medium text-foreground">{Number(profile.homeLatitude).toFixed(4)}, {Number(profile.homeLongitude).toFixed(4)}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
