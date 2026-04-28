# DESIGN_SYSTEM.md
# Foundation -- Telia design system standards for AI-generated UI code
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core + UX Lead
#
# This file is read by:
#   - Code Gen Agent (A09) -- UI code generation uses these tokens and patterns
#   - Accessibility Agent (A19) -- verifies colour tokens are design system compliant
#   - Peer Review Agent (A27) -- checks UI code uses approved tokens
#   - Frontend patterns reference this file for component examples

---

## 1. Overview

Telia uses a design system based on design tokens for all customer-facing
and internal UI. AI-generated UI code must use these tokens -- never
hardcode hex colours, font sizes, or spacing values.

Design system documentation (full reference):
https://telia-company.atlassian.net/wiki/spaces/DESIGN/pages/design-system

Figma component library:
https://www.figma.com/file/telia-design-system (requires Figma access)

---

## 2. Colour tokens

Use CSS custom properties (design tokens) -- never hardcode hex values.

### 2.1 Brand colours

```css
/* Primary brand */
--color-brand-purple:         #990AE3;  /* Telia purple -- primary action */
--color-brand-purple-dark:    #7A08B5;  /* Hover state */
--color-brand-purple-light:   #E8CCFA;  /* Background tints */

/* Secondary */
--color-brand-black:          #222222;
--color-brand-white:          #FFFFFF;
--color-brand-deep-purple:    #29003E;  /* Dark backgrounds */
```

### 2.2 Semantic colour tokens

```css
/* Use these in components -- not the raw brand colours */

/* Interactive */
--color-action-primary:       var(--color-brand-purple);
--color-action-primary-hover: var(--color-brand-purple-dark);
--color-action-secondary:     transparent;

/* Status */
--color-status-success:       #008A27;
--color-status-success-light: #E8F5EB;
--color-status-warning:       #C06400;
--color-status-warning-light: #FDF1E1;
--color-status-error:         #B00020;
--color-status-error-light:   #FDECEE;
--color-status-info:          #0C5FA5;
--color-status-info-light:    #E8F0FA;

/* Text */
--color-text-primary:         #222222;
--color-text-secondary:       #5C5C5C;
--color-text-disabled:        #999999;
--color-text-on-dark:         #FFFFFF;
--color-text-link:            var(--color-brand-purple);

/* Surfaces */
--color-surface-default:      #FFFFFF;
--color-surface-subtle:       #F9F9F9;
--color-surface-dark:         var(--color-brand-deep-purple);

/* Borders */
--color-border-default:       #CCCCCC;
--color-border-focus:         var(--color-brand-purple);
--color-border-error:         var(--color-status-error);
```

### 2.3 Contrast compliance

All text must meet WCAG 2.1 AA contrast:
- Normal text (< 18px): 4.5:1 minimum
- Large text (>= 18px or 14px bold): 3:1 minimum

Pre-validated safe combinations:
```
--color-text-primary on --color-surface-default:  14.7:1  PASS
--color-text-secondary on --color-surface-default: 6.3:1  PASS
--color-brand-purple on --color-surface-default:   4.8:1  PASS (large text only)
--color-text-on-dark on --color-surface-dark:     15.1:1  PASS
```

Do NOT use purple text on white for body text -- it only passes for
large text (18px+). The Accessibility Agent (A19) flags this automatically.

---

## 3. Typography tokens

```css
/* Font families */
--font-family-heading: 'Syne', 'Helvetica Neue', Arial, sans-serif;
--font-family-body:    'DM Sans', 'Helvetica Neue', Arial, sans-serif;
--font-family-mono:    'JetBrains Mono', 'Courier New', monospace;

/* Type scale -- use these sizes only */
--font-size-xs:   0.75rem;   /* 12px */
--font-size-sm:   0.875rem;  /* 14px */
--font-size-base: 1rem;      /* 16px */
--font-size-lg:   1.125rem;  /* 18px */
--font-size-xl:   1.25rem;   /* 20px */
--font-size-2xl:  1.5rem;    /* 24px */
--font-size-3xl:  1.875rem;  /* 30px */
--font-size-4xl:  2.25rem;   /* 36px */

/* Line heights */
--line-height-tight:  1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;

/* Font weights */
--font-weight-regular: 400;
--font-weight-medium:  500;
--font-weight-bold:    700;
```

---

## 4. Spacing tokens

All spacing uses a 4px base grid.

```css
--space-0:   0;
--space-1:   0.25rem;  /* 4px */
--space-2:   0.5rem;   /* 8px */
--space-3:   0.75rem;  /* 12px */
--space-4:   1rem;     /* 16px */
--space-5:   1.25rem;  /* 20px */
--space-6:   1.5rem;   /* 24px */
--space-8:   2rem;     /* 32px */
--space-10:  2.5rem;   /* 40px */
--space-12:  3rem;     /* 48px */
--space-16:  4rem;     /* 64px */
--space-20:  5rem;     /* 80px */
--space-24:  6rem;     /* 96px */
```

---

## 5. Component standards

### 5.1 Buttons

```tsx
/* Primary button */
<button
  type="button"
  className="btn btn-primary"
  style={{
    backgroundColor: 'var(--color-action-primary)',
    color: 'var(--color-text-on-dark)',
    padding: 'var(--space-3) var(--space-6)',
    borderRadius: '4px',
    fontFamily: 'var(--font-family-body)',
    fontSize: 'var(--font-size-base)',
    fontWeight: 'var(--font-weight-medium)',
    border: 'none',
    cursor: 'pointer',
  }}
>
  {label}
</button>

/* Secondary button */
<button
  type="button"
  style={{
    backgroundColor: 'transparent',
    color: 'var(--color-action-primary)',
    border: '2px solid var(--color-action-primary)',
    padding: 'var(--space-3) var(--space-6)',
    borderRadius: '4px',
  }}
>
  {label}
</button>
```

### 5.2 Form inputs

```tsx
<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
  <label
    htmlFor={id}
    style={{
      fontSize: 'var(--font-size-sm)',
      fontWeight: 'var(--font-weight-medium)',
      color: 'var(--color-text-primary)',
    }}
  >
    {label}
  </label>
  <input
    id={id}
    type={type}
    style={{
      padding: 'var(--space-3) var(--space-4)',
      border: `1px solid var(--color-border-default)`,
      borderRadius: '4px',
      fontSize: 'var(--font-size-base)',
      color: 'var(--color-text-primary)',
    }}
    aria-describedby={error ? `${id}-error` : undefined}
    aria-invalid={!!error}
  />
  {error && (
    <span
      id={`${id}-error`}
      role="alert"
      style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-status-error)' }}
    >
      {error}
    </span>
  )}
</div>
```

### 5.3 Status indicators

```tsx
/* Do NOT use colour alone to indicate status (A06 accessibility rule) */
/* Always combine colour + icon or colour + text */

const StatusBadge = ({ status }: { status: 'success' | 'warning' | 'error' | 'info' }) => {
  const config = {
    success: { bg: '--color-status-success-light', text: '--color-status-success', label: 'Success' },
    warning: { bg: '--color-status-warning-light', text: '--color-status-warning', label: 'Warning' },
    error:   { bg: '--color-status-error-light',   text: '--color-status-error',   label: 'Error' },
    info:    { bg: '--color-status-info-light',     text: '--color-status-info',    label: 'Info' },
  }[status];

  return (
    <span style={{
      backgroundColor: `var(${config.bg})`,
      color: `var(${config.text})`,
      padding: 'var(--space-1) var(--space-3)',
      borderRadius: '12px',
      fontSize: 'var(--font-size-sm)',
      fontWeight: 'var(--font-weight-medium)',
    }}>
      {config.label}
    </span>
  );
};
```

---

## 6. CSS custom property setup

Add to your project's global CSS or index.css:

```css
:root {
  /* Brand */
  --color-brand-purple:         #990AE3;
  --color-brand-purple-dark:    #7A08B5;
  --color-brand-purple-light:   #E8CCFA;
  --color-brand-black:          #222222;
  --color-brand-deep-purple:    #29003E;

  /* Semantic */
  --color-action-primary:       #990AE3;
  --color-action-primary-hover: #7A08B5;
  --color-status-success:       #008A27;
  --color-status-success-light: #E8F5EB;
  --color-status-warning:       #C06400;
  --color-status-warning-light: #FDF1E1;
  --color-status-error:         #B00020;
  --color-status-error-light:   #FDECEE;
  --color-status-info:          #0C5FA5;
  --color-status-info-light:    #E8F0FA;
  --color-text-primary:         #222222;
  --color-text-secondary:       #5C5C5C;
  --color-text-disabled:        #999999;
  --color-text-on-dark:         #FFFFFF;
  --color-surface-default:      #FFFFFF;
  --color-surface-subtle:       #F9F9F9;
  --color-surface-dark:         #29003E;
  --color-border-default:       #CCCCCC;
  --color-border-focus:         #990AE3;
  --color-border-error:         #B00020;

  /* Typography */
  --font-family-heading: 'Syne', 'Helvetica Neue', Arial, sans-serif;
  --font-family-body:    'DM Sans', 'Helvetica Neue', Arial, sans-serif;
  --font-size-xs:   0.75rem;
  --font-size-sm:   0.875rem;
  --font-size-base: 1rem;
  --font-size-lg:   1.125rem;
  --font-size-xl:   1.25rem;
  --font-size-2xl:  1.5rem;
  --font-weight-regular: 400;
  --font-weight-medium:  500;
  --font-weight-bold:    700;
  --line-height-normal:  1.5;

  /* Spacing */
  --space-1:  0.25rem;
  --space-2:  0.5rem;
  --space-3:  0.75rem;
  --space-4:  1rem;
  --space-6:  1.5rem;
  --space-8:  2rem;
  --space-12: 3rem;
  --space-16: 4rem;
}
```

---

## 7. What AI agents must never do

When generating UI code, agents must never:
- Hardcode hex colour values -- use CSS custom properties
- Use font sizes outside the type scale tokens
- Use spacing values not on the 4px grid
- Use purple text (#990AE3) on white for body text (fails contrast)
- Omit accessible labels on status indicators (colour alone is not enough)
- Generate UI without checking ACCESSIBILITY_STANDARDS.md A01-A18

---

## 8. Version and review

| File owner | CoE Core + UX Lead |
| Review cadence | Quarterly -- sync with Figma design system releases |
| Last reviewed | 2025-01 |
| Next review due | 2025-04 |
| Approvers | UX Lead, CoE Lead |
| Change process | PR with UX Lead approval required |
