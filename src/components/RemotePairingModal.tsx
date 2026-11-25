import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, RefreshCw, Smartphone, Wifi, X } from 'lucide-react';
import { buildRemoteUrl, ConnectionStatus } from '../lib/remoteSync';

interface RemotePairingModalProps {
  open: boolean;
  roomCode: string;
  connectionStatus: ConnectionStatus;
  peerConnected: boolean;
  onClose: () => void;
  onRegenerateCode: () => void;
}

export function RemotePairingModal({
  open,
  roomCode,
  connectionStatus,
  peerConnected,
  onClose,
  onRegenerateCode,
}: RemotePairingModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const remoteUrl = typeof window !== 'undefined' ? buildRemoteUrl(roomCode) : '';

  useEffect(() => {
    if (!open || !remoteUrl) return;
    let active = true;
    QRCode.toDataURL(remoteUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: '#EAE4D8',
        light: '#12110E',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [open, remoteUrl]);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(remoteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  const statusText = peerConnected
    ? 'Телефон подключён — можно листать'
    : connectionStatus === 'connected'
    ? 'Готово к подключению — наведите камеру телефона'
    : connectionStatus === 'error'
    ? 'Нет доступа к сети синхронизации'
    : 'Установка канала связи…';

  return (
    <div
      className="remote-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Подключение пульта с телефона"
      data-hud-control="true"
    >
      <div className="remote-modal-card">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '18px',
          }}
        >
          <div>
            <div className="museum-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={14} /> Пульт с телефона
            </div>
            <h2
              className="display-monumental"
              style={{ fontSize: 'clamp(1.35rem, 2.2vw, 1.9rem)', marginTop: '6px' }}
            >
              УПРАВЛЕНИЕ СО СМАРТФОНА
            </h2>
          </div>

          <button
            type="button"
            className="hud-icon-btn"
            onClick={onClose}
            aria-label="Закрыть окно подключения"
          >
            <X size={15} />
          </button>
        </div>

        <div className="remote-modal-body">
          <div className="remote-qr-box">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR-код для подключения пульта с телефона"
                width={210}
                height={210}
                style={{ display: 'block', border: '1px solid rgba(183, 155, 104, 0.28)' }}
              />
            ) : (
              <div style={{ width: 210, height: 210, background: '#12110E' }} />
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            <p className="museum-caption" style={{ color: 'var(--ink-ivory)' }}>
              Отсканируйте QR-код камерой телефона. На смартфоне откроется пульт с крупными кнопками,
              таймером и текстом доклада — а на этом экране останется чистая презентация.
            </p>

            <div
              style={{
                padding: '10px 14px',
                background: '#11100d',
                border: '1px solid rgba(183, 155, 104, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div>
                <div className="museum-footnote">Код сессии</div>
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.35rem',
                    letterSpacing: '0.16em',
                    color: 'var(--accent-gold)',
                  }}
                >
                  {roomCode}
                </div>
              </div>

              <button
                type="button"
                className="hud-icon-btn"
                onClick={onRegenerateCode}
                title="Сгенерировать новый код"
              >
                <RefreshCw size={13} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.82rem',
                color: peerConnected ? '#b9d49c' : 'var(--accent-gold)',
              }}
            >
              <Wifi size={14} />
              <span>{statusText}</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'auto' }}>
              <button type="button" className="museum-btn" onClick={handleCopy}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
