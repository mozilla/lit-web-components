import type { CSSProperties } from 'react';

const panel: CSSProperties = {
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--border-radius-medium)',
  background: 'var(--background-color-box)',
  color: 'var(--text-color)',
};

export const hero: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-xlarge)',
  flexWrap: 'wrap',
  marginBlock: 'var(--space-large)',
};

export const heroText: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-medium)',
  flex: 1,
  minInlineSize: '320px',
};

// Storybook's docs stylesheet styles `p` directly, so paragraph colour has to
// be set on the element to win over it.
export const heroLede: CSSProperties = {
  margin: 0,
  fontSize: '1.1rem',
  color: 'var(--text-color)',
};

export const heroLinks: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-small)',
  flexWrap: 'wrap',
};

export const sampler: CSSProperties = {
  ...panel,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-medium)',
  padding: 'var(--space-large)',
  // The next heading is markdown, so it only brings Storybook's own ~20px.
  marginBlockEnd: 'var(--space-xlarge)',
};

export const samplerRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-medium)',
  flexWrap: 'wrap',
};

export const caption: CSSProperties = {
  margin: 0,
  fontSize: '0.9rem',
  color: 'var(--text-color)',
};

export const cards: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
  gap: 'var(--space-medium)',
};

export const card: CSSProperties = {
  ...panel,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-xxsmall)',
  padding: 'var(--space-medium)',
  textDecoration: 'none',
};
