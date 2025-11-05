// components/MediaUploader.jsx
'use client';
import { useState } from 'react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { X, Upload } from 'lucide-react';
import styles from './MediaUploader.module.css';

export function MediaUploader({ media, onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file) => {
    if (!file?.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onUpload(url);
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.uploader}>
      {media ? (
        <div className={styles.preview}>
          <img src={media} alt="" />
          <button onClick={() => onUpload(null)} className={styles.remove}>
            <X size={20} />
          </button>
        </div>
      ) : (
        <div
          className={`${styles.dropzone} ${dragOver ? styles.dragOver : ''}`}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
        >
          <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} className={styles.fileInput} id="upload" />
          <label htmlFor="upload" className={styles.label}>
            {uploading ? 'Uploading...' : <><Upload size={32} /> Drop or click to upload</>}
          </label>
        </div>
      )}
    </div>
  );
}