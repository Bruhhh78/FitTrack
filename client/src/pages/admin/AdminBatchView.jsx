import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { 
  FiChevronDown, FiChevronUp, FiPlayCircle, FiFileText, FiImage, 
  FiVideo, FiArrowLeft, FiClock, FiDownload, FiCheckCircle, FiDownloadCloud,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const getYouTubeID = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const AdminBatchView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    api.get(`/batches/${id}`)
      .then(r => {
        const batchData = r.data.batch;
        setBatch(batchData);
        // Default selection: Prioritize Guide Link
        if (batchData.guideLink) {
          setSelectedItem({ type: 'video', title: 'Program Guide', content: batchData.guideLink });
        } else if (batchData.curriculum?.length > 0) {
          const firstModule = batchData.curriculum[0];
          if (firstModule.items?.length > 0) {
            setSelectedItem(firstModule.items[0]);
          }
        }

        // Always expand first module by default if it exists
        if (batchData.curriculum?.length > 0) {
          setExpandedModules({ 0: true });
        } else if (batchData.guideLink) {
          setExpandedModules({ 0: true });
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load batch details');
        setLoading(false);
      });
  }, [id]);

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

  const renderContent = () => {
    if (!selectedItem) return (
        <div className="empty-content-state">
            <FiPlayCircle size={48} />
            <p>Select a curriculum item to preview its content.</p>
        </div>
    );

    switch (selectedItem.type) {
      case 'video':
        const ytId = getYouTubeID(selectedItem.content);
        return (
          <div className="content-viewer">
            <div className="content-header">
                <span className="badge badge-warning">Video Preview</span>
                <h2>{selectedItem.title}</h2>
            </div>
            <div className="video-wrapper">
              {ytId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title={selectedItem.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="error-placeholder">Invalid YouTube URL: {selectedItem.content}</div>
              )}
            </div>
          </div>
        );
      case 'text':
        return (
          <div className="content-viewer text-view">
            <div className="content-header">
                <span className="badge badge-teal">Text Sheet Preview</span>
                <h2>{selectedItem.title}</h2>
            </div>
            <div className="text-body">{selectedItem.content}</div>
          </div>
        );
      case 'image':
        return (
          <div className="content-viewer">
            <div className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <span className="badge badge-success">Image Preview</span>
                    <h2>{selectedItem.title}</h2>
                </div>
                <button onClick={() => handleDownload(selectedItem.content, `${selectedItem.title}.jpg`)} className="btn btn-secondary btn-sm">
                    <FiDownload /> Download Original
                </button>
            </div>
            <div className="image-wrapper">
              <img src={selectedItem.content} alt={selectedItem.title} />
            </div>
          </div>
        );
      case 'pdf':
        return (
          <div className="content-viewer">
            <div className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <span className="badge badge-secondary">PDF Preview</span>
                    <h2>{selectedItem.title}</h2>
                </div>
                <button onClick={() => handleDownload(selectedItem.content, `${selectedItem.title}.pdf`)} className="btn btn-secondary btn-sm">
                    <FiDownload /> Download PDF
                </button>
            </div>
            <div className="pdf-viewer-container" style={{ height: '700px', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <iframe 
                src={`${selectedItem.content}#toolbar=0&navpanes=0&scrollbar=0`} 
                title={selectedItem.title} 
                style={{ width: '100%', height: '100%', border: 'none' }}
              ></iframe>
            </div>
          </div>
        );
      default: return null;
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!batch) return <div className="error-page">Batch not found</div>;

  return (
    <div className="learn-page-v2 admin-view">
      <div className="container py-12">
        <div className="admin-top-nav mb-8">
           <span className="badge badge-warning">ADMIN PREVIEW MODE</span>
        </div>

        {/* TOP HERO CARD */}
        <div className="learn-hero-card fade-in">
          <div className="hero-thumb">
            {batch.thumbnailUrl ? <img src={batch.thumbnailUrl} alt="" /> : <div className="thumb-placeholder">FitTrack</div>}
          </div>
          <div className="hero-info">
            <div className="badge-row">
              <span className="badge badge-teal">{batch.durationType} Program</span>
              <span className="badge badge-success">Active</span>
              <span className="meta-item"><FiClock /> {batch.duration} {batch.durationType}</span>
            </div>
            <h1>{batch.title}</h1>
            <p>{batch.description?.substring(0, 160)}...</p>
            <div className="hero-footer">
               <div className="instructor-info">
                  {batch.createdBy?.avatar ? (
                    <img src={batch.createdBy.avatar} alt={batch.createdBy.name} className="avatar" style={{ border: '2px solid rgba(255,255,255,0.2)' }} />
                  ) : (
                    <div className="avatar avatar-placeholder">{batch.createdBy?.name?.[0] || 'A'}</div>
                  )}
                  <span>Instructor: {batch.createdBy?.name || 'Admin'}</span>
               </div>
               <div className="admin-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/admin?tab=curriculum&batchId=${batch._id}`)}>
                    Manage Curriculum
                  </button>
               </div>
            </div>
          </div>
        </div>

        <div className="learn-layout pt-12">
          {/* MAIN PLAYER - 8 COLS */}
          <div className="player-section">
            <div className="card player-card">
              <div className="player-nav">
                <button className="btn btn-secondary btn-sm" onClick={() => {
                   const items = batch.curriculum.flatMap(m => m.items);
                   const idx = items.indexOf(selectedItem);
                   if(idx > 0) setSelectedItem(items[idx-1]);
                }} disabled={!selectedItem}><FiChevronLeft /> Previous</button>
                <span className="item-count">Content Preview</span>
                <button className="btn btn-secondary btn-sm" onClick={() => {
                   const items = batch.curriculum.flatMap(m => m.items);
                   const idx = items.indexOf(selectedItem);
                   if(idx < items.length - 1) setSelectedItem(items[idx+1]);
                }} disabled={!selectedItem}>Next <FiChevronRight /></button>
              </div>
              
              <div className="player-content-area">
                {renderContent()}
              </div>
            </div>
            <button className="btn btn-secondary mt-8" onClick={() => navigate('/admin')}>
              <FiArrowLeft /> Back to Admin Dashboard
            </button>
          </div>

          {/* CURRICULUM SIDEBAR - 4 COLS */}
          <aside className="curriculum-sidebar-v2">
            <div className="card sidebar-card">
              <div className="sidebar-header">
                <h3><FiFileText /> Curriculum Preview</h3>
              </div>
              <div className="sidebar-list">
                {batch.curriculum?.map((module, mIdx) => (
                  <div key={mIdx} className="module-section">
                    <button 
                      className={`module-toggle ${expandedModules[mIdx] ? 'active' : ''}`}
                      onClick={() => setExpandedModules(p => ({...p, [mIdx]: !p[mIdx]}))}
                    >
                      <div className="module-title-group">
                        <span className="module-label">MODULE {mIdx + 1}</span>
                        <h4>{module.title}</h4>
                      </div>
                      {expandedModules[mIdx] ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    
                    {expandedModules[mIdx] && (
                      <div className="module-items-v2">
                        {module.items.map((item, iIdx) => (
                          <div 
                            key={iIdx} 
                            className={`item-link ${selectedItem === item ? 'active' : ''}`}
                            onClick={() => setSelectedItem(item)}
                          >
                            <div className="item-icon-v2">
                              {item.type === 'video' ? <FiVideo /> : item.type === 'pdf' ? <FiFileText /> : <FiImage />}
                            </div>
                            <div className="item-info-v2">
                              <span className="item-type-label">{item.type}</span>
                              <p>{item.title}</p>
                            </div>
                            {selectedItem === item ? <FiCheckCircle className="check-icon" /> : <FiChevronRight className="arrow-icon" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .learn-page-v2 { 
          min-height: 100vh; 
          background: var(--bg-deep); 
          padding-top: calc(var(--navbar-height) + 40px);
          padding-bottom: 120px; 
        }
        .admin-top-nav { display: flex; justify-content: space-between; align-items: center; }
        .learn-hero-card { 
          display: flex; background: var(--gradient-hero); border-radius: var(--radius-xl); 
          overflow: hidden; color: white; box-shadow: var(--shadow-xl); border: 1px solid var(--glass-border);
          margin-bottom: 32px;
        }
        [data-theme="light"] .learn-hero-card { color: #000; }
        .hero-thumb { width: 350px; background: #000; overflow: hidden; }
        .hero-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .thumb-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 2rem; color: var(--accent); }
        .hero-info { flex: 1; padding: 40px; display: flex; flex-direction: column; justify-content: center; gap: 16px; }
        .hero-info h1 { font-size: 2.5rem; font-weight: 900; margin: 0; color: inherit; }
        .hero-info p { color: rgba(255,255,255,0.8); font-size: 1rem; line-height: 1.6; max-width: 800px; }
        [data-theme="light"] .hero-info p { color: rgba(0,0,0,0.7); }
        .badge-row { display: flex; gap: 12px; align-items: center; }
        .hero-info .badge { color: white !important; border: 1px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.2); }
        [data-theme="light"] .hero-info .badge { color: #000 !important; border-color: rgba(0,0,0,0.1); background: rgba(0,0,0,0.05); }
        .meta-item { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: rgba(255,255,255,0.7); }
        [data-theme="light"] .meta-item { color: rgba(0,0,0,0.6); }
        .hero-footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; }
        [data-theme="light"] .hero-footer { border-color: rgba(0,0,0,0.1); }
        .instructor-info { display: flex; align-items: center; gap: 12px; font-size: 0.9rem; font-weight: 600; color: white; }
        [data-theme="light"] .instructor-info { color: #000; }
        .progress-stats { display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; }

        .learn-layout { display: grid; grid-template-columns: 1fr 380px; gap: 32px; }
        .pt-12 { padding-top: 48px; }
        .mt-8 { margin-top: 32px; }
        @media (max-width: 1024px) { .learn-layout { grid-template-columns: 1fr; } }

        .player-card { padding: 0; overflow: hidden; min-height: 600px; display: flex; flex-direction: column; }
        .player-nav { padding: 16px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-secondary); }
        .item-count { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
        .player-content-area { flex: 1; padding: 24px; background: var(--bg-card); }
        
        .video-wrapper { 
          position: relative; 
          padding-bottom: 56.25%; 
          height: 0; 
          border-radius: 16px; 
          overflow: hidden; 
          background: #000; 
          box-shadow: var(--shadow-lg);
          margin-bottom: 24px;
        }
        .video-wrapper iframe {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%; border: 0;
        }
        .content-viewer h2 { font-size: 1.8rem; font-weight: 800; margin-bottom: 20px; color: var(--text-primary); }

        .sidebar-card { padding: 0; display: flex; flex-direction: column; height: calc(100vh - 120px); sticky: top 100px; }
        .sidebar-header { padding: 20px 24px; border-bottom: 1px solid var(--border-color); }
        .sidebar-header h3 { font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
        .sidebar-list { flex: 1; overflow-y: auto; padding-bottom: 20px; }
        .module-section { border-bottom: 1px solid var(--border-color); }
        .module-toggle { 
          width: 100%; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; 
          background: var(--bg-tertiary); cursor: pointer; transition: var(--transition);
        }
        .module-toggle.active { background: var(--bg-secondary); }
        .module-title-group { text-align: left; }
        .module-label { display: block; font-size: 0.65rem; font-weight: 900; color: var(--accent); letter-spacing: 0.1em; margin-bottom: 4px; }
        .module-toggle h4 { font-size: 0.95rem; font-weight: 700; margin: 0; }
        
        .module-items-v2 { padding: 8px; }
        .item-link { 
          padding: 12px 16px; border-radius: var(--radius-md); display: flex; align-items: center; gap: 14px; 
          cursor: pointer; transition: var(--transition); margin-bottom: 4px; border-left: 3px solid transparent;
        }
        .item-link:hover { background: var(--bg-tertiary); }
        .item-link.active { background: var(--accent-light); border-color: var(--accent); }
        .item-icon-v2 { width: 36px; height: 36px; border-radius: 8px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: var(--accent); }
        .item-link.active .item-icon-v2 { background: var(--accent); color: white; }
        .item-info-v2 { flex: 1; }
        .item-type-label { display: block; font-size: 0.65rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px; }
        .item-info-v2 p { font-size: 0.85rem; font-weight: 600; margin: 0; }
        .check-icon { color: var(--success); }
        .arrow-icon { color: var(--text-muted); font-size: 0.8rem; }

        .text-body { background: var(--bg-secondary); padding: 32px; border-radius: 12px; line-height: 1.8; font-size: 1.1rem; white-space: pre-wrap; color: var(--text-main); }
        .image-wrapper img { width: 100%; border-radius: 12px; border: 1px solid var(--border-color); }
        .empty-content-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); gap: 16px; }

        /* Mobile Specifics */
        @media (max-width: 768px) {
          .learn-hero-card { flex-direction: column; }
          .hero-thumb { width: 100%; height: 200px; }
          .hero-info { padding: 24px; }
          .hero-info h1 { font-size: 1.8rem; }
          .hero-footer { flex-direction: column; align-items: flex-start; gap: 16px; }
          .admin-actions { width: 100%; }
          .admin-actions button { width: 100%; }
          .player-nav { flex-direction: column; gap: 12px; padding: 16px; }
          .player-nav button { width: 100%; }
          .sidebar-card { height: auto; sticky: static; }
          .pdf-viewer-container { height: 400px !important; }
          .content-header { flex-direction: column; align-items: flex-start !important; gap: 12px; }
          .content-header button { width: 100%; }
        }
      `}} />
    </div>
  );
};

export default AdminBatchView;
