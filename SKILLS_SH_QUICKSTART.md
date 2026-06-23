# Skills.sh Registry Setup - Quick Start

✨ Your repository is now configured for skills.sh discovery! Here's what was added and what you need to do next.

## ✅ What Was Added

### 1. **skills.json** - Registry Manifest
A complete manifest listing all 11 skills with metadata for bulk registration:
- Names, versions, descriptions
- Author and license info
- Tags for filtering and discovery
- Repository reference

### 2. **GitHub Actions Workflow** - Auto-Publishing
`.github/workflows/publish-to-skills-sh.yml` automatically publishes to skills.sh when:
- You push changes to `main` branch
- Any `SKILL.md` file is updated
- You manually trigger it

### 3. **Validation Script** - Quality Gate
`scripts/validate-skills.sh` ensures all skills have proper metadata before publishing.

### 4. **Setup Documentation** - Implementation Guide
`.github/SKILLS_SH_SETUP.md` with complete setup instructions.

---

## 🚀 What You Need to Do

### Step 1: Add Repository Topics (5 minutes)
Visit: https://github.com/ommakes/Skills/settings

Scroll to "About" section → "Topics" and add:
- `claude-skills` ← Primary discovery tag
- `design-system`
- `ux`
- `product-design`

### Step 2: Get skills.sh API Token (10 minutes)
1. Go to https://skills.sh (create account if needed)
2. Generate an API token in account settings
3. Copy the token (keep it secret!)

### Step 3: Add GitHub Secret (5 minutes)
Visit: https://github.com/ommakes/Skills/settings/secrets/actions

Click "New repository secret":
- **Name:** `SKILLS_SH_API_TOKEN`
- **Value:** [Paste your token from Step 2]
- Click "Add secret"

### Step 4: Test Publishing (2 minutes)
Option A - Push to main:
```bash
git add .
git commit -m "chore: add skills.sh registry configuration"
git push origin claude/eloquent-carson-32e1fn
# Then create a PR
```

Option B - Manual trigger:
1. Go to https://github.com/ommakes/Skills/actions
2. Click "Publish Skills to skills.sh" workflow
3. Click "Run workflow"

---

## 📊 What Happens After Setup

Once configured, your skills will:
- ✅ Appear in skills.sh registry
- ✅ Be discoverable via `npx skills search righter`
- ✅ Be installable via `npx skills add ommakes/Skills`
- ✅ Auto-update whenever you push to main
- ✅ Have version history tracked

---

## ✨ Validation

All 11 skills are validated and ready:

```
✅ design-ask (v1.0.0)
✅ design-rationale (v1.0.0)
✅ designer-ic-assessment (v1.0.0)
✅ gtm-positioning (v1.0.0)
✅ metrics-tagging (v1.0.0)
✅ righter (v1.1.0)
✅ vois-components (v1.2.1)
✅ vois-loop (v1.3.0)
✅ vois-patterns (v1.3.1)
✅ vois-router (v1.4.0)
✅ vois-tokens (v1.4.0)
```

Run validation anytime:
```bash
bash scripts/validate-skills.sh
```

---

## 📚 Reference

- **Detailed setup:** `.github/SKILLS_SH_SETUP.md`
- **Validation:** `scripts/validate-skills.sh`
- **Registry manifest:** `skills.json`
- **Workflow file:** `.github/workflows/publish-to-skills-sh.yml`

---

## ❓ Troubleshooting

**Publishing failed?**
1. Check the Actions tab for error details
2. Verify `SKILLS_SH_API_TOKEN` secret is set and hasn't expired
3. Ensure all SKILL.md files pass validation

**Topics not showing?**
- GitHub sometimes takes a few minutes to reflect changes
- Check repository settings → About section

**Want to republish?**
1. Go to Actions tab
2. Find "Publish Skills to skills.sh" workflow
3. Click "Run workflow" → "Run workflow" button

---

That's it! You're ready to be discoverable on skills.sh. 🚀
