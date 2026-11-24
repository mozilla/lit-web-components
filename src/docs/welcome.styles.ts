import type { CSSProperties } from 'react';

// The docs page is plain MDX rather than a story, so it gets none of
// preview.ts's provider decorator — these lean on the token layer the preview
// loads globally (tokens.css + base.css) and nothing else.

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

export const sampler: CSSProperties = {
  ...panel,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-medium)',
  padding: 'var(--space-large)',
  // The heading that follows only brings Storybook's own ~20px of margin.
  marginBlockEnd: 'var(--space-xlarge)',
};

// Storybook's docs stylesheet styles `p` directly, so the token colour has to
// be set on the element to win over it.
export const caption: CSSProperties = {
  margin: 0,
  fontSize: '0.9rem',
  color: 'var(--text-color)',
};

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

export const samplerRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-medium)',
  flexWrap: 'wrap',
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
