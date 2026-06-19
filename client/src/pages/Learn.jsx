import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FiArrowLeft, FiDownload, FiVideo, FiFileText, FiImage, FiClock, FiZap, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DIET_ROUTINE } from '../utils/dietRoutine';

const getYouTubeID = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const Learn = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [activeItemForModal, setActiveItemForModal] = useState(null);
  const [isVeg, setIsVeg] = useState(true);
  const [routineDay, setRoutineDay] = useState(1);

  const activeDietRoutine = batch?.dietRoutine?.length > 0
    ? batch.dietRoutine
    : DIET_ROUTINE;

  useEffect(() => {
    api.get(`/batches/${batchId}`)
      .then(r => {
        const batchData = r.data.batch;
        setBatch(batchData);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load course content');
        setLoading(false);
      });
  }, [batchId]);

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!batch) return <div className="error-page">Course not found</div>;

  return (
    <div className="learn-page-v2">
      <div className="container py-12">
        {/* Back navigation & Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }} className="fade-in">
          <button className="btn btn-secondary btn-sm" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => navigate(`/dashboard/${batchId}`)}>
            <FiArrowLeft /> Back to Dashboard
          </button>
        </div>

        <div className="learn-hero-card fade-in" style={{ marginBottom: 48 }}>
          <div className="hero-card-glow" />
          <div className="hero-card-glow-2" />
          <div className="hero-thumb">
            {batch.thumbnailUrl ? (
              <img src={batch.thumbnailUrl} alt="" />
            ) : (
              <div className="thumb-placeholder">
                <span className="thumb-glow" />
                <span className="thumb-icon">⚡</span>
              </div>
            )}
          </div>
          <div className="hero-info">
            <div className="badge-row">
              <span className="badge-pill badge-teal-pill">
                <FiZap size={14} style={{ marginRight: 6 }} /> {batch.durationType} Program
              </span>
              <span className="badge-pill badge-success-pill">
                <FiActivity size={14} style={{ marginRight: 6 }} /> Active
              </span>
              <span className="meta-pill">
                <FiClock size={14} style={{ color: '#06b6d4', marginRight: 6 }} /> {batch.duration} {batch.durationType}
              </span>
            </div>
            <h1>{batch.title}</h1>
            <p>{batch.description}</p>
            <div className="hero-footer">
               <div className="instructor-card-glass">
                  <div className="avatar-container">
                    <div className="avatar-placeholder">{batch.createdBy?.name?.[0] || 'A'}</div>
                    <span className="online-indicator" />
                  </div>
                  <div className="instructor-details">
                    <span className="instructor-label">INSTRUCTOR</span>
                    <span className="instructor-name">{batch.createdBy?.name || 'Admin'}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Weekly Roadmap Timeline Node Track */}
        <div className="timeline-section fade-in">
          <div className="section-title-wrapper">
            <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Interactive Roadmap</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Click on any stage to track weekly guidelines, diet structures, and workouts.</p>
          </div>
          
          <div className="timeline-track">
            {batch.curriculum?.map((module, index) => {
              const isActive = selectedModuleIndex === index;
              return (
                <div key={module._id || index} className="timeline-node-wrapper">
                  <button 
                    className={`timeline-node ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedModuleIndex(index)}
                  >
                    <div className="node-circle">
                      {index + 1}
                    </div>
                    <div className="node-info">
                      <span className="node-caption">STAGE {index + 1}</span>
                      <h4>{module.title.split(' - ')[0]}</h4>
                    </div>
                  </button>
                  {index < batch.curriculum.length - 1 && <div className="timeline-connector"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Week Action Card Grid */}
        <div className="roadmap-grid fade-in">
          {/* Always add General Program Guide as a video card if it exists */}
          {selectedModuleIndex === 0 && batch.guideLink && (
            <div className="roadmap-card" onClick={() => setActiveItemForModal({ type: 'video', title: 'General Program Guide', content: batch.guideLink })}>
              <div className="card-header-gradient video">
                <div className="blur-icon-bubble">
                  <FiVideo />
                </div>
              </div>
              <div className="card-body">
                <span className="card-type-tag">video</span>
                <h3>General Program Guide</h3>
                <div className="card-footer-action">
                  <span>Watch Program Guide</span>
                  <span className="arrow-icon">→</span>
                </div>
              </div>
            </div>
          )}
          
          {batch.curriculum?.[selectedModuleIndex]?.items?.map((item, itemIndex) => (
            <div key={itemIndex} className="roadmap-card" onClick={() => setActiveItemForModal(item)}>
              <div className={`card-header-gradient ${item.type}`}>
                <div className="blur-icon-bubble">
                  {item.type === 'video' ? <FiVideo /> : item.type === 'pdf' ? <FiFileText /> : <FiImage />}
                </div>
              </div>
              <div className="card-body">
                <span className="card-type-tag">{item.type}</span>
                <h3>{item.title}</h3>
                <div className="card-footer-action">
                  <span>{item.type === 'video' ? 'Watch Workout Video' : item.type === 'pdf' ? 'Open PDF Diet Plan' : 'Read Diet Menu & Rules'}</span>
                  <span className="arrow-icon">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Daily Diet Routine Section */}
        <div className="timeline-section fade-in" style={{ marginTop: 48, background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
            <div>
              <h2 style={{ fontWeight: 800, marginBottom: 6 }}>📅 21-Day Diet Routine</h2>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Select any day from Day 1 to Day 21 to view the exact diet schedule.</p>
            </div>
            
            {/* Veg / Non-Veg Toggle */}
            <div className="diet-type-toggle-pill" style={{ display: 'flex', background: 'var(--bg-deep)', padding: 4, borderRadius: 30, border: '1px solid var(--glass-border)' }}>
              <button 
                type="button"
                className={`diet-toggle-btn ${isVeg ? 'active-veg' : ''}`}
                style={{ padding: '8px 20px', borderRadius: 25, border: 'none', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.3s ease', cursor: 'pointer', background: isVeg ? 'var(--primary-subtle)' : 'transparent', color: isVeg ? 'var(--primary)' : 'var(--text-muted)' }}
                onClick={() => setIsVeg(true)}
              >
                🥗 Vegetarian
              </button>
              <button 
                type="button"
                className={`diet-toggle-btn ${!isVeg ? 'active-nonveg' : ''}`}
                style={{ padding: '8px 20px', borderRadius: 25, border: 'none', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.3s ease', cursor: 'pointer', background: !isVeg ? 'var(--accent-subtle)' : 'transparent', color: !isVeg ? 'var(--accent)' : 'var(--text-muted)' }}
                onClick={() => setIsVeg(false)}
              >
                🍗 Non-Vegetarian
              </button>
            </div>
          </div>

          {/* Grid of Days */}
          <div className="routine-days-container" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {(() => {
              const weeksMap = {};
              activeDietRoutine.forEach(item => {
                if (!weeksMap[item.week]) weeksMap[item.week] = [];
                weeksMap[item.week].push(item);
              });
              return Object.entries(weeksMap).map(([weekNum, days]) => (
                <div key={weekNum} className="routine-week-row">
                  <span className="routine-week-label">WEEK {weekNum}</span>
                  <div className="routine-days-row">
                    {days.map(item => {
                      const d = item.day;
                      const isCleanse = item.type === 'cleanse';
                      const isFasting = item.type === 'fasting';
                      return (
                        <button 
                          key={d} 
                          className={`routine-day-dot ${routineDay === d ? 'active' : ''} ${isCleanse ? 'cleanse-day' : ''} ${isFasting ? 'fasting-day' : ''}`}
                          onClick={() => setRoutineDay(d)}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>

          {/* Routine Detail Card */}
          {activeDietRoutine[routineDay - 1] && (
            <div className="routine-detail-card fade-in" style={{ marginTop: 32, padding: 28, background: 'var(--bg-secondary)', borderRadius: 24, border: '1px solid var(--glass-border)', position: 'relative', overflow: 'hidden' }}>
              <div className="routine-detail-glow" />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24, position: 'relative', zIndex: 1 }}>
                <div>
                  <span className="badge badge-teal" style={{ marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>Day {routineDay} Diet Schedule</span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                    {activeDietRoutine[routineDay - 1].type === 'cleanse' ? '🧹 GUT RESET CLEANSE DAY' : `⚡ Week ${activeDietRoutine[routineDay - 1].week} Diet Routine`}
                  </h3>
                </div>
                {activeDietRoutine[routineDay - 1].rule && (
                  <div className="badge-pill badge-success-pill" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', borderColor: 'var(--primary-glow)' }}>
                    🎯 Rule: {activeDietRoutine[routineDay - 1].rule}
                  </div>
                )}
              </div>

              <div className="grid grid-3" style={{ position: 'relative', zIndex: 1, gap: 20 }}>
                {/* Breakfast */}
                <div className="card glass-premium" style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 16, border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: '1.5rem' }}>🌅</span>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {activeDietRoutine[routineDay - 1].type === 'fasting' ? 'Meal 1 (Break Fast)' : 'Breakfast (Before 9 AM)'}
                    </h4>
                  </div>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                    {isVeg ? activeDietRoutine[routineDay - 1].veg.breakfast : activeDietRoutine[routineDay - 1].nonveg.breakfast}
                  </p>
                </div>

                {/* Lunch */}
                <div className="card glass-premium" style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 16, border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: '1.5rem' }}>☀️</span>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {activeDietRoutine[routineDay - 1].type === 'fasting' ? 'Lemon Rock Water' : 'Lunch Menu'}
                    </h4>
                  </div>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                    {isVeg ? activeDietRoutine[routineDay - 1].veg.lunch : activeDietRoutine[routineDay - 1].nonveg.lunch}
                  </p>
                </div>

                {/* Dinner */}
                <div className="card glass-premium" style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 16, border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: '1.5rem' }}>🌌</span>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {activeDietRoutine[routineDay - 1].type === 'fasting' ? 'Meal 2 (Last Meal)' : 'Dinner (Low Oil)'}
                    </h4>
                  </div>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                    {isVeg ? activeDietRoutine[routineDay - 1].veg.dinner : activeDietRoutine[routineDay - 1].nonveg.dinner}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theatre Overlay Modal Viewer */}
        {activeItemForModal && (
          <div className="viewer-modal-overlay" onClick={() => setActiveItemForModal(null)}>
            <div className="viewer-modal" onClick={e => e.stopPropagation()}>
              <div className="viewer-modal-header">
                <div>
                  <span className="modal-type-badge">{activeItemForModal.type}</span>
                  <h3>{activeItemForModal.title}</h3>
                </div>
                <button className="close-btn" onClick={() => setActiveItemForModal(null)}>×</button>
              </div>
              <div className="viewer-modal-body">
                {activeItemForModal.type === 'video' && (
                  <div className="video-wrapper">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeID(activeItemForModal.content)}`}
                      title={activeItemForModal.title}
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
                {activeItemForModal.type === 'pdf' && (
                  <div className="pdf-iframe-wrapper">
                    <div className="pdf-actions">
                      <button onClick={() => handleDownload(activeItemForModal.content, `${activeItemForModal.title}.pdf`)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiDownload /> Download PDF
                      </button>
                    </div>
                    <iframe 
                      src={`${activeItemForModal.content}#toolbar=0&navpanes=0`} 
                      title={activeItemForModal.title}
                    ></iframe>
                  </div>
                )}
                {activeItemForModal.type === 'text' && (
                  <div className="text-content-viewer">
                    {activeItemForModal.content}
                  </div>
                )}
                {activeItemForModal.type === 'image' && (
                  <div className="image-viewer-wrapper" style={{ textAlign: 'center' }}>
                    <img src={activeItemForModal.content} alt={activeItemForModal.title} style={{ maxWidth: '100%', borderRadius: 12 }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .learn-page-v2 { 
          min-height: 100vh; 
          background: var(--bg-deep); 
          padding-top: calc(var(--navbar-height) + 40px);
          padding-bottom: 120px; 
        }
        .learn-hero-card { 
          display: flex; 
          background: var(--bg-card); 
          border-radius: var(--radius-xl); 
          overflow: hidden; 
          color: var(--text-main); 
          box-shadow: var(--shadow-lg), var(--shadow-glow); 
          border: 1px solid var(--glass-border);
          position: relative;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: var(--transition);
        }
        .hero-card-glow {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(40px);
          pointer-events: none;
          z-index: 0;
          opacity: 0.6;
        }
        .hero-card-glow-2 {
          position: absolute;
          bottom: -120px;
          left: 20%;
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(30px);
          pointer-events: none;
          z-index: 0;
          opacity: 0.5;
        }
        .hero-thumb { 
          width: 320px; 
          background: var(--bg-deep); 
          overflow: hidden; 
          position: relative;
          border-right: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }
        .hero-thumb img { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .learn-hero-card:hover .hero-thumb img {
          transform: scale(1.08);
        }
        .thumb-placeholder { 
          width: 100%; 
          height: 100%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-weight: 900; 
          font-size: 2.2rem; 
          background: var(--gradient-hero-subtle);
          color: var(--primary); 
          position: relative;
        }
        .thumb-glow {
          position: absolute;
          width: 80px;
          height: 80px;
          background: var(--primary-glow);
          filter: blur(25px);
          opacity: 0.4;
          border-radius: 50%;
          animation: float 4s ease-in-out infinite;
        }
        .thumb-icon {
          position: relative;
          z-index: 1;
          font-size: 3rem;
          filter: drop-shadow(0 0 15px var(--primary-glow));
        }
        .hero-info { 
          flex: 1; 
          padding: 48px; 
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
          gap: 20px; 
          z-index: 1;
        }
        .hero-info h1 { 
          font-size: clamp(2rem, 3.5vw, 2.8rem); 
          font-weight: 900; 
          margin: 0; 
          line-height: 1.2;
          background: linear-gradient(135deg, var(--text-main) 30%, var(--primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: var(--text-main);
        }
        .hero-info p { 
          color: var(--text-dim); 
          font-size: 1.05rem; 
          line-height: 1.65; 
          max-width: 800px; 
        }
        .badge-row { 
          display: flex; 
          gap: 12px; 
          align-items: center; 
          flex-wrap: wrap; 
        }
        .badge-pill {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .badge-teal-pill {
          background: var(--accent-subtle);
          color: var(--accent);
          border: 1px solid var(--accent-glow);
        }
        .badge-success-pill {
          background: var(--success-glow);
          color: var(--success);
          border: 1px solid var(--success-glow);
        }
        .meta-pill {
          display: inline-flex;
          align-items: center;
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
          color: var(--text-dim);
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
        }
        .hero-footer { 
          margin-top: 12px; 
          padding-top: 24px; 
          border-top: 1px solid var(--glass-border); 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          flex-wrap: wrap; 
          gap: 16px; 
        }
        .instructor-card-glass { 
          display: flex; 
          align-items: center; 
          gap: 14px; 
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
          padding: 8px 18px;
          border-radius: 18px;
          transition: all 0.3s ease;
        }
        .instructor-card-glass:hover {
          background: var(--bg-tertiary);
          border-color: var(--primary);
          box-shadow: var(--shadow-sm);
        }
        .avatar-container {
          position: relative;
          width: 40px;
          height: 40px;
        }
        .avatar-container .avatar-placeholder { 
          width: 100%; 
          height: 100%; 
          border-radius: 50%; 
          background: var(--gradient-hero); 
          color: white; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-weight: 800; 
          font-size: 1rem;
          border: 2px solid var(--glass-border);
        }
        .online-indicator {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: var(--success);
          border: 2px solid var(--bg-dark);
          box-shadow: 0 0 10px var(--success-glow);
        }
        .instructor-details {
          display: flex;
          flex-direction: column;
        }
        .instructor-label {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }
        .instructor-name {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-main);
        }

        /* Timeline Roadmap Layout */
        .timeline-section {
          background: var(--bg-card);
          border: 1px solid var(--glass-border);
          border-radius: 28px;
          padding: 32px;
          margin-bottom: 40px;
          box-shadow: var(--shadow-sm);
        }
        .section-title-wrapper {
          margin-bottom: 32px;
        }
        .timeline-track {
          display: flex;
          align-items: center;
          justify-content: space-between;
          overflow-x: auto;
          padding: 8px 4px;
          scrollbar-width: none;
        }
        .timeline-track::-webkit-scrollbar {
          display: none;
        }
        .timeline-node-wrapper {
          display: flex;
          align-items: center;
          flex: 1;
        }
        .timeline-node-wrapper:last-child {
          flex: initial;
        }
        .timeline-node {
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          padding: 8px;
          text-align: left;
          font-family: inherit;
          transition: all 0.3s ease;
        }
        .node-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.15rem;
          color: var(--text-muted);
          background: var(--bg-deep);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }
        .node-info {
          display: flex;
          flex-direction: column;
        }
        .node-caption {
          font-size: 0.65rem;
          font-weight: 900;
          letter-spacing: 0.15em;
          color: var(--text-muted);
          margin-bottom: 4px;
        }
        .node-info h4 {
          font-size: 1rem;
          font-weight: 800;
          margin: 0;
          color: var(--text-dim);
          transition: color 0.3s;
        }
        .timeline-connector {
          flex: 1;
          height: 3px;
          background: var(--glass-border);
          margin: 0 20px;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        /* Timeline Active & Hover States */
        .timeline-node:hover .node-circle {
          border-color: var(--primary-subtle);
          color: var(--text-main);
          transform: scale(1.05);
        }
        .timeline-node.active .node-circle {
          border-color: transparent;
          color: white;
          background: var(--gradient-hero);
          box-shadow: 0 0 20px var(--primary-glow);
          transform: scale(1.1);
        }
        .timeline-node.active .node-caption {
          color: var(--primary);
        }
        .timeline-node.active .node-info h4 {
          color: var(--text-main);
        }
        .timeline-node.active + .timeline-connector {
          background: var(--primary);
        }

        /* Roadmap Grid & Premium Card */
        .roadmap-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 28px;
        }
        .roadmap-card {
          display: flex;
          flex-direction: column;
          border-radius: 24px;
          background: var(--bg-card);
          border: 1px solid var(--glass-border);
          overflow: hidden;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .roadmap-card:hover {
          transform: translateY(-8px);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
          background: var(--bg-secondary);
        }
        .card-header-gradient {
          height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .card-header-gradient.video {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.7) 0%, rgba(185, 28, 28, 0.85) 100%);
        }
        .card-header-gradient.pdf {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.7) 0%, rgba(29, 78, 216, 0.85) 100%);
        }
        .card-header-gradient.text {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.7) 0%, rgba(4, 120, 87, 0.85) 100%);
        }
        .card-header-gradient.image {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.7) 0%, rgba(180, 83, 9, 0.85) 100%);
        }
        .blur-icon-bubble {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.45rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }
        .roadmap-card:hover .blur-icon-bubble {
          transform: scale(1.15) rotate(5deg);
        }
        .card-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .card-type-tag {
          font-size: 0.6rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--primary);
          margin-bottom: 8px;
          display: block;
        }
        .card-body h3 {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0 0 18px;
          color: var(--text-main);
          line-height: 1.35;
          flex: 1;
        }
        .card-footer-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          border-top: 1px solid var(--glass-border);
          padding-top: 16px;
          margin-top: auto;
          transition: color 0.2s;
        }
        .roadmap-card:hover .card-footer-action {
          color: var(--primary);
        }
        .arrow-icon {
          transition: transform 0.2s;
        }
        .roadmap-card:hover .arrow-icon {
          transform: translateX(6px);
        }

        /* Overlay Theatre Modal styles */
        .viewer-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: fadeIn 0.25s ease-out;
        }
        .viewer-modal {
          width: 100%;
          max-width: 960px;
          background: var(--bg-card);
          border-radius: 28px;
          border: 1px solid var(--glass-border);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .viewer-modal-header {
          padding: 24px 32px;
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-type-badge {
          font-size: 0.6rem;
          text-transform: uppercase;
          font-weight: 900;
          letter-spacing: 0.1em;
          color: var(--primary);
          display: block;
          margin-bottom: 4px;
        }
        .viewer-modal-header h3 {
          font-size: 1.3rem;
          font-weight: 800;
          margin: 0;
          color: var(--text-main);
        }
        .close-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
          color: var(--text-main);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .close-btn:hover {
          background: #ef4444;
          color: white;
          border-color: transparent;
        }
        .viewer-modal-body {
          padding: 32px;
          overflow-y: auto;
          max-height: 70vh;
          scrollbar-width: thin;
        }
        .video-wrapper {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          border-radius: 20px;
          overflow: hidden;
          background: #000;
          box-shadow: var(--shadow-xl);
        }
        .video-wrapper iframe {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%; border: 0;
        }
        .pdf-iframe-wrapper {
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 600px;
        }
        .pdf-actions {
          display: flex;
          justify-content: flex-end;
        }
        .pdf-iframe-wrapper iframe {
          flex: 1;
          border: 1px solid var(--glass-border);
          border-radius: 16px;
        }
        .text-content-viewer {
          font-size: 1.05rem;
          line-height: 1.9;
          white-space: pre-wrap;
          font-family: inherit;
          color: var(--text-dim);
          padding: 32px;
          background: var(--bg-secondary);
          border-radius: 24px;
          border: 1px solid var(--glass-border);
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.2);
        }

        .routine-week-row {
          display: flex;
          align-items: center;
          gap: 20px;
          border-bottom: 1px dashed var(--glass-border);
          padding-bottom: 16px;
        }
        .routine-week-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .routine-week-label {
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--primary);
          width: 70px;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }
        .routine-days-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .routine-day-dot {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--glass-border);
          background: var(--bg-deep);
          color: var(--text-dim);
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: inherit;
        }
        .routine-day-dot:hover {
          border-color: var(--primary);
          color: var(--primary);
          transform: translateY(-2px);
        }
        .routine-day-dot.active {
          background: var(--gradient-hero);
          color: white;
          border-color: transparent;
          box-shadow: 0 0 12px var(--primary-glow);
          transform: scale(1.1);
        }
        .routine-day-dot.cleanse-day {
          border-color: rgba(16, 185, 129, 0.3);
          color: #10b981;
        }
        .routine-day-dot.cleanse-day.active {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
        }
        .routine-day-dot.fasting-day {
          border-color: rgba(245, 158, 11, 0.3);
          color: #f59e0b;
        }
        .routine-day-dot.fasting-day.active {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.3);
        }
        .routine-detail-glow {
          position: absolute;
          top: -50px;
          right: -50px;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
          opacity: 0.5;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 1024px) {
          .timeline-connector {
            margin: 0 10px;
          }
          .timeline-node h4 {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 768px) {
          .learn-hero-card {
            flex-direction: column;
          }
          .hero-thumb {
            width: 100%;
            height: 200px;
            border-right: none;
            border-bottom: 1px solid var(--glass-border);
          }
          .hero-info {
            padding: 28px;
          }
          .timeline-section {
            padding: 20px;
          }
          .timeline-track {
            justify-content: flex-start;
            gap: 16px;
          }
          .timeline-connector {
            display: none;
          }
          .routine-week-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          .routine-week-label {
            width: auto;
          }
          .viewer-modal-body { padding: 20px; }
          .viewer-modal-header { padding: 20px 24px; }
          .roadmap-grid { grid-template-columns: 1fr; }
        }
      `}} />
    </div>
  );
};

export default Learn;
