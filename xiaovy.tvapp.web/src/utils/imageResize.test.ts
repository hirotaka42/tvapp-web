import { afterEach, describe, expect, it, vi } from 'vitest';
import { resizeImage } from './imageResize';

type ImageSize = { width: number; height: number };

function installImageMocks({ width, height }: ImageSize) {
  class MockFileReader {
    onload: ((event: ProgressEvent<FileReader>) => void) | null = null;

    readAsDataURL() {
      this.onload?.({ target: { result: 'data:image/png;base64,test' } } as ProgressEvent<FileReader>);
    }
  }

  class MockImage {
    onload: (() => void) | null = null;
    width = width;
    height = height;

    set src(_value: string) {
      this.onload?.();
    }
  }

  const drawImage = vi.fn();
  const toBlob = vi.fn((callback: BlobCallback, type?: string) => {
    callback(new Blob(['resized'], { type }));
  });
  const createElement = vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
    if (tagName === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext: () => ({ drawImage }),
        toBlob,
      } as unknown as HTMLCanvasElement;
    }
    return document.createElement(tagName);
  });

  vi.stubGlobal('FileReader', MockFileReader);
  vi.stubGlobal('Image', MockImage);

  return { drawImage, toBlob, createElement };
}

describe('resizeImage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('横長画像は最大幅に合わせてリサイズする', async () => {
    const { drawImage } = installImageMocks({ width: 2000, height: 1000 });
    const file = new File(['image'], 'wide.png', { type: 'image/png' });

    const resized = await resizeImage(file, 1000, 1000);

    expect(resized.name).toBe('wide.png');
    expect(resized.type).toBe('image/png');
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1000, 500);
  });

  it('縦長画像は最大高さに合わせてリサイズする', async () => {
    const { drawImage } = installImageMocks({ width: 800, height: 1600 });
    const file = new File(['image'], 'tall.jpeg', { type: 'image/jpeg' });

    const resized = await resizeImage(file, 1000, 800);

    expect(resized.name).toBe('tall.jpeg');
    expect(resized.type).toBe('image/jpeg');
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 400, 800);
  });

  it('最大サイズ内の画像は元サイズを維持する', async () => {
    const { drawImage } = installImageMocks({ width: 640, height: 480 });
    const file = new File(['image'], 'small.webp', { type: 'image/webp' });

    await resizeImage(file, 1000, 1000);

    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 640, 480);
  });
});
