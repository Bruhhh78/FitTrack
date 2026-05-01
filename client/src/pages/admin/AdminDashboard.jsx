import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiUsers, FiPackage, FiActivity, FiPlus, FiEdit2, FiTrash2, FiEye, FiImage, FiX, FiBook, FiArrowLeft, FiEdit3 } from 'react-icons/fi';
import CurriculumManager from '../../components/admin/CurriculumManager';

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
  const [batchForm, setBatchForm] = useState({ title: '', description: '', duration: '', durationType: 'days', originalPrice: '', offerPrice: '', maxParticipants: 50, features: '', guideLink: '', thumbnailUrl: '', curriculum: [] });
  const [challengeForm, setChallengeForm] = useState({ batchId: '', title: '', description: '', duration: '', startDay: '', endDay: '', instructions: '' });
  const [userImages, setUserImages] = useState(null);
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

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
    api.get(`/admin/enrollments/${batchId}`).then(r => setEnrollments(r.data.enrollments));
  };

  const editBatch = (batch) => {
    setEditingBatchId(batch._id);
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
      curriculum: batch.curriculum || []
    });
    setShowBatchForm(true);
  };

  const saveBatch = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...batchForm, features: batchForm.features.split('\n').filter(Boolean), duration: Number(batchForm.duration), originalPrice: Number(batchForm.originalPrice), offerPrice: Number(batchForm.offerPrice), maxParticipants: Number(batchForm.maxParticipants) };
      if (editingBatchId) {
        await api.put(`/batches/${editingBatchId}`, payload);
        toast.success('Batch updated!');
      } else {
        await api.post('/batches', payload);
        toast.success('Batch created!');
      }
      setShowBatchForm(false);
      setEditingBatchId(null);
      setBatchForm({ title: '', description: '', duration: '', durationType: 'days', originalPrice: '', offerPrice: '', maxParticipants: 50, features: '', guideLink: '', thumbnailUrl: '', curriculum: [] });
      const r = await api.get('/batches'); setBatches(r.data.batches);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
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

  const viewUserImages = async (userId) => {
    try { const { data } = await api.get(`/admin/user-images/${userId}`); setUserImages(data); } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="page-wrapper"><div className="page-loading"><div className="spinner" /></div></div>;

  return (
    <div className="page-wrapper">
      <div className="dashboard">
        <div className="sidebar">
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1.1rem' }}>Admin Panel</h3>
          {[
            { key: 'dashboard', icon: <FiActivity />, label: 'Overview' },
            { key: 'batches', icon: <FiPackage />, label: 'Batches' },
            { key: 'curriculum', icon: <FiBook />, label: 'Curriculum' },
            { key: 'users', icon: <FiUsers />, label: 'Users' },
            { key: 'enrollments', icon: <FiEye />, label: 'Enrollments' },
          ].map(item => (
            <button key={item.key} className={`sidebar-link ${tab === item.key ? 'active' : ''}`} onClick={() => setTab(item.key)}>
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
              <div className="grid grid-4" style={{ marginBottom: 32 }}>
                {[
                  { label: 'Total Revenue', value: `₹${stats.totalRevenue || 0}`, icon: <span style={{fontSize: '1.2rem'}}>💰</span>, color: 'var(--success)' },
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
                  <button className="btn btn-primary btn-sm" onClick={() => { setEditingBatchId(null); setBatchForm({ title: '', description: '', duration: '', durationType: 'days', originalPrice: '', offerPrice: '', maxParticipants: 50, features: '', guideLink: '', thumbnailUrl: '', curriculum: [] }); setShowBatchForm(true); }}><FiPlus /> New Batch</button>
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
                    <button className="btn btn-sm btn-secondary" title="Edit Batch" onClick={() => editBatch(b)}><FiEdit2 /></button>
                    <button className="btn btn-sm btn-info" title="View Enrollments" onClick={() => loadEnrollments(b._id)}><FiEye /></button>
                    <button className="btn btn-sm btn-danger" title="Delete Batch" onClick={() => deleteBatch(b._id)}><FiTrash2 /></button>
                  </div>
                </div>
              ))}
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
                        <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {u.avatar ? <img src={u.avatar} className="avatar" alt="" /> : <div className="avatar avatar-placeholder">{u.name[0]}</div>}
                          {u.name}
                        </td>
                        <td>{u.email}</td><td>{u.phone || '-'}</td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td><button className="btn btn-sm btn-secondary" onClick={() => viewUserImages(u._id)}><FiImage /> Images</button></td>
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
              <h2 style={{ fontWeight: 800, marginBottom: 24 }}>Enrollments</h2>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Select Batch</label>
                <select className="form-input" onChange={e => loadEnrollments(e.target.value)} value={selectedBatch || ''}>
                  <option value="">Choose a batch</option>
                  {batches.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
                </select>
              </div>
              {enrollments.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead><tr><th>User</th><th>Email</th><th>Status</th><th>Enrolled On</th><th>Actions</th></tr></thead>
                    <tbody>
                      {enrollments.map(e => (
                        <tr key={e._id}>
                          <td>{e.userId?.name}</td><td>{e.userId?.email}</td>
                          <td><span className={`badge ${e.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{e.status}</span></td>
                          <td>{new Date(e.enrolledAt).toLocaleDateString()}</td>
                          <td><button className="btn btn-sm btn-secondary" onClick={() => viewUserImages(e.userId?._id)}><FiImage /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p style={{ color: 'var(--text-muted)' }}>Select a batch to view enrollments.</p>}
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

                  <button className="btn btn-primary" style={{ width: '100%' }}>{editingBatchId ? 'Update Batch' : 'Create Batch'}</button>
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

                {(!userImages.dayWiseData || userImages.dayWiseData.length === 0) ? (
                  <div className="empty-state" style={{ padding: 40 }}>
                    <div className="empty-state-icon">📷</div>
                    <h3>No uploads yet</h3>
                    <p>This user hasn't uploaded any images or meals yet.</p>
                  </div>
                ) : (
                  userImages.dayWiseData.map((day) => (
                    <div key={day.date} className="card" style={{ marginBottom: 16 }}>
                      {/* Day header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--border-color)' }}>
                        <div>
                          <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>
                            📆 {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </h4>
                          {day.batch && <span className="badge badge-teal" style={{ marginTop: 4 }}>{day.batch}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {day.bodyImages.length > 0 && <span className="badge badge-success">📸 Body</span>}
                          {day.meals.length > 0 && <span className="badge badge-warning">🍽️ {day.meals.length} meals</span>}
                          {day.steps && <span className="badge badge-teal">🚶 {day.steps.count} steps</span>}
                        </div>
                      </div>

                      {/* Steps for this day */}
                      {day.steps && (
                        <div style={{ marginBottom: 12, display: 'flex', gap: 16, alignItems: 'center', background: 'rgba(13, 148, 136, 0.05)', padding: 12, borderRadius: 10 }}>
                          {day.steps.image && (
                            <img src={day.steps.image} alt="steps proof" style={{ width: 80, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-color)' }} />
                          )}
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent)' }}>🚶 {day.steps.count} Steps</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily walking goal proof</p>
                          </div>
                        </div>
                      )}

                      {/* Body images for this day */}
                      {day.bodyImages.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Body Progress</p>
                          {day.bodyImages.map((bi, idx) => (
                            <div key={idx}>
                              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                                {bi.left && (
                                  <div style={{ textAlign: 'center' }}>
                                    <img src={bi.left} alt="Left" style={{ width: 140, height: 180, objectFit: 'cover', borderRadius: 10, border: '2px solid var(--border-color)' }} />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Left Side</p>
                                  </div>
                                )}
                                {bi.center && (
                                  <div style={{ textAlign: 'center' }}>
                                    <img src={bi.center} alt="Center" style={{ width: 140, height: 180, objectFit: 'cover', borderRadius: 10, border: '2px solid var(--border-color)' }} />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Front</p>
                                  </div>
                                )}
                                {bi.right && (
                                  <div style={{ textAlign: 'center' }}>
                                    <img src={bi.right} alt="Right" style={{ width: 140, height: 180, objectFit: 'cover', borderRadius: 10, border: '2px solid var(--border-color)' }} />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Right Side</p>
                                  </div>
                                )}
                              </div>
                              {(bi.weight || bi.chest || bi.belly) && (
                                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                  {bi.weight > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⚖️ {bi.weight} kg</span>}
                                  {bi.chest > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📏 Chest: {bi.chest} cm</span>}
                                  {bi.belly > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📏 Belly: {bi.belly} cm</span>}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Meal images for this day */}
                      {day.meals.length > 0 && (
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Meals</p>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {day.meals.map((meal, mi) => (
                              <div key={mi} style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: 8, width: 150 }}>
                                {meal.image && <img src={meal.image} alt={meal.type} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 6 }} />}
                                <p style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'capitalize' }}>{meal.type}</p>
                                {meal.description && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meal.description}</p>}
                                {meal.calories > 0 && <span className="badge badge-teal" style={{ marginTop: 4 }}>{meal.calories} cal</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
