import { describe, expect, it } from 'vitest';
import router from './router';

describe('router category routes', () => {
  it('resolves category routes under /c/', () => {
    expect(router.resolve('/c/crypto').name).toBe('category-crypto');
    expect(router.resolve('/c/images-and-videos').name).toBe('category-images-and-videos');
    expect(router.resolve('/c/text').name).toBe('category-text');
  });

  it('keeps tool and unknown routes intact', () => {
    expect(router.resolve('/base64-string-converter').meta.isTool).toBe(true);
    expect(router.resolve('/c/unknown').name).toBe('NotFound');
    expect(router.resolve('/unknown').name).toBe('NotFound');
  });
});
