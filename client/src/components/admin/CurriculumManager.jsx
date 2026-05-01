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
import { FiPlus, FiTrash2, FiMove, FiType, FiImage, FiVideo, FiFileText, FiChevronDown, FiChevronUp, FiUpload } from 'react-icons/fi';
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

  const getIcon = (type) => {
    switch (type) {
      case 'text': return <FiType />;
      case 'image': return <FiImage />;
      case 'video': return <FiVideo />;
      case 'pdf': return <FiFileText />;
      default: return <FiFileText />;
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check PDF size limit (5MB)
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
    <div ref={setNodeRef} style={style} className="curriculum-item-card">
      <div className="drag-handle" {...attributes} {...listeners}>
        <FiMove />
      </div>
      <div className="item-icon">{getIcon(item.type)}</div>
      <div className="item-content">
        <input
          type="text"
          className="item-title-input"
          value={item.title}
          onChange={(e) => onUpdate(moduleIndex, index, { title: e.target.value })}
          placeholder="Item Title"
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            className="item-url-input"
            value={item.content || ''}
            onChange={(e) => onUpdate(moduleIndex, index, { content: e.target.value })}
            placeholder={item.type === 'text' ? 'Content/Text' : 'URL (YouTube/Image/PDF)'}
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
              <label htmlFor={`file-${id}`} className={`upload-label ${uploading ? 'loading' : ''}`}>
                {uploading ? '...' : <FiUpload />}
              </label>
            </div>
          )}
        </div>
      </div>
      <button type="button" className="btn-icon btn-danger-soft" onClick={() => onRemove(moduleIndex, index)}>
        <FiTrash2 />
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="curriculum-module-card">
      <div className="module-header">
        <div className="drag-handle" {...attributes} {...listeners}>
          <FiMove />
        </div>
        <input
          type="text"
          className="module-title-input"
          value={module.title}
          onChange={(e) => onUpdate(index, { title: e.target.value })}
          placeholder="Module Title (e.g. Chapter 1)"
        />
        <div className="module-actions">
          <button type="button" className="btn-icon" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          <button type="button" className="btn-icon btn-danger-soft" onClick={() => onRemove(index)}>
            <FiTrash2 />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="module-body">
          <div className="items-list">
            <DndContext
              sensors={useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor))}
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
          </div>
          <div className="add-item-actions">
            <button type="button" className="btn btn-xs btn-outline" onClick={() => onAddItem(index, 'video')}><FiVideo /> Video</button>
            <button type="button" className="btn btn-xs btn-outline" onClick={() => onAddItem(index, 'text')}><FiType /> Text</button>
            <button type="button" className="btn btn-xs btn-outline" onClick={() => onAddItem(index, 'image')}><FiImage /> Image</button>
            <button type="button" className="btn btn-xs btn-outline" onClick={() => onAddItem(index, 'pdf')}><FiFileText /> PDF</button>
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
      title: `New ${type}`,
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

  return (
    <div className="curriculum-manager">
      <div className="manager-header">
        <h4>Curriculum Structure</h4>
        <button type="button" className="btn btn-sm btn-primary" onClick={addModule}>
          <FiPlus /> Add Module
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
              <div className="empty-curriculum">
                <p>No curriculum added yet. Click "Add Module" to start.</p>
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
        .curriculum-manager {
          margin-top: 20px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 16px;
          background: var(--bg-secondary);
        }
        .manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .modules-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .curriculum-module-card {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .module-header {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border);
          gap: 10px;
        }
        .drag-handle {
          cursor: grab;
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }
        .module-title-input {
          flex: 1;
          background: transparent;
          border: none;
          font-weight: 600;
          color: var(--text-primary);
          padding: 4px 8px;
        }
        .module-title-input:focus {
          outline: 1px solid var(--accent);
          border-radius: 4px;
        }
        .module-actions {
          display: flex;
          gap: 4px;
        }
        .module-body {
          padding: 12px;
          background: var(--bg-primary);
        }
        .items-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }
        .curriculum-item-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: var(--bg-tertiary);
          border: 1px dashed var(--border);
          border-radius: var(--radius-sm);
        }
        .item-icon {
          color: var(--accent);
          display: flex;
        }
        .item-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .item-title-input {
          background: transparent;
          border: none;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
        }
        .item-url-input {
          background: transparent;
          border: none;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .item-title-input:focus, .item-url-input:focus {
          outline: none;
          color: var(--accent);
        }
        .btn-icon {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        .btn-icon:hover {
          background: var(--border);
          color: var(--text-primary);
        }
        .btn-danger-soft:hover {
          background: #fee2e2;
          color: #ef4444;
        }
        .add-item-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .btn-xs {
          padding: 4px 8px;
          font-size: 0.7rem;
        }
        .empty-curriculum {
          text-align: center;
          padding: 24px;
          color: var(--text-muted);
          border: 1px dashed var(--border);
          border-radius: var(--radius-md);
        }
        .upload-label {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 4px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--accent);
          cursor: pointer;
          transition: all 0.2s;
        }
        .upload-label:hover {
          background: var(--accent);
          color: white;
        }
        .upload-label.loading {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}} />
    </div>
  );
};

export default CurriculumManager;
