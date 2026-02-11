# Create Post (text/image/video)

As a user, I want to create posts with text, pictures, or videos so I can share content to my followers.

Acceptance criteria:

- UI: Composer supports text + media attachments, shows selected profile.
- Backend: POST /make-server-7c20c7e0/posts accepts content, mediaUrl, mediaType and returns post object.
- Media upload uses POST /make-server-7c20c7e0/upload and stores media in object storage.

Estimate: 5 pts
