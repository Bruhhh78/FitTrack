import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiUpload, FiSave, FiCheckCircle, FiActivity } from 'react-icons/fi';

const DailyActivity = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [stepsCount, setStepsCount] = useState('');
  const [stepsImage, setStepsImage] = useState(null);
  const [stepsPreview, setStepsPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    if (!batchId) return;
    const today = new Date().toLocaleDateString('en-CA');
    api.get(`/measurements/today/${batchId}?date=${today}`).then(r => {
      if (r.data.measurement) {
        const m = r.data.measurement;
        if (m.stepsCount) {
          setStepsCount(m.stepsCount);
          setIsLogged(true);
        }
        if (m.stepsImage) setStepsPreview(m.stepsImage);
      }
    }).catch(err => {
      console.error("Fetch daily activity error:", err);
    });
  }, [batchId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stepsCount) return toast.error('Please enter steps count');
    if (!stepsImage && !stepsPreview) return toast.error('Please upload proof of movement (screenshot)');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('batchId', batchId);
      formData.append('date', new Date().toLocaleDateString('en-CA'));
      formData.append('stepsCount', stepsCount);
      if (stepsImage) formData.append('stepsImage', stepsImage);

      // We use the same measurements endpoint but it handles updates if already logged today
      await api.post('/measurements', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Daily activity saved!');
      setIsLogged(true);
      setTimeout(() => navigate(`/dashboard/${batchId}`), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60, maxWidth: 600 }}>
        <div className="fade-in">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, background: 'rgba(245, 158, 11, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2rem' }}>
              <FiActivity />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Daily Movement</h1>
            <p style={{ color: 'var(--text-muted)' }}>Keep your streak alive by logging your daily steps.</p>
          </div>

          <form onSubmit={handleSubmit} className="card glass-premium" style={{ padding: 32 }}>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Total Steps Count</label>
              <input 
                className="form-input" 
                type="number" 
                placeholder="e.g. 10000" 
                value={stepsCount}
                onChange={e => setStepsCount(e.target.value)}
                style={{ fontSize: '1.2rem', padding: '16px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 32 }}>
              <label className="form-label">Proof of Movement (Screenshot)</label>
              <label className={`image-upload-zone ${stepsPreview ? 'has-image' : ''}`} style={{ height: 200 }}>
                {stepsPreview ? (
                  <img src={stepsPreview} alt="steps" />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <FiUpload size={32} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Upload health app screenshot</p>
                  </div>
                )}
                <input type="file" accept="image/*" hidden onChange={e => {
                  if (e.target.files[0]) {
                    setStepsImage(e.target.files[0]);
                    setStepsPreview(URL.createObjectURL(e.target.files[0]));
                  }
                }} />
              </label>
            </div>

            <button className={`btn btn-primary btn-lg ${isLogged ? 'btn-success' : ''}`} style={{ width: '100%', padding: '18px', fontSize: '1.1rem' }} disabled={loading}>
              {loading ? 'Saving...' : isLogged ? <><FiCheckCircle /> Updated Today</> : <><FiSave /> Log Activity</>}
            </button>
          </form>

          <button 
            className="btn btn-ghost" 
            style={{ width: '100%', marginTop: 16 }}
            onClick={() => navigate(`/dashboard/${batchId}`)}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyActivity;
