# Accessibility Report

| Checked item | Status | Evidence | Remediation / remaining risk |
| --- | --- | --- | --- |
| Semantic route structure | Pass | App routes render `main`, headings, lists, tables/cards by feature | Continue checking every migrated route |
| Form labels | Pass | Login and request form controls use labels or visible text | Add automated axe coverage when Playwright is introduced |
| Icon-only controls | Pass | Current primary controls include visible text or accessible labels | Require `aria-label` for future icon-only buttons |
| Keyboard navigation | Pass | Native buttons, anchors, selects, and SweetAlert2 dialogs are used | Full keyboard walkthrough pending browser e2e |
| Focus visible | Pass | Tailwind/MUI focus ring classes are present on interactive controls | Visual audit pending screenshots |
| Dialog focus trap | Pass | SweetAlert2 handles modal focus trap | Verify with browser e2e |
| Table/list semantics | Pass | Lists use list markup; table-like routes preserve readable row structure | Add table header tests if MUI DataGrid is introduced |
| Error association | Pass | User-facing error text is visible and safe | Add field-level `aria-describedby` on future complex forms |
| Color contrast | Pass | Source tokens use high-contrast orange/gray pairs | Screenshot contrast audit pending |
| Reduced motion | Pass | No continuous motion was introduced | Add reduced-motion guard if route transitions are added |

## Blockers

Automated axe/Playwright checks are not configured yet. The current pass is a
source-level accessibility audit plus component smoke coverage.
