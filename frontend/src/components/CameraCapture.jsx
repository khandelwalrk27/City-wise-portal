import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, StopCircle, RefreshCw, Trash2, CheckCircle2, AlertCircle, Upload } from 'lucide-react';

export default function CameraCapture({ onMediaCaptured, capturedFiles = [] }) {
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [captureMode, setCaptureMode] = useState('photo'); // 'photo' | 'video'
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [cameraError, setCameraError] = useState('');

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Local state for previews & files
  const [items, setItems] = useState([]); // [{ id, type: 'photo'|'video', file, previewUrl }]

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const startCameraStream = async () => {
    setCameraError('');
    try {
      const constraints = {
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' },
        audio: captureMode === 'video'
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access device camera. Please allow camera permissions or use file upload.');
      setCameraActive(false);
    }
  };

  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Capture Photo Snapshot
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const fileName = `camera-photo-${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      const previewUrl = URL.createObjectURL(blob);

      const newItem = { id: Date.now(), type: 'photo', file, previewUrl };
      const updated = [...items, newItem];
      setItems(updated);
      onMediaCaptured(updated.map(i => i.file));
    }, 'image/jpeg', 0.92);
  };

  // Start Recording Video
  const startVideoRecording = () => {
    if (!stream) return;
    recordedChunksRef.current = [];
    try {
      const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4' });
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'video/webm';
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const fileName = `camera-video-${Date.now()}.${ext}`;
        const file = new File([blob], fileName, { type: mimeType });
        const previewUrl = URL.createObjectURL(blob);

        const newItem = { id: Date.now(), type: 'video', file, previewUrl };
        const updated = [...items, newItem];
        setItems(updated);
        onMediaCaptured(updated.map(i => i.file));
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('MediaRecorder error:', err);
      alert('Video recording is not supported in this browser mode.');
    }
  };

  // Stop Recording Video
  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Remove Item
  const removeItem = (id) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    onMediaCaptured(updated.map(i => i.file));
  };

  // Fallback File Picker
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newItems = files.map(file => ({
      id: Date.now() + Math.random(),
      type: file.type.startsWith('video') ? 'video' : 'photo',
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    const updated = [...items, ...newItems];
    setItems(updated);
    onMediaCaptured(updated.map(i => i.file));
  };

  return (
    <div className="space-y-4">
      
      {/* Action Controls & Stream Viewfinder */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Live Camera Evidence Capture</span>
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => { setCaptureMode('photo'); if (cameraActive) startCameraStream(); }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${captureMode === 'photo' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Photo
              </button>
              <button
                type="button"
                onClick={() => { setCaptureMode('video'); if (cameraActive) startCameraStream(); }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${captureMode === 'video' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Video
              </button>
            </div>
          </div>

          {!cameraActive ? (
            <button
              type="button"
              onClick={startCameraStream}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition"
            >
              <Camera className="w-4 h-4" />
              Open Camera
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCameraStream}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              Turn Off Camera
            </button>
          )}
        </div>

        {cameraError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Camera Live Viewfinder Window */}
        {cameraActive && (
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video border border-slate-800 flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Recording HUD */}
            {isRecording && (
              <div className="absolute top-3 left-3 bg-rose-600/90 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                RECORDING ({recordSeconds}s)
              </div>
            )}

            {/* Live Controls Bar */}
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
              {captureMode === 'photo' ? (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="w-14 h-14 rounded-full bg-white hover:bg-slate-200 border-4 border-slate-900 flex items-center justify-center shadow-2xl transition transform active:scale-95"
                >
                  <Camera className="w-6 h-6 text-slate-900" />
                </button>
              ) : !isRecording ? (
                <button
                  type="button"
                  onClick={startVideoRecording}
                  className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 border-4 border-slate-900 flex items-center justify-center shadow-2xl transition transform active:scale-95 text-white"
                >
                  <Video className="w-6 h-6" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopVideoRecording}
                  className="w-14 h-14 rounded-full bg-slate-900 hover:bg-slate-800 border-4 border-rose-600 flex items-center justify-center shadow-2xl transition transform active:scale-95 text-rose-500"
                >
                  <StopCircle className="w-8 h-8" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Fallback File Select Option */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-900">
          <span>Or select file directly from device storage:</span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-lg border border-slate-800 flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            Browse File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

      </div>

      {/* Captured Media Preview Gallery */}
      {items.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Captured Evidence Attachments ({items.length})</span>
            <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Upload
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {items.map(item => (
              <div key={item.id} className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video">
                {item.type === 'video' ? (
                  <video src={item.previewUrl} className="w-full h-full object-cover" />
                ) : (
                  <img src={item.previewUrl} alt="Captured preview" className="w-full h-full object-cover" />
                )}

                <span className="absolute top-1 left-1 bg-slate-900/80 text-[10px] text-slate-300 font-bold px-1.5 py-0.5 rounded uppercase">
                  {item.type}
                </span>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-lg opacity-80 hover:opacity-100 transition"
                  title="Remove media"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
