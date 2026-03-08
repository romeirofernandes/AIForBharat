import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, generateWhatsappOtp, getProfile } from '../../api/auth';
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
    const whatsappUser = user?.whatsappUser || null;
    const navigate = useNavigate();
    
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

    // WhatsApp OTP state
    const [phoneInput, setPhoneInput] = useState(profile.phone || '');
    const [otp, setOtp] = useState(null);
    const [otpLoading, setOtpLoading] = useState(false);
    const [expiresAt, setExpiresAt] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!expiresAt) return;
        const interval = setInterval(() => {
            const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
            setTimeLeft(diff);
            if (diff <= 0) { setOtp(null); setExpiresAt(null); setTimeLeft(null); clearInterval(interval); }
        }, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    const handleGenerateOtp = async () => {
        // Normalise: strip spaces/dashes, prepend +91 for bare 10-digit Indian numbers
        let phone = phoneInput.replace(/[\s\-()]/g, '');
        if (/^\d{10}$/.test(phone)) phone = '+91' + phone;
        else if (/^0\d{10}$/.test(phone)) phone = '+91' + phone.slice(1);
        else if (/^91\d{10}$/.test(phone)) phone = '+' + phone;
        setPhoneInput(phone); // show normalised value

        if (!/^\+\d{10,15}$/.test(phone)) {
            toast.error('Enter a valid phone number, e.g. 9876543210 or +919876543210');
            return;
        }
        setOtpLoading(true);
        try {
            const data = await generateWhatsappOtp(phone);
            setOtp(data.otp);
            setExpiresAt(Date.now() + data.expiresInMinutes * 60 * 1000);
            toast.success('OTP generated! Valid for 10 minutes.');
            const profileData = await getProfile();
            login(localStorage.getItem('token'), profileData.user);
        } catch (err) {
            toast.error(err.message || 'Failed to generate OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

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

            {/* WhatsApp Section */}
            {user?.role === 'user' && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    transition={{ delay: 0.2 }}
                    className="border border-border rounded-lg p-6 bg-card space-y-5"
                >
                    {/* Header row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${whatsappUser?.isActive ? 'bg-green-500/10' : 'bg-muted/40'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={whatsappUser?.isActive ? 'text-green-600' : 'text-muted-foreground'}><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">WhatsApp Bot</p>
                                <p className="text-xs text-muted-foreground">
                                    {whatsappUser?.isActive
                                        ? `Connected • ${profile.phone || ''}`
                                        : 'Not connected yet'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${whatsappUser?.isActive ? 'bg-green-500/10 text-green-600' : 'bg-muted/50 text-muted-foreground'}`}>
                                {whatsappUser?.isActive ? '● Active' : '○ Inactive'}
                            </div>
                            <button
                                onClick={() => navigate('/user/whatsapp')}
                                className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-bold text-[10px] uppercase tracking-wider rounded-md transition-all cursor-pointer"
                            >
                                Docs
                            </button>
                        </div>
                    </div>

                    {/* Phone + OTP */}
                    <div className="border-t border-border pt-5 space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Mobile Number (E.164)</label>
                            <div className="flex gap-2">
                                <input
                                    type="tel"
                                    value={phoneInput}
                                    onChange={(e) => setPhoneInput(e.target.value)}
                                    placeholder="+919876543210"
                                    className="flex-1 h-11 px-4 rounded-lg bg-muted/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-mono"
                                />
                                <button
                                    onClick={handleGenerateOtp}
                                    disabled={otpLoading}
                                    className="h-11 px-5 bg-primary text-primary-foreground rounded-lg font-bold text-[10px] uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer whitespace-nowrap"
                                >
                                    {otpLoading ? 'Generating...' : 'Generate OTP'}
                                </button>
                            </div>
                            <p className="text-[10px] text-muted-foreground ml-1">10-digit number · +91 added automatically for India</p>
                        </div>

                        {otp && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between gap-4"
                            >
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">Your OTP</p>
                                    <p className="text-2xl font-mono font-bold text-foreground tracking-[0.3em]">{otp}</p>
                                    {timeLeft !== null && (
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            Expires in <span className="font-mono font-bold text-foreground">{formatTime(timeLeft)}</span>
                                        </p>
                                    )}
                                </div>
                                <a
                                    href="https://wa.me/18599276910"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 h-11 px-5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors whitespace-nowrap"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/></svg>
                                    Open Bot
                                </a>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
