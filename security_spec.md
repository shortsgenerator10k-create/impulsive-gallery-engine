# Security Specification: Impulsive Gallery Engine

## 1. Data Invariants
- Images can only be read/written by their owner.
- Memory documents can only be read/written by the user they belong to.
- Keywords must be strings of limited length.
- URLs must be strings.

## 2. The Dirty Dozen Payloads
1. **Identity Spoofing**: Attempt to write an image with an `ownerId` that doesn't match `request.auth.uid`.
2. **Access Breach**: Attempt to read another user's image.
3. **Keyword Poisoning**: Inject 1MB string into keywords array.
4. **Memory Hijack**: Overwrite another user's `memories/{userId}` document.
5. **Timestamp Fraud**: Provide a client-side `createdAt` instead of `serverTimestamp()`.
6. **Shadow Update**: Add a `isVerified` field to an image document during update.
7. **Invalid ID**: Use a toxic string as `imageId`.
8. **Malicious Link**: Write an image without an `ownerId`.
9. **Synonym Chaos**: Overwrite synonyms with a non-object type.
10. **Query Scraping**: Attempt to list all images across all users without a filter.
11. **Immortal Field Breach**: Change the `createdAt` or `ownerId` of an image.
12. **Unverified Write**: Attempt to write as an unverified user.

## 3. Test Runner (Draft)
A `firestore.rules.test.ts` would verify that all these payloads return PERMISSION_DENIED.
