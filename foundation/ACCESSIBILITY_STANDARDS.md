# ACCESSIBILITY_STANDARDS.md
# AI Engineering Commons -- Accessibility Standards for All UI Code Generation
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core + UX Lead + Tech Lead representatives

---

## 1. Purpose

This file defines the accessibility requirements that all agents must apply
when generating, reviewing, or modifying user interface code. Compliance
with WCAG 2.1 Level AA is the minimum standard for all Telia customer-facing
and internal user interfaces.

Referenced by:
- `agents/ACCESSIBILITY_AGENT.md` -- primary enforcement agent
- `agents/CODE_GEN_AGENT.md` -- applies these during UI code generation
- `agents/PEER_REVIEW_AGENT.md` -- checks every UI PR against these standards
- `agents/FEATURE_VALIDATION_AGENT.md` -- includes accessibility in AC execution
- `sdlc/qa/TEST_GEN_GUIDE.md` -- generates accessibility test cases

Non-compliance with BLOCK items prevents merge. WARN items are flagged
for Tech Lead review. All generated UI code is assumed to be customer-facing
at AA level unless the Jira story explicitly states otherwise.

---

## 2. WCAG 2.1 Level AA -- mandatory requirements

WCAG is organised around four principles: Perceivable, Operable,
Understandable, and Robust (POUR). The following requirements are the
subset most commonly violated in generated code and most commonly caught
by automated tooling.

### 2.1 Perceivable

#### 2.1.1 Images and non-text content (1.1.1)

All non-text content must have a text alternative.

```tsx
// FORBIDDEN -- image with no alt text
<img src="/icons/warning.svg" />

// FORBIDDEN -- meaningless alt text
<img src="/icons/warning.svg" alt="image" />

// REQUIRED -- descriptive alt text
<img src="/icons/warning.svg" alt="Warning: your session will expire in 5 minutes" />

// REQUIRED -- decorative images use empty alt (screen reader skips them)
<img src="/background-pattern.svg" alt="" role="presentation" />

// REQUIRED -- icon buttons need accessible label
<button aria-label="Close dialog">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>
```

#### 2.1.2 Colour is not the only means of conveying information (1.4.1)

```tsx
// FORBIDDEN -- colour alone indicates required field
<label style={{ color: 'red' }}>Email address</label>
<input type="email" />

// REQUIRED -- colour plus text indicator
<label>
  Email address
  <span aria-hidden="true" style={{ color: 'red' }}> *</span>
  <span className="sr-only"> (required)</span>
</label>
<input type="email" aria-required="true" />

// FORBIDDEN -- colour alone indicates status
<span style={{ color: 'green' }}>Order confirmed</span>

// REQUIRED -- colour plus icon or text
<span style={{ color: 'green' }}>
  <svg aria-hidden="true">...</svg>
  Order confirmed
</span>
```

#### 2.1.3 Colour contrast (1.4.3 and 1.4.11)

Minimum contrast ratios that agents must apply in all generated UI:

| Element | Minimum contrast ratio | Target |
|---|---|---|
| Normal text (< 18pt) | 4.5:1 | 7:1 |
| Large text (>= 18pt or 14pt bold) | 3:1 | 4.5:1 |
| UI components (borders, icons) | 3:1 | 4.5:1 |
| Placeholder text | 4.5:1 | -- |
| Disabled elements | No requirement | -- |
| Focus indicators | 3:1 against adjacent colours | -- |

Agents must not generate hardcoded colour values that fail these ratios.
Use the design system colour tokens defined in `DESIGN_SYSTEM.md` which
are pre-validated for contrast compliance.

#### 2.1.4 Text spacing (1.4.12)

Generated CSS must not override these properties in a way that causes
content to be lost or clipped:

```css
/* FORBIDDEN -- fixed height that clips content when text spacing changed */
.card {
  height: 120px;
  overflow: hidden;
}

/* REQUIRED -- min-height allows content to grow */
.card {
  min-height: 120px;
}

/* Content must remain readable when user applies:
   - Line height 1.5x font size
   - Letter spacing 0.12x font size
   - Word spacing 0.16x font size
   - Paragraph spacing 2x font size */
```

#### 2.1.5 Audio and video content (1.2.x)

| Content type | Requirement |
|---|---|
| Pre-recorded audio | Transcript required |
| Pre-recorded video with audio | Captions + audio description required |
| Live audio | Real-time captions required |
| Video only (no audio) | Text alternative or audio description |
| Decorative video (no content) | Mark as decorative, no audio |

Agents generating media components must include placeholder structure
for captions and transcripts, flagged with a TODO comment referencing
the content team.

### 2.2 Operable

#### 2.2.1 Keyboard accessibility (2.1.1 and 2.1.2)

All interactive elements must be reachable and operable by keyboard alone.

```tsx
// FORBIDDEN -- click handler on non-interactive element
<div onClick={handleSelect} className="option">
  Select this plan
</div>

// REQUIRED -- use semantic interactive element
<button onClick={handleSelect} className="option">
  Select this plan
</button>

// REQUIRED -- if div is unavoidable (custom component), add full keyboard support
<div
  role="button"
  tabIndex={0}
  onClick={handleSelect}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect();
    }
  }}
  className="option"
>
  Select this plan
</div>
```

No keyboard trap -- users must be able to navigate away from any component
using keyboard alone. Modal dialogs are the most common source of keyboard
traps.

```tsx
// REQUIRED -- modal must trap focus within itself (not on the page)
// and restore focus to trigger element on close
function Modal({ isOpen, onClose, triggerRef, children }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    // Move focus into modal when it opens
    modalRef.current?.focus();

    // Trap focus within modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') trapFocus(e, modalRef.current);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to trigger element when modal closes
      triggerRef.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div role="dialog" aria-modal="true" ref={modalRef} tabIndex={-1}>
      {children}
    </div>
  );
}
```

#### 2.2.2 Skip navigation (2.4.1)

All pages with repeated navigation must include a skip link as the first
focusable element:

```tsx
// REQUIRED -- skip to main content link (visually hidden until focused)
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black"
    >
      Skip to main content
    </a>
  );
}

// Main content area must have matching id
<main id="main-content" tabIndex={-1}>
  ...
</main>
```

#### 2.2.3 Focus visibility (2.4.7 and 2.4.11)

Focus indicators must be visible. Agents must never generate CSS that
removes focus outlines without providing a replacement:

```css
/* FORBIDDEN -- removes focus indicator entirely */
:focus {
  outline: none;
}

button:focus {
  outline: 0;
}

/* REQUIRED -- custom focus indicator that meets 3:1 contrast */
:focus-visible {
  outline: 3px solid #0066CC;
  outline-offset: 2px;
  border-radius: 2px;
}

/* Acceptable -- hide outline for mouse users only, keep for keyboard */
:focus:not(:focus-visible) {
  outline: none;
}
```

#### 2.2.4 Timing (2.2.1)

If the UI includes session timeout or auto-updating content:

```tsx
// REQUIRED -- warn user before session expires with option to extend
function SessionWarning({ timeRemaining, onExtend, onLogout }) {
  return (
    <div role="alertdialog" aria-live="assertive" aria-label="Session expiring">
      <p>Your session will expire in {timeRemaining} minutes.</p>
      <button onClick={onExtend}>Stay logged in</button>
      <button onClick={onLogout}>Log out</button>
    </div>
  );
}
```

Auto-refreshing content must provide a way to pause, stop, or hide the
updates (WCAG 2.2.2).

### 2.3 Understandable

#### 2.3.1 Language declaration (3.1.1)

```html
<!-- REQUIRED -- lang attribute on html element -->
<html lang="no">  <!-- Norwegian -->
<html lang="en">  <!-- English -->
<html lang="sv">  <!-- Swedish -->

<!-- REQUIRED -- mark language changes within content -->
<p>The error message in English is:
  <span lang="en">Order not found</span>
</p>
```

#### 2.3.2 Error identification and description (3.3.1 and 3.3.2)

```tsx
// REQUIRED -- form error handling pattern
function EmailField({ error }: { error?: string }) {
  const fieldId = 'email-field';
  const errorId = 'email-error';

  return (
    <div>
      <label htmlFor={fieldId}>
        Email address
        <span aria-hidden="true"> *</span>
      </label>
      <input
        id={fieldId}
        type="email"
        aria-required="true"
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <span id={errorId} role="alert" className="error-message">
          {error}
        </span>
      )}
    </div>
  );
}
```

Error messages must:
- Identify which field has the error
- Describe what is wrong
- Suggest how to fix it where possible
- Never say only "invalid input" or "error"

```tsx
// FORBIDDEN -- unhelpful error message
"Invalid email"

// REQUIRED -- specific, actionable error message
"Enter a valid email address, for example name@example.com"
```

#### 2.3.3 Labels and instructions (3.3.2)

```tsx
// FORBIDDEN -- placeholder as the only label
<input type="text" placeholder="Enter your name" />

// REQUIRED -- visible label always present
<label htmlFor="name">Full name</label>
<input
  id="name"
  type="text"
  placeholder="For example: Ola Nordmann"
  autoComplete="name"
/>
```

### 2.4 Robust

#### 2.4.1 Valid HTML semantics (4.1.1 and 4.1.2)

```tsx
// FORBIDDEN -- div soup with no semantics
<div class="header">
  <div class="nav">
    <div class="nav-item" onclick="navigate()">Home</div>
  </div>
</div>

// REQUIRED -- semantic HTML
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>

// Semantic element usage agents must follow
// <header>    -- site header or section header
// <nav>       -- navigation landmarks (with aria-label if multiple)
// <main>      -- main content (one per page)
// <aside>     -- complementary content
// <footer>    -- site footer or section footer
// <section>   -- thematic grouping (with aria-label or heading)
// <article>   -- self-contained content
// <h1>-<h6>  -- headings in correct hierarchical order, no skipping levels
```

#### 2.4.2 Status messages (4.1.3)

```tsx
// REQUIRED -- dynamic status messages announced to screen readers
// without moving focus

// For success messages
<div role="status" aria-live="polite">
  {successMessage && <p>{successMessage}</p>}
</div>

// For urgent error messages
<div role="alert" aria-live="assertive">
  {errorMessage && <p>{errorMessage}</p>}
</div>

// For loading states
<div role="status" aria-live="polite" aria-label="Loading">
  {isLoading && <span className="sr-only">Loading, please wait...</span>}
</div>
```

---

## 3. ARIA usage rules

### 3.1 ARIA landmark roles

Every page must have these landmarks, in this order:

```tsx
// Required page landmark structure
<header role="banner">...</header>        // site header
<nav aria-label="Main navigation">...</nav>
<main id="main-content">                  // main content -- one per page
  <nav aria-label="Breadcrumb">...</nav>  // secondary nav gets aria-label
  ...
</main>
<aside aria-label="Related content">...</aside>
<footer role="contentinfo">...</footer>
```

### 3.2 ARIA rules agents must follow

| Rule | Detail |
|---|---|
| No redundant ARIA | `<button role="button">` -- the role is already implied |
| No ARIA on hidden elements | `aria-label` on `display:none` elements confuses screen readers |
| `aria-label` vs `aria-labelledby` | Use `aria-labelledby` when the label is visible text on screen |
| `aria-describedby` for help text | Use for supplementary descriptions, not primary labels |
| `aria-expanded` on toggles | Always set true/false on buttons that show/hide content |
| `aria-selected` on tabs | Required on tab elements in a tablist |
| `aria-current` on navigation | Mark the current page link with `aria-current="page"` |
| `aria-hidden="true"` on decorative elements | Icons, decorative images, duplicate text |

### 3.3 Common ARIA patterns agents must use

```tsx
// Tabs pattern
<div role="tablist" aria-label="Order details">
  <button
    role="tab"
    aria-selected={activeTab === 'summary'}
    aria-controls="panel-summary"
    id="tab-summary"
  >
    Summary
  </button>
  <button
    role="tab"
    aria-selected={activeTab === 'items'}
    aria-controls="panel-items"
    id="tab-items"
  >
    Items
  </button>
</div>
<div
  role="tabpanel"
  id="panel-summary"
  aria-labelledby="tab-summary"
  hidden={activeTab !== 'summary'}
>
  ...
</div>

// Accordion pattern
<button
  aria-expanded={isOpen}
  aria-controls="accordion-content"
  id="accordion-header"
>
  Frequently asked questions
</button>
<div
  id="accordion-content"
  aria-labelledby="accordion-header"
  hidden={!isOpen}
>
  ...
</div>

// Combobox / autocomplete pattern
<label id="search-label">Search products</label>
<input
  role="combobox"
  aria-labelledby="search-label"
  aria-expanded={showSuggestions}
  aria-autocomplete="list"
  aria-controls="suggestions-list"
  aria-activedescendant={activeSuggestionId}
/>
<ul id="suggestions-list" role="listbox">
  {suggestions.map((s) => (
    <li key={s.id} id={`suggestion-${s.id}`} role="option" aria-selected={s.id === activeId}>
      {s.label}
    </li>
  ))}
</ul>
```

---

## 4. Screen reader utility class

All generated UI must have access to a visually-hidden class for
content that should be read by screen readers but not visible:

```css
/* Required utility class -- must be present in global styles */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Becomes visible when focused -- for skip links */
.sr-only.focusable:focus,
.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

---

## 5. Automated testing requirements

### 5.1 Tools agents use for accessibility testing

| Tool | What it catches | When used |
|---|---|---|
| axe-core | WCAG violations, ARIA errors | Unit and integration tests |
| jest-axe | axe-core integration for React | Component test suite |
| Playwright + axe | Full page accessibility scan | E2E test suite |
| eslint-plugin-jsx-a11y | Compile-time accessibility lint | Pre-commit, CI |

### 5.2 Required test patterns

```tsx
// Required -- accessibility test alongside every component test
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

describe('OrderSummary accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <OrderSummary orderId="order-1" onCancel={jest.fn()} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('is keyboard navigable', async () => {
    render(<OrderSummary orderId="order-1" onCancel={jest.fn()} />);
    const cancelButton = screen.getByRole('button', { name: /cancel order/i });
    cancelButton.focus();
    expect(document.activeElement).toBe(cancelButton);
  });
});
```

### 5.3 eslint-plugin-jsx-a11y rules

The following rules must be enabled in `.eslintrc` for all React projects.
Agents must generate compliant code that passes these rules:

```json
{
  "plugins": ["jsx-a11y"],
  "rules": {
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-proptypes": "error",
    "jsx-a11y/aria-unsupported-elements": "error",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/heading-has-content": "error",
    "jsx-a11y/html-has-lang": "error",
    "jsx-a11y/iframe-has-title": "error",
    "jsx-a11y/img-redundant-alt": "error",
    "jsx-a11y/interactive-supports-focus": "error",
    "jsx-a11y/label-has-associated-control": "error",
    "jsx-a11y/no-access-key": "error",
    "jsx-a11y/no-autofocus": "warn",
    "jsx-a11y/no-noninteractive-element-interactions": "error",
    "jsx-a11y/no-static-element-interactions": "error",
    "jsx-a11y/role-has-required-aria-props": "error",
    "jsx-a11y/role-supports-aria-props": "error",
    "jsx-a11y/tabindex-no-positive": "error"
  }
}
```

---

## 6. Accessibility review checklist for agents

| # | Check | Severity |
|---|---|---|
| A01 | All images have appropriate alt text | BLOCK |
| A02 | No `outline: none` without focus-visible replacement | BLOCK |
| A03 | No click handlers on non-interactive elements without keyboard support | BLOCK |
| A04 | All form inputs have associated visible labels | BLOCK |
| A05 | Modal dialogs trap focus and restore on close | BLOCK |
| A06 | Colour is not the only means of conveying information | BLOCK |
| A07 | `lang` attribute present on html element | BLOCK |
| A08 | axe-core passes with no violations | BLOCK |
| A09 | Error messages identify field, describe problem, suggest fix | WARN |
| A10 | Page has skip navigation link | WARN |
| A11 | Heading hierarchy is correct (no skipped levels) | WARN |
| A12 | Page has correct landmark structure | WARN |
| A13 | Dynamic content uses aria-live regions | WARN |
| A14 | ARIA attributes are valid and not redundant | WARN |
| A15 | Colour contrast meets 4.5:1 for normal text | WARN |
| A16 | Focus order is logical and follows visual layout | WARN |
| A17 | Timeout warnings give user option to extend | WARN |
| A18 | eslint-plugin-jsx-a11y has no errors | WARN |

---

## 7. What agents do when they detect a violation

```
ACCESSIBILITY BLOCK -- [Agent Name]

Rule violated: [A0X] -- [Rule name from section 6]
Location: [Component name and line or element]

Issue:
[One sentence description of the accessibility problem]

Impact:
[Who is affected -- e.g. "Screen reader users cannot determine the
purpose of this button because it has no accessible name"]

Required fix:
[Corrected code with example]

WCAG reference: [e.g. WCAG 2.1 Success Criterion 4.1.2]
```

---

## 8. Relationship to other files

| File | Relationship |
|---|---|
| `CODING_STANDARDS.md` | General coding rules -- this file extends them for accessibility |
| `agents/ACCESSIBILITY_AGENT.md` | The agent that enforces this file |
| `agents/PEER_REVIEW_AGENT.md` | Checks A01-A18 checklist on every UI PR |
| `agents/FEATURE_VALIDATION_AGENT.md` | Runs axe-core as part of AC execution |
| `sdlc/qa/TEST_GEN_GUIDE.md` | How the Test Gen agent generates accessibility tests |
| `DESIGN_SYSTEM.md` | Colour tokens pre-validated for contrast compliance |

---

## 9. Version and review

| Attribute | Value |
|---|---|
| File owner | CoE Core + UX Lead + Tech Lead representatives |
| Review cadence | Quarterly |
| Last reviewed | 2025-01 |
| Next review due | 2025-04 |
| Approvers | CoE Lead, UX Lead, Tech Lead representative |
| Change process | PR to ai-engineering-common, 2 CoE approvals required |
| Standards basis | WCAG 2.1 Level AA, EN 301 549 (European accessibility standard) |
