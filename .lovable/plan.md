## Goal
Move the post-signup Welcome tutorial modal **into the Dashboard**, so it appears only on the user's first login right after completing signup (free or paid). Right now `SignupSteps` renders `WelcomeModal` as a fullscreen replacement before the user reaches the dashboard, which interrupts the login → dashboard flow.

## Behavior after change
1. User completes signup (free plan OR paid plan via `subscriptionTypeId` endpoint).
2. `SignupSteps` finishes `signup(...)`, sets a one-time flag, and lets the normal auth flow route the user into `/` (Dashboard).
3. `Dashboard` mounts, detects the flag, and renders `<WelcomeModal />` overlayed on top of the dashboard.
4. When the user closes/finishes the modal, the flag is cleared. Subsequent logins never show the modal again.

## Changes

### 1. `src/components/SignupSteps.tsx`
- Remove the `WelcomeModal` import, the `showWelcome` state, the `handleWelcomeClose` handler, and the `if (showWelcome) return <WelcomeModal .../>` block.
- In `handleSignupComplete` (the function currently calling `setShowWelcome(true)` after `await signup(userData)`), replace that with:
  ```ts
  localStorage.setItem("pantry_show_welcome", "1");
  ```
  Then let the existing auth/redirect flow take the user into the dashboard (no manual navigation change needed — `UserContext.signup` already logs the user in).

### 2. `src/components/Dashboard.tsx`
- Import `WelcomeModal`.
- Add local state `const [showWelcome, setShowWelcome] = useState(false);`.
- In a `useEffect` on mount, check `localStorage.getItem("pantry_show_welcome") === "1"` and, if true, `setShowWelcome(true)`.
- Render `{showWelcome && <WelcomeModal onClose={handleWelcomeClose} />}` at the end of `DashboardContent`'s JSX.
- `handleWelcomeClose` clears the flag (`localStorage.removeItem("pantry_show_welcome")`) and sets `showWelcome(false)`.

### 3. `src/components/WelcomeModal.tsx`
- Currently `handleComplete` does `onClose(); navigate('/')`. Since the modal will already be inside the dashboard, drop the `navigate('/')` call (keep `onClose()`), so closing the modal just dismisses the overlay and leaves the user on the dashboard.
- No visual changes; it already uses a `Dialog` overlay which composes cleanly over the dashboard.

## Out of scope
- No changes to subscription assignment logic, payments, or `subscriptionTypeId` endpoint calls.
- No changes to translations or styling of the modal itself.
- No new "first-login" flag in the backend — `localStorage` is sufficient since the modal is purely a one-time onboarding tutorial.

## Edge cases
- If signup succeeds but the user closes the tab before the dashboard mounts, the flag persists and the modal will show on their next login — acceptable (it is still effectively their first dashboard visit).
- Existing logged-in users won't have the flag set, so they won't see the modal — matches the requested "only during signup's first login" behavior.
