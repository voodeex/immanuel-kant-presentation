export type RemoteMessage =
  | { type: 'HELLO'; senderId: string; ts: number }
  | { type: 'STATE'; sceneIndex: number; senderId: string; ts: number }
  | { type: 'GOTO'; sceneIndex: number; senderId: string; ts: number }
  | { type: 'NEXT'; senderId: string; ts: number }
  | { type: 'PREV'; senderId: string; ts: number }
  | { type: 'REPLAY'; senderId: string; ts: number }
  | { type: 'PING'; senderId: string; ts: number };

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error';

const TOPIC_PREFIX = 'kant-slide-sync-2026-';
const ROOM_STORAGE_KEY = 'kant-remote-room-id';

function randomToken(len: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(len);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < len; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

export function generateRoomCode(): string {
  return `${randomToken(4)}-${randomToken(4)}`;
}

export function getOrCreateHostRoomCode(): string {
  if (typeof window === 'undefined') return generateRoomCode();
  try {
    const existing = window.sessionStorage.getItem(ROOM_STORAGE_KEY);
    if (existing && /^[A-Z0-9-]{6,16}$/.test(existing)) return existing;
    const created = generateRoomCode();
    window.sessionStorage.setItem(ROOM_STORAGE_KEY, created);
    return created;
  } catch {
    return generateRoomCode();
  }
}

export function regenerateHostRoomCode(): string {
  const created = generateRoomCode();
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(ROOM_STORAGE_KEY, created);
    }
  } catch {
    // ignore storage restrictions on kiosk / smartboard browsers
  }
  return created;
}

export function buildRemoteUrl(roomCode: string): string {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('remote', roomCode);
  return url.toString();
}

export class RemoteSyncClient {
  private roomCode: string;
  private senderId: string;
  private ws: WebSocket | null = null;
  private closed = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private onMessage: (msg: RemoteMessage) => void;
  private onStatus: (status: ConnectionStatus) => void;

  constructor(
    roomCode: string,
    onMessage: (msg: RemoteMessage) => void,
    onStatus: (status: ConnectionStatus) => void
  ) {
    this.roomCode = roomCode.trim().toUpperCase();
    this.senderId = `${Date.now().toString(36)}-${randomToken(5)}`;
    this.onMessage = onMessage;
    this.onStatus = onStatus;
  }

  private get topic(): string {
    return `${TOPIC_PREFIX}${this.roomCode.toLowerCase()}`;
  }

  connect() {
    this.closed = false;
    this.openSocket();
  }

  private openSocket() {
    if (this.closed) return;
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }

    this.onStatus('connecting');
    const wsUrl = `wss://ntfy.sh/${encodeURIComponent(this.topic)}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      this.ws = ws;

      ws.onopen = () => {
        if (this.closed) return;
        this.onStatus('connected');
      };

      ws.onmessage = (event) => {
        if (this.closed) return;
        try {
          const envelope = JSON.parse(String(event.data));
          if (envelope.event !== 'message' || typeof envelope.message !== 'string') return;
          const payload = JSON.parse(envelope.message) as RemoteMessage;
          if (!payload || typeof payload !== 'object' || payload.senderId === this.senderId) {
            return;
          }
          this.onMessage(payload);
        } catch {
          // Ignore malformed or keepalive packets
        }
      };

      ws.onerror = () => {
        if (!this.closed) {
          this.onStatus('reconnecting');
        }
      };

      ws.onclose = () => {
        if (this.closed) return;
        this.onStatus('reconnecting');
        this.scheduleReconnect();
      };
    } catch {
      this.onStatus('error');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.closed) return;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.openSocket();
    }, 2200);
  }

  async send(
    payload:
      | { type: 'HELLO' }
      | { type: 'STATE'; sceneIndex: number }
      | { type: 'GOTO'; sceneIndex: number }
      | { type: 'NEXT' }
      | { type: 'PREV' }
      | { type: 'REPLAY' }
      | { type: 'PING' }
  ): Promise<boolean> {
    if (this.closed) return false;
    const msg: RemoteMessage = {
      ...payload,
      senderId: this.senderId,
      ts: Date.now(),
    };
    try {
      const res = await fetch(`https://ntfy.sh/${encodeURIComponent(this.topic)}`, {
        method: 'POST',
        body: JSON.stringify(msg),
        keepalive: true,
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  disconnect() {
    this.closed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }
    this.onStatus('idle');
  }
}
