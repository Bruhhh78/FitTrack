import { useState, useEffect } from 'react';
import api from '../utils/api';
import Chat from '../components/Chat';
import { FiMessageSquare, FiPackage } from 'react-icons/fi';

const Messenger = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/enrollments/my')
      .then(r => {
        const active = r.data.enrollments.filter(e => e.status === 'active');
        setEnrollments(active);
        if (active.length > 0) setSelectedEnrollment(active[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-wrapper"><div className="page-loading"><div className="spinner" /></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 32 }}>FitTrack <span style={{ color: 'var(--accent)' }}>Messenger</span></h1>
        
        {enrollments.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <FiPackage size={48} style={{ opacity: 0.2, marginBottom: 20 }} />
            <h3>No Active Chats</h3>
            <p style={{ color: 'var(--text-muted)' }}>You must have an active program to access the messenger.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 32, height: 'calc(100vh - 250px)' }}>
            {/* Batch List */}
            <div className="card" style={{ padding: 0, overflowY: 'auto' }}>
              <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
                <h4 style={{ fontWeight: 700, margin: 0 }}>My Programs</h4>
              </div>
              {enrollments.map(e => (
                <div 
                  key={e._id} 
                  className={`chat-batch-item ${selectedEnrollment?._id === e._id ? 'active' : ''}`}
                  onClick={() => setSelectedEnrollment(e)}
                  style={{ padding: '16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: '0.2s' }}
                >
                  <div style={{ fontWeight: 600 }}>{e.batchId?.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{e.batchId?.duration} {e.batchId?.durationType} Program</div>
                </div>
              ))}
            </div>

            {/* Chat Area */}
            <div style={{ height: '100%' }}>
              {selectedEnrollment ? (
                <Chat 
                  batchId={selectedEnrollment.batchId._id} 
                  receiverId={selectedEnrollment.batchId.createdBy} 
                />
              ) : (
                <div className="card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiMessageSquare size={48} style={{ opacity: 0.1, marginBottom: 20 }} />
                  <p>Select a program to start chatting.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .chat-batch-item:hover { background: var(--bg-tertiary); }
        .chat-batch-item.active { background: var(--bg-tertiary); border-left: 4px solid var(--accent); }
        .chat-window { height: 100% !important; }
      `}} />
    </div>
  );
};

export default Messenger;
