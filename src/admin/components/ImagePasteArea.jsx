import { useState, useRef, useEffect } from 'react';
import { IconPhoto, IconX, IconUpload } from '@tabler/icons-react';
import './ImagePasteArea.css';

const ImagePasteArea = ({ images = [], onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const pasteAreaRef = useRef(null);

  useEffect(() => {
    const handlePaste = (e) => {
      if (!pasteAreaRef.current?.contains(document.activeElement) && 
          document.activeElement !== pasteAreaRef.current) {
        return;
      }

      e.preventDefault();
      setIsPasting(true);
      
      const items = e.clipboardData?.items;
      if (!items) return;

      const newImages = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Handle image files
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              newImages.push(event.target.result);
              if (newImages.length === items.length || i === items.length - 1) {
                onChange([...images, ...newImages]);
                setTimeout(() => setIsPasting(false), 300);
              }
            };
            reader.readAsDataURL(file);
          }
        }
        // Handle text URLs
        else if (item.type === 'text/plain') {
          item.getAsString((url) => {
            if (url.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)/i)) {
              newImages.push(url);
              onChange([...images, ...newImages]);
              setTimeout(() => setIsPasting(false), 300);
            }
          });
        }
      }

      if (newImages.length === 0) {
        setTimeout(() => setIsPasting(false), 300);
      }
    };

    const element = pasteAreaRef.current;
    if (element) {
      element.addEventListener('paste', handlePaste);
      return () => element.removeEventListener('paste', handlePaste);
    }
  }, [images, onChange]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (!files) return;

    const newImages = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          newImages.push(event.target.result);
          if (newImages.length === files.length) {
            onChange([...images, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          newImages.push(event.target.result);
          if (newImages.length === files.length) {
            onChange([...images, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleUrlPaste = (e) => {
    const url = e.target.value.trim();
    if (url && url.match(/^https?:\/\/.+/i)) {
      onChange([...images, url]);
      e.target.value = '';
    }
  };

  return (
    <div className="image-paste-area-container">
      <div
        ref={pasteAreaRef}
        className={`image-paste-area ${isDragging ? 'paste-area-dragging' : ''} ${isPasting ? 'paste-area-pasting' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        tabIndex={0}
      >
        <IconPhoto size={48} stroke={1.5} className="paste-area-icon" />
        <div className="paste-area-text">
          <p className="paste-area-title">
            {isPasting ? 'Colando imagem...' : 'Cole, arraste ou clique para adicionar imagens'}
          </p>
          <p className="paste-area-subtitle">
            Ctrl+V para colar • Arraste arquivos • Ou clique para selecionar
          </p>
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="paste-area-input"
          aria-label="Selecionar imagens"
        />
      </div>

      <div className="image-url-input-group">
        <input
          type="text"
          placeholder="Ou cole URL da imagem aqui e pressione Enter"
          className="image-url-input"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleUrlPaste(e);
            }
          }}
        />
      </div>

      {images.length > 0 && (
        <div className="image-thumbnails-grid">
          {images.map((img, index) => (
            <div key={index} className="image-thumbnail-item">
              <img src={img} alt={`Preview ${index + 1}`} className="image-thumbnail" />
              <button
                type="button"
                className="image-thumbnail-remove"
                onClick={() => handleRemove(index)}
                aria-label={`Remover imagem ${index + 1}`}
              >
                <IconX size={14} stroke={2} />
              </button>
              {index === 0 && (
                <div className="image-thumbnail-badge">Principal</div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="image-paste-help">
          <IconUpload size={14} stroke={1.8} />
          <span>{images.length} {images.length === 1 ? 'imagem' : 'imagens'} adicionada{images.length === 1 ? '' : 's'}</span>
        </div>
      )}
    </div>
  );
};

export default ImagePasteArea;
