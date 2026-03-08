import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RichButton } from '../../components/ui/rich-button';
import {
    getForumFeed, voteIssue as apiVoteIssue,
    getIssueComments, addIssueComment, voteComment as apiVoteComment
} from '../../api/forum';
import {
    ArrowUp, ArrowDown, MessageSquare, Clock, TrendingUp, Flame,
    MapPin, Video, Send, X, CornerDownRight, Loader2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
};

const statusLabels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected',
};

const departmentColors = {
    'Roads & Transport': 'bg-orange-100 text-orange-700',
    'Sanitation & Cleaning': 'bg-emerald-100 text-emerald-700',
    'Water Supply & Sewerage': 'bg-blue-100 text-blue-700',
    'Electricity & Street Lighting': 'bg-yellow-100 text-yellow-700',
    'Public Works Department': 'bg-purple-100 text-purple-700',
    Other: 'bg-gray-100 text-gray-700',
};

const SORT_OPTIONS = [
    { value: 'hot', label: 'Hot', icon: Flame },
    { value: 'new', label: 'New', icon: Clock },
    { value: 'top', label: 'Top Voted', icon: TrendingUp },
];

function timeAgo(ts) {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

// ─── Mini Map ───
function MiniMap({ lat, lng }) {
    return (
        <MapContainer
            center={[lat, lng]}
            zoom={15}
            scrollWheelZoom={true}
            zoomControl={true}
            dragging={true}
            attributionControl={false}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[lat, lng]} />
        </MapContainer>
    );
}

// ─── Comment Component (Recursive/Threaded) ───
function Comment({ comment, issueId, onReplyAdded }) {
    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [localScore, setLocalScore] = useState(comment.score);
    const [localVote, setLocalVote] = useState(comment.userVote);

    const handleReply = async () => {
        if (!replyText.trim() || sending) return;
        setSending(true);
        try {
            const { comment: newComment } = await addIssueComment(issueId, replyText.trim(), comment.id);
            onReplyAdded(comment.id, newComment);
            setReplyText('');
            setReplying(false);
        } catch { /* silent */ }
        finally { setSending(false); }
    };

    const handleVote = async (value) => {
        const newVal = localVote === value ? 0 : value;
        // Optimistic
        setLocalScore(prev => prev - localVote + (newVal || 0));
        setLocalVote(newVal || 0);
        try {
            const res = await apiVoteComment(comment.id, value);
            setLocalScore(res.score);
            setLocalVote(res.userVote);
        } catch { /* revert on error handled by next render */ }
    };

    return (
        <div className={`${comment.parentId ? 'ml-6 pl-4 border-l-2 border-border' : ''}`}>
            <div className="py-2.5">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-sm bg-primary/15 text-primary flex items-center justify-center text-[9px] font-bold shrink-0">
                        {(comment.user.name || comment.user.email)?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span className="text-[10px] font-bold text-foreground">{comment.user.name || comment.user.email?.split('@')[0]}</span>
                    <span className="text-[9px] text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                    {/* Inline vote */}
                    <div className="flex items-center gap-1 ml-auto">
                        <button onClick={() => handleVote(1)} className={`p-0.5 rounded cursor-pointer ${localVote === 1 ? 'text-primary' : 'text-muted-foreground/50 hover:text-primary'}`}>
                            <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                        </button>
                        <span className={`text-[9px] font-bold tabular-nums min-w-[14px] text-center ${localScore > 0 ? 'text-primary' : localScore < 0 ? 'text-destructive' : 'text-muted-foreground/50'}`}>
                            {localScore}
                        </span>
                        <button onClick={() => handleVote(-1)} className={`p-0.5 rounded cursor-pointer ${localVote === -1 ? 'text-destructive' : 'text-muted-foreground/50 hover:text-destructive'}`}>
                            <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                        </button>
                    </div>
                </div>
                <p className="text-xs text-foreground/80 font-medium leading-relaxed ml-7">{comment.body}</p>
                <button
                    onClick={() => setReplying(!replying)}
                    className="ml-7 mt-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
                >
                    <CornerDownRight className="w-3 h-3" /> Reply
                </button>

                <AnimatePresence>
                    {replying && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="ml-7 mt-2 flex gap-2">
                            <input
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                                placeholder="Write a reply..."
                                className="flex-1 px-3 py-1.5 text-xs bg-muted border border-border rounded-md outline-none focus:border-primary/40 font-medium"
                                autoFocus
                            />
                            <button onClick={handleReply} disabled={sending} className="p-1.5 bg-primary text-primary-foreground rounded-md hover:brightness-110 transition cursor-pointer disabled:opacity-50">
                                {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                            </button>
                            <button onClick={() => setReplying(false)} className="p-1.5 text-muted-foreground hover:text-foreground transition cursor-pointer">
                                <X className="w-3 h-3" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {comment.replies?.length > 0 && (
                <div>
                    {comment.replies.map(reply => (
                        <Comment key={reply.id} comment={reply} issueId={issueId} onReplyAdded={onReplyAdded} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Issue Post Card ───
function IssuePost({ issue: initialIssue }) {
    const [expanded, setExpanded] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [sending, setSending] = useState(false);
    const [score, setScore] = useState(initialIssue.score);
    const [userVote, setUserVote] = useState(initialIssue.userVote);
    const [commentCount, setCommentCount] = useState(initialIssue.commentCount);
    const [imgError, setImgError] = useState(false);

    const loadComments = useCallback(async () => {
        if (loadingComments) return;
        setLoadingComments(true);
        try {
            const { comments: data } = await getIssueComments(initialIssue.id);
            setComments(data);
        } catch { /* silent */ }
        finally { setLoadingComments(false); }
    }, [initialIssue.id, loadingComments]);

    const handleExpand = () => {
        const next = !expanded;
        setExpanded(next);
        if (next && comments.length === 0) loadComments();
    };

    const handleVote = async (value) => {
        // Optimistic
        const newVal = userVote === value ? 0 : value;
        setScore(prev => prev - userVote + (newVal || 0));
        setUserVote(newVal || 0);
        try {
            const res = await apiVoteIssue(initialIssue.id, value);
            setScore(res.score);
            setUserVote(res.userVote);
        } catch { /* silent */ }
    };

    const handleComment = async () => {
        if (!commentText.trim() || sending) return;
        setSending(true);
        try {
            const { comment } = await addIssueComment(initialIssue.id, commentText.trim());
            setComments(prev => [...prev, comment]);
            setCommentCount(c => c + 1);
            setCommentText('');
        } catch { /* silent */ }
        finally { setSending(false); }
    };

    const handleReplyAdded = (parentId, newReply) => {
        setCommentCount(c => c + 1);
        const insertReply = (list) =>
            list.map(c => c.id === parentId
                ? { ...c, replies: [...(c.replies || []), newReply] }
                : { ...c, replies: insertReply(c.replies || []) }
            );
        setComments(prev => insertReply(prev));
    };

    const issue = initialIssue;
    const hasMedia = issue.imageUrl || issue.videoUrl;
    const hasLocation = issue.latitude && issue.longitude;

    return (
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="border border-border rounded-lg bg-card hover:border-primary/20 transition-all overflow-hidden">
                <div className="flex-1 min-w-0 p-4 md:p-5">
                    {/* Meta + user/time */}
                    <div className="flex items-center gap-2 flex-wrap mb-2.5">
                        {issue.department && (
                            <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${departmentColors[issue.department] || 'bg-muted text-muted-foreground'}`}>
                                {issue.department}
                            </span>
                        )}
                        <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${statusColors[issue.status]}`}>
                            {statusLabels[issue.status]}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-medium ml-auto">
                            {issue.user?.name || issue.user?.email?.split('@')[0] || 'anonymous'} · {timeAgo(issue.createdAt)}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-[15px] font-bold text-foreground mb-1.5 leading-snug">
                        {issue.title || issue.incidentType || 'Untitled Issue'}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                        {issue.description}
                    </p>

                    {/* Media grid: photo + map side by side */}
                    {(hasMedia || hasLocation) && (
                        <div className={`grid gap-3 mb-4 ${hasMedia && hasLocation ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {issue.imageUrl && !imgError && (
                                <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                                    <img
                                        src={issue.imageUrl}
                                        alt="Incident evidence"
                                        className="w-full h-full object-cover"
                                        onError={() => setImgError(true)}
                                    />
                                </div>
                            )}
                            {issue.videoUrl && !issue.imageUrl && (
                                <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                                    <video
                                        src={issue.videoUrl}
                                        className="w-full h-full object-cover"
                                        controls
                                        muted
                                        playsInline
                                    />
                                </div>
                            )}
                            {hasLocation && (
                                <div className="aspect-video rounded-lg overflow-hidden border border-border">
                                    <MiniMap lat={Number(issue.latitude)} lng={Number(issue.longitude)} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions Bar */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                        <button
                            onClick={() => handleVote(1)}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${userVote === 1 ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'}`}
                        >
                            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        <span className={`text-sm font-bold tabular-nums min-w-[20px] text-center ${score > 0 ? 'text-primary' : score < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {score}
                        </span>
                        <button
                            onClick={() => handleVote(-1)}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${userVote === -1 ? 'text-destructive bg-destructive/10' : 'text-muted-foreground hover:text-destructive hover:bg-destructive/5'}`}
                        >
                            <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <button
                            onClick={handleExpand}
                            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            {commentCount > 0 ? `${commentCount} Comment${commentCount === 1 ? '' : 's'}` : 'Comment'}
                        </button>
                    </div>

                    {/* Comments Section */}
                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-3 pt-3 border-t border-border space-y-1"
                            >
                                {/* Add comment */}
                                <div className="flex gap-2 mb-3">
                                    <input
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                                        placeholder="Add a comment..."
                                        className="flex-1 px-3 py-2 text-xs bg-muted border border-border rounded-md outline-none focus:border-primary/40 font-medium"
                                    />
                                    <button
                                        onClick={handleComment}
                                        disabled={!commentText.trim() || sending}
                                        className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:brightness-110 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                    </button>
                                </div>

                                {/* Thread */}
                                {loadingComments ? (
                                    <div className="flex justify-center py-6">
                                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                    </div>
                                ) : comments.length === 0 ? (
                                    <p className="text-[10px] text-muted-foreground font-medium py-4 text-center">No comments yet. Be the first to weigh in.</p>
                                ) : (
                                    comments.map(c => (
                                        <Comment key={c.id} comment={c} issueId={initialIssue.id} onReplyAdded={handleReplyAdded} />
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
        </motion.div>
    );
}

// ─── Main Forum Page ───
export default function DiscussionForum() {
    const navigate = useNavigate();

    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('new');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [departments, setDepartments] = useState([]);

    const fetchFeed = useCallback(async () => {
        setLoading(true);
        try {
            const { feed: data } = await getForumFeed({
                status: filterStatus || undefined,
                department: filterDepartment || undefined,
                sort: sortBy,
                search: searchQuery || undefined,
            });
            setFeed(data);
            // Extract unique departments
            const depts = [...new Set(data.map(i => i.department).filter(Boolean))];
            setDepartments(prev => prev.length >= depts.length ? prev : depts);
        } catch { setFeed([]); }
        finally { setLoading(false); }
    }, [filterStatus, filterDepartment, sortBy, searchQuery]);

    useEffect(() => { fetchFeed(); }, [fetchFeed]);

    // Debounced search
    const [searchInput, setSearchInput] = useState('');
    useEffect(() => {
        const t = setTimeout(() => setSearchQuery(searchInput), 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">The Civic Wire</h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Community-driven incident tracking. Upvote, discuss, resolve.</p>
                </div>
                <RichButton color="default" size="sm" onClick={() => navigate('/user/report')}>
                    Report Issue
                </RichButton>
            </motion.div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 border border-border rounded-lg bg-card p-3">
                {/* Sort */}
                <div className="flex items-center gap-1">
                    {SORT_OPTIONS.map(opt => {
                        const Icon = opt.icon;
                        return (
                            <button
                                key={opt.value}
                                onClick={() => setSortBy(opt.value)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer
                                    ${sortBy === opt.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {opt.label}
                            </button>
                        );
                    })}
                </div>

                <div className="hidden md:block w-px h-6 bg-border" />

                {/* Filters */}
                <div className="flex items-center gap-2 flex-1 flex-wrap">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-muted border border-border rounded-md text-foreground cursor-pointer outline-none"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    {departments.length > 0 && (
                        <select
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                            className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-muted border border-border rounded-md text-foreground cursor-pointer outline-none"
                        >
                            <option value="">All Departments</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    )}

                    {/* Search */}
                    <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search issues..."
                        className="flex-1 min-w-[180px] px-3 py-1.5 text-xs font-medium bg-background border border-border rounded-md outline-none focus:border-primary/40 placeholder:text-muted-foreground/50"
                    />
                </div>
            </div>

            {/* Results Count */}
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                {feed.length} issue{feed.length !== 1 ? 's' : ''}
                {filterStatus || filterDepartment || searchQuery ? ' (filtered)' : ''}
            </p>

            {/* Feed */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : feed.length === 0 ? (
                <motion.div initial="hidden" animate="visible" variants={fadeIn} className="border border-border rounded-lg p-16 bg-card text-center space-y-4">
                    <p className="text-sm text-muted-foreground font-medium">
                        {!filterStatus && !filterDepartment && !searchQuery ? 'No incidents reported yet.' : 'No issues match your filters.'}
                    </p>
                    {!filterStatus && !filterDepartment && !searchQuery && (
                        <RichButton color="default" size="sm" onClick={() => navigate('/user/report')}>
                            Be the first to report
                        </RichButton>
                    )}
                </motion.div>
            ) : (
                <div className="space-y-3">
                    {feed.map(issue => (
                        <IssuePost key={issue.id} issue={issue} />
                    ))}
                </div>
            )}
        </div>
    );
}
