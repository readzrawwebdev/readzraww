# Architecture rules
- Use Framer Motion scroll values for homepage depth and video seeking, with native reduced-motion fallbacks; this avoids per-frame React rendering and unnecessary dependencies.
- Keep route/section reveal behavior in PageMotion; this gives public and authenticated pages one consistent motion boundary.
- Store served video assets through the project asset pointer flow; this keeps large media outside the source bundle.
- Chat knowledge changes remain server-side and preserve the existing transport; this avoids rebuilding a working chat UI for content-only updates.
- Share order reads through a user-scoped React Query hook and shared payment/status presentation; this keeps transaction references and refreshed records consistent across customer and admin views.
- Confirm destructive actions with accessible dialogs and require returned mutation rows before reporting success; this avoids accidental actions and false success on stale records.