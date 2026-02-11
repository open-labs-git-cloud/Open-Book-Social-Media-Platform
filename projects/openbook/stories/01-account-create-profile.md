# Create additional profile on signup

As a logged-in user, I want to create additional profiles under my account (e.g., "Personal", "Photography Page"), so I can post under different identities.

Acceptance criteria:

- UI: "Create profile" button in Account settings.
- Fields: displayName, bio, avatar, visibility (public/private), profileType (personal/page/group).
- Backend: POST /make-server-7c20c7e0/profiles returns profile object.
- The new profile appears in my profiles list immediately.

POPIA notes:
- Collect minimal personal data for profiles. Avoid sensitive fields.

Estimate: 3 pts
