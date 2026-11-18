import { useState, useRef, useEffect, useCallback } from 'react';

export type RecordingState = 'INACTIVE' | 'COUNTDOWN' | 'RECORDING' | 'STOPPED';

interface UseMediaRecorderProps {
  onStartScroll?: () => void;
  onStopScroll?: () => void;
}

export function useMediaRecorder({ onStartScroll, onStopScroll }: UseMediaRecorderProps = {}) {
  const [recordingState, setRecordingState] = useState<RecordingState>('INACTIVE');
  const [countdown, setCountdown] = useState<number>(3);
  const [recordingDurationSec, setRecordingDurationSec] = useState<number>(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [showCameraPreview, setShowCameraPreview] = useState<boolean>(true);
  const [previewOpacity, setPreviewOpacity] = useState<number>(0.25); // Subtle 25% preview behind text
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const durationTimerRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Request WakeLock to prevent iPhone screen from sleeping during recording
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch {
      // Ignore wakeLock errors on unsupported browsers
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  };

  // Initialize or get the user's camera + microphone stream
  const getCameraStream = useCallback(async (): Promise<MediaStream | null> => {
    if (streamRef.current && streamRef.current.active) {
      return streamRef.current;
    }

    try {
      // Request front-facing camera on mobile or default camera on desktop
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;
      setCameraActive(true);
      setHasPermission(true);
      setErrorMessage(null);

      // Attach to preview element if mounted
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }

      return stream;
    } catch (err: any) {
      console.error('Camera/Mic permission error:', err);
      setHasPermission(false);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Camera/Microphone permission was denied. Please allow camera access in your browser settings.'
          : 'Could not connect to camera/microphone.'
      );
      return null;
    }
  }, []);

  // Determine best supported MIME type (mp4 for iOS Safari, webm for desktop Chrome)
  const getSupportedMimeType = (): string => {
    const types = [
      'video/mp4;codecs=avc1,mp4a',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    for (const t of types) {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return '';
  };

  // Start the 3-2-1 countdown before recording starts
  const startRecordingFlow = useCallback(async () => {
    const stream = await getCameraStream();
    if (!stream) return;

    // Attach stream to preview
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = stream;
      videoPreviewRef.current.play().catch(() => {});
    }

    setRecordingState('COUNTDOWN');
    setCountdown(3);

    let currentCount = 3;
    const countdownInterval = setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
      } else {
        clearInterval(countdownInterval);
        // Start actual recording
        executeRecordingStart(stream);
      }
    }, 1000);
  }, [getCameraStream]);

  // Execute recording after countdown
  const executeRecordingStart = (stream: MediaStream) => {
    chunksRef.current = [];
    setRecordingDurationSec(0);

    const mimeType = getSupportedMimeType();
    const options: MediaRecorderOptions = mimeType ? { mimeType } : {};

    try {
      const recorder = new MediaRecorder(stream, options);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const recordedMime = mimeType || 'video/mp4';
        const blob = new Blob(chunksRef.current, { type: recordedMime });
        const url = URL.createObjectURL(blob);
        setRecordedBlobUrl(url);
        setRecordingState('STOPPED');
        releaseWakeLock();
      };

      recorder.start(1000); // Collect chunk every second
      mediaRecorderRef.current = recorder;
      setRecordingState('RECORDING');
      requestWakeLock();

      // Start elapsed timer
      durationTimerRef.current = window.setInterval(() => {
        setRecordingDurationSec((prev) => prev + 1);
      }, 1000);

      // Trigger teleprompter to start scrolling simultaneously!
      onStartScroll?.();
    } catch (err: any) {
      console.error('Failed to start MediaRecorder:', err);
      setErrorMessage('Failed to initialize video recording.');
      setRecordingState('INACTIVE');
    }
  };

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    releaseWakeLock();

    // Trigger teleprompter to pause scrolling
    onStopScroll?.();
  }, [onStopScroll]);

  // Dismiss / close review modal
  const dismissReview = useCallback(() => {
    if (recordedBlobUrl) {
      URL.revokeObjectURL(recordedBlobUrl);
      setRecordedBlobUrl(null);
    }
    setRecordingState('INACTIVE');
    setRecordingDurationSec(0);
  }, [recordedBlobUrl]);

  // Download recorded video file
  const downloadRecording = useCallback(() => {
    if (!recordedBlobUrl) return;
    const isMp4 = getSupportedMimeType().includes('mp4');
    const filename = `speech_take_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_')}.${isMp4 ? 'mp4' : 'webm'}`;

    const a = document.createElement('a');
    a.href = recordedBlobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [recordedBlobUrl]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      releaseWakeLock();
    };
  }, []);

  return {
    recordingState,
    countdown,
    recordingDurationSec,
    recordedBlobUrl,
    cameraActive,
    showCameraPreview,
    previewOpacity,
    hasPermission,
    errorMessage,
    videoPreviewRef,
    setShowCameraPreview,
    setPreviewOpacity,
    getCameraStream,
    startRecordingFlow,
    stopRecording,
    dismissReview,
    downloadRecording,
  };
}
