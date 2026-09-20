"use client";

import { useState, useRef } from "react";
import {
  ArrowLeft, Plus, X, Trash2, ChevronRight, Paperclip,
  Folder, Briefcase, Code, Terminal, BookOpen, GraduationCap, Lightbulb, Rocket, Star, Heart,
  Home, Globe, Music, Camera, Film, Gamepad2, Palette, PenTool, Pencil, Calculator,
  Calendar, Clock, Coffee, Cpu, Database, Gem, Dumbbell, Flame, Flag, FlaskConical,
  Gift, Hammer, Headphones, Key, Laptop, Leaf, Library, Lock, Mail, Map,
  MessageSquare, Microscope, Mic, Moon, Newspaper, Package, Phone, PieChart, Plane, Puzzle,
  Shield, ShoppingCart, Smile, Sparkles, Stethoscope, Sun, Target, Trophy, Truck, Umbrella,
  User, Users, Utensils, Video, Wallet, Wrench, Zap, Anchor, Apple, Bell,
  Bike, Bookmark, Bug, Building2, Car, Cat, Coins, Compass, Crown, Bot
} from "lucide-react";

// Icon set for the picker. Keys are what gets saved with the project.
export const PROJECT_ICONS = {
  Folder, Briefcase, Code, Terminal, BookOpen, GraduationCap, Lightbulb, Rocket, Star, Heart,
  Home, Globe, Music, Camera, Film, Gamepad2, Palette, PenTool, Pencil, Calculator,
  Calendar, Clock, Coffee, Cpu, Database, Gem, Dumbbell, Flame, Flag, FlaskConical,
  Gift, Hammer, Headphones, Key, Laptop, Leaf, Library, Lock, Mail, Map,
  MessageSquare, Microscope, Mic, Moon, Newspaper, Package, Phone, PieChart, Plane, Puzzle,
  Shield, ShoppingCart, Smile, Sparkles, Stethoscope, Sun, Target, Trophy, Truck, Umbrella,
  User, Users, Utensils, Video, Wallet, Wrench, Zap, Anchor, Apple, Bell,
  Bike, Bookmark, Bug, Building2, Car, Cat, Coins, Compass, Crown, Bot
};

export function ProjectIcon({ name, size = 18, className }) {
  const Cmp = PROJECT_ICONS[name] || Folder;
  return <Cmp size={size} className={className} />;
}

// Project files: text and code only (read on the device, no upload)
const FILE_EXTS = [
  'txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'py', 'js', 'ts', 'jsx', 'tsx',
  'html', 'htm', 'css', 'scss', 'sql', 'xml', 'yaml', 'yml', 'log', 'sh',
  'c', 'cpp', 'h', 'java', 'rs', 'go'
];
const FILE_ACCEPT = FILE_EXTS.map(e => '.' + e).join(',') + ',text/*';
const MAX_FILES = 5;
const MAX_FILE_BYTES = 200 * 1024;
const MAX_STORED_CHARS = 100000;
const MAX_INSTRUCTIONS = 4000;

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProjectsPage({
  projects,
  sessions,
  projectMeta,
  projectFiles,
  onClose,
  onCreate,
  onSaveExisting,
  onDelete,
  notify
}) {
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Folder');
  const [instructions, setInstructions] = useState('');
  const [files, setFiles] = useState([]);
  const [showIcons, setShowIcons] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const openNew = () => {
    setEditingId(null);
    setName('');
    setIcon('Folder');
    setInstructions('');
    setFiles([]);
    setShowIcons(false);
    setView('form');
  };

  const openEdit = (proj) => {
    const meta = projectMeta[proj.id] || {};
    setEditingId(proj.id);
    setName(proj.name || '');
    setIcon(meta.icon || 'Folder');
    setInstructions(meta.instructions || '');
    setFiles(projectFiles[proj.id] || []);
    setShowIcons(false);
    setView('form');
  };

  const closeForm = () => {
    setShowIcons(false);
    setView('list');
  };

  const handleFiles = async (e) => {
    const picked = Array.from(e.target.files || []);
    if (e.target) e.target.value = '';
    if (!picked.length) return;

    if (files.length + picked.length > MAX_FILES) {
      notify(`A project can have up to ${MAX_FILES} files.`);
      return;
    }

    const added = [];
    for (const file of picked) {
      const ext = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
      if (!FILE_EXTS.includes(ext)) {
        notify(`"${file.name}" isn't supported yet. Project files support text and code files for now.`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        notify(`"${file.name}" is bigger than ${Math.round(MAX_FILE_BYTES / 1024)} KB.`);
        continue;
      }
      try {
        const text = await file.text();
        added.push({
          id: 'pf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
          name: file.name,
          size: file.size,
          ext,
          text: text.slice(0, MAX_STORED_CHARS)
        });
      } catch (err) {
        notify(`Couldn't read "${file.name}".`);
      }
    }
    if (added.length) setFiles(prev => [...prev, ...added]);
  };

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      if (editingId) {
        onSaveExisting(editingId, { icon, instructions: instructions.trim(), files });
        setView('list');
      } else {
        const ok = await onCreate({ name: trimmed, icon, instructions: instructions.trim(), files });
        if (ok) setView('list');
      }
    } finally {
      setSaving(false);
    }
  };

  const chatCount = (projId) => sessions.filter(s => s.project_id === projId).length;

  return (
    <div className="pp-page" role="dialog" aria-modal="true">
      {view === 'list' ? (
        <>
          <div className="pp-header">
            <button className="pp-icon-btn" onClick={onClose} aria-label="Back">
              <ArrowLeft size={22} />
            </button>
            <h2 className="pp-title">Projects</h2>
            <button className="pp-icon-btn" onClick={openNew} aria-label="New project">
              <Plus size={24} />
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="pp-empty">
              <div className="pp-empty-circle"><Folder size={28} /></div>
              <h3>Get started by creating a new project</h3>
              <p>Projects help you set common instructions and attach files for conversations.</p>
              <button className="pp-pill-btn" onClick={openNew}>
                <Plus size={18} /> New project
              </button>
            </div>
          ) : (
            <div className="pp-list">
              {projects.map(proj => {
                const meta = projectMeta[proj.id] || {};
                const count = chatCount(proj.id);
                return (
                  <div key={proj.id} className="pp-row">
                    <button className="pp-row-main" onClick={() => openEdit(proj)}>
                      <span className="pp-row-icon"><ProjectIcon name={meta.icon} size={20} /></span>
                      <span className="pp-row-text">
                        <span className="pp-row-name">{proj.name}</span>
                        <span className="pp-row-sub">{count === 1 ? '1 chat' : `${count} chats`}</span>
                      </span>
                      <ChevronRight size={18} className="pp-row-chevron" />
                    </button>
                    <button className="pp-icon-btn pp-danger" onClick={() => onDelete(proj)} aria-label={`Delete ${proj.name}`}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="pp-header">
            <button className="pp-icon-btn" onClick={closeForm} aria-label="Close">
              <X size={24} />
            </button>
            <h2 className="pp-title pp-title-left">{editingId ? 'Edit Project' : 'New Project'}</h2>
            <button
              className={`pp-create-btn ${name.trim() && !saving ? 'ready' : ''}`}
              onClick={submit}
              disabled={!name.trim() || saving}
            >
              {editingId ? 'Save' : 'Create'}
            </button>
          </div>

          <div className="pp-form">
            <div className="pp-name-row">
              <button className="pp-icon-circle" onClick={() => setShowIcons(true)} aria-label="Pick project icon">
                <ProjectIcon name={icon} size={22} />
              </button>
              <input
                className="pp-input"
                type="text"
                placeholder="Project Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                readOnly={!!editingId}
                autoFocus={!editingId}
                maxLength={60}
              />
            </div>

            <label className="pp-label">Project Instructions (Optional)</label>
            <textarea
              className="pp-textarea"
              placeholder="Add instructions about the tone, style, and persona you want Davora to adopt."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              maxLength={MAX_INSTRUCTIONS}
              rows={6}
            />

            <label className="pp-label">Project Files</label>
            <button
              className="pp-file-row"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={files.length >= MAX_FILES}
            >
              <Plus size={20} />
              <span>Upload File</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={FILE_ACCEPT}
              onChange={handleFiles}
              style={{ display: 'none' }}
            />
            {files.map(f => (
              <div key={f.id} className="pp-file-item">
                <Paperclip size={16} />
                <span className="pp-file-name">{f.name}</span>
                <span className="pp-file-size">{formatSize(f.size)}</span>
                <button className="pp-icon-btn pp-small" onClick={() => removeFile(f.id)} aria-label={`Remove ${f.name}`}>
                  <X size={16} />
                </button>
              </div>
            ))}
            <p className="pp-hint">Text and code files only for now (up to {MAX_FILES}). Files are saved on this device.</p>
          </div>

          {showIcons && (
            <>
              <div className="pp-sheet-backdrop" onClick={() => setShowIcons(false)} />
              <div className="pp-sheet" role="dialog" aria-label="Pick new icon">
                <div className="pp-sheet-handle" />
                <div className="pp-sheet-title">
                  <ProjectIcon name={icon} size={18} />
                  <span>Pick new icon</span>
                </div>
                <div className="pp-icon-grid">
                  {Object.keys(PROJECT_ICONS).map(key => (
                    <button
                      key={key}
                      className={`pp-icon-cell ${icon === key ? 'selected' : ''}`}
                      onClick={() => { setIcon(key); setShowIcons(false); }}
                      aria-label={key}
                    >
                      <ProjectIcon name={key} size={22} />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
