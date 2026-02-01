# 🛠️ Repository Maintenance Guide (V3)

> **"If it's not documented, it's broken."**

This guide details the exact procedures for maintaining `antigravity-awesome-skills`.
It covers the **Quality Bar**, **Documentation Consistency**, and **Release Workflows**.

---

## 1. 🚦 Daily Maintenance Routine

### A. Validation Chain

Before ANY commit that adds/modifies skills, run the chain:

1.  **Validate Metadata & Quality**:

    ```bash
    python3 scripts/validate_skills.py
    ```

    _Must return 0 errors for new skills._

2.  **Regenerate Index**:
    ```bash
    python3 scripts/generate_index.py
    ```

### B. Post-Merge Routine (Must Do)

After multiple PR merges or significant changes:

1.  **Sync Contributors List**:
    - Run: `git shortlog -sn --all`
    - Update `## Repo Contributors` in README.md.

2.  **Verify Table of Contents**:
    - Ensure all new headers have clean anchors.
    - **NO EMOJIS** in H2 headers.

3.  **Draft a Release**:
    - Go to [Releases Page](https://github.com/sickn33/antigravity-awesome-skills/releases).
    - Draft a new release for the merged changes.
    - Tag version (e.g., `v3.1.0`).

---

## 2. 📝 Documentation "Pixel Perfect" Rules

We discovered several consistency issues during V3 development. Follow these rules STRICTLY.

### A. Table of Contents (TOC) Anchors

GitHub's anchor generation breaks if headers have emojis.

- **BAD**: `## 🚀 New Here?` -> Anchor: `#--new-here` (Broken)
- **GOOD**: `## New Here?` -> Anchor: `#new-here` (Clean)

**Rule**: **NEVER put emojis in H2 (`##`) headers.** Put them in the text below if needed.

### B. The "Trinity" of Docs

If you update installation instructions or tool compatibility, you MUST update all 3 files:

1.  `README.md` (Source of Truth)
2.  `GETTING_STARTED.md` (Beginner Guide)
3.  `FAQ.md` (Troubleshooting)

_Common pitfall: Updating the clone URL in README but leaving an old one in FAQ._

### C. Statistics

If you add skills, update the counts:

- Title of `README.md`: "253+ Agentic Skills..."
- `## Full Skill Registry (253/253)` header.
- `GETTING_STARTED.md` intro.

### D. Badges & Links

- **Antigravity Badge**: Must point to `https://github.com/sickn33/antigravity-awesome-skills`, NOT `anthropics/antigravity`.
- **License**: Ensure the link points to `LICENSE` file.

---

## 3. 🛡️ Governance & Quality Bar

### A. The 5-Point Quality Check

Reject any PR that fails this:

1.  **Metadata**: Has `name`, `description`?
2.  **Safety**: `risk: offensive` used for red-team tools?
3.  **Clarity**: Does it say _when_ to use it?
4.  **Examples**: Copy-pasteable code blocks?
5.  **Actions**: "Run this command" vs "Think about this".

### B. Risk Labels (V3)

- ⚪ **Safe**: Default.
- 🔴 **Risk**: Destructive/Security tools. MUST have `[Authorized Use Only]` warning.
- 🟣 **Official**: Vendor mirrors only.

---

## 4. 🚀 Release Workflow

When cutting a new version (e.g., V4):

1.  **Run Full Validation**: `python3 scripts/validate_skills.py --strict`
2.  **Update Changelog**: Create `RELEASE_NOTES.md`.
3.  **Bump Version**: Update header in `README.md`.
4.  **Tag Release**:
    ```bash
    git tag -a v3.0.0 -m "V3 Enterprise Edition"
    git push origin v3.0.0
    ```

---

## 5. 🚨 Emergency Fixes

If a skill is found to be harmful or broken:

1.  **Move to broken folder** (don't detect): `mv skills/bad-skill skills/.broken/`
2.  **Or Add Warning**: Add `> [!WARNING]` to the top of `SKILL.md`.
3.  **Push Immediately**.
