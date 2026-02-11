# OpenBook — User Personas and User Stories

Date: 2026-02-11

This document lists potential user types for OpenBook and a first tranche of user stories focused on Account Management and Profile Management (one account → multiple profiles). It also includes acceptance criteria, POPIA considerations, and frontend/backend work items.

## User types / personas

- Standard User (browser): creates posts, comments, likes, follows people/groups
- Guest / Visitor (not logged in): browse public content, preview sign-up
- Promo User (creator): receives payments for content (monetized creator)
- Advertiser — Small Business: buys ad units, targets local audiences
- Advertiser — Medium Business: manages campaigns, billing, creatives
- Advertiser — Large Enterprise: agency-level access, reporting, multi-account
- Page Admin (business/news/political/organization): manages pages, content scheduling
- Community Group Admin / Moderator: manage members, moderate posts
- Journalist / News Organization: publish news posts, subscribe to verification tools
- Political Page Manager: publish political content, adhere to transparency rules
- Platform Admin / Operator: manage infra, content policy enforcement, analytics
- Compliance Officer / Privacy Officer: manage data requests, retention, audit logs
- Content Moderator / Trust & Safety: review reports, escalate content
- Developer / Integrator: uses APIs and integrations (Facebook/TikTok/LinkedIn adapters)
- Third-party Integrations (analytics, cross-posting services, ad networks)
- Accessibility User: uses a11y tools and settings
- Data Processor (on behalf of customers)
- Billing / Finance User: invoicing and revenue reports


## High-level epics

1. Account & Profile Management
2. Content (Text, Photo, Video) — create / upload / edit / delete
3. Social Graph — follows, friends, groups, pages
4. Monetization — promo users, ad inventory, payouts
5. Ads Platform — creatives, targeting, reporting
6. Integrations — cross-posting, social import/export
7. Moderation & Trust & Safety
8. Privacy & Compliance (POPIA) — data requests, retention, consent
9. Admin & Infrastructure — deployment, monitoring, billing


## Epic: Account & Profile Management (priority: P0)

Goal: Provide secure account-level authentication and allow one account to manage multiple profiles (persona profiles). Profiles can be used to post on behalf of different identities (e.g., personal, business, page, community moderator) while the account remains the owner.

### Actors
- Standard User
- Promo User
- Page Admin
- Community Group Admin
- Platform Admin
- Compliance Officer

### User stories

1. As a logged-in user, I want to create additional profiles under my account (e.g., "Personal", "Photography Page"), so I can post under different identities.
   - Acceptance criteria:
     - UI: "Create profile" button in Account settings.
     - Fields: displayName, bio, avatar, visibility (public/private), profileType (personal/page/group).
     - Backend: POST /make-server-7c20c7e0/profiles returns profile object.
     - The new profile appears in my profiles list immediately.

2. As a user, I want to list all profiles under my account, so I can switch between them when creating posts.
   - Acceptance criteria:
     - Backend: GET /make-server-7c20c7e0/profiles returns an array of my profiles.
     - UI: Profiles dropdown in CreatePost and Account settings showing avatars and display names.

3. As a user, I want to edit a profile's display name, bio, avatar, and visibility.
   - Acceptance criteria:
     - Backend: PUT /make-server-7c20c7e0/profiles/:profileId updates profile when owner.
     - UI: Edit profile form with validation; changes persist and are visible across pages.

4. As a user, I want to delete a profile (but not my account) so I can remove unwanted personas.
   - Acceptance criteria:
     - Backend: DELETE /make-server-7c20c7e0/profiles/:profileId removes profile and disassociates it from account.
     - UI: Delete confirmation modal; deletion is reversible only via support (audit log kept).

5. As a user, I want to set a default profile for posting, so the app chooses it when I open the composer.
   - Acceptance criteria:
     - UI: Option in Account settings "Set default profile".
     - Frontend stores default in localStorage and in backend (e.g., user profile record) if available.

6. As a user, I want to see which profile I'm posting from in the CreatePost component.
   - Acceptance criteria:
     - CreatePost shows active profile avatar/name and a dropdown to switch profiles.

7. As a compliance officer, I want to ensure each profile stores minimal personal data and has retention timestamps for audit.
   - Acceptance criteria:
     - Profiles include createdAt and updatedAt fields.
     - Admin APIs can fetch audit logs (implementation later).


## POPIA (South Africa) considerations — implications for Account/Profile management

- Data minimization: only collect necessary fields (displayName, avatar, bio) for public profiles. Sensitive personal data must be avoided or require explicit consent.
- Lawful basis & consent: collect consent for processing personal data where required (e.g., promotional payouts).
- Data localization: for sovereignty goals, recommend storing personal data in a South African region; document mapping of which data is stored in KV vs storage buckets.
- Right to be forgotten / deletion: deleting a profile must remove personal data where feasible and queue records for deletion (or pseudonymize) in logs respecting retention policies.
- Data access requests: build endpoints/process for users to request an export of their account/profile data; Compliance Officer needs tools to process these.
- Audit logs: store immutable audit events (creation/update/delete) for compliance.
- Security: enforce least privilege for endpoints; validate tokens and ensure authenticated access to sensitive endpoints.


## Frontend work items (first sprint)

- UI components to build:
  - AccountSettings page (manage account-level email, password, default profile, connected services)
  - ProfileManager component (list/create/edit/delete profiles)
  - Profiles dropdown in CreatePost (show active profile, switch)
- Integrations with existing `AuthContext` and server functions:
  - Use GET/POST/PUT/DELETE endpoints at `/make-server-7c20c7e0/profiles` added to server functions.
  - Use `accessToken` from `useAuth()` for Authorization header.
- Tests:
  - Unit tests for ProfileManager logic (create/list/update/delete flows; permission checks)
  - End-to-end or integration tests (optional, next sprint)


## Backend work items (first sprint)

- Implemented endpoints in Supabase function:
  - GET /make-server-7c20c7e0/profiles
  - POST /make-server-7c20c7e0/profiles
  - PUT /make-server-7c20c7e0/profiles/:profileId
  - DELETE /make-server-7c20c7e0/profiles/:profileId
- Store profiles in KV with keys `profile:<id>` and index in `user:<userId>:profiles`.
- Add audit events for create/update/delete (TODO: append to `audit:<userId>` or similar).


## Sample frontend acceptance test checklist

- Create a profile and see it in the list
- Edit a profile and confirm changes persisted after refresh
- Delete a profile and confirm it's removed and no longer available in composer
- Switch active profile in composer and create a post that shows the selected profile as the author


## Project board (local) — suggested columns

- Backlog
- Ready (for dev)
- In progress
- Review / QA
- Done

Each story above should be converted into a card with clear acceptance criteria, estimate, and owner.


---

Next steps I can take now (pick one):

- Generate the frontend components and wire them to the new endpoints (AccountSettings, ProfileManager, Composer profile switch)
- Create local project board files and individual story markdown files (I can scaffold these into `projects/openbook/` in the repo)
- Add unit tests for ProfileManager and ThemeContext

Tell me which to do next and I will proceed and commit the changes to the repo.