## Switch analyze-image to multipart/form-data upload

The endpoint now expects `multipart/form-data` with `userId` and a binary `image` file instead of JSON `{ user_id, image: base64 }`. The response shape (`{ jobId }`) and the socket flow are unchanged, so only the upload path needs to be adapted.

### 1. `src/services/pantryService.ts`
- Change `analyzeImageJob` signature to accept a `File | Blob` instead of a base64 string:
  - `analyzeImageJob(userId: string, image: File | Blob, filename?: string) → { jobId }`
- Build a `FormData`:
  - `form.append("userId", userId)`
  - `form.append("image", image, filename ?? (image as File).name ?? "photo.jpg")`
- POST to `${BASE_URL}/meal-plan/analyze-image` with the FormData body.
- Do NOT set `Content-Type` manually — let axios/browser set the correct `multipart/form-data; boundary=…`.
- Keep the `Authorization: Bearer <token>` header when `localStorage.authToken` exists.
- Keep the `jobId` validation and error throw.
- Remove the base64 stripping logic (no longer needed).

### 2. `src/components/AnalyzeImageCapture.tsx`
- Keep the two entry points (Take Photo / Upload Photo) and the preview UX as-is.
- Track the picked `File` in state alongside the data-URL preview:
  - `const [file, setFile] = useState<File | null>(null);`
  - `const [preview, setPreview] = useState<string | null>(null);`
  - In `handleFile`: store the `File` and generate a data-URL only for the `<img>` preview.
- In `handleAnalyze`: call `analyzeImageJob(user.id, file, file.name)` instead of passing the base64 string.
- On "Choose another": reset both `file` and `preview`.

### 3. No changes required
- `src/contexts/AnalyzeImageJobContext.tsx` — socket events, `normalizeIngredients`, and `readyIngredients` flow are unchanged because the response shape is the same.
- `src/components/AnalyzeImageReadyModal.tsx`, `AnalyzeImageJobIndicator.tsx`, `AddIngredientForm.tsx`, `IngredientTracker.tsx`, `App.tsx`, `LanguageContext.tsx` — untouched.

### Technical notes
- Using native `FormData` + `File` keeps the request browser-native; `<input type="file" accept="image/*" capture="environment">` already returns a `File`, which axios sends as binary inside the multipart part — matching the `curl --form 'image=@…'` shape.
- Letting axios infer the `Content-Type` ensures the multipart boundary is correct; manually setting `multipart/form-data` would break the request.
- Auth header behavior, `jobId` handling, and socket subscription stay identical, so the indicator + ready-modal flow continues to work unchanged.

### Files touched
- edit `src/services/pantryService.ts`
- edit `src/components/AnalyzeImageCapture.tsx`
