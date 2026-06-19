import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiPlus, FiTrash2, FiMove, FiType, FiImage, FiVideo, FiFileText, FiChevronDown, FiChevronUp, FiUpload, FiMenu, FiBookOpen } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SortableItem = ({ id, index, moduleIndex, item, onRemove, onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getIconDetails = (type) => {
    switch (type) {
      case 'video': return { icon: <FiVideo />, className: 'item-type-video', colorClass: 'badge-purple' };
      case 'text': return { icon: <FiType />, className: 'item-type-text', colorClass: 'badge-blue' };
      case 'image': return { icon: <FiImage />, className: 'item-type-image', colorClass: 'badge-cyan' };
      case 'pdf': return { icon: <FiFileText />, className: 'item-type-pdf', colorClass: 'badge-red' };
      default: return { icon: <FiFileText />, className: 'item-type-pdf', colorClass: 'badge-red' };
    }
  };

  const { icon, className, colorClass } = getIconDetails(item.type);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === 'application/pdf' && file.size > 5 * 1024 * 1024) {
      toast.error('PDF file size should not exceed 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUpdate(moduleIndex, index, { content: data.url });
      toast.success('File uploaded successfully!');
    } catch (err) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={`curriculum-item-card ${className}`}>
      <div className="drag-handle item-drag" {...attributes} {...listeners}>
        <FiMenu size={16} />
      </div>
      <div className="item-icon-container">
        {icon}
      </div>
      <div className="item-content-wrapper">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            className="item-title-input"
            value={item.title}
            onChange={(e) => onUpdate(moduleIndex, index, { title: e.target.value })}
            placeholder="Content Item Title"
          />
          <span className={`curriculum-type-badge ${colorClass}`}>{item.type}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
          <input
            type="text"
            className="item-url-input"
            value={item.content || ''}
            onChange={(e) => onUpdate(moduleIndex, index, { content: e.target.value })}
            placeholder={item.type === 'text' ? 'Enter text content details...' : 'Paste file/media URL or upload file'}
            style={{ flex: 1 }}
          />
          {(item.type === 'image' || item.type === 'pdf') && (
            <div className="file-upload-btn">
              <input 
                type="file" 
                id={`file-${id}`} 
                hidden 
                accept={item.type === 'image' ? 'image/*' : '.pdf'} 
                onChange={handleFileUpload}
              />
              <label htmlFor={`file-${id}`} className={`upload-label ${uploading ? 'loading' : ''}`} title="Upload local file">
                {uploading ? <div className="btn-spinner" /> : <FiUpload size={14} />}
              </label>
            </div>
          )}
        </div>
      </div>
      <button type="button" className="btn-icon btn-danger-soft-curriculum" onClick={() => onRemove(moduleIndex, index)} title="Remove Item">
        <FiTrash2 size={15} />
      </button>
    </div>
  );
};

const SortableModule = ({ id, index, module, onRemove, onUpdate, onAddItem, onRemoveItem, onUpdateItem, onMoveItem }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const [isExpanded, setIsExpanded] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="curriculum-module-card">
      <div className="module-header">
        <div className="drag-handle module-drag" {...attributes} {...listeners} title="Drag to reorder module">
          <FiMove size={16} />
        </div>
        <div className="module-title-section">
          <input
            type="text"
            className="module-title-input"
            value={module.title}
            onChange={(e) => onUpdate(index, { title: e.target.value })}
            placeholder="Module Title (e.g. Week 1 Introduction)"
          />
          <span className="module-item-count">
            {module.items?.length || 0} {module.items?.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <div className="module-actions">
          <button type="button" className="btn-icon header-action-btn" onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? 'Collapse' : 'Expand'}>
            {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </button>
          <button type="button" className="btn-icon btn-danger-soft-curriculum" onClick={() => onRemove(index)} title="Delete Module">
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="module-body">
          <div className="items-list">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => onMoveItem(index, event)}
            >
              <SortableContext
                items={module.items.map((_, i) => `item-${index}-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                {module.items.map((item, itemIdx) => (
                  <SortableItem
                    key={`item-${index}-${itemIdx}`}
                    id={`item-${index}-${itemIdx}`}
                    index={itemIdx}
                    moduleIndex={index}
                    item={item}
                    onRemove={onRemoveItem}
                    onUpdate={onUpdateItem}
                  />
                ))}
              </SortableContext>
            </DndContext>
            {module.items.length === 0 && (
              <div className="empty-module-placeholder">
                <FiBookOpen size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
                <p>This module is empty. Add a content item below to get started.</p>
              </div>
            )}
          </div>
          <div className="add-item-container">
            <span className="add-item-label">Add Content Item:</span>
            <div className="add-item-actions">
              <button type="button" className="add-btn add-btn-video" onClick={() => onAddItem(index, 'video')}><FiVideo size={13} /> Video</button>
              <button type="button" className="add-btn add-btn-text" onClick={() => onAddItem(index, 'text')}><FiType size={13} /> Text</button>
              <button type="button" className="add-btn add-btn-image" onClick={() => onAddItem(index, 'image')}><FiImage size={13} /> Image</button>
              <button type="button" className="add-btn add-btn-pdf" onClick={() => onAddItem(index, 'pdf')}><FiFileText size={13} /> PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CurriculumManager = ({ curriculum = [], onChange }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = parseInt(active.id.split('-')[1]);
      const newIndex = parseInt(over.id.split('-')[1]);
      const newCurriculum = arrayMove(curriculum, oldIndex, newIndex);
      onChange(newCurriculum.map((m, i) => ({ ...m, order: i })));
    }
  };

  const addModule = () => {
    const newModule = {
      title: `New Module ${curriculum.length + 1}`,
      order: curriculum.length,
      items: []
    };
    onChange([...curriculum, newModule]);
  };

  const removeModule = (index) => {
    const newCurriculum = [...curriculum];
    newCurriculum.splice(index, 1);
    onChange(newCurriculum.map((m, i) => ({ ...m, order: i })));
  };

  const updateModule = (index, updates) => {
    const newCurriculum = [...curriculum];
    newCurriculum[index] = { ...newCurriculum[index], ...updates };
    onChange(newCurriculum);
  };

  const addItem = (moduleIndex, type) => {
    const newCurriculum = [...curriculum];
    const newItem = {
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      content: '',
      order: newCurriculum[moduleIndex].items.length
    };
    newCurriculum[moduleIndex].items.push(newItem);
    onChange(newCurriculum);
  };

  const removeItem = (moduleIndex, itemIndex) => {
    const newCurriculum = [...curriculum];
    newCurriculum[moduleIndex].items.splice(itemIndex, 1);
    newCurriculum[moduleIndex].items = newCurriculum[moduleIndex].items.map((it, i) => ({ ...it, order: i }));
    onChange(newCurriculum);
  };

  const updateItem = (moduleIndex, itemIndex, updates) => {
    const newCurriculum = [...curriculum];
    newCurriculum[moduleIndex].items[itemIndex] = { ...newCurriculum[moduleIndex].items[itemIndex], ...updates };
    onChange(newCurriculum);
  };

  const handleItemDragEnd = (moduleIndex, event) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = parseInt(active.id.split('-').pop());
      const newIndex = parseInt(over.id.split('-').pop());
      const newCurriculum = [...curriculum];
      newCurriculum[moduleIndex].items = arrayMove(newCurriculum[moduleIndex].items, oldIndex, newIndex);
      newCurriculum[moduleIndex].items = newCurriculum[moduleIndex].items.map((it, i) => ({ ...it, order: i }));
      onChange(newCurriculum);
    }
  };

  const totalItems = curriculum.reduce((acc, m) => acc + (m.items?.length || 0), 0);

  return (
    <div className="curriculum-manager-container">
      <div className="manager-header">
        <div>
          <h4 className="manager-title">Curriculum Modules</h4>
          <span className="manager-subtitle">{curriculum.length} Modules • {totalItems} Content Items</span>
        </div>
        <button type="button" className="btn btn-sm btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={addModule}>
          <FiPlus size={16} /> Add Module
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={curriculum.map((_, i) => `module-${i}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="modules-list">
            {curriculum.length === 0 && (
              <div className="empty-curriculum-panel">
                <FiBookOpen size={48} className="empty-icon" />
                <h3>No curriculum added yet</h3>
                <p>Start organizing your program's curriculum path by adding a module below.</p>
                <button type="button" className="btn btn-outline" style={{ marginTop: 16 }} onClick={addModule}>
                  <FiPlus /> Add First Module
                </button>
              </div>
            )}
            {curriculum.map((module, index) => (
              <SortableModule
                key={`module-${index}`}
                id={`module-${index}`}
                index={index}
                module={module}
                onRemove={removeModule}
                onUpdate={updateModule}
                onAddItem={addItem}
                onRemoveItem={removeItem}
                onUpdateItem={updateItem}
                onMoveItem={handleItemDragEnd}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <style dangerouslySetInnerHTML={{ __html: `
        .curriculum-manager-container {
          margin-top: 16px;
        }
        .manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          background: var(--bg-card);
          padding: 20px 24px;
          border-radius: var(--radius-md);
          border: 1px solid var(--glass-border);
          box-shadow: var(--shadow-sm);
        }
        .manager-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 1.15rem;
          margin: 0 0 2px 0;
          color: var(--text-main);
        }
        .manager-subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .modules-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .curriculum-module-card {
          background: var(--bg-card);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          overflow: hidden;
          box-shadow: var(--shadow-md);
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .curriculum-module-card:hover {
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
          border-color: rgba(139, 92, 246, 0.25);
        }
        .module-header {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          background: linear-gradient(90deg, rgba(139, 92, 246, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%);
          border-bottom: 1px solid var(--glass-border);
          gap: 16px;
        }
        .module-title-section {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .drag-handle {
          cursor: grab;
          color: var(--text-dim);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.03);
          transition: all 0.2s;
        }
        .drag-handle:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-main);
        }
        .drag-handle:active {
          cursor: grabbing;
          background: var(--primary-subtle);
          color: var(--primary);
        }
        .module-title-input {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid transparent;
          font-weight: 700;
          color: var(--text-main);
          padding: 8px 12px;
          font-family: inherit;
          font-size: 0.95rem;
          border-radius: var(--radius-sm);
          width: 70%;
          max-width: 400px;
          transition: all 0.2s;
        }
        .module-title-input:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .module-title-input:focus {
          background: rgba(0, 0, 0, 0.35);
          border-color: var(--primary);
          outline: none;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
        }
        .module-item-count {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--primary);
          background: var(--primary-subtle);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(139, 92, 246, 0.2);
        }
        .module-actions {
          display: flex;
          gap: 8px;
        }
        .header-action-btn {
          color: var(--text-main) !important;
        }
        .module-body {
          padding: 20px;
          background: rgba(0, 0, 0, 0.08);
        }
        .items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }
        .curriculum-item-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 18px;
          background: var(--bg-deep);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .curriculum-item-card:hover {
          transform: translateX(4px);
          box-shadow: var(--shadow-sm);
        }
        .item-type-video {
          border-left: 4px solid var(--primary);
        }
        .item-type-text {
          border-left: 4px solid var(--info);
        }
        .item-type-image {
          border-left: 4px solid var(--accent);
        }
        .item-type-pdf {
          border-left: 4px solid var(--danger);
        }
        .item-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-main);
        }
        .item-type-video .item-icon-container { color: var(--secondary); background: rgba(139, 92, 246, 0.1); }
        .item-type-text .item-icon-container { color: var(--info); background: rgba(59, 130, 246, 0.1); }
        .item-type-image .item-icon-container { color: var(--accent); background: rgba(6, 182, 212, 0.1); }
        .item-type-pdf .item-icon-container { color: var(--danger); background: rgba(239, 68, 68, 0.1); }

        .item-content-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .item-title-input {
          background: transparent;
          border: none;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-main);
          font-family: inherit;
          padding: 2px 6px;
          border-radius: 4px;
          width: auto;
          min-width: 150px;
          transition: all 0.2s;
        }
        .item-title-input:hover {
          background: rgba(255, 255, 255, 0.04);
        }
        .item-title-input:focus {
          outline: none;
          background: rgba(0, 0, 0, 0.25);
          box-shadow: 0 0 0 2px var(--primary-glow);
        }
        .curriculum-type-badge {
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          border: 1px solid transparent;
        }
        .badge-purple { color: var(--secondary); background: rgba(139, 92, 246, 0.12); border-color: rgba(139, 92, 246, 0.2); }
        .badge-blue { color: var(--info); background: rgba(59, 130, 246, 0.12); border-color: rgba(59, 130, 246, 0.2); }
        .badge-cyan { color: var(--accent); background: rgba(6, 182, 212, 0.12); border-color: rgba(6, 182, 212, 0.2); }
        .badge-red { color: var(--danger); background: rgba(239, 68, 68, 0.12); border-color: rgba(239, 68, 68, 0.2); }

        .item-url-input {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--glass-border);
          border-radius: 6px;
          font-size: 0.78rem;
          color: var(--text-dim);
          font-family: inherit;
          padding: 6px 12px;
          transition: all 0.2s;
        }
        .item-url-input:hover {
          border-color: rgba(255, 255, 255, 0.1);
        }
        .item-url-input:focus {
          outline: none;
          color: var(--text-main);
          border-color: var(--primary);
          background: rgba(0, 0, 0, 0.25);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        .btn-icon {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--glass-border);
          color: var(--text-dim);
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .btn-icon:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-main);
        }
        .btn-danger-soft-curriculum {
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.1);
          color: #fca5a5;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .btn-danger-soft-curriculum:hover {
          background: var(--danger);
          border-color: var(--danger);
          color: #fff;
        }
        .empty-module-placeholder {
          text-align: center;
          padding: 24px;
          color: var(--text-muted);
          border: 1px dashed var(--glass-border);
          border-radius: var(--radius-md);
          font-size: 0.8rem;
        }
        .add-item-container {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--glass-border);
          flex-wrap: wrap;
        }
        .add-item-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-dim);
        }
        .add-item-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .add-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          color: var(--text-dim);
          cursor: pointer;
          transition: all 0.2s;
        }
        .add-btn:hover {
          transform: translateY(-1px);
        }
        .add-btn-video:hover { color: #c084fc; background: rgba(139, 92, 246, 0.08); border-color: rgba(139, 92, 246, 0.3); }
        .add-btn-text:hover { color: #60a5fa; background: rgba(59, 130, 246, 0.08); border-color: rgba(59, 130, 246, 0.3); }
        .add-btn-image:hover { color: #22d3ee; background: rgba(6, 182, 212, 0.08); border-color: rgba(6, 182, 212, 0.3); }
        .add-btn-pdf:hover { color: #f87171; background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.3); }

        .empty-curriculum-panel {
          text-align: center;
          padding: 48px 24px;
          color: var(--text-muted);
          border: 2px dashed var(--glass-border);
          border-radius: var(--radius-md);
          background: var(--bg-card);
        }
        .empty-icon {
          opacity: 0.15;
          margin-bottom: 16px;
          color: var(--primary);
        }
        .empty-curriculum-panel h3 {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 8px;
        }
        .empty-curriculum-panel p {
          max-width: 400px;
          margin: 0 auto;
          font-size: 0.85rem;
        }
        .upload-label {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(6, 182, 212, 0.08);
          border: 1px solid var(--accent-glow);
          color: var(--accent);
          cursor: pointer;
          transition: all 0.2s;
        }
        .upload-label:hover {
          background: var(--accent);
          color: #000;
        }
        .upload-label.loading {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default CurriculumManager;
