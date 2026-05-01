import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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
  const [form, setForm] = useState(Object.fromEntries(fields.map(f => [f.key, ''])));
  const [images, setImages] = useState({ left: null, right: null, center: null });
  const [previews, setPreviews] = useState({ left: '', right: '', center: '' });
  const [stepsCount, setStepsCount] = useState('');
  const [stepsImage, setStepsImage] = useState(null);
  const [stepsPreview, setStepsPreview] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('form');

  useEffect(() => {
    api.get(`/measurements/batch/${batchId}`).then(r => setHistory(r.data.measurements)).catch(() => {});
    api.get(`/measurements/latest/${batchId}`).then(r => {
      if (r.data.measurement) {
        const m = r.data.measurement;
        const vals = {};
        fields.forEach(f => { vals[f.key] = m[f.key] || ''; });
        setForm(vals);
        if (m.images) setPreviews(m.images);
        if (m.stepsCount) setStepsCount(m.stepsCount);
        if (m.stepsImage) setStepsPreview(m.stepsImage);
      }
      // Scroll to steps if focused
      if (location.search.includes('focus=steps')) {
        setTimeout(() => {
          document.getElementById('steps-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    }).catch(() => {});
  }, [batchId, location.search]);

  const handleImageChange = (side, file) => {
    if (!file) return;
    setImages(p => ({ ...p, [side]: file }));
    setPreviews(p => ({ ...p, [side]: URL.createObjectURL(file) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('batchId', batchId);
      fields.forEach(f => formData.append(f.key, form[f.key] || 0));
      formData.append('stepsCount', stepsCount || 0);
      Object.entries(images).forEach(([k, v]) => { if (v) formData.append(k, v); });
      if (stepsImage) formData.append('stepsImage', stepsImage);

      await api.post('/measurements', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Measurements saved!');
      api.get(`/measurements/batch/${batchId}`).then(r => setHistory(r.data.measurements));
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
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📏 Measurements</h3>
              <div className="measurement-grid">
                {fields.map(f => (
                  <div className="form-group" key={f.key} style={{ marginBottom: 12 }}>
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" type="number" step="0.1" placeholder="0" value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>

            <div className="card" id="steps-section" style={{ marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🚶 Walking Steps</h3>
              <div className="grid grid-2" style={{ alignItems: 'end' }}>
                <div className="form-group">
                  <label className="form-label">Steps Count</label>
                  <input className="form-input" type="number" placeholder="Enter steps (e.g. 10000)" value={stepsCount}
                    onChange={e => setStepsCount(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Steps Proof (Screenshot)</label>
                  <label className={`image-upload-zone ${stepsPreview ? 'has-image' : ''}`} style={{ height: 120 }}>
                    {stepsPreview ? (
                      <img src={stepsPreview} alt="steps" />
                    ) : (
                      <><FiUpload size={20} style={{ color: 'var(--text-muted)' }} /><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Upload proof</span></>
                    )}
                    <input type="file" accept="image/*" hidden onChange={e => {
                      if (e.target.files[0]) {
                        setStepsImage(e.target.files[0]);
                        setStepsPreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }} />
                  </label>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📸 Progress Photos</h3>
              <div className="grid grid-3">
                {['left', 'right', 'center'].map(side => (
                  <div key={side}>
                    <label className="form-label" style={{ textTransform: 'capitalize' }}>{side} Side</label>
                    <label className={`image-upload-zone ${previews[side] ? 'has-image' : ''}`}>
                      {previews[side] ? (
                        <img src={previews[side]} alt={side} />
                      ) : (
                        <><FiUpload size={24} style={{ color: 'var(--text-muted)' }} /><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Click to upload</span></>
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
