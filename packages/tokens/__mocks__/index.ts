import tokens from './tokens';

export * from 'infos';

export const getTokens = vi.fn(() => tokens);
export const getSwapTokens = vi.fn(() => tokens);
export const getDisabledTokenActions = vi.fn(() => []);
