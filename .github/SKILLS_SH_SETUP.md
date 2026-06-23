# Publishing to skills.sh

This repository is configured to automatically publish skills to the skills.sh registry. Here's what was set up:

## What Was Added

### 1. **skills.json Manifest** (`/skills.json`)
A registry manifest that lists all 11 skills with their metadata. This enables:
- Bulk discovery and validation
- API-based skill registration
- Version tracking and updates

### 2. **GitHub Actions Workflow** (`.github/workflows/publish-to-skills-sh.yml`)
Automatically publishes skills to skills.sh when:
- Changes are pushed to `main` branch
- Any `SKILL.md` file is updated
- `skills.json` is updated
- Workflow is manually triggered via GitHub UI

### 3. **Repository Configuration**
Add these **GitHub Topics** to your repository settings (https://github.com/ommakes/Skills/settings):
- `claude-skills`
- `design-system`
- `ux`
- `product-design`

## Setup: Enable Publishing

To activate publishing to skills.sh:

### Step 1: Get API Token
1. Create an account on [skills.sh](https://skills.sh)
2. Generate an API token in your account settings
3. Copy the token (you'll use it in the next step)

### Step 2: Add GitHub Secret
1. Go to https://github.com/ommakes/Skills/settings/secrets/actions
2. Click "New repository secret"
3. Name: `SKILLS_SH_API_TOKEN`
4. Value: Paste your skills.sh API token
5. Click "Add secret"

### Step 3: Add Repository Topics
1. Go to https://github.com/ommakes/Skills/settings
2. Scroll to "Repository topics"
3. Add these topics:
   - `claude-skills`
   - `design-system`
   - `ux`
   - `product-design`

### Step 4: Trigger First Publish
Option A (Recommended): Push a change to main
```bash
git push origin main
```

Option B: Manual trigger
1. Go to https://github.com/ommakes/Skills/actions
2. Click "Publish Skills to skills.sh"
3. Click "Run workflow"

## How It Works

1. **Validation**: Workflow checks that each `SKILL.md` has required frontmatter fields:
   - `name` (skill identifier)
   - `version` (semantic versioning)
   - `description` (explains when/why to use it)

2. **Publishing**: Each skill is posted to skills.sh API with:
   - All frontmatter metadata (name, version, description, author, tags, license)
   - Repository reference
   - Skill path within the repo

3. **Updates**: Each push to main automatically updates skills.sh with new versions

## Troubleshooting

If the workflow fails:

1. **Check the Actions tab** (https://github.com/ommakes/Skills/actions)
2. **Verify the API token is set** and hasn't expired
3. **Check SKILL.md files** have all required fields
4. **Ensure main branch is up to date**

## What Happens Next

Once configured:
- ✅ All 11 skills appear on skills.sh registry
- ✅ Discoverable via `npx skills search`
- ✅ Installable via `npx skills add ommakes/Skills`
- ✅ Automatic updates on each push to main
- ✅ Version history tracked

## Manual Publishing

If you need to publish without GitHub:

```bash
# Validate all skills
node scripts/validate-skills.js

# Publish directly (requires SKILLS_SH_API_TOKEN env var)
node scripts/publish-skills.js
```

## Questions?

- skills.sh docs: https://skills.sh/docs
- GitHub Actions docs: https://docs.github.com/en/actions
- Claude Code skills: https://claude.com/docs/skills
