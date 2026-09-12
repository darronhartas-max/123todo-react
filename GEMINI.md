# 123 To Do — Agent Guidelines & Workflow Rules

## MANDATORY COMMIT & VERSION BUMPING PROTOCOL

> [!IMPORTANT]
> **EVERY TIME AN UPDATE IS MADE TO THE APP AND IT IS COMMITTED AND PUSHED, YOU MUST PERFORM A MINOR VERSION BUMP FIRST.**
>
> - **Minor Version Bump Increment**: Increments at the very end of the version number.
>   * Example: `v3.6.11` becomes `v3.6.12`
>   * Example: `v3.7.0` becomes `v3.7.1`
> - **Major Version Bumps**: Any major or middle-digit bumps (e.g. `v3.x.x` ➔ `v4.0.0`) will be specifically notified and instructed by Darron / project owner. **Never perform major or middle-number bumps without explicit instruction.**

---

### Step-by-Step Commit Checklist (MUST BE FOLLOWED IN ORDER):

1. **Bump Version**:
   - Increment the last number in `package.json` and `package-lock.json`:
     ```bash
     npm version <new_version> --no-git-tag-version
     ```
2. **Update Release Changelog**:
   - In `src/utils/constants.js`, add the new version key and entry to `RELEASE_CHANGELOG` summarizing what changed. This directly feeds the in-app "Latest Update Info" modal (`UpdatedModal.js`).
3. **Update Documentation**:
   - In `README.md`, update the version badge header (e.g. `Version **3.7.1**`) and add release notes under `## 🔄 Recent Release Highlights`.
4. **Build Bundle & Auto-Sync Master Changelog**:
   - Run `npm run build`. The build script automatically executes `node scripts/sync-changelog.js` (which syncs the new release from `RELEASE_CHANGELOG` into both `CHANGELOG.md` and the sibling marketing website `123todo-website/src/data/changelog.json`), updates `public/version.json`, and confirms zero build warnings.
5. **Run Tests**:
   - Run `npm test -- --watchAll=false` and confirm all test suites pass.
6. **Commit Changes**:
   - Stage modified files and commit with a clean, concise message.
   - Note: The local `.git/hooks/post-commit` hook automatically pushes the commit to `origin/<branch>`.
7. **Verify CI/CD Deployment**:
   - Verify that the GitHub Actions build on `darronhartas-max/123todo-react` finishes with `status: "completed"` and `conclusion: "success"`.
8. **Deploy Public Website Changelog**:
   - In `../123todo-website`, run `npm run check && npm run build` to verify formatting and compilation.
   - Stage and commit the updated `src/data/changelog.json`:
     ```bash
     git add src/data/changelog.json && git commit -m "chore: sync changelog to v<new_version>" && git push origin main
     ```
   - Verify the GitHub Actions deployment on `darronhartas-max/123todo-website` finishes with `status: "completed"` and `conclusion: "success"`, publishing the updated changelog live to `https://www.123todo.com/changelog`.

---

## Architectural Principles & Core Constraints
- **Silent Background Updates**: Service worker activates silently on install; no update prompts or banners.
- **PWA & Offline-First**: LocalStorage first with 24-hour shadow backups and persistent storage API.
- **Zero-Knowledge Encryption**: All sync data is AES-256-GCM encrypted client-side before touching Google Drive or Cloudflare D1.
- **Testing & Quality**: Never commit code that causes test failures or build warnings.
