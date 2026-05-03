import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiUpload, FiSave, FiTrash2 } from 'react-icons/fi';

const fields = [
  { key: 'face', label: 'Face (cm)' }, { key: 'neck', label: 'Neck (cm)' },
  { key: 'chest', label: 'Chest (cm)' }, { key: 'armsLeft', label: 'Arms Left (cm)' },
  { key: 'armsRight', label: 'Arms Right (cm)' }, { key: 'belly', label: 'Belly (cm)' },
  { key: 'hips', label: 'Hips (cm)' }, { key: 'thighsLeft', label: 'Thighs Left (cm)' },
  { key: 'thighsRight', label: 'Thighs Right (cm)' }, { key: 'weight', label: 'Weight (kg)' },
];

const MeasurementForm = () => {
  const { batchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState(Object.fromEntries(fields.map(f => [f.key, ''])));
  const [images, setImages] = useState({ left: null, right: null, center: null });
  const [previews, setPreviews] = useState({ left: '', right: '', center: '' });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('form');

  useEffect(() => {
    if (!batchId) return;
    const todayStr = new Date().toLocaleDateString('en-CA');
    api.get(`/measurements/today/${batchId}?date=${todayStr}`).then(r => {
      if (r.data.measurement) {
        const m = r.data.measurement;
        const latestDate = new Date(m.date).toDateString();
        const today = new Date().toDateString();
        

        const vals = {};
        fields.forEach(f => { vals[f.key] = m[f.key] || ''; });
        setForm(vals);
        if (m.images) setPreviews(m.images);
      }
    }).catch(err => {
      console.error("Fetch latest error:", err);
    });
    api.get(`/measurements/batch/${batchId}`).then(r => setHistory(r.data.measurements)).catch(() => {});
  }, [batchId]);

  const handleImageChange = (side, file) => {
    if (!file) return;
    setImages(p => ({ ...p, [side]: file }));
    setPreviews(p => ({ ...p, [side]: URL.createObjectURL(file) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate all fields
      for (const f of fields) {
        if (!form[f.key]) {
          toast.error(`${f.label} is required`);
          setLoading(false);
          return;
        }
      }
      // Validate images
      if (!images.left || !images.right || !images.center) {
        if (!previews.left || !previews.right || !previews.center) {
           toast.error('All 3 progress photos (Left, Right, Center) are required');
           setLoading(false);
           return;
        }
      }

      const formData = new FormData();
      formData.append('batchId', batchId);
      formData.append('date', new Date().toLocaleDateString('en-CA'));
      fields.forEach(f => formData.append(f.key, form[f.key] || 0));
      Object.entries(images).forEach(([k, v]) => { if (v) formData.append(k, v); });

      await api.post('/measurements', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Measurements saved!');
      setTimeout(() => navigate(`/dashboard/${batchId}`), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60, maxWidth: 900 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Body Measurements</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Track your daily measurements and upload progress photos.</p>

        <div className="tabs">
          <button className={`tab ${tab === 'form' ? 'active' : ''}`} onClick={() => setTab('form')}>Today's Log</button>
          <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>History ({history.length})</button>
        </div>

        {tab === 'form' ? (
          <form onSubmit={handleSubmit} className="fade-in">
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 20 }}>📏 Measurements</h3>
              <div className="measurement-grid">
                {fields.map(f => (
                  <div className="form-group" key={f.key}>
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" type="number" step="0.1" placeholder="0" value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>



            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 20 }}>📸 Progress Photos</h3>
              <div className="grid grid-3">
                {['left', 'right', 'center'].map(side => (
                  <div key={side}>
                    <label className="form-label" style={{ textTransform: 'capitalize' }}>{side} Side</label>
                    <label className={`image-upload-zone ${previews[side] ? 'has-image' : ''}`}>
                      {previews[side] ? (
                        <img src={previews[side]} alt={side} />
                      ) : (
                        <><FiUpload size={24} style={{ color: 'var(--text-muted)' }} /><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Upload {side} view</span></>
                      )}
                      <input type="file" accept="image/*" hidden onChange={e => handleImageChange(side, e.target.files[0])} />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              <FiSave /> {loading ? 'Saving...' : 'Save Measurements'}
            </button>
          </form>
        ) : (
          <div className="fade-in">
            {history.length === 0 ? (
              <div className="empty-state card"><h3>No measurements yet</h3><p>Start logging your measurements above.</p></div>
            ) : (
              <div className="table-container">
                <table>
                  <thead><tr><th>Date</th><th>Steps</th><th>Weight</th><th>Chest</th><th>Belly</th><th>Photos</th></tr></thead>
                  <tbody>
                    {history.map(m => (
                      <tr key={m._id}>
                        <td>{new Date(m.date).toLocaleDateString()}</td>
                        <td>{m.stepsCount || 0}</td>
                        <td>{m.weight} kg</td><td>{m.chest} cm</td>
                        <td>{m.belly} cm</td><td>{m.hips} cm</td>
                        <td>{[m.images?.left, m.images?.right, m.images?.center, m.stepsImage].filter(Boolean).length} photos</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeasurementForm;
