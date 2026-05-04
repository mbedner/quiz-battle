import { QRCodeSVG } from 'qrcode.react';

interface Props {
  url: string;
}

export function QRDisplay({ url }: Props) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '12px', padding: '20px',
      background: '#0f172a', borderRadius: '20px',
      border: '2px solid #334155',
    }}>
      <div style={{
        background: '#fff', padding: '12px', borderRadius: '12px',
        display: 'inline-block',
      }}>
        <QRCodeSVG value={url} size={160} />
      </div>
      <p style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', wordBreak: 'break-all', maxWidth: '180px' }}>
        {url}
      </p>
    </div>
  );
}
