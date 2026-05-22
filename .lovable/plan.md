## Problem
After signup completes (free or paid), `completeSignup()` in `SignupSteps.tsx` only calls the mock `useUser().signup(userData)` and sets the `pantry_show_welcome` flag. It never calls the real `useAuth().login(email, password)` against `/security/login`, so `AuthContext.user` stays null. As a result the user is not actually authenticated, `Index` redirects to `/signin`, and the dashboard (and welcome modal inside it) is never reached.

The pattern that works is already in `src/pages/SignIn.tsx`: call `useAuth().login(email, password)` (which hits the login endpoint, stores token in localStorage, dispatches `pantry-sync` / `subscription-sync`), then `navigate("/")`.

## Fix — only `src/components/SignupSteps.tsx`

1. Import `useAuth` and `useNavigate`:
   ```ts
   import { useAuth } from "@/contexts/AuthContext";
   import { useLocation, useNavigate } from "react-router-dom";
   ```
   Inside the component:
   ```ts
   const { login } = useAuth();
   const navigate = useNavigate();
   ```

2. Update `completeSignup()` so that, after the subscription endpoint has succeeded and the mock `signup(userData)` runs, it performs the real login and routes into the dashboard:
   ```ts
   const completeSignup = async () => {
     try {
       const userData = { /* unchanged */ };
       await signup(userData); // keep mock user-context bootstrap

       // Flag welcome modal BEFORE navigating so Dashboard's mount effect picks it up
       try { localStorage.setItem("pantry_show_welcome", "1"); } catch {}

       // Real authentication so AuthContext.user is set and routes unlock
       try {
         await login(signupData.email, signupData.password);
         navigate("/", { replace: true });
       } catch (loginErr) {
         console.error("Auto-login after signup failed:", loginErr);
         toast({
           title: "Account created",
           description: "Please sign in to continue.",
           duration: 5000,
         });
         navigate("/signin", { replace: true });
       }
     } catch (error) {
       console.error("Signup completion failed:", error);
     }
   };
   ```

3. No changes needed elsewhere:
   - `handleFreeSubscription` already calls `completeSignup()` after `POST /subscription/{userId}` succeeds.
   - `handlePaymentSuccess` already calls `completeSignup()` after Stripe success — the paid flow uses the same subscription endpoint inside `PaymentForm` (unchanged).
   - `Dashboard` already reads `pantry_show_welcome` on mount and renders `<WelcomeModal />`, so the welcome tutorial appears inside the dashboard after navigation.
   - The incomplete-account branch (user already exists, just finishing profile) still has `signupData.password` from step 1; if they came back without a password we keep the fallback `navigate("/signin")`.

## Out of scope
- No changes to subscription endpoint, RevenueCat, payment flow, or `UserContext.signup`.
- No new translation keys, styling, or routing config changes.

## Verification
- Free plan: complete steps 1→3, pick Free → `POST /subscription/{userId}` → auto `login()` → land on `/` with welcome modal overlayed on dashboard.
- Paid plan: complete Stripe → `handlePaymentSuccess` → same auto-login + navigate.
- Login failure fallback: toast + redirect to `/signin` with email prefilled by existing SignIn behavior.
