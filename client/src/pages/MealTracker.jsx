import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiUpload, FiPlus, FiTrash2 } from 'react-icons/fi';

const mealTypes = [
  { type: 'breakfast', label: '🌅 Breakfast', cls: 'meal-breakfast' },
  { type: 'lunch', label: '☀️ Lunch', cls: 'meal-lunch' },
  { type: 'dinner', label: '🌙 Dinner', cls: 'meal-dinner' },
];

const MealTracker = () => {
  const { batchId } = useParams();
  const [todayLog, setTodayLog] = useState(null);
  const [editMeal, setEditMeal] = useState(null);
  const [form, setForm] = useState({ description: '', calories: '', time: '' });
  const [mealImage, setMealImage] = useState(null);
  const [mealPreview, setMealPreview] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('today');

  const loadData = () => {
    api.get(`/meals/today/${batchId}`).then(r => setTodayLog(r.data.mealLog)).catch(() => {});
    api.get(`/meals/batch/${batchId}`).then(r => setHistory(r.data.mealLogs)).catch(() => {});
  };

  useEffect(() => { loadData(); }, [batchId]);

  const handleImageUpload = async (file) => {
    if (!file) return '';
    const fd = new FormData();
    fd.append('image', file);
    const { data } = await api.post('/meals/upload-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data.imageUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editMeal) return;
    setLoading(true);
    try {
      let imageUrl = '';
      if (mealImage) imageUrl = await handleImageUpload(mealImage);
      const existingMeal = todayLog?.meals?.find(m => m.type === editMeal);
      await api.post('/meals', {
        batchId, date: new Date().toISOString(),
        meals: [{ type: editMeal, description: form.description, calories: Number(form.calories) || 0, time: form.time, image: imageUrl || existingMeal?.image || '' }],
      });
      toast.success(`${editMeal} logged!`);
      setEditMeal(null); setForm({ description: '', calories: '', time: '' }); setMealImage(null); setMealPreview('');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log meal');
    } finally { setLoading(false); }
  };

  const openMealForm = (type) => {
    const existing = todayLog?.meals?.find(m => m.type === type);
    setEditMeal(type);
    if (existing) {
      setForm({ description: existing.description, calories: existing.calories || '', time: existing.time || '' });
      setMealPreview(existing.image || '');
    } else {
      setForm({ description: '', calories: '', time: '' }); setMealPreview('');
    }
    setMealImage(null);
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60, maxWidth: 800 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Meal Tracker</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Log your daily meals with photos.</p>

        <div className="tabs">
          <button className={`tab ${tab === 'today' ? 'active' : ''}`} onClick={() => setTab('today')}>Today</button>
          <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>History ({history.length})</button>
        </div>

        {tab === 'today' ? (
          <div className="fade-in">
            {/* Meal cards */}
            {mealTypes.map(mt => {
              const logged = todayLog?.meals?.find(m => m.type === mt.type);
              return (
                <div key={mt.type} className="card meal-card" style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => openMealForm(mt.type)}>
                  <div className={`meal-icon ${mt.cls}`}>{mt.label.split(' ')[0]}</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: 600 }}>{mt.label.split(' ')[1]}</h4>
                    {logged ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{logged.description || 'Logged'}{logged.calories ? ` • ${logged.calories} cal` : ''}</p>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tap to log</p>
                    )}
                  </div>
                  {logged ? <span className="badge badge-success">✓ Logged</span> : <FiPlus style={{ color: 'var(--accent)' }} />}
                  {logged?.image && <img src={logged.image} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />}
                </div>
              );
            })}

            {/* Meal form modal */}
            {editMeal && (
              <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditMeal(null)}>
                <div className="modal">
                  <div className="modal-header">
                    <h3 className="modal-title">Log {editMeal}</h3>
                    <button className="modal-close" onClick={() => setEditMeal(null)}>×</button>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label className="form-label">What did you eat?</label>
                      <textarea className="form-input" rows="3" placeholder="Describe your meal..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
                    </div>
                    <div className="grid grid-2">
                      <div className="form-group">
                        <label className="form-label">Calories (approx)</label>
                        <input className="form-input" type="number" placeholder="0" value={form.calories} onChange={e => setForm(p => ({ ...p, calories: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Time</label>
                        <input className="form-input" type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Meal Photo</label>
                      <label className={`image-upload-zone ${mealPreview ? 'has-image' : ''}`}>
                        {mealPreview ? <img src={mealPreview} alt="meal" /> : <><FiUpload size={24} style={{ color: 'var(--text-muted)' }} /><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Upload photo</span></>}
                        <input type="file" accept="image/*" hidden onChange={e => { setMealImage(e.target.files[0]); setMealPreview(URL.createObjectURL(e.target.files[0])); }} />
                      </label>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                      {loading ? 'Saving...' : 'Save Meal'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="fade-in">
            {history.length === 0 ? (
              <div className="empty-state card"><h3>No meal logs yet</h3></div>
            ) : history.map(log => (
              <div key={log._id} className="card" style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{new Date(log.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {log.meals.map((m, i) => <span key={i} className="badge badge-teal" style={{ textTransform: 'capitalize' }}>{m.type}{m.calories ? ` • ${m.calories}cal` : ''}</span>)}
                </div>
                {log.totalCalories > 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8 }}>Total: {log.totalCalories} calories</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealTracker;
