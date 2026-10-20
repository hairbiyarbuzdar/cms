# Codex Project Development Rules

These rules apply whenever Codex creates, edits, or redesigns any part of this application, unless the user explicitly overrides a specific rule.

## 1. References Are for Layout Only

Treat screenshots, websites, mockups, and reference designs **strictly as layout references**. You may adapt structure, spacing, positioning, section order, navigation, and responsive layout. **Never copy reference colors, fonts, branding, shadows, or visual theme.** Always preserve the project's own design system.

**Rule: Reference = layout. Our project = theme.**

## 2. Single Source of Truth: `global.css`

Keep all shared design tokens in `global.css`: colors, typography, spacing, radii, shadows, and related design values. Before adding a token, check whether a suitable token already exists. Never scatter hardcoded HEX, RGB, HSL, or arbitrary Tailwind color values across components.

Forbidden:

```jsx
<div className="bg-[#4888d8] text-[#ffffff] border-[#dddddd]" />
```

Preferred: semantic Tailwind utilities backed by global tokens:

```jsx
<div className="bg-primary text-primary-foreground border-border" />
```

Example global theme tokens (initial examples only; preserve existing values when present):

```css
:root {
  --color-primary: #4888d8;
  --color-primary-hover: #3675c5;
  --color-primary-foreground: #ffffff;
  --color-background: #ffffff;
  --color-surface: #f5f9ff;
  --color-text: #111827;
  --color-text-muted: #64748b;
  --color-border: #e2e8f0;
  --color-success: #16a34a;
  --color-warning: #f59e0b;
  --color-danger: #dc2626;
  --radius-card: 12px;
  --radius-input: 8px;
  --shadow-card: 0 4px 16px rgb(0 0 0 / 6%);
}
```

Map semantic Tailwind utilities to these variables using the project's actual Tailwind version (v3 config or v4 CSS theme). Do not assume one version's configuration works in the other. Do not use arbitrary color utilities or inline color styles as workarounds.

## 3. Modular, Reusable Components

Do not put the entire website or large features in a single file. Pages should orchestrate reusable components, not contain complex standalone UI implementations.

Suggested structure (adapt to the existing framework and naming conventions):

```text
src/
  app/
    pages/
    routes/
  components/
    ui/            # Button, Input, Select, Card, Table, Badge
    layout/        # Header, Sidebar, Navbar, PageLayout
    modals/        # ConfirmModal, AddPatientModal, EditPatientModal
    forms/         # PatientForm, MedicineForm
    print/         # PrintLayout, PrescriptionPrint, InvoicePrint
    shared/        # SearchBar, LoadingSpinner, EmptyState
  hooks/
  services/
  utils/
  styles/
    global.css
    print.css
  assets/
```

Before creating a component, inspect existing components and reuse them whenever practical. Keep each file focused on a clear responsibility.

## 4. Modals Must Be Separate Files

- Create each distinct modal in its own file under `components/modals/`.
- Reuse a shared base modal/dialog component for consistent styling and behavior.
- Pass data and callbacks through props; keep business logic separate from presentation.
- Support keyboard interaction, focus management, and Escape-to-close where appropriate.
- Never embed a large modal directly inside a page.

```jsx
<AddPatientModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onSave={handleSavePatient}
/>
```

## 5. Invoices, Prescriptions, and Print Layouts

- Every invoice, prescription, receipt, and printable report layout must live in its own component file under `components/print/`.
- Use a shared `PrintLayout` when appropriate and pass dynamic data via props.
- Put print-specific CSS in `print.css`, including `@media print` and `@page` rules.
- Keep print markup out of dashboard and other ordinary page components.
- Hide navigation and interactive controls during printing.
- Handle page size, margins, page breaks, and long content so important information is not clipped.

```jsx
<PrescriptionPrint patient={patient} doctor={doctor} medicines={medicines} />
<InvoicePrint invoice={invoice} />
```

## 6. Forms and State

- Extract complex forms into separate components.
- Reuse shared form fields and consistent validation patterns.
- Keep API calls in services or appropriate data layers rather than presentational components.
- Show loading, empty, success, and error states consistently.
- Avoid duplicating state-handling or validation logic.

## 7. Responsive and Accessible by Default

- Design for mobile, tablet, laptop, and desktop from the beginning.
- Use flexible grids and layouts; avoid fixed widths that overflow.
- Make tables, forms, dialogs, and navigation usable on small screens.
- Maintain readable typography, accessible labels, keyboard navigation, and sensible focus behavior.
- Verify print layouts separately from screen layouts.

## 8. Preserve Existing Project Behavior

Before implementing any request:

1. Inspect the current folder structure and coding conventions.
2. Read `global.css` and existing Tailwind theme configuration.
3. Identify existing reusable components, hooks, and services.
4. Preserve established branding, theme, routing, and working features.
5. Make only the changes required by the request.
6. Check affected pages and components for regressions.

Do not introduce unnecessary dependencies, duplicate components, or rewrite unrelated features.

## 9. Implementation Checklist

For every feature or UI update:

- [ ] Reference used for layout only; project colors and theme preserved.
- [ ] All shared design values are defined in `global.css`.
- [ ] No hardcoded HEX/RGB/HSL or arbitrary Tailwind color classes in components.
- [ ] Existing reusable components checked before creating new ones.
- [ ] Modals extracted into dedicated files.
- [ ] Forms extracted where complex.
- [ ] Invoice, prescription, and print templates extracted into dedicated files.
- [ ] Print-specific styles maintained in `print.css`.
- [ ] Responsive and accessibility behavior considered.
- [ ] Existing functionality preserved and affected features verified.

## 10. Non-Negotiable Principle

**Use the reference's layout, never its theme. Use our global CSS theme everywhere. Build features from small, reusable components. Keep all modals and printable layouts in separate files.**
