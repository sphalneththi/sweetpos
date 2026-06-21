import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  continuous?: boolean; // true = keep scanning, false = close after first scan
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ open, onClose, onScan, continuous = true }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const mountedRef = useRef(true);
  const lastScannedRef = useRef('');
  const containerId = 'barcode-scanner-viewport';

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        // ignore stop errors
      }
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleClose = useCallback(async () => {
    await stopScanner();
    onClose();
  }, [stopScanner, onClose]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!open) return;

    setError('');
    setLastScanned('');
    setScanCount(0);
    lastScannedRef.current = '';

    // Wait for DOM to be ready
    const timeout = setTimeout(async () => {
      const el = document.getElementById(containerId);
      if (!el) { setError('Scanner container not found'); return; }

      try {
        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 140 }, aspectRatio: 1.5 },
          (decodedText) => {
            if (mountedRef.current) {
              // Prevent duplicate scans of the same barcode within 2 seconds
              if (decodedText === lastScannedRef.current) return;
              lastScannedRef.current = decodedText;
              setLastScanned(decodedText);
              onScan(decodedText);
              setScanCount(c => c + 1);
              if (!continuous) {
                // Single scan mode: stop and close
                stopScanner();
                onClose();
              } else {
                // Reset duplicate prevention after 2s so same item can be scanned again
                setTimeout(() => { lastScannedRef.current = ''; }, 2000);
              }
            }
          },
          () => {} // ignore failures
        );

        if (mountedRef.current) setScanning(true);
      } catch (err: any) {
        if (!mountedRef.current) return;
        const msg = String(err?.message || err || '');
        if (msg.includes('NotAllowed')) {
          setError('Camera access denied. Please allow camera permissions in your browser.');
        } else if (msg.includes('NotFound') || msg.includes('Requested device not found')) {
          setError('No camera found. Please connect a webcam.');
        } else {
          setError(`Camera error: ${msg}`);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
      stopScanner();
    };
  }, [open]); // intentionally minimal deps to avoid re-triggering

  if (!open) return null;

  // Render via portal to avoid z-index issues with parent modals
  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div style={{
        background: 'var(--bg-surface)', borderRadius: 16,
        width: '100%', maxWidth: 440, overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid var(--border-color)',
        }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>📷 Scan Barcode</h2>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Continuously scans — items auto-add to cart
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1, padding: 4 }}
          >✕</button>
        </div>

        {/* Scanner viewport */}
        <div style={{ position: 'relative', background: '#111', minHeight: 260 }}>
          <div id={containerId} style={{ width: '100%' }} />
          {!scanning && !error && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#aaa', fontSize: 13, flexDirection: 'column', gap: 8,
            }}>
              <div style={{ fontSize: 32 }}>📷</div>
              <div>Starting camera…</div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '12px 20px', background: 'var(--color-danger-light)',
            color: 'var(--color-danger)', fontSize: 13, fontWeight: 500,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 12 }}>
            {scanning ? (
              <span style={{ color: 'var(--color-success)' }}>
                🟢 Scanning… {scanCount > 0 && <strong>({scanCount} scanned)</strong>}
              </span>
            ) : error ? (
              <span style={{ color: 'var(--color-danger)' }}>🔴 Error</span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>⏳ Initializing…</span>
            )}
            {lastScanned && (
              <div style={{ marginTop: 4, color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'monospace' }}>
                Last: {lastScanned}
              </div>
            )}
          </div>
          <button className="btn btn-primary" onClick={handleClose} style={{ fontSize: 13, padding: '8px 18px' }}>
            ✓ Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
