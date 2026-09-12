#!/usr/bin/env node

/**
 * sync-changelog.js
 * 
 * Automatically synchronizes release entries from `src/utils/constants.js` (RELEASE_CHANGELOG)
 * into:
 *   1. Repository `CHANGELOG.md` in 123todo-react
 *   2. Marketing website `src/data/changelog.json` in sibling repository 123todo-website (if present)
 * 
 * Invoked during `npm run build` or manually via `npm run sync:changelog`.
 */

const fs = require('fs');
const path = require('path');

const reactRoot = path.resolve(__dirname, '..');
const websiteRoot = path.resolve(reactRoot, '../123todo-website');

const pkgPath = path.join(reactRoot, 'package.json');
const constantsPath = path.join(reactRoot, 'src/utils/constants.js');
const changelogMdPath = path.join(reactRoot, 'CHANGELOG.md');
const websiteChangelogJsonPath = path.join(websiteRoot, 'src/data/changelog.json');

function run() {
  if (!fs.existsSync(constantsPath)) {
    console.warn('[sync-changelog] constants.js not found at', constantsPath);
    return;
  }

  const constantsContent = fs.readFileSync(constantsPath, 'utf8');
  const match = constantsContent.match(/export const RELEASE_CHANGELOG = ({[\s\S]*?^};)/m);
  if (!match) {
    console.warn('[sync-changelog] Could not locate RELEASE_CHANGELOG in src/utils/constants.js');
    return;
  }

  let releaseChangelog;
  try {
    releaseChangelog = eval('(' + match[1].replace(/;$/, '') + ')');
  } catch (e) {
    console.warn('[sync-changelog] Failed to evaluate RELEASE_CHANGELOG:', e.message);
    return;
  }

  // 1. Sync in-repo CHANGELOG.md
  if (fs.existsSync(changelogMdPath)) {
    let changelogMd = fs.readFileSync(changelogMdPath, 'utf8');
    let mdModified = false;

    const versions = Object.keys(releaseChangelog);
    for (const ver of versions) {
      const versionHeader = `### v${ver}`;
      if (!changelogMd.includes(versionHeader)) {
        const items = releaseChangelog[ver] || [];
        const markdownLines = [
          `### v${ver}`,
          ''
        ];
        items.forEach(item => {
          markdownLines.push(`- **${item.title}** ${item.desc}`);
        });
        markdownLines.push('');

        const markdownBlock = markdownLines.join('\n');
        const phase5Marker = '## 🚀 Phase 5: Modern Era & Photo Attachments (v3.5.0 – Present)\n\n';
        if (changelogMd.includes(phase5Marker)) {
          changelogMd = changelogMd.replace(phase5Marker, phase5Marker + markdownBlock + '\n');
          mdModified = true;
          console.log(`[sync-changelog] Added v${ver} to CHANGELOG.md`);
        }
      }
    }

    if (mdModified) {
      fs.writeFileSync(changelogMdPath, changelogMd, 'utf8');
      console.log('[sync-changelog] Successfully updated CHANGELOG.md');
    } else {
      console.log('[sync-changelog] CHANGELOG.md is up-to-date.');
    }
  }

  // 2. Sync 123todo-website/src/data/changelog.json (if sibling repo exists)
  if (fs.existsSync(websiteChangelogJsonPath)) {
    try {
      const websiteData = JSON.parse(fs.readFileSync(websiteChangelogJsonPath, 'utf8'));
      let jsonModified = false;
      const newVersions = {};

      for (const ver of Object.keys(releaseChangelog)) {
        if (!websiteData[ver]) {
          newVersions[ver] = releaseChangelog[ver];
          jsonModified = true;
          console.log(`[sync-changelog] Added v${ver} to 123todo-website changelog.json`);
        }
      }

      if (jsonModified) {
        const combined = { ...newVersions, ...websiteData };
        fs.writeFileSync(websiteChangelogJsonPath, JSON.stringify(combined, null, 2) + '\n', 'utf8');
        console.log('[sync-changelog] Successfully updated 123todo-website/src/data/changelog.json');
      } else {
        console.log('[sync-changelog] 123todo-website changelog.json is up-to-date.');
      }
    } catch (err) {
      console.warn('[sync-changelog] Warning updating website changelog.json:', err.message);
    }
  } else {
    console.log('[sync-changelog] Sibling 123todo-website not found, skipping website JSON sync.');
  }
}

run();
