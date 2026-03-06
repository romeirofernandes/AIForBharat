import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { RichButton } from '../components/ui/rich-button';
import { HexagonBackground } from '../components/hexagon';
import { ArrowLeft01Icon as ArrowLeft, ViewIcon, ViewOffIcon } from 'hugeicons-react';
import { toast } from 'sonner';
import { signup as signupAPI } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const data = await signupAPI(formData.email, formData.password);

            login(data.token, data.user);
            toast.success("Account created securely");
            navigate('/user/dashboard');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center w-full bg-linear-to-b from-background to-muted/30 relative px-6">
            <HexagonBackground className="absolute inset-0 flex items-center justify-center rounded-xl opacity-20" />

            <RichButton
                onClick={() => navigate('/')}
                color="default"
                size="sm"
                className="absolute top-8 left-8 md:top-12 md:left-12 z-10"
            >
                <ArrowLeft size={14} /> 
            </RichButton>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-background/80 backdrop-blur-xl border border-border shadow-2xl shadow-primary/5 rounded-2xl p-8 md:p-12 z-10"
            >
                <div className="flex flex-col items-center text-center mb-10">
                    <span className="material-symbols-outlined text-primary text-4xl mb-4">account_balance</span>
                    <h1 className="text-2xl font-bold uppercase tracking-tight text-foreground mb-2">Create Account</h1>
                    <p className="text-sm font-medium text-muted-foreground">Join Civic Intelligence and access your rights.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="h-12 px-4 rounded-lg bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                            placeholder="citizen@bharat.in"
                        />
                    </div>

                    <div className="flex flex-col gap-2 relative">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full h-12 px-4 rounded-lg bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                            >
                                {showPassword ? <ViewOffIcon size={18} /> : <ViewIcon size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Confirm Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="h-12 px-4 rounded-lg bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                            placeholder="••••••••"
                        />
                    </div>

                    <RichButton type="submit" disabled={isLoading} color="primary" size="lg" className="mt-4 w-full">
                        {isLoading ? 'Processing...' : 'Sign Up'}
                    </RichButton>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs font-medium text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-primary uppercase tracking-wider hover:underline underline-offset-4">
                            Log in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
