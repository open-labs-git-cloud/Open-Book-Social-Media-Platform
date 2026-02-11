# Delete profile

As a user, I want to delete a profile (but not my account) so I can remove unwanted personas.

Acceptance criteria:

- Backend: DELETE /make-server-7c20c7e0/profiles/:profileId removes profile and disassociates it from account.
- UI: Delete confirmation modal; deletion is reversible only via support (audit log kept).

POPIA notes:
- Deletion should remove personal identifiers where appropriate and queue audit logs for retention.

Estimate: 2 pts
