import { describe, expect, it } from 'vitest';
import { getOldSasUrl, getPublicSasUrl, getSasUrl } from './getSasUrl';

describe('getSasUrl', () => {
  it('新形式の sas.new.url を最優先する', () => {
    const video = {
      sas: { new: { url: 'https://new.example/sas' } },
      sas_url: { new: { key: 'https://legacy.example/sas' } },
      blob_url: 'https://blob.example/video.mp4',
    };
    expect(getSasUrl(video as any)).toBe('https://new.example/sas');
  });

  it('旧形式、文字列、blob_url、空文字の順にフォールバックする', () => {
    expect(getSasUrl({ sas_url: { new: { key: 'legacy-key' } } } as any)).toBe('legacy-key');
    expect(getSasUrl({ sas_url: 'legacy-string' } as any)).toBe('legacy-string');
    expect(getSasUrl({ blob_url: 'blob-url' } as any)).toBe('blob-url');
    expect(getSasUrl({} as any)).toBe('');
  });

  it('公開 URL と古い URL を必要に応じて返す', () => {
    expect(getPublicSasUrl({ sas: { public: { url: 'public-url' } } } as any)).toBe('public-url');
    expect(getPublicSasUrl({} as any)).toBeNull();
    expect(getOldSasUrl({ sas_url: { old: { key: 'old-key' } } } as any)).toBe('old-key');
    expect(getOldSasUrl({ sas_url: 'old-string' } as any)).toBeNull();
  });
});
