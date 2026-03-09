import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Download, Settings, Image as ImageIcon, Video, RefreshCw } from 'lucide-react';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Settings
  const [barcodeWidth, setBarcodeWidth] = useState(1000);
  const [barcodeHeight, setBarcodeHeight] = useState(400);
  const [smoothBars, setSmoothBars] = useState(true);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState(false);

  // Refs for elements
  const videoRef = useRef<HTMLVideoElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);

  // Stop processing flag
  const abortControllerRef = useRef<AbortController | null>(null);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFile(droppedFile);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
      setError(null);
      setHasResult(false);
      setProgress(0);

      // Load video src immediately for fast meta fetching
      if (videoRef.current) {
        const url = URL.createObjectURL(selectedFile);
        videoRef.current.src = url;
      }
    } else {
      setError('Please select a valid video file.');
    }
  };

  const generateBarcode = async () => {
    if (!file || !videoRef.current || !hiddenCanvasRef.current || !outputCanvasRef.current) return;

    setIsProcessing(true);
    setHasResult(false);
    setProgress(0);
    setStatusText('Loading video metadata...');
    setError(null);

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const video = videoRef.current;
      const hiddenCanvas = hiddenCanvasRef.current;
      const outputCanvas = outputCanvasRef.current;
      const hiddenCtx = hiddenCanvas.getContext('2d', { willReadFrequently: true });
      const outputCtx = outputCanvas.getContext('2d', { alpha: false });

      if (!hiddenCtx || !outputCtx) throw new Error("Could not initialize canvas context.");

      // Ensure video metadata is loaded
      if (isNaN(video.duration)) {
        await new Promise((resolve) => {
          video.onloadeddata = resolve;
          video.onerror = () => { throw new Error("Video format not supported by the browser."); };
        });
      }

      const duration = video.duration;
      if (!duration) throw new Error("Could not determine video duration.");

      // Setup canvases
      outputCanvas.width = barcodeWidth;
      outputCanvas.height = barcodeHeight;
      outputCtx.fillStyle = '#000';
      outputCtx.fillRect(0, 0, barcodeWidth, barcodeHeight); // Background

      if (smoothBars) {
        // Implementing the literal C# "MagicScaler" 2-pass Average Algorithm:
        // Pass 1: Resize the frame to a width of `barcodeWidth` but a height of *1 pixel*.
        // Pass 2: Resize that 1-pixel high image to the final `barcodeHeight`.
        hiddenCanvas.width = barcodeWidth;
        hiddenCanvas.height = 1;
      }

      // The original script slices the entire frame down to a 1px vertical column.
      // So we can draw the original video frame directly onto a 1px width slice on the main canvas!
      // But actually, it's better to draw it to the output canvas with 1px width directly.
      // E.g., outputCtx.drawImage(video, 0, 0, videoWidth, videoHeight, x, 0, 1, barcodeHeight);

      const numFrames = barcodeWidth;
      const frameInterval = duration / numFrames;

      // Extract frames
      for (let i = 0; i < numFrames; i++) {
        if (signal.aborted) {
          throw new Error("Aborted");
        }

        const targetTime = i * frameInterval;

        setStatusText(`Extracting frame ${i + 1} of ${numFrames}...`);

        await new Promise((resolve, reject) => {
          video.currentTime = targetTime;

          const handleSeeked = () => {
            video.removeEventListener('seeked', handleSeeked);
            video.removeEventListener('error', handleError);
            resolve(true);
          };

          const handleError = () => {
            video.removeEventListener('seeked', handleSeeked);
            video.removeEventListener('error', handleError);
            reject(new Error("Error seeking video."));
          };

          video.addEventListener('seeked', handleSeeked);
          video.addEventListener('error', handleError);
        });

        // Draw directly to output canvas
        if (smoothBars) {
          // Pass 1: Draw the current frame squashed into a 1-pixel high dot on the hidden canvas
          hiddenCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, i, 0, 1, 1);

          // Note: We don't draw to outputCanvas yet. We have to wait for all frames 
          // to be squashed into the hiddenCanvas 1-pixel high line first.
        } else {
          // Normal mode: sample a vertical slice from the frame
          outputCtx.drawImage(
            video,
            0, 0, video.videoWidth, video.videoHeight, // source rect
            i, 0, 1, barcodeHeight // destination rect (slice)
          );
        }

        // Update progress per frame implicitly unblocks UI because of awaits, but we can add a small sleep to ensure smooth UI
        if (i % Math.ceil(numFrames / 100) === 0) {
          setProgress(Math.floor((i / numFrames) * 100));
          // Let the UI render the progress
          await new Promise(r => requestAnimationFrame(r));
        }
      }

      if (smoothBars) {
        // Pass 2: Stretch the completely assembled 1-pixel high image to the full height barcode
        outputCtx.imageSmoothingEnabled = true; // Use CubicSmoother interpolation equivalent
        outputCtx.imageSmoothingQuality = "high";
        outputCtx.drawImage(hiddenCanvas, 0, 0, barcodeWidth, 1, 0, 0, barcodeWidth, barcodeHeight);
      }

      setProgress(100);
      setStatusText('Done!');
      setHasResult(true);

    } catch (err: any) {
      if (err.message !== "Aborted") {
        setError(err.message || 'An error occurred during processing.');
        console.error(err);
      }
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const cancelProcessing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setStatusText('Cancelled.');
    }
  };

  const removeFile = () => {
    if (isProcessing) cancelProcessing();
    setFile(null);
    setHasResult(false);
    setProgress(0);
    if (videoRef.current) {
      videoRef.current.src = "";
    }
  };

  const downloadImage = () => {
    if (!outputCanvasRef.current) return;

    // Use toBlob instead of toDataURL to safely handle massive resolutions 
    // without crashing the browser or hitting data URI limits.
    outputCanvasRef.current.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${file?.name.replace(/\.[^/.]+$/, "") || "movie"}-barcode.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Movie Barcode</h1>
        <p>A beautiful visual timeline of your favorite film's color palette</p>
      </header>

      <main className="main-content">
        <aside className="controls-panel glass-panel">
          <div className="control-group" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <Settings size={20} /> Settings
            </h3>

            <div className="control-group">
              <label>
                Barcode Width
                <span>{barcodeWidth}px</span>
              </label>
              <input
                type="range"
                min="100"
                max="3000"
                step="10"
                value={barcodeWidth}
                onChange={(e) => setBarcodeWidth(Number(e.target.value))}
                disabled={isProcessing}
              />
            </div>

            <div className="control-group" style={{ marginTop: '1rem' }}>
              <label>
                Barcode Height
                <span>{barcodeHeight}px</span>
              </label>
              <input
                type="range"
                min="50"
                max="1000"
                step="10"
                value={barcodeHeight}
                onChange={(e) => setBarcodeHeight(Number(e.target.value))}
                disabled={isProcessing}
              />
            </div>

            <div className="toggle-group" style={{ marginTop: '1.5rem' }}>
              <label htmlFor="smooth-toggle" style={{ margin: 0, cursor: 'pointer' }}>Smooth Bars (Blur)</label>
              <label className="toggle-switch">
                <input
                  id="smooth-toggle"
                  type="checkbox"
                  checked={smoothBars}
                  onChange={(e) => setSmoothBars(e.target.checked)}
                  disabled={isProcessing}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {!file ? (
            <div
              className={`dropzone ${isDragging ? 'active' : ''}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <input
                id="fileInput"
                type="file"
                accept="video/*"
                className="hidden-video"
                onChange={onFileSelect}
              />
              <UploadCloud className="dropzone-icon" />
              <div className="dropzone-text">Drop your movie file here</div>
              <div className="dropzone-subtext">or click to browse</div>
              {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '0.5rem' }}>{error}</div>}
            </div>
          ) : (
            <div className="control-group" style={{ gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)', padding: '12px', borderRadius: 'var(--radius)' }}>
                <Video className="dropzone-icon" style={{ width: '24px', height: '24px' }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontWeight: 500, fontSize: '0.9rem' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
                {!isProcessing && (
                  <button
                    className="btn-icon"
                    onClick={removeFile}
                    title="Remove file"
                  >
                    &times;
                  </button>
                )}
              </div>

              {isProcessing ? (
                <button className="btn-secondary" onClick={cancelProcessing} style={{ padding: '12px', fontSize: '1.1rem', borderColor: '#ef4444', color: '#ef4444' }}>
                  Cancel
                </button>
              ) : (
                <button className="btn-primary" onClick={generateBarcode} style={{ padding: '12px', fontSize: '1.1rem' }}>
                  <ImageIcon size={20} /> Generate Barcode
                </button>
              )}
              {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
            </div>
          )}
        </aside>

        <section className="preview-container glass-panel">
          <div className="canvas-wrapper">
            {!hasResult && !isProcessing && (
              <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', position: 'absolute' }}>
                <ImageIcon size={48} opacity={0.2} />
                <p>Output preview will appear here</p>
              </div>
            )}

            {/* Hidden Elements used for processing */}
            <video ref={videoRef} className="hidden-video" muted playsInline />
            <canvas ref={hiddenCanvasRef} className="hidden-video" />

            {/* Output Canvas */}
            <canvas
              ref={outputCanvasRef}
              style={{
                display: (hasResult || isProcessing) ? 'block' : 'none',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
              }}
            />
          </div>

          {isProcessing && (
            <div className="progress-container">
              {/* Fixed missing styling issues by adding margin tops manually */}
              <div className="status-text" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>{statusText}</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-bar-bg" style={{ width: '100%', height: '8px', background: 'var(--surface-hover)', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                <div className="progress-bar-fill" style={{ height: '100%', background: 'var(--primary)', transition: 'width 0.1s linear', width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button className="btn-secondary" onClick={downloadImage} disabled={!hasResult || isProcessing}>
              <Download size={18} /> Download Image
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
