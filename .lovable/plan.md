

# Signup Flow Improvements

## Changes

### 1. Remove OTP step from SignupSteps.tsx
- Remove step 2 (OTP verification) from the `stepItems` array, making it a 4-step flow: Account → Profile → Plan → Payment
- After successful signup API call (step 1), skip directly to profile (new step 2)
- Renumber all step references: step 3→2 (profile), step 4→3 (plan), step 5→4 (payment)
- Remove `handleOTPVerified` function and the OTP rendering block
- Remove import of `OTPVerification`
- Update `onBack` handlers to match new step numbers

### 2. Add missing translation keys in LanguageContext.tsx
Add `signup.ageError.title` and `signup.ageError.description` to all three languages:
- EN: "Age Requirement" / "You must be at least 18 years old to create an account."
- ES: "Requisito de edad" / "Debes tener al menos 18 años para crear una cuenta."
- PT: "Requisito de idade" / "Você deve ter pelo menos 18 anos para criar uma conta."

### 3. Inline form validation with red borders in UserProfileForm.tsx
- Add a `formErrors` state object tracking which fields have errors and their messages
- On submit, validate fields (e.g., birthday for age < 18) and set errors before returning
- Apply `border-red-500` class to invalid inputs conditionally
- Show a red error message `<p>` below each invalid field
- Clear field errors when the user changes the value

### Files Modified
- `src/components/SignupSteps.tsx` — remove OTP step, renumber flow
- `src/contexts/LanguageContext.tsx` — add age error translation keys
- `src/components/UserProfileForm.tsx` — add inline field validation with red styling

