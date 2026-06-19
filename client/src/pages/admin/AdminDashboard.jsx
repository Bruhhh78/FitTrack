import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiUsers, FiPackage, FiActivity, FiPlus, FiEdit2, FiTrash2, FiEye, FiImage, FiX, FiBook, FiArrowLeft, FiEdit3, FiKey, FiCopy, FiCheck, FiMessageSquare, FiMenu, FiDownload } from 'react-icons/fi';
import CurriculumManager from '../../components/admin/CurriculumManager';
import Chat from '../../components/Chat';
import { DIET_ROUTINE } from '../../utils/dietRoutine';

const AvatarWithFallback = ({ src, name, size = 32 }) => {
  const [error, setError] = useState(false);
  if (!error && src) {
    return <img src={src} className="avatar" style={{ width: size, height: size, objectFit: 'cover', borderRadius: '50%' }} alt={name} onError={() => setError(true)} />;
  }
  return <div className="avatar avatar-placeholder" style={{ width: size, height: size, fontSize: size * 0.4, display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>{name?.[0] || '?'}</div>;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [batches, setBatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedBatchForCurriculum, setSelectedBatchForCurriculum] = useState(null);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [batchForm, setBatchForm] = useState({ title: '', description: '', duration: '', durationType: 'days', originalPrice: '', offerPrice: '', maxParticipants: 50, features: '', guideLink: '', thumbnailUrl: '', curriculum: [], dietRoutine: [] });
  const [challengeForm, setChallengeForm] = useState({ batchId: '', title: '', description: '', duration: '', startDay: '', endDay: '', instructions: '' });
  const [showRoutineSection, setShowRoutineSection] = useState(false);
  const [activeRoutineEditDay, setActiveRoutineEditDay] = useState(1);
  const [selectedBatchForEditing, setSelectedBatchForEditing] = useState(null);

  useEffect(() => {
    if (!showBatchForm && !selectedBatchForEditing) return;
    const durationNum = Number(batchForm.duration);
    if (!durationNum || isNaN(durationNum) || durationNum <= 0) return;
    
    const totalDays = batchForm.durationType === 'weeks' ? durationNum * 7 : batchForm.durationType === 'months' ? durationNum * 30 : durationNum;
    
    setBatchForm(prev => {
      const currentRoutine = prev.dietRoutine ? [...prev.dietRoutine] : [];
      if (currentRoutine.length === totalDays) return prev;
      
      if (currentRoutine.length < totalDays) {
        const diff = totalDays - currentRoutine.length;
        const newItems = [];
        for (let i = 0; i < diff; i++) {
          const dayNum = currentRoutine.length + i + 1;
          const weekNum = Math.floor((dayNum - 1) / 7) + 1;
          newItems.push({
            day: dayNum,
            week: weekNum,
            type: 'regular',
            rule: '',
            veg: { breakfast: '', lunch: '', dinner: '' },
            nonveg: { breakfast: '', lunch: '', dinner: '' }
          });
        }
        return { ...prev, dietRoutine: [...currentRoutine, ...newItems] };
      } else {
        return { ...prev, dietRoutine: currentRoutine.slice(0, totalDays) };
      }
    });
  }, [batchForm.duration, batchForm.durationType, showBatchForm, selectedBatchForEditing]);

  const [userImages, setUserImages] = useState(null);
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllotModal, setShowAllotModal] = useState(false);
  const [selectedUserForAllot, setSelectedUserForAllot] = useState(null);
  const [allotForm, setAllotForm] = useState({ batchId: '' });
  const [generatedTokens, setGeneratedTokens] = useState({}); // { enrollmentId: token }
  const [copiedToken, setCopiedToken] = useState(null);
  const [activeChat, setActiveChat] = useState(null); // { userId, batchId, userName, batchTitle }
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [monitorData, setMonitorData] = useState([]);
  const [selectedMonitorBatch, setSelectedMonitorBatch] = useState('');
  const [monitorLoading, setMonitorLoading] = useState(false);
  const [selectedMonitorDetail, setSelectedMonitorDetail] = useState(null);
  const [activeModalDay, setActiveModalDay] = useState(null); // The specific day object being viewed in the modal

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) setTab(tabParam);
  }, [location.search]);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/batches'),
      api.get('/admin/users'),
    ]).then(([s, b, u]) => {
      setStats(s.data.stats);
      const batchList = b.data.batches;
      setBatches(batchList);
      setUsers(u.data.users);
      setLoading(false);

      // Handle deep linking for curriculum
      const params = new URLSearchParams(location.search);
      const tabParam = params.get('tab');
      const batchIdParam = params.get('batchId');

      if (tabParam === 'curriculum') {
        setTab('curriculum');
        if (batchIdParam) {
          const target = batchList.find(b => b._id === batchIdParam);
          if (target) setSelectedBatchForCurriculum(target);
        }
      }
    }).catch(() => setLoading(false));
  }, [location.search]);

  const loadEnrollments = (batchId) => {
    setSelectedBatch(batchId);
    setTab('enrollments');
    api.get(`/admin/enrollments/${batchId}`).then(r => {
      console.log('Fetched Enrollments:', r.data.enrollments);
      setEnrollments(r.data.enrollments);
    });
  };

  const editBatch = (batch) => {
    setSelectedBatchForEditing(batch);
    setBatchForm({
      title: batch.title,
      description: batch.description,
      duration: batch.duration,
      durationType: batch.durationType || 'days',
      originalPrice: batch.originalPrice,
      offerPrice: batch.offerPrice,
      maxParticipants: batch.maxParticipants,
      features: (batch.features || []).join('\n'),
      guideLink: batch.guideLink || '',
      thumbnailUrl: batch.thumbnailUrl || '',
      curriculum: batch.curriculum || [],
      dietRoutine: batch.dietRoutine || []
    });
    setActiveRoutineEditDay(1);
    setTab('edit-batch');
  };

  const saveBatch = async (e) => {
    if (e) e.preventDefault();
    try {
      const payload = { 
        ...batchForm, 
        features: typeof batchForm.features === 'string' ? batchForm.features.split('\n').filter(Boolean) : batchForm.features, 
        duration: Number(batchForm.duration), 
        originalPrice: Number(batchForm.originalPrice), 
        offerPrice: Number(batchForm.offerPrice), 
        maxParticipants: Number(batchForm.maxParticipants) 
      };
      
      const isEditing = selectedBatchForEditing !== null && !showBatchForm;
      const id = selectedBatchForEditing?._id;
      
      if (isEditing) {
        await api.put(`/batches/${id}`, payload);
        toast.success('Batch updated!');
        setSelectedBatchForEditing(null);
        setTab('batches');
      } else {
        await api.post('/batches', payload);
        toast.success('Batch created!');
        setShowBatchForm(false);
      }
      
      setBatchForm({ title: '', description: '', duration: '', durationType: 'days', originalPrice: '', offerPrice: '', maxParticipants: 50, features: '', guideLink: '', thumbnailUrl: '', curriculum: [], dietRoutine: [] });
      const r = await api.get('/batches'); 
      setBatches(r.data.batches);
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed'); 
    }
  };

  const deleteBatch = async (id) => {
    if (!confirm('Delete this batch?')) return;
    try { await api.delete(`/batches/${id}`); toast.success('Deleted'); setBatches(p => p.filter(b => b._id !== id)); } catch { toast.error('Failed'); }
  };

  const createChallenge = async (e) => {
    e.preventDefault();
    try {
      await api.post('/challenges', { ...challengeForm, duration: Number(challengeForm.duration), startDay: Number(challengeForm.startDay), endDay: Number(challengeForm.endDay) });
      toast.success('Challenge created!');
      setShowChallengeForm(false);
      setChallengeForm({ batchId: '', title: '', description: '', duration: '', startDay: '', endDay: '', instructions: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const viewUserImages = async (userId, batchId = null) => {
    try { 
      const url = batchId ? `/admin/user-images/${userId}?batchId=${batchId}` : `/admin/user-images/${userId}`;
      const { data } = await api.get(url); 
      setUserImages(data);
      // Set default active day to today's data if available, otherwise latest compliance day
      const today = new Date().toISOString().split('T')[0];
      const todayData = data.complianceData?.find(d => d.date === today);
      setActiveModalDay(todayData || data.complianceData?.[data.complianceData.length - 1]);
    } catch { toast.error('Failed'); }
  };

  const handleCleanup = async () => {
    if (!confirm('This will delete all enrollments linked to users that no longer exist. Continue?')) return;
    try {
      const { data } = await api.post('/admin/cleanup-enrollments');
      toast.success(`Cleaned up ${data.count} orphaned records!`);
      if (selectedBatch) loadEnrollments(selectedBatch);
    } catch {
      toast.error('Cleanup failed');
    }
  };

  const handleSendManualEmail = async (userId, type) => {
    try {
      await api.post('/admin/send-manual-email', { userId, type });
      toast.success(`Email (${type}) sent successfully!`);
    } catch {
      toast.error('Failed to send email');
    }
  };

  const handleAllotBatch = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/allot-batch', { userId: selectedUserForAllot._id, batchId: allotForm.batchId });
      toast.success('Batch alloted successfully!');
      setShowAllotModal(false);
      setAllotForm({ batchId: '' });
      // Refresh enrollments if we are currently looking at that batch
      if (selectedBatch === allotForm.batchId) {
        loadEnrollments(selectedBatch);
      }
      const u = await api.get('/admin/users');
      setUsers(u.data.users);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to allot batch');
    }
  };

  const handleGenerateToken = async (enrollmentId, phone) => {
    try {
      const { data } = await api.post('/admin/generate-token', { enrollmentId });
      setGeneratedTokens(prev => ({ ...prev, [enrollmentId]: data.token }));
      toast.success('Token generated!');
    } catch (err) {
      toast.error('Failed to generate token');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    toast.success('Token copied!');
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const shareOnWhatsapp = (phone, token, batchTitle) => {
    const message = `Hello! Your access token for ${batchTitle} is: ${token}. Please enter this on the website to unlock your program.`;
    const url = `https://wa.me/${phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleClearChat = async (userId, batchId) => {
    if (!confirm('Clear all chat history for this user?')) return;
    try {
      await api.post('/chat/clear', { userId, batchId });
      toast.success('Chat history cleared');
      // Force reload active chat or refresh messages
      setActiveChat(prev => ({ ...prev })); 
    } catch {
      toast.error('Failed to clear chat');
    }
  };
  
  const loadDailyMonitor = (batchId) => {
    setSelectedMonitorBatch(batchId);
    if (!batchId) return;
    setMonitorLoading(true);
    api.get(`/admin/daily-monitor/${batchId}`)
      .then(r => {
        setMonitorData(r.data.monitorData);
        setMonitorLoading(false);
      })
      .catch(() => setMonitorLoading(false));
  };

  const downloadImage = (url, name) => {
    fetch(url)
      .then(resp => resp.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = name || 'image.jpg';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => toast.error('Failed to download image'));
  };

  if (loading) return <div className="page-wrapper"><div className="page-loading"><div className="spinner" /></div></div>;

  return (
    <div className="page-wrapper">
      <div className="dashboard">
        <button 
          className="sidebar-toggle-btn" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <FiX /> : <FiMenu />}
        </button>
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1.1rem' }}>Admin Panel</h3>
          {[
            { key: 'dashboard', icon: <FiActivity />, label: 'Overview' },
            { key: 'batches', icon: <FiPackage />, label: 'Batches' },
            { key: 'edit-batch', icon: <FiEdit2 />, label: 'Edit Batch' },
            { key: 'curriculum', icon: <FiBook />, label: 'Curriculum' },
            { key: 'daily-monitor', icon: <FiActivity />, label: 'Daily Monitor' },
            { key: 'users', icon: <FiUsers />, label: 'Users' },
            { key: 'enrollments', icon: <FiEye />, label: 'Enrollments' },
            { key: 'messages', icon: <FiMessageSquare />, label: 'Messages' },
          ].map(item => (
            <button key={item.key} className={`sidebar-link ${tab === item.key ? 'active' : ''}`} onClick={() => { setTab(item.key); setSidebarOpen(false); }}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        <div className="dashboard-content">
          {/* DASHBOARD TAB - FULL OVERVIEW */}
          {tab === 'dashboard' && (
            <div className="fade-in">
              <h2 style={{ fontWeight: 800, marginBottom: 24 }}>System Overview</h2>
              
              {/* Top Stats Grid */}
              <div className="grid grid-3" style={{ marginBottom: 32 }}>
                {[
                  { label: 'Active Users', value: stats.totalUsers || 0, icon: <FiUsers />, color: 'var(--accent)' },
                  { label: 'Total Enrollments', value: stats.totalEnrollments || 0, icon: <FiEye />, color: 'var(--info)' },
                  { label: 'Active Batches', value: stats.activeBatches || 0, icon: <FiActivity />, color: 'var(--warning)' },
                ].map((s, i) => (
                  <div key={i} className="card stat-card" style={{ borderLeft: `4px solid ${s.color}` }}>
                    <div className="stat-icon" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
                    <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
                  </div>
                ))}
              </div>

              <div className="grid grid-2" style={{ gap: 24, marginBottom: 32 }}>
                {/* Recent Users */}
                <div className="card" style={{ padding: 0 }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Recent Signups</h3>
                  </div>
                  <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table style={{ fontSize: '0.85rem' }}>
                      <thead><tr><th>User</th><th>Joined</th></tr></thead>
                      <tbody>
                        {stats.recentUsers?.map(u => (
                          <tr key={u._id}>
                            <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {u.avatar ? <img src={u.avatar} style={{ width: 24, height: 24, borderRadius: '50%' }} alt="" /> : <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>{u.name[0]}</div>}
                              {u.name}
                            </td>
                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Enrollments */}
                <div className="card" style={{ padding: 0 }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Recent Enrollments</h3>
                  </div>
                  <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table style={{ fontSize: '0.85rem' }}>
                      <thead><tr><th>User</th><th>Program</th><th>Date</th></tr></thead>
                      <tbody>
                        {stats.recentEnrollments?.map(e => (
                          <tr key={e._id}>
                            <td>{e.userId?.name}</td>
                            <td><span className="badge badge-teal">{e.batchId?.title}</span></td>
                            <td>{new Date(e.enrolledAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Batch Performance */}
              <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Program Performance</h3>
                <div className="grid grid-3" style={{ gap: 16 }}>
                  {stats.batchStats?.map((b, i) => (
                    <div key={i} style={{ padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <h4 style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.95rem' }}>{b.title}</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)' }}>{b.count}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Students</span>
                      </div>
                      <div className="progress-bar-container" style={{ height: 6, marginTop: 12, background: 'var(--border)' }}>
                        <div className="progress-bar-fill" style={{ width: `${Math.min(100, (b.count / 50) * 100)}%`, background: 'var(--accent)' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BATCHES TAB */}
          {tab === 'batches' && (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontWeight: 800 }}>Manage Batches</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => { setSelectedBatchForEditing(null); setBatchForm({ title: '', description: '', duration: '', durationType: 'days', originalPrice: '', offerPrice: '', maxParticipants: 50, features: '', guideLink: '', thumbnailUrl: '', curriculum: [], dietRoutine: [] }); setShowBatchForm(true); setActiveRoutineEditDay(1); }}><FiPlus /> New Batch</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowChallengeForm(true)}><FiPlus /> New Challenge</button>
                </div>
              </div>
              {batches.map(b => (
                <div key={b._id} className="card" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: 600 }}>{b.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{b.duration} {b.durationType} • ₹{b.offerPrice} • {b.enrollmentCount || 0} enrolled</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-sm btn-secondary" title="Edit Batch Details & Diet" onClick={() => editBatch(b)}><FiEdit2 /></button>
                    <button className="btn btn-sm btn-info" title="View Enrollments" onClick={() => loadEnrollments(b._id)}><FiEye /></button>
                    <button className="btn btn-sm btn-danger" title="Delete Batch" onClick={() => deleteBatch(b._id)}><FiTrash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EDIT BATCH TAB */}
          {tab === 'edit-batch' && (
            <div className="fade-in">
              {selectedBatchForEditing ? (
                <div className="batch-edit-workspace-view">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => { setSelectedBatchForEditing(null); setTab('batches'); }}>
                        <FiArrowLeft /> Back to Batches List
                      </button>
                      <h2 style={{ fontWeight: 900, marginTop: 16, marginBottom: 4 }}>Edit Program: {selectedBatchForEditing.title}</h2>
                      <p style={{ color: 'var(--text-muted)', margin: 0 }}>Modify batch details and configure day-wise diet schedules.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline" onClick={() => { setSelectedBatchForEditing(null); setTab('batches'); }}>Cancel</button>
                      <button className="btn btn-primary" onClick={saveBatch}>Save Changes</button>
                    </div>
                  </div>

                  {/* 2-Column Layout */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
                    {/* Left Column: Metadata Forms */}
                    <div className="card" style={{ padding: 24 }}>
                      <h3 style={{ fontWeight: 800, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>📋 Batch Details</h3>
                      
                      <form onSubmit={saveBatch}>
                        <div className="form-group">
                          <label className="form-label">Batch Title</label>
                          <input className="form-input" type="text" value={batchForm.title} onChange={e => setBatchForm(p => ({ ...p, title: e.target.value }))} required />
                        </div>
                        
                        <div className="grid grid-2" style={{ gap: 16 }}>
                          <div className="form-group">
                            <label className="form-label">Duration</label>
                            <input className="form-input" type="number" value={batchForm.duration} onChange={e => setBatchForm(p => ({ ...p, duration: e.target.value }))} required />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Unit</label>
                            <select className="form-input" value={batchForm.durationType} onChange={e => setBatchForm(p => ({ ...p, durationType: e.target.value }))}>
                              <option value="days">Days</option>
                              <option value="weeks">Weeks</option>
                              <option value="months">Months</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-2" style={{ gap: 16 }}>
                          <div className="form-group">
                            <label className="form-label">Price (Original price) (₹)</label>
                            <input className="form-input" type="number" value={batchForm.originalPrice} onChange={e => setBatchForm(p => ({ ...p, originalPrice: e.target.value }))} required />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Offer Price (Discounted price) (₹)</label>
                            <input className="form-input" type="number" value={batchForm.offerPrice} onChange={e => setBatchForm(p => ({ ...p, offerPrice: e.target.value }))} required />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Max Participants</label>
                          <input className="form-input" type="number" value={batchForm.maxParticipants} onChange={e => setBatchForm(p => ({ ...p, maxParticipants: e.target.value }))} />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Thumbnail URL</label>
                          <input className="form-input" type="url" placeholder="https://image-url.com/..." value={batchForm.thumbnailUrl} onChange={e => setBatchForm(p => ({ ...p, thumbnailUrl: e.target.value }))} />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Guide Link (YouTube) - Optional</label>
                          <input className="form-input" type="url" placeholder="https://youtube.com/watch?v=..." value={batchForm.guideLink} onChange={e => setBatchForm(p => ({ ...p, guideLink: e.target.value }))} />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Description</label>
                          <textarea className="form-input" rows="4" value={batchForm.description} onChange={e => setBatchForm(p => ({ ...p, description: e.target.value }))} required />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Features (one per line)</label>
                          <textarea className="form-input" rows="4" placeholder="Feature 1&#10;Feature 2" value={batchForm.features} onChange={e => setBatchForm(p => ({ ...p, features: e.target.value }))} />
                        </div>
                      </form>
                    </div>

                    {/* Right Column: Dynamic Diet Routine Editor */}
                    <div className="card" style={{ padding: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                        <h3 style={{ fontWeight: 800, margin: 0 }}>🥗 Diet Routine Plan</h3>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '0.72rem', padding: '6px 12px', color: 'var(--accent)', background: 'var(--accent-light)', borderRadius: 8 }}
                          onClick={() => {
                            if (confirm('Are you sure you want to load the default 21-Day Inferno Routine? This will overwrite your current inputs.')) {
                              setBatchForm(p => ({
                                ...p,
                                duration: 21,
                                durationType: 'days',
                                dietRoutine: DIET_ROUTINE
                              }));
                              setActiveRoutineEditDay(1);
                              toast.success('Loaded Default 21-Day Inferno Diet Plan!');
                            }
                          }}
                        >
                          ⚡ Load Default Inferno21
                        </button>
                      </div>

                      {batchForm.dietRoutine?.length > 0 ? (
                        <div>
                          {/* Grid of Day Selectors */}
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(7, 1fr)', 
                            gap: 6, 
                            maxHeight: 180, 
                            overflowY: 'auto', 
                            marginBottom: 24, 
                            padding: 8, 
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            background: 'var(--bg-deep)'
                          }}>
                            {batchForm.dietRoutine.map((item, idx) => {
                              const dNum = item.day;
                              let dotBg = 'var(--bg-tertiary)';
                              let dotColor = 'var(--text-main)';
                              if (item.type === 'cleanse') {
                                dotBg = '#10b981'; // Green for cleanse
                                dotColor = '#fff';
                              } else if (item.type === 'fasting') {
                                dotBg = '#f59e0b'; // Amber for fasting
                                dotColor = '#fff';
                              }
                              const isSelected = activeRoutineEditDay === dNum;
                              return (
                                  <button
                                    key={dNum}
                                    type="button"
                                    onClick={() => setActiveRoutineEditDay(dNum)}
                                    style={{
                                      padding: '8px 4px',
                                      background: isSelected ? 'var(--accent)' : dotBg,
                                      color: isSelected ? '#fff' : dotColor,
                                      borderRadius: 6,
                                      border: isSelected ? '2px solid var(--text-main)' : '1px solid var(--border)',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    {dNum}
                                  </button>
                              );
                            })}
                          </div>

                          {/* Active Editing Day Details */}
                          {(() => {
                            const activeDayItem = batchForm.dietRoutine.find(r => r.day === activeRoutineEditDay);
                            if (!activeDayItem) return null;
                            
                            const updateActiveDayField = (field, val, isNested = false, nestedField = '') => {
                              setBatchForm(prev => {
                                const routine = prev.dietRoutine ? [...prev.dietRoutine] : [];
                                const idx = routine.findIndex(r => r.day === activeRoutineEditDay);
                                if (idx !== -1) {
                                  if (isNested) {
                                    routine[idx] = {
                                      ...routine[idx],
                                      [field]: {
                                        ...routine[idx][field],
                                        [nestedField]: val
                                      }
                                    };
                                  } else {
                                    routine[idx] = {
                                      ...routine[idx],
                                      [field]: val
                                    };
                                  }
                                }
                                return { ...prev, dietRoutine: routine };
                              });
                            };

                            const copyToNextDay = () => {
                              if (activeRoutineEditDay >= batchForm.dietRoutine.length) {
                                  toast.error('This is already the last day!');
                                  return;
                              }
                              setBatchForm(prev => {
                                const routine = prev.dietRoutine ? [...prev.dietRoutine] : [];
                                const currentIdx = routine.findIndex(r => r.day === activeRoutineEditDay);
                                const nextIdx = routine.findIndex(r => r.day === activeRoutineEditDay + 1);
                                if (currentIdx !== -1 && nextIdx !== -1) {
                                  routine[nextIdx] = {
                                    ...routine[nextIdx],
                                    type: routine[currentIdx].type,
                                    rule: routine[currentIdx].rule,
                                    veg: { ...routine[currentIdx].veg },
                                    nonveg: { ...routine[currentIdx].nonveg }
                                  };
                                  toast.success(`Copied Day ${activeRoutineEditDay} to Day ${activeRoutineEditDay + 1}!`);
                                }
                                return { ...prev, dietRoutine: routine };
                              });
                              setActiveRoutineEditDay(activeRoutineEditDay + 1);
                            };

                            const copyToWeek = () => {
                              setBatchForm(prev => {
                                const routine = prev.dietRoutine ? [...prev.dietRoutine] : [];
                                const current = routine.find(r => r.day === activeRoutineEditDay);
                                if (!current) return prev;
                                
                                let count = 0;
                                routine.forEach((r, idx) => {
                                  if (r.week === current.week && r.day !== current.day) {
                                    routine[idx] = {
                                      ...routine[idx],
                                      type: current.type,
                                      rule: current.rule,
                                      veg: { ...current.veg },
                                      nonveg: { ...current.nonveg }
                                    };
                                    count++;
                                  }
                                });
                                toast.success(`Copied to ${count} other days in Week ${current.week}!`);
                                return { ...prev, dietRoutine: routine };
                              });
                            };

                            return (
                              <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 10, border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                                  <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem' }}>
                                    ✍️ Day {activeRoutineEditDay} Setup (Week {activeDayItem.week})
                                  </h4>
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    <button type="button" className="btn btn-ghost btn-sm" style={{ fontSize: '0.72rem', padding: '4px 8px', borderRadius: 6 }} onClick={copyToWeek}>
                                      📋 Copy to Week {activeDayItem.week}
                                    </button>
                                    <button type="button" className="btn btn-ghost btn-sm" style={{ fontSize: '0.72rem', padding: '4px 8px', borderRadius: 6 }} onClick={copyToNextDay}>
                                      ⏭️ Copy to Day {activeRoutineEditDay + 1}
                                    </button>
                                  </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                  <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: 4 }}>Day Type</label>
                                    <select 
                                      className="form-input" 
                                      style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                                      value={activeDayItem.type || 'regular'} 
                                      onChange={e => updateActiveDayField('type', e.target.value)}
                                    >
                                      <option value="regular">Regular Day</option>
                                      <option value="cleanse">Cleanse Day</option>
                                      <option value="fasting">Fasting Day</option>
                                    </select>
                                  </div>
                                  <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: 4 }}>Rule / Tag</label>
                                    <input 
                                      className="form-input" 
                                      style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                                      type="text" 
                                      placeholder="e.g. Sandwich Method" 
                                      value={activeDayItem.rule || ''} 
                                      onChange={e => updateActiveDayField('rule', e.target.value)}
                                    />
                                  </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                                  {/* Veg Section */}
                                  <div style={{ background: 'var(--bg-deep)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                                    <h5 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, margin: '0 0 10px 0' }}>🥗 Veg Meals</h5>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                      <div>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Breakfast</label>
                                        <input type="text" className="form-input" style={{ padding: '6px 10px', fontSize: '0.75rem' }} value={activeDayItem.veg?.breakfast || ''} onChange={e => updateActiveDayField('veg', e.target.value, true, 'breakfast')} />
                                      </div>
                                      <div>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Lunch</label>
                                        <input type="text" className="form-input" style={{ padding: '6px 10px', fontSize: '0.75rem' }} value={activeDayItem.veg?.lunch || ''} onChange={e => updateActiveDayField('veg', e.target.value, true, 'lunch')} />
                                      </div>
                                      <div>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Dinner</label>
                                        <input type="text" className="form-input" style={{ padding: '6px 10px', fontSize: '0.75rem' }} value={activeDayItem.veg?.dinner || ''} onChange={e => updateActiveDayField('veg', e.target.value, true, 'dinner')} />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Non-Veg Section */}
                                  <div style={{ background: 'var(--bg-deep)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                                    <h5 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4, margin: '0 0 10px 0' }}>🍗 Non-Veg Meals</h5>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                      <div>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Breakfast</label>
                                        <input type="text" className="form-input" style={{ padding: '6px 10px', fontSize: '0.75rem' }} value={activeDayItem.nonveg?.breakfast || ''} onChange={e => updateActiveDayField('nonveg', e.target.value, true, 'breakfast')} />
                                      </div>
                                      <div>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Lunch</label>
                                        <input type="text" className="form-input" style={{ padding: '6px 10px', fontSize: '0.75rem' }} value={activeDayItem.nonveg?.lunch || ''} onChange={e => updateActiveDayField('nonveg', e.target.value, true, 'lunch')} />
                                      </div>
                                      <div>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Dinner</label>
                                        <input type="text" className="form-input" style={{ padding: '6px 10px', fontSize: '0.75rem' }} value={activeDayItem.nonveg?.dinner || ''} onChange={e => updateActiveDayField('nonveg', e.target.value, true, 'dinner')} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Set a batch duration above to edit day-wise routine plans.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 style={{ fontWeight: 800, marginBottom: 24 }}>Select Batch to Edit</h2>
                  {batches.length > 0 ? (
                    <div className="grid grid-3" style={{ gap: 16 }}>
                      {batches.map(b => (
                        <div key={b._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <h4 style={{ fontWeight: 600 }}>{b.title}</h4>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{b.duration} {b.durationType} • ₹{b.offerPrice}</p>
                          <button className="btn btn-sm btn-outline" style={{marginTop: 'auto'}} onClick={() => editBatch(b)}>
                            <FiEdit2 /> Edit Details & Diet
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>No batches available to edit.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CURRICULUM TAB - SEPARATE MANAGEMENT */}
          {tab === 'curriculum' && (
            <div className="fade-in">
              <h2 style={{ fontWeight: 800, marginBottom: 24 }}>Manage Course Curriculum</h2>
              {selectedBatchForCurriculum ? (
                <div className="curriculum-editor-view">
                   <button className="btn btn-secondary btn-sm" style={{marginBottom: 20}} onClick={() => setSelectedBatchForCurriculum(null)}>
                     <FiArrowLeft /> Back to Batch List
                   </button>
                   <div className="card" style={{marginBottom: 20}}>
                     <h3 style={{fontWeight: 700}}>{selectedBatchForCurriculum.title}</h3>
                     <p style={{color: 'var(--text-muted)'}}>Manage modules and items for this program.</p>
                   </div>
                   
                   <CurriculumManager 
                      curriculum={selectedBatchForCurriculum.curriculum || []} 
                      onChange={(newCurriculum) => {
                        const updatedBatch = { ...selectedBatchForCurriculum, curriculum: newCurriculum };
                        setSelectedBatchForCurriculum(updatedBatch);
                      }} 
                   />
                   
                   <button 
                     className="btn btn-primary" 
                     style={{marginTop: 20, width: '100%'}} 
                     onClick={async () => {
                        try {
                          await api.put(`/batches/${selectedBatchForCurriculum._id}`, { curriculum: selectedBatchForCurriculum.curriculum });
                          toast.success('Curriculum saved successfully!');
                          const r = await api.get('/batches'); 
                          setBatches(r.data.batches);
                          setSelectedBatchForCurriculum(null);
                        } catch {
                          toast.error('Failed to save curriculum');
                        }
                     }}
                   >
                     Save Curriculum Changes
                   </button>
                </div>
              ) : (
                <div className="grid grid-3" style={{ gap: 16 }}>
                  {batches.map(b => (
                    <div key={b._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <h4 style={{ fontWeight: 600 }}>{b.title}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{b.curriculum?.length || 0} Modules • {b.curriculum?.reduce((acc, m) => acc + (m.items?.length || 0), 0) || 0} Items</p>
                      <button className="btn btn-sm btn-outline" style={{marginTop: 'auto'}} onClick={() => setSelectedBatchForCurriculum(b)}>
                        <FiEdit3 /> Edit Curriculum
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* USERS TAB */}
          {tab === 'users' && (
            <div className="fade-in">
              <h2 style={{ fontWeight: 800, marginBottom: 24 }}>All Users</h2>
              <div className="table-container">
                <table>
                  <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <AvatarWithFallback src={u.avatar} name={u.name} size={32} />
                          {u.name}
                        </td>
                        <td>{u.email}</td><td>{u.phone || '-'}</td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-sm btn-secondary" onClick={() => viewUserImages(u._id)} title="View Images"><FiImage /></button>
                          <button className="btn btn-sm btn-primary" onClick={() => { setSelectedUserForAllot(u); setShowAllotModal(true); }} title="Allot Batch"><FiPlus /> Allot</button>
                          <button className="btn btn-sm btn-info" onClick={() => { setTab('messages'); setActiveChat({ userId: u._id, userName: u.name }); }} title="Chat"><FiMessageSquare /></button>
                          <button className="btn btn-sm btn-outline" onClick={() => handleSendManualEmail(u._id, 'welcome')} title="Send Welcome Mail"><FiPlus style={{ transform: 'rotate(45deg)' }} /> Welcome</button>
                          <button className="btn btn-sm btn-outline" onClick={() => handleSendManualEmail(u._id, 'reminder')} title="Send Reminder Mail">☀️ Nudge</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ENROLLMENTS TAB */}
          {tab === 'enrollments' && (
            <div className="fade-in">
              <h2 style={{ fontWeight: 800, marginBottom: 24 }}>Enrollments & Tokens</h2>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Select Batch</label>
                <select className="form-input" onChange={e => loadEnrollments(e.target.value)} value={selectedBatch || ''}>
                  <option value="">Choose a batch</option>
                  {batches.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
                </select>
                <button className="btn btn-sm btn-outline" style={{ marginTop: 12, borderColor: '#ef4444', color: '#ef4444' }} onClick={handleCleanup}>
                  <FiTrash2 /> Cleanup Broken Data
                </button>
              </div>
              {enrollments.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead><tr><th>User</th><th>Email</th><th>Status</th><th>Token</th><th>Actions</th></tr></thead>
                    <tbody>
                      {enrollments.map(e => (
                        <tr key={e._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <AvatarWithFallback src={e.userId?.avatar} name={e.userId?.name || 'Unknown'} size={32} />
                              <span style={{ fontWeight: 600 }}>{e.userId?.name || 'Unknown User'}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-dim)' }}>{e.userId?.email || 'N/A'}</td>
                          <td><span className={`badge ${e.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{e.status}</span></td>
                          <td>
                            {e.token ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{e.token}</code>
                                <button className="btn-icon" onClick={() => copyToClipboard(e.token)} title="Copy Token">
                                  {copiedToken === e.token ? <FiCheck style={{ color: 'var(--success)' }} /> : <FiCopy />}
                                </button>
                              </div>
                            ) : (
                              generatedTokens[e._id] ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{generatedTokens[e._id]}</code>
                                  <button className="btn-icon" onClick={() => copyToClipboard(generatedTokens[e._id])} title="Copy Token">
                                    {copiedToken === generatedTokens[e._id] ? <FiCheck style={{ color: 'var(--success)' }} /> : <FiCopy />}
                                  </button>
                                </div>
                              ) : (
                                <button className="btn btn-sm btn-outline" onClick={() => handleGenerateToken(e._id, e.userId?.phone)}>
                                  <FiKey /> Generate
                                </button>
                              )
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-sm btn-secondary" onClick={() => viewUserImages(e.userId?._id)} title="View Images"><FiImage /></button>
                              {(e.token || generatedTokens[e._id]) && (
                                <button className="btn btn-sm btn-success" onClick={() => shareOnWhatsapp(e.userId?.phone, e.token || generatedTokens[e._id], e.batchId?.title)} title="Send via WhatsApp">
                                  <span style={{ fontSize: '1rem' }}>💬</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p style={{ color: 'var(--text-muted)' }}>Select a batch to view enrollments.</p>}
            </div>
          )}

          {/* DAILY MONITOR TAB */}
          {tab === 'daily-monitor' && (
            <div className="fade-in">
              <h2 style={{ fontWeight: 800, marginBottom: 24 }}>Daily User Activity Monitor</h2>
              <div style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Select Batch</label>
                  <select className="form-input" value={selectedMonitorBatch} onChange={e => loadDailyMonitor(e.target.value)}>
                    <option value="">Choose batch to monitor</option>
                    {batches.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
                  </select>
                </div>
                <button className="btn btn-primary" disabled={!selectedMonitorBatch || monitorLoading} onClick={() => loadDailyMonitor(selectedMonitorBatch)}>
                  Refresh Data
                </button>
              </div>

              {selectedMonitorBatch ? (
                monitorLoading ? (
                  <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>User</th>
                          <th style={{ textAlign: 'center' }}>Stats</th>
                          <th style={{ textAlign: 'center' }}>Steps</th>
                          <th style={{ textAlign: 'center' }}>Meals</th>
                          <th style={{ textAlign: 'center' }}>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monitorData.map((m, i) => (
                          <tr key={i}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <AvatarWithFallback src={m.user.avatar} name={m.user.name} size={32} />
                                <div>
                                  <div style={{ fontWeight: 600 }}>{m.user.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`badge ${m.stats ? 'badge-success' : 'badge-warning'}`}>{m.stats ? '✓' : 'Pending'}</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`badge ${m.steps ? 'badge-success' : 'badge-warning'}`}>{m.steps ? '✓' : 'Pending'}</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`badge ${m.meals ? 'badge-success' : 'badge-warning'}`}>{m.meals ? '✓' : 'Pending'} ({m.mealsCount}/3)</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {m.isFullyCompleted ? (
                                <span className="badge badge-teal" style={{ background: 'var(--success)', color: '#fff' }}>✓ Completed Today</span>
                              ) : (
                                <span className="badge badge-outline" style={{ opacity: 0.5 }}>Incomplete</span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-sm btn-secondary" onClick={() => {
                                  setSelectedMonitorDetail(m);
                                  viewUserImages(m.user._id, selectedMonitorBatch);
                                }}>
                                  <FiEye /> View Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div className="empty-state card">
                  <FiActivity size={48} style={{ opacity: 0.2, marginBottom: 20 }} />
                  <p>Select a batch above to monitor today's activity.</p>
                </div>
              )}
            </div>
          )}

          {/* Today Detail Modal */}
          {selectedMonitorDetail && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedMonitorDetail(null)}>
              <div className="modal" style={{ maxWidth: 800 }}>
                <div className="modal-header">
                  <h3 className="modal-title">Today's Details: {selectedMonitorDetail.user.name}</h3>
                  <button className="modal-close" onClick={() => setSelectedMonitorDetail(null)}>×</button>
                </div>
                
                <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
                  {/* Body Stats & Photos */}
                  <div className="card" style={{ marginBottom: 20 }}>
                    <h4 style={{ fontWeight: 700, marginBottom: 16 }}>📸 Body Stats & Photos</h4>
                    {selectedMonitorDetail.measurement ? (
                      <>
                        <div className="grid grid-3" style={{ gap: 12, marginBottom: 20 }}>
                          {['left', 'center', 'right'].map(side => (
                            <div key={side}>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 4, textTransform: 'capitalize' }}>{side}</p>
                              {selectedMonitorDetail.measurement.images?.[side] ? (
                                <div style={{ position: 'relative', group: 'image' }}>
                                  <img src={selectedMonitorDetail.measurement.images[side]} alt="" style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)' }} />
                                  <button 
                                    className="btn-icon" 
                                    style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: 6, borderRadius: '50%' }}
                                    onClick={() => downloadImage(selectedMonitorDetail.measurement.images[side], `${selectedMonitorDetail.user.name}_body_${side}.jpg`)}
                                    title="Download"
                                  >
                                    <FiDownload size={14} />
                                  </button>
                                </div>
                              ) : (
                                <div style={{ width: '100%', height: 120, background: 'var(--bg-tertiary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>No Photo</div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                          {Object.entries(selectedMonitorDetail.measurement).map(([k, v]) => {
                            if (['images', 'userId', 'batchId', '_id', '__v', 'date', 'stepsCount', 'stepsImage'].includes(k)) return null;
                            if (!v) return null;
                            return (
                              <div key={k} style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{v}</div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : <p style={{ color: 'var(--text-muted)' }}>No measurements logged yet.</p>}
                  </div>

                  {/* Steps */}
                  <div className="card" style={{ marginBottom: 20 }}>
                    <h4 style={{ fontWeight: 700, marginBottom: 16 }}>🚶 Walking Steps</h4>
                    {selectedMonitorDetail.measurement?.stepsCount ? (
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        {selectedMonitorDetail.measurement.stepsImage && (
                          <div style={{ position: 'relative' }}>
                            <img src={selectedMonitorDetail.measurement.stepsImage} alt="" style={{ width: 120, borderRadius: 8 }} />
                            <button 
                              className="btn-icon" 
                              style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: 4, borderRadius: '50%' }}
                              onClick={() => downloadImage(selectedMonitorDetail.measurement.stepsImage, `${selectedMonitorDetail.user.name}_steps.jpg`)}
                            >
                              <FiDownload size={12} />
                            </button>
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{selectedMonitorDetail.measurement.stepsCount}</div>
                          <p style={{ color: 'var(--text-muted)' }}>Steps logged today</p>
                        </div>
                      </div>
                    ) : <p style={{ color: 'var(--text-muted)' }}>No steps logged yet.</p>}
                  </div>

                  {/* Meals */}
                  <div className="card">
                    <h4 style={{ fontWeight: 700, marginBottom: 16 }}>🍱 Meal Logs</h4>
                    {selectedMonitorDetail.mealLog?.meals?.length > 0 ? (
                      <div className="grid grid-3" style={{ gap: 12 }}>
                        {selectedMonitorDetail.mealLog.meals.map((meal, i) => (
                          <div key={i} style={{ background: 'var(--bg-tertiary)', borderRadius: 12, padding: 12, position: 'relative' }}>
                            {meal.image && (
                              <div style={{ position: 'relative' }}>
                                <img src={meal.image} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />
                                <button 
                                  className="btn-icon" 
                                  style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: 4, borderRadius: '50%' }}
                                  onClick={() => downloadImage(meal.image, `${selectedMonitorDetail.user.name}_meal_${meal.type}.jpg`)}
                                >
                                  <FiDownload size={12} />
                                </button>
                              </div>
                            )}
                            <div className="badge badge-teal" style={{ marginBottom: 8, textTransform: 'capitalize' }}>{meal.type}</div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{meal.description}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{meal.calories} cal • {meal.time}</div>
                          </div>
                        ))}
                      </div>
                    ) : <p style={{ color: 'var(--text-muted)' }}>No meals logged yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MESSAGES TAB */}
          {tab === 'messages' && (
            <div className="fade-in">
              <h2 style={{ fontWeight: 800, marginBottom: 24 }}>Messaging System</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, height: 'calc(100vh - 200px)' }}>
                {/* Users List for Chat */}
                <div className="card" style={{ padding: 0, overflowY: 'auto' }}>
                  <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
                    <h4 style={{ fontWeight: 700, margin: 0 }}>Recent Users</h4>
                  </div>
                  {users.map(u => (
                    <div 
                      key={u._id} 
                      className={`chat-user-item ${activeChat?.userId === u._id ? 'active' : ''}`}
                      onClick={() => setActiveChat({ userId: u._id, userName: u.name })}
                      style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: '0.2s' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {u.avatar ? <img src={u.avatar} className="avatar" style={{ width: 32, height: 32 }} alt="" /> : <div className="avatar avatar-placeholder" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>{u.name[0]}</div>}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Window */}
                <div className="chat-main-container">
                  {activeChat?.userId ? (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                           <h3 style={{ margin: 0, fontWeight: 700 }}>Chat with {activeChat.userName}</h3>
                           <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                             <label className="form-label" style={{ marginBottom: 0 }}>Select Batch:</label>
                             <select 
                               className="form-input" 
                               style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                               onChange={e => setActiveChat(prev => ({ ...prev, batchId: e.target.value }))}
                               value={activeChat.batchId || ''}
                             >
                               <option value="">Choose Batch</option>
                               {batches.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
                             </select>
                           </div>
                        </div>
                        {activeChat.batchId && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleClearChat(activeChat.userId, activeChat.batchId)}>
                            <FiTrash2 /> Clear History
                          </button>
                        )}
                      </div>

                      {activeChat.batchId ? (
                        <Chat 
                          batchId={activeChat.batchId} 
                          receiverId={activeChat.userId} 
                          isAdmin={true} 
                        />
                      ) : (
                        <div className="empty-state card" style={{ flex: 1, justifyContent: 'center' }}>
                          <FiPackage size={40} style={{ opacity: 0.2, marginBottom: 16 }} />
                          <p>Please select a batch to start chatting.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="empty-state card" style={{ height: '100%', justifyContent: 'center' }}>
                      <FiMessageSquare size={48} style={{ opacity: 0.2, marginBottom: 20 }} />
                      <h3>No User Selected</h3>
                      <p>Select a user from the left to start messaging.</p>
                    </div>
                  )}
                </div>
              </div>

              <style dangerouslySetInnerHTML={{ __html: `
                .chat-user-item:hover { background: var(--bg-tertiary); }
                .chat-user-item.active { background: var(--bg-tertiary); border-left: 3px solid var(--accent); }
                .chat-main-container { height: 100%; }
                .btn-outline-danger { border: 1px solid var(--danger); color: var(--danger); background: transparent; }
                .btn-outline-danger:hover { background: var(--danger); color: #fff; }
              `}} />
            </div>
          )}

          {/* Batch Form Modal */}
          {showBatchForm && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowBatchForm(false)}>
              <div className="modal">
                <div className="modal-header"><h3 className="modal-title">{editingBatchId ? 'Edit Batch' : 'Create Batch'}</h3><button className="modal-close" onClick={() => setShowBatchForm(false)}>×</button></div>
                <form onSubmit={saveBatch}>
                  <div className="form-group">
                    <label className="form-label">Batch Title</label>
                    <input className="form-input" type="text" value={batchForm.title} onChange={e => setBatchForm(p => ({ ...p, title: e.target.value }))} required />
                  </div>
                  
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label className="form-label">Duration</label>
                      <input className="form-input" type="number" value={batchForm.duration} onChange={e => setBatchForm(p => ({ ...p, duration: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Unit</label>
                      <select className="form-input" value={batchForm.durationType} onChange={e => setBatchForm(p => ({ ...p, durationType: e.target.value }))}>
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-2">
                    <div className="form-group">
                      <label className="form-label">Price (₹)</label>
                      <input className="form-input" type="number" placeholder="Original price" value={batchForm.originalPrice} onChange={e => setBatchForm(p => ({ ...p, originalPrice: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Offer Price (₹)</label>
                      <input className="form-input" type="number" placeholder="Discounted price" value={batchForm.offerPrice} onChange={e => setBatchForm(p => ({ ...p, offerPrice: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Participants</label>
                    <input className="form-input" type="number" value={batchForm.maxParticipants} onChange={e => setBatchForm(p => ({ ...p, maxParticipants: e.target.value }))} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Thumbnail URL</label>
                    <input className="form-input" type="url" placeholder="https://image-url.com/..." value={batchForm.thumbnailUrl} onChange={e => setBatchForm(p => ({ ...p, thumbnailUrl: e.target.value }))} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Guide Link (YouTube)</label>
                    <input className="form-input" type="url" placeholder="https://youtube.com/watch?v=..." value={batchForm.guideLink} onChange={e => setBatchForm(p => ({ ...p, guideLink: e.target.value }))} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-input" rows="3" value={batchForm.description} onChange={e => setBatchForm(p => ({ ...p, description: e.target.value }))} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Features (one per line)</label>
                    <textarea className="form-input" rows="4" placeholder="Feature 1&#10;Feature 2" value={batchForm.features} onChange={e => setBatchForm(p => ({ ...p, features: e.target.value }))} />
                  </div>

                  <button className="btn btn-primary" style={{ width: '100%' }}>Create Batch</button>
                </form>
              </div>
            </div>
          )}

          {/* Challenge Form Modal */}
          {showChallengeForm && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowChallengeForm(false)}>
              <div className="modal">
                <div className="modal-header"><h3 className="modal-title">Create Challenge</h3><button className="modal-close" onClick={() => setShowChallengeForm(false)}>×</button></div>
                <form onSubmit={createChallenge}>
                  <div className="form-group">
                    <label className="form-label">Batch</label>
                    <select className="form-input" value={challengeForm.batchId} onChange={e => setChallengeForm(p => ({ ...p, batchId: e.target.value }))} required>
                      <option value="">Select batch</option>
                      {batches.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
                    </select>
                  </div>
                  {[{ name: 'title', label: 'Title', type: 'text' }, { name: 'duration', label: 'Duration (days)', type: 'number' }, { name: 'startDay', label: 'Start Day', type: 'number' }, { name: 'endDay', label: 'End Day', type: 'number' }].map(f => (
                    <div className="form-group" key={f.name}>
                      <label className="form-label">{f.label}</label>
                      <input className="form-input" type={f.type} value={challengeForm[f.name]} onChange={e => setChallengeForm(p => ({ ...p, [f.name]: e.target.value }))} required />
                    </div>
                  ))}
                  <div className="form-group"><label className="form-label">Instructions</label><textarea className="form-input" rows="3" value={challengeForm.instructions} onChange={e => setChallengeForm(p => ({ ...p, instructions: e.target.value }))} /></div>
                  <button className="btn btn-primary" style={{ width: '100%' }}>Create Challenge</button>
                </form>
              </div>
            </div>
          )}

          {/* User Images Modal - Day Wise */}
          {userImages && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setUserImages(null)}>
              <div className="modal" style={{ maxWidth: 850 }}>
                <div className="modal-header">
                  <h3 className="modal-title">📅 Day-Wise Progress ({userImages.totalDays || 0} days)</h3>
                  <button className="modal-close" onClick={() => setUserImages(null)}>×</button>
                </div>

                {/* Compliance Calendar Section */}
                {userImages.complianceData && (
                  <div className="card" style={{ marginBottom: 24, padding: 20, background: 'var(--bg-secondary)' }}>
                    <h4 style={{ fontWeight: 700, marginBottom: 16, fontSize: '0.9rem', color: 'var(--text-main)' }}>Discipline Calendar</h4>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(32px, 1fr))', 
                      gap: 8 
                    }}>
                      {userImages.complianceData.map((d, i) => {
                        let bgColor = 'var(--bg-tertiary)';
                        let tooltip = `Day ${d.day}: ${d.date} - Not yet uploaded`;
                        
                        if (d.isFull) {
                          bgColor = 'var(--success)';
                          tooltip = `Day ${d.day}: ${d.date} - All Tasks Completed!`;
                        } else if (d.isPast) {
                          bgColor = 'var(--danger)';
                          tooltip = `Day ${d.day}: ${d.date} - MISSED TASKS`;
                        } else if (d.isToday) {
                          bgColor = '#9ca3af'; // Grey for today if incomplete
                          tooltip = `Day ${d.day}: Today - Progressing...`;
                        }

                        return (
                          <div 
                            key={i} 
                            title={tooltip}
                            onClick={() => setActiveModalDay(d)}
                            style={{ 
                              aspectRatio: '1',
                              background: bgColor,
                              borderRadius: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              color: d.isFull || d.isPast ? '#fff' : 'var(--text-muted)',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: activeModalDay?.date === d.date ? '2px solid #fff' : (d.isToday ? '2px solid var(--accent)' : 'none'),
                              boxShadow: activeModalDay?.date === d.date ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
                              opacity: d.isPast || d.isFull || d.isToday ? 1 : 0.3,
                              transform: activeModalDay?.date === d.date ? 'scale(1.1)' : 'scale(1)',
                              transition: '0.2s'
                            }}
                          >
                            {d.day}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 12, height: 12, background: 'var(--success)', borderRadius: 2 }} /> Completed</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 12, height: 12, background: 'var(--danger)', borderRadius: 2 }} /> Missed</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 12, height: 12, background: '#9ca3af', borderRadius: 2 }} /> Today</div>
                    </div>
                  </div>
                )}

                {activeModalDay ? (
                  <div className="fade-in">
                    <div style={{ marginBottom: 20, padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontWeight: 700, margin: 0 }}>
                        📅 Day {activeModalDay.day} Details ({new Date(activeModalDay.date).toLocaleDateString()})
                      </h4>
                      {activeModalDay.isFull ? (
                        <span className="badge badge-success">✓ Fully Completed</span>
                      ) : (
                        <span className="badge badge-warning">⚠️ Incomplete</span>
                      )}
                    </div>

                    {activeModalDay.details ? (
                      <div style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: 8 }}>
                        {/* Body Stats & Photos */}
                        <div className="card" style={{ marginBottom: 20 }}>
                          <h4 style={{ fontWeight: 700, marginBottom: 16 }}>📸 Body Stats & Photos</h4>
                          {activeModalDay.details.bodyImages?.length > 0 ? (
                            <>
                              <div className="grid grid-3" style={{ gap: 12, marginBottom: 20 }}>
                                {['left', 'center', 'right'].map(side => (
                                  <div key={side}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 4, textTransform: 'capitalize' }}>{side === 'center' ? 'Front' : side + ' Side'}</p>
                                    {activeModalDay.details.bodyImages[0][side] ? (
                                      <div style={{ position: 'relative' }}>
                                        <img src={activeModalDay.details.bodyImages[0][side]} alt="" style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)' }} />
                                        <button 
                                          className="btn-icon" 
                                          style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: 6, borderRadius: '50%' }}
                                          onClick={() => downloadImage(activeModalDay.details.bodyImages[0][side], `${selectedMonitorDetail.user.name}_day${activeModalDay.day}_${side}.jpg`)}
                                        >
                                          <FiDownload size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      <div style={{ width: '100%', height: 120, background: 'var(--bg-tertiary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>No Photo</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                                {Object.entries(activeModalDay.details.bodyImages[0]).map(([k, v]) => {
                                  if (['left', 'right', 'center', 'id', '_id'].includes(k)) return null;
                                  if (v === undefined || v === null || v === '') return null;
                                  
                                  const label = k.replace(/([A-Z])/g, ' $1');
                                  const unit = k === 'weight' ? 'kg' : 'cm';

                                  return (
                                    <div key={k} style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{label}</div>
                                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{v} <span style={{ fontSize: '0.7rem', fontWeight: 500, opacity: 0.7 }}>{unit}</span></div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          ) : <p style={{ color: 'var(--text-muted)' }}>No measurements logged for this day.</p>}
                        </div>

                        {/* Steps */}
                        <div className="card" style={{ marginBottom: 20 }}>
                          <h4 style={{ fontWeight: 700, marginBottom: 16 }}>🚶 Walking Steps</h4>
                          {activeModalDay.details.steps?.count ? (
                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                              {activeModalDay.details.steps.image && (
                                <div style={{ position: 'relative' }}>
                                  <img src={activeModalDay.details.steps.image} alt="" style={{ width: 120, borderRadius: 8 }} />
                                  <button 
                                    className="btn-icon" 
                                    style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: 4, borderRadius: '50%' }}
                                    onClick={() => downloadImage(activeModalDay.details.steps.image, `${selectedMonitorDetail.user.name}_day${activeModalDay.day}_steps.jpg`)}
                                  >
                                    <FiDownload size={12} />
                                  </button>
                                </div>
                              )}
                              <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{activeModalDay.details.steps.count}</div>
                                <p style={{ color: 'var(--text-muted)' }}>Steps logged</p>
                              </div>
                            </div>
                          ) : <p style={{ color: 'var(--text-muted)' }}>No steps logged for this day.</p>}
                        </div>

                        {/* Meals */}
                        <div className="card">
                          <h4 style={{ fontWeight: 700, marginBottom: 16 }}>🍱 Meal Logs</h4>
                          {activeModalDay.details.meals?.length > 0 ? (
                            <div className="grid grid-3" style={{ gap: 12 }}>
                              {activeModalDay.details.meals.map((meal, i) => (
                                <div key={i} style={{ background: 'var(--bg-tertiary)', borderRadius: 12, padding: 12, position: 'relative' }}>
                                  {meal.image && (
                                    <div style={{ position: 'relative' }}>
                                      <img src={meal.image} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />
                                      <button 
                                        className="btn-icon" 
                                        style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: 4, borderRadius: '50%' }}
                                        onClick={() => downloadImage(meal.image, `${selectedMonitorDetail.user.name}_day${activeModalDay.day}_meal.jpg`)}
                                      >
                                        <FiDownload size={12} />
                                      </button>
                                    </div>
                                  )}
                                  <div className="badge badge-teal" style={{ marginBottom: 8, textTransform: 'capitalize' }}>{meal.type}</div>
                                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{meal.description}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{meal.calories} cal</div>
                                </div>
                              ))}
                            </div>
                          ) : <p style={{ color: 'var(--text-muted)' }}>No meals logged for this day.</p>}
                        </div>
                      </div>
                    ) : (
                      <div className="empty-state card" style={{ padding: 40 }}>
                        <div style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.2 }}>📉</div>
                        <h3>No Data for Day {activeModalDay.day}</h3>
                        <p>The user did not log any activity for this specific date.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: 40 }}>
                    <div className="empty-state-icon">📷</div>
                    <h3>No uploads yet</h3>
                    <p>This user hasn't uploaded any images or meals yet.</p>
                  </div>
                )}

              </div>
            </div>
          )}
          {/* Allot Batch Modal */}
          {showAllotModal && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAllotModal(false)}>
              <div className="modal">
                <div className="modal-header">
                  <h3 className="modal-title">Allot Batch to {selectedUserForAllot?.name}</h3>
                  <button className="modal-close" onClick={() => setShowAllotModal(false)}>×</button>
                </div>
                <form onSubmit={handleAllotBatch}>
                  <div className="form-group">
                    <label className="form-label">Select Program</label>
                    <select className="form-input" value={allotForm.batchId} onChange={e => setAllotForm({ batchId: e.target.value })} required>
                      <option value="">Choose a program</option>
                      {batches.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
                    </select>
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%' }}>Confirm Allotment</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
