# UI patterns

## Patients and registration · 2026-10-20

Sources: `src/components/patients/`, `src/components/forms/patient-form.tsx`,
`src/components/modals/register-patient-modal.tsx`, `src/components/ui/dialog.tsx`.

| Property          | Pattern                                                                     |
| ----------------- | --------------------------------------------------------------------------- |
| Shared navigation | WorkspaceShell with WorkspaceSidebar; active link uses aria-current         |
| Forms             | form-label and form-input; space-y-5; optional fields labelled clearly      |
| Secondary actions | button-secondary: border-border bg-background rounded-lg                    |
| Dialog            | Native dialog, rounded-xl border-border bg-background, max-w-xl, scrollable |
| Dialog spacing    | Header px-6 py-5; form p-6; footer border-t pt-5                            |
| Tables            | dashboard-panel with overflow-x-auto; text-sm, divide-border, px-6 py-5     |
| Feedback          | text-danger field errors; role=alert errors; role=status success            |

## Login and workspace · 2026-10-20

Sources: `src/components/forms/login-form.tsx`, `src/components/shared/sign-out-button.tsx`.

| Property    | Pattern                                                                     |
| ----------- | --------------------------------------------------------------------------- |
| Theme       | Semantic tokens in `src/styles/global.css`, light and dark                  |
| Text        | text-foreground, secondary text-muted, errors text-danger                   |
| Fields      | .form-input: border-border, bg-background, rounded-lg, px-3 py-3            |
| Buttons     | .button-primary: bg-primary, text-primary-foreground, rounded-lg, px-5 py-3 |
| Focus       | Visible 2px primary outline, 2px offset                                     |
| Form rhythm | space-y-5, label/field space-y-2                                            |
| Labels      | text-sm font-medium                                                         |
| Headings    | font-semibold tracking-tight                                                |
| Feedback    | Inline role=alert; pending button copy; disabled during requests            |
| Shadows     | None                                                                        |

## Clinic dashboard · 2026-10-20

Sources: `src/components/dashboard/`.

| Property        | Pattern                                                                     |
| --------------- | --------------------------------------------------------------------------- |
| Page background | bg-surface                                                                  |
| Panels          | .dashboard-panel: rounded-xl border border-border bg-background; no shadows |
| Panel headings  | text-base font-semibold; explanatory copy text-sm text-muted                |
| Panel spacing   | px-6 py-5; layout space-y-7 and gap-7                                       |
| KPIs            | Semantic dl, text-3xl font-semibold tracking-tight tabular-nums             |
| Tables          | text-sm; divide-border; numeric columns text-right tabular-nums             |
| Filter          | Active bg-primary text-primary-foreground; inactive text-muted              |
| Empty states    | font-medium heading and text-sm leading-6 text-muted explanation            |
| Stock status    | Out of stock uses text-danger plus explicit text                            |

## Workspace sidebar ? 2026-10-20

- Shared shell: fixed w-64 sidebar on desktop, md:pl-64 content offset.
- Mobile: native dialog drawer with Menu/Close controls and Escape dismissal.
- Navigation: rounded-lg px-4 py-3, active bg-primary text-primary-foreground; inactive text-muted with surface hover.
- Sidebar: bg-background, border-r border-border, px-4 py-8, account and sign-out at bottom.
- Icons: authored 20px SVG, 1.5px stroke, currentColor.
- Focus: primary outline; skip-to-content link; native dialog focus trapping.

## Patients reference layout · 2026-10-20

Sources: src/components/patients/, src/components/forms/patient-form.tsx.

- Summary cards: dashboard-panel, px-5 py-5; neutral round icon wells, text-2xl count.
- Page rhythm: space-y-5; filters/list gap-5; right panel 21rem at xl breakpoint.
- Compact table: text-xs, px-3 py-3; initials in neutral 8-unit circles.
- Registration panel: p-4, space-y-4; form labels text-xs, inputs min-h-10 text-sm.
- Active status: semantic status-active and status-active-foreground tokens in global.css.
- Mobile registration uses the shared modal and same form, with unique field IDs.
- Summary numbers and status labels carry meaning without relying on color alone.
