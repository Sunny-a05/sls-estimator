# Wizard UI/UX and Code Audit Implementation Plan

This plan documents the findings from the wizard audit and outlines the technical and design changes required to elevate the application to a "premium" standard.

## Proposed Changes

### 1. State Management & Hydration Fixes
#### [MODIFY] [wizard-store.ts](file:///c:/Users/suppa/OneDrive/Desktop/gas_sliced_files/sls-estimator/src/stores/wizard-store.ts)
- Add zustand `persist` middleware to ensure the user's progress is saved in `localStorage` across reloads or crashes.
- Introduce an `isHydrated` or custom hook pattern to avoid initial React Hydration mismatches caused by rendering client-persisted state on the server.
- Add an `isCalculatingFit` boolean to the store to handle the Step 3 feedback.

### 2. Layout & Responsiveness
#### [MODIFY] [SidebarLayout.tsx](file:///c:/Users/suppa/OneDrive/Desktop/gas_sliced_files/sls-estimator/src/components/layout/SidebarLayout.tsx)
- The step tracking indicator disappears on mobile/tablet because the sidebar gets hidden. We will add a slim, horizontal `StepIndicator` to the top of the main layout, visible only on `lg:hidden` breakpoints.

#### [MODIFY] [DimensionInputs.tsx](file:///c:/Users/suppa/OneDrive/Desktop/gas_sliced_files/sls-estimator/src/components/shared/DimensionInputs.tsx)
- Fix the broken mobile forms (3-column cutting off). Change the XYZ layout wrapper from `flex gap-3` to `flex flex-col sm:flex-row gap-3` so inputs stack elegantly on small screens.

### 3. UI/UX Interaction & Polish
#### [MODIFY] [Step3Printer.tsx](file:///c:/Users/suppa/OneDrive/Desktop/gas_sliced_files/sls-estimator/src/components/wizard/Step3Printer.tsx)
- Replace the static "Running fit check..." text with a premium bounding-box or spinner animation.
- Introduce a minimum calculated delay (e.g., 600-800ms) for the fit check to provide standard user feedback that the system is actively working on the background physics calculation.

#### [MODIFY] [WizardShell.tsx](file:///c:/Users/suppa/OneDrive/Desktop/gas_sliced_files/sls-estimator/src/components/wizard/WizardShell.tsx)
- Update the `useEffect` that calculates printer fit to manage the `isCalculatingFit` state with a simulated delay to drastically improve user feedback during Step 3.

#### [MODIFY] [Navbar.tsx](file:///c:/Users/suppa/OneDrive/Desktop/gas_sliced_files/sls-estimator/src/components/layout/Navbar.tsx)
- Hide the "Start Job" call-to-action button when the user is already on the `/wizard` route. This eliminates header redundancy.

#### [MODIFY] [Step2Setup.tsx](file:///c:/Users/suppa/OneDrive/Desktop/gas_sliced_files/sls-estimator/src/components/wizard/Step2Setup.tsx), [WizardSidebar.tsx](file:///c:/Users/suppa/OneDrive/Desktop/gas_sliced_files/sls-estimator/src/components/wizard/WizardSidebar.tsx), etc.
- **Accessibility/Contrast**: Replace `text-gray-muted` (which is #9A9A9A) in form labels with `text-gray` (#6B6B6B) or `text-black/60` to ensure they meet WCAG contrast guidelines against white backgrounds without losing their subtle hierarchy.
- Ensure all interactive chips have an emphatic selected background color with stronger textual contrast (currently `text-red` on a very light red).

## Verification Plan

### Automated Tests
- Since there are no existing unit tests for the components, formatting and structural checks will be verified through `npm run lint` and `npm run build` to ensure no Typescript or Next.js build errors are introduced.

### Manual Verification
- We will run `npm run dev` and navigate to `http://localhost:3000/wizard` with the browser subagent (or ask the user to view it).
- **Test 1**: Refresh the page mid-way through the wizard. Expect inputs to persist.
- **Test 2**: View the page at a 375px mobile viewport. Expect XYZ inputs to stack and a mobile step indicator to appear at the top.
- **Test 3**: Proceed to Step 3. Expect a brief loading animation before printer options appear.
- **Test 4**: Inspect form labels to ensure correct `text-gray` contrast.
