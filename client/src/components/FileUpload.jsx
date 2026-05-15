import { useState, useRef, useCallback } from 'react';

export default function FileUpload({ onFilesUploaded, onClose }) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const processFiles = useCallback(async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    setIsLoading(true);
    setStatus('Reading your files…');

    const formData = new FormData();
    Array.from(fileList).forEach(f => formData.append('files', f));

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setStatus(`🎉 Loaded ${data.files.length} file(s)! Sparky is ready!`);
      onFilesUploaded(data.files);
      setTimeout(onClose, 2200);
    } catch (err) {
      setStatus(`❌ ${err.message}. Try again!`);
    } finally {
      setIsLoading(false);
    }
  }, [onFilesUploaded, onClose]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  return (
    <div className="upload-panel" role="dialog" aria-label="Upload learning files">
      <div className="upload-header">
        <h3>📚 Load Learning Files</h3>
        <button className="upload-close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      <div
        className={`drop-zone ${isDragging ? 'drop-zone--active' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDragEnd={() => setIsDragging(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        aria-label="Drop files or click to choose"
      >
        <div className="drop-zone-icon">📄</div>
        <p className="drop-zone-text">Drop files here or click to choose!</p>
        <p className="drop-zone-hint">PDF, TXT, or Markdown files</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.md,.csv"
          style={{ display: 'none' }}
          onChange={(e) => processFiles(e.target.files)}
        />
      </div>

      {isLoading && (
        <div className="upload-loading">
          <div className="upload-spinner" />
          <span>Reading files…</span>
        </div>
      )}

      {status && !isLoading && (
        <p className="upload-status">{status}</p>
      )}
    </div>
  );
}
