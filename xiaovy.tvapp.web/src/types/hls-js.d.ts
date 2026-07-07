declare module 'hls.js' {
  export interface ErrorData {
    fatal: boolean;
    type: string;
  }

  export default class Hls {
    static Events: {
      ERROR: string;
    };

    static ErrorTypes: {
      NETWORK_ERROR: string;
      MEDIA_ERROR: string;
    };

    static isSupported(): boolean;

    on(event: string, callback: (event: string, data: ErrorData) => void): void;
    loadSource(url: string): void;
    attachMedia(media: HTMLMediaElement): void;
    startLoad(): void;
    recoverMediaError(): void;
    destroy(): void;
  }
}
