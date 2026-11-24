# Security Specification & Payload-First TDD

## 1. Data Invariants
1. Only an authenticated, email-verified administrator (`aymanalawadhi844@gmail.com` or an explicitly registered UID in `/admins/{uid}`) may create, update, or delete `/siteSettings/{settingId}`, `/projects/{projectId}`, `/services/{serviceId}`, or `/skills/{skillId}`.
2. Only the bootstrapped super-admin (`aymanalawadhi844@gmail.com` with `email_verified == true`) may read or write `/admins/{adminUid}`.
3. Public visitors (`read` on `siteSettings`, `projects`, `services`, `skills`) may view published portfolio content without authenticating, while `admins` remains strictly private.
4. Every document ID must match `^[a-zA-Z0-9_\-]+$` with length <= 128 (`siteSettings` further restricted to `main`).
5. Every write must set `updatedBy == request.auth.uid` and `updatedAt == request.time`, enforce strict `keys().hasAll(...) && keys().hasOnly(...)`, validate field types and `.size()` limits, and cap all arrays (`<= 6..20`).

## 2. The "Dirty Dozen" Attack Payloads (All Must Fail with PERMISSION_DENIED)
1. **Unauthenticated Create Project**: Anonymous user attempts `setDoc(doc(db, 'projects', 'p1'), validProject)` -> Denied (`isAdmin()` false).
2. **Unverified Admin Email Spoof**: User with `email == 'aymanalawadhi844@gmail.com'` and `email_verified == false` attempts write -> Denied (`email_verified == true` required).
3. **Non-Admin Signed-In User Write**: Authenticated user `other@gmail.com` attempts `updateDoc` on `siteSettings/main` -> Denied.
4. **Privilege Escalation to `/admins`**: Non-super-admin attempts `setDoc(doc(db, 'admins', uid), { uid, email })` -> Denied.
5. **Shadow Field Injection**: Admin attempts creating a project with extra key `isSecret: true` -> Denied (`keys().hasOnly(...)`).
6. **Document ID Poisoning**: Admin attempts creating project with ID `bad/id` or 200-char string -> Denied (`isValidId()`).
7. **Mismatched `updatedBy` Spoofing**: Admin sets `updatedBy: 'someone-else'` -> Denied (`data.updatedBy == request.auth.uid`).
8. **Client Timestamp Forgery**: Admin sends `updatedAt: new Date(0)` instead of `serverTimestamp()` -> Denied (`data.updatedAt == request.time`).
9. **Unbounded Array / Denial of Wallet**: Admin sends `technologies` array with 50 items -> Denied (`.size() <= 15`).
10. **Oversized Description String**: Admin sends 10KB `summary` string -> Denied (`.size() <= 500`).
11. **Invalid Category Enum**: Admin sends `category: 'InvalidCat'` -> Denied (`in ['الويب', 'Flutter', 'قواعد البيانات', 'الشبكات']`).
12. **PII / Admin Registry Scraping**: Unauthenticated or non-super-admin attempts `getDocs(collection(db, 'admins'))` -> Denied.
