import { useState, useRef, useEffect } from 'react';
import { IconPhoto, IconX, IconUpload, IconFolder, IconChevronRight, IconFile, IconKeyboard } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import './ImagePasteArea.css';

// ── Known project assets (src/assets/**) ────────────────────────────────
// We map these statically so the admin can pick images already in the repo.
// When a new image is pushed to GitHub, add the path here or use typed path.
const ASSET_TREE = {
  sofas: [
    { name: 'Zeus.png', path: '/assets/sofas/Zeus.png' },
    { name: 'Chronos.png', path: '/assets/sofas/Chronos.png' },
    { name: 'Organico.png', path: '/assets/sofas/Organico.png' },
    { name: 'RC.png', path: '/assets/sofas/RC.png' },
    { name: 'Roma.png', path: '/assets/sofas/Roma.png' },
    { name: 'Chaise.png', path: '/assets/sofas/Chaise.png' },
  ],
  almofadas: [
    { name: 'azul-royal.png', path: '/assets/almofadas/azul-royal.png' },
    { name: 'bege.png', path: '/assets/almofadas/bege.png' },
    { name: 'black.png', path: '/assets/almofadas/black.png' },
    { name: 'bordô.png', path: '/assets/almofadas/bordô.png' },
    { name: 'cinza-rato.png', path: '/assets/almofadas/cinza-rato.png' },
    { name: 'malve.png', path: '/assets/almofadas/malve.png' },
    { name: 'off-white.png', path: '/assets/almofadas/off-white.png' },
    { name: 'terra.png', path: '/assets/almofadas/terra.png' },
  ],
  travesseiro: [
    { name: 'travesseiro.png', path: '/assets/travesseiro/travesseiro.png' },
  ],
  raiz: [
    { name: 'logo.png', path: '/assets/logo.png' },
    { name: 'logoblack.png', path: '/assets/logoblack.png' },
    { name: 'almofadas_bg.jpeg', path: '/assets/almofadas_bg.jpeg' },
  ],
};

const FOLDER_LABELS = {
  sofas: 'Sofás',
  almofadas: 'Almofadas',
  travesseiro: 'Travesseiro',
  raiz: 'Geral',
};

const ImagePasteArea = ({ images = [], onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [openFolder, setOpenFolder] = useState(null);
  const [typedPath, setTypedPath] = useState('');
  const [showTypedInput, setShowTypedInput] = useState(false);
  const pasteAreaRef = useRef(null);

  // ── Clipboard paste handler ──────────────────────────────────────────
  useEffect(() => {
    const handlePaste = (e) => {
      if (!pasteAreaRef.current?.contains(document.activeElement) &&
        document.activeElement !== pasteAreaRef.current) {
        return;
      }

      e.preventDefault();
      setIsPasting(true);

      const items = e.clipboardData?.items;
      if (!items || items.length === 0) {
        setIsPasting(false);
        return;
      }

      const imagePromises = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            const promise = new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (event) => resolve(event.target.result);
              reader.onerror = () => resolve(null);
              reader.readAsDataURL(file);
            });
            imagePromises.push(promise);
          }
        } else if (item.type === 'text/plain') {
          const promise = new Promise((resolve) => {
            item.getAsString((url) => {
              if (url.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)/i)) {
                resolve(url);
              } else {
                resolve(null);
              }
            });
          });
          imagePromises.push(promise);
        }
      }

      if (imagePromises.length > 0) {
        Promise.all(imagePromises).then((results) => {
          const validImages = results.filter(img => img !== null);
          if (validImages.length > 0) {
            onChange([...images, ...validImages]);
          }
          setTimeout(() => setIsPasting(false), 300);
        });
      } else {
        setTimeout(() => setIsPasting(false), 300);
      }
    };

    const element = pasteAreaRef.current;
    if (element) {
      element.addEventListener('paste', handlePaste);
      return () => element.removeEventListener('paste', handlePaste);
    }
  }, [images, onChange]);

  // ── Drag & drop ──────────────────────────────────────────────────────
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const imagePromises = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const promise = new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });
        imagePromises.push(promise);
      }
    }

    if (imagePromises.length > 0) {
      Promise.all(imagePromises).then((results) => {
        const validImages = results.filter(img => img !== null);
        if (validImages.length > 0) {
          onChange([...images, ...validImages]);
        }
      });
    }
  };

  // ── File select ──────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const imagePromises = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const promise = new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });
        imagePromises.push(promise);
      }
    }

    if (imagePromises.length > 0) {
      Promise.all(imagePromises).then((results) => {
        const validImages = results.filter(img => img !== null);
        if (validImages.length > 0) {
          onChange([...images, ...validImages]);
        }
      });
    }
  };

  const handleRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  // ── Asset browser picks ──────────────────────────────────────────────
  const handleAssetPick = (assetPath) => {
    if (!images.includes(assetPath)) {
      onChange([...images, assetPath]);
    }
    setShowBrowser(false);
    setOpenFolder(null);
  };

  // ── Typed path ───────────────────────────────────────────────────────
  const handleTypedPathAdd = () => {
    let p = typedPath.trim();
    if (!p) return;
    // Ensure it starts with /assets/
    if (!p.startsWith('/')) p = '/' + p;
    if (!p.startsWith('/assets/')) p = '/assets' + p;
    if (!images.includes(p)) {
      onChange([...images, p]);
    }
    setTypedPath('');
    setShowTypedInput(false);
  };

  // ── URL paste ────────────────────────────────────────────────────────
  const handleUrlPaste = (e) => {
    const url = e.target.value.trim();
    if (url && url.match(/^https?:\/\/.+/i)) {
      onChange([...images, url]);
      e.target.value = '';
    }
  };

  return (
    <div className="image-paste-area-container">
      {/* Paste / Drag area */}
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

      {/* Action buttons row */}
      <div className="image-action-buttons">
        <motion.button
          type="button"
          className="image-action-btn"
          onClick={() => { setShowBrowser(!showBrowser); setShowTypedInput(false); }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <IconFolder size={16} stroke={1.8} />
          Escolher do Projeto
        </motion.button>
        <motion.button
          type="button"
          className="image-action-btn"
          onClick={() => { setShowTypedInput(!showTypedInput); setShowBrowser(false); }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <IconKeyboard size={16} stroke={1.8} />
          Digitar Caminho
        </motion.button>
      </div>

      {/* Typed Path Input */}
      <AnimatePresence>
        {showTypedInput && (
          <motion.div
            className="typed-path-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="typed-path-help">
              <p>Digite o caminho relativo à pasta <code>src/assets/</code></p>
              <p className="typed-path-example">Ex: <code>/travesseiro/travesseiro.png</code> → <code>/assets/travesseiro/travesseiro.png</code></p>
            </div>
            <div className="typed-path-row">
              <span className="typed-path-prefix">/assets</span>
              <input
                type="text"
                className="typed-path-input"
                value={typedPath}
                onChange={(e) => setTypedPath(e.target.value)}
                placeholder="/pasta/nome-do-arquivo.png"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleTypedPathAdd(); } }}
              />
              <motion.button
                type="button"
                className="btn-primary typed-path-add-btn"
                onClick={handleTypedPathAdd}
                disabled={!typedPath.trim()}
                whileHover={typedPath.trim() ? { scale: 1.05 } : {}}
                whileTap={typedPath.trim() ? { scale: 0.95 } : {}}
              >
                Adicionar
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Asset Browser */}
      <AnimatePresence>
        {showBrowser && (
          <motion.div
            className="asset-browser"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="asset-browser-header">
              <IconFolder size={16} stroke={1.8} />
              <span>src/assets/</span>
            </div>

            <div className="asset-browser-folders">
              {Object.entries(ASSET_TREE).map(([folder, files]) => (
                <div key={folder} className="asset-folder">
                  <motion.button
                    type="button"
                    className={`asset-folder-btn ${openFolder === folder ? 'open' : ''}`}
                    onClick={() => setOpenFolder(openFolder === folder ? null : folder)}
                    whileHover={{ x: 2 }}
                  >
                    <IconChevronRight
                      size={14}
                      stroke={2}
                      className={`folder-chevron ${openFolder === folder ? 'rotated' : ''}`}
                    />
                    <IconFolder size={16} stroke={1.6} />
                    <span>{FOLDER_LABELS[folder] || folder}</span>
                    <span className="folder-count">{files.length}</span>
                  </motion.button>

                  <AnimatePresence>
                    {openFolder === folder && (
                      <motion.div
                        className="asset-file-list"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {files.map((file) => {
                          const isSelected = images.includes(file.path);
                          return (
                            <motion.button
                              type="button"
                              key={file.path}
                              className={`asset-file-btn ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleAssetPick(file.path)}
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <IconFile size={14} stroke={1.6} />
                              <span className="asset-file-name">{file.name}</span>
                              <img
                                src={file.path}
                                alt={file.name}
                                className="asset-file-preview"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                              {isSelected && (
                                <span className="asset-file-check">✓</span>
                              )}
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* URL input */}
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

      {/* Thumbnails */}
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
              {img.startsWith('/assets/') && (
                <div className="image-thumbnail-path">{img}</div>
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
