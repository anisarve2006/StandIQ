# BRAND.md
# AI-Powered Indian Standards Recommendation Engine
## Frontend Brand & UI System

## 01 — PRODUCT IDENTITY

Product: AI-Powered Recommendation Engine for Identifying Applicable Indian Standards for Procurement Specifications.

This is a serious procurement intelligence product for government departments, PSUs, procurement agencies, and organizations that need to identify applicable Indian Standards (IS), related standards, current editions, amendments, and certification requirements.

The product should feel like:
- A professional technical intelligence system
- Precise and trustworthy
- Fast and information-dense without being cluttered
- Built for procurement officers, engineers, compliance teams, and reviewers
- More like a high-end developer/procurement workstation than a generic AI chatbot

Do NOT make it look like:
- A generic AI chat application
- A SaaS dashboard full of colorful cards
- A marketing landing page
- A glassmorphism UI
- A consumer app
- A heavily rounded/bubbly product

Core UX identity:

INPUT → UNDERSTAND → DISCOVER → DIAGNOSE → FIX → VERIFY → BUILD → APPROVE → EXPORT

---

## 02 — VISUAL DIRECTION

Primary style:
Swiss / International Typographic Style + Developer / Terminal aesthetic.

The uploaded `swiss-dev-ui` skill is the authoritative visual reference for this project.

Core principles:
1. Grid discipline first.
2. Typography creates hierarchy.
3. Visual restraint.
4. Numbered and labeled structure.
5. Function over decoration.

Reference style characteristics:
- Dark near-black interface
- Strict grid
- Strong typography
- Monospace metadata
- Numbered sections
- Thin borders
- Minimal accent color
- Terminal/code motifs where useful
- Technical/system language
- Generous whitespace
- Left-aligned content
- Sharp or barely-rounded controls

---

## 03 — COLOR SYSTEM

Background:
- `#0a0a0a`

Surface:
- `#111111`
- `#161616`

Border:
- approximately `#2a2a2a`

Primary text:
- `#f5f5f5`
- `#fafafa`

Secondary text:
- `#888888`
- `#999999`

Tertiary/meta:
- `#555555`
- `#666666`

Accent:
- ONE accent hue only across the product.
- Use the accent sparingly for active states, important signals, links, status indicators, and key interactions.
- Do not introduce multiple competing accent colors.

Semantic states may use restrained system indicators, but must remain visually subordinate to the monochrome base.

No gradients.
No decorative glow.
No drop shadows for elevation.
Depth comes from borders and subtle surface changes.

---

## 04 — TYPOGRAPHY

Maximum two font families.

Sans:
- Inter / Geist / similarly clean grotesk sans.

Monospace:
- JetBrains Mono / IBM Plex Mono / similar.

Use sans for:
- Main headings
- Body
- Descriptions
- Primary interface content

Use monospace for:
- Section numbers
- Eyebrows
- Metadata
- Status
- IDs
- Technical values
- Standard numbers
- Timestamps
- System messages
- Code / terminal blocks
- Compact controls where appropriate

Headings:
- Heavy weight
- Tight letter spacing
- Low line height
- Strong scale hierarchy

Labels:
- Uppercase
- Monospace
- Small
- Wide letter spacing
- Muted

Major sections use:
`01 — DASHBOARD`
`02 — REQUIREMENT`
`03 — DISCOVERY`

---

## 05 — GRID & SPACING

Everything must follow a consistent grid.

Do not position components arbitrarily.

Use:
- Large desktop content grid
- Responsive tablet grid
- Single-column mobile layout

Prefer:
- 12-column desktop structure
- Consistent gutters
- Consistent page padding
- Reusable spacing tokens

Major content should be left aligned.

Avoid:
- Centering everything
- Random spacing
- Oversized empty hero sections
- Decorative layout elements without function

---

## 06 — COMPONENT LANGUAGE

Buttons:
- Two main variants:
  - Primary filled
  - Secondary outlined/ghost
- Sharp or barely rounded corners: approximately 2–6px
- Never pill-shaped
- No gradients

Cards:
- 1px border
- Near-black/slightly lifted surface
- Minimal radius
- No shadows
- Number or metadata can appear in the corner
- Hover may subtly lift the background

Links:
- Use `→` or `↗` where natural.
- Avoid unnecessary chevron-heavy UI.

Status:
- Compact
- Monospace
- System-like language

Examples:
- `CURRENT`
- `SUPERSEDED`
- `AMENDED`
- `UNKNOWN`
- `VERIFIED`
- `REQUIRES REVIEW`

---

## 07 — CORE PRODUCT UI

The frontend is an officer workspace, not a chatbot.

Primary navigation:
- Dashboard
- Procurements
- Standards
- Tender Health
- Knowledge Graph
- Specification Builder
- Alerts / Changes
- Settings

Primary project workflow:

01 — DASHBOARD
Attention Center, active procurements, recent activity, standards changes.

02 — CREATE PROCUREMENT
Input product description, technical specification, or upload tender.

03 — REQUIREMENT UNDERSTANDING
Show what the system extracted:
- Product
- Application
- Environment
- Materials
- Performance requirements
- Quantities
- Technical parameters
- Existing IS references

Allow users to edit/confirm extracted requirements.

04 — STANDARDS DISCOVERY
Results grouped into:
- Primary Standards
- Allied Standards
- Test Methods
- Safety
- Installation
- Terminology
- Certification
- International Equivalents

Each result should show:
- IS number
- Title
- Current edition/status
- Why it is relevant
- Evidence
- Related standards
- Certification relevance

05 — TENDER HEALTH
Analyze uploaded tender/specification:
- Standards coverage
- Missing standards
- Outdated standards
- Superseded references
- Missing amendments
- Certification gaps
- Scope mismatches
- Cross-item conflicts

06 — REVIEW & VERIFY
Evidence-first review.
Show source evidence, page references, extracted clauses, verification status, and confidence.

07 — KNOWLEDGE GRAPH
Interactive standards relationship graph showing:
- Primary
- Test method
- Safety
- Installation
- Terminology
- Material
- International equivalent
relationships.

08 — SPECIFICATION BUILDER
Create a procurement-ready specification using verified standards and clauses.

09 — APPROVAL
Review, comments, changes, approval status, audit trail.

10 — EXPORT
Support:
- DOCX
- PDF
- JSON
- CSV

---

## 08 — UNIQUE FRONTEND FEATURES

Prioritize these as product-defining experiences:

1. Requirement Understanding Workspace
   The system explains what it understood before recommending standards.

2. Tender Health Score / Coverage View
   Show what is covered, missing, stale, conflicting, or uncertain.

3. Missing Standards Detector
   Detect requirements that appear to need a standard but have no appropriate reference.

4. Outdated Standard Detector
   Clearly identify stale/superseded/withdrawn references.

5. Tender Diff / Fix Mode
   Original tender on one side, recommended fixes/findings on the other.

6. Interactive Standards Relationship Graph
   Let users explore how standards connect.

7. Standards Basket
   Users can collect selected standards into a working set for the procurement.

8. Specification Builder
   Convert verified findings into structured procurement requirements.

9. Evidence Viewer
   Show the exact supporting source, page, clause, and relevant evidence.

10. Why Recommended / Why Excluded
    Every important recommendation should be explainable.

11. Version Timeline
    Show edition history, amendments, current status, and changes.

12. Recently Changed Standards
    Surface relevant standards that changed since the procurement was created.

13. Considered & Excluded
    Show relevant candidates that were rejected and why.

14. Multilingual Input
    Support multilingual natural-language procurement queries.

---

## 09 — UX RULES

The system must always communicate uncertainty.

Never make an AI recommendation look like an unquestionable fact.

Use states such as:
- VERIFIED
- HIGH RELEVANCE
- REVIEW REQUIRED
- UNKNOWN
- NOT FOUND
- SCOPE MISMATCH

Evidence should be visually close to the claim it supports.

Do not hide important information behind unnecessary modals.

Prefer progressive disclosure.

Keep dense technical information readable through hierarchy rather than decoration.

---

## 10 — RESPONSIVE BEHAVIOR

Desktop is the primary target because procurement officers will use large screens.

Tablet:
- Preserve two-column workflows where possible.
- Collapse secondary panels intelligently.

Mobile:
- Prioritize requirement review, standard discovery, and evidence.
- Convert split views into stacked views.
- Keep actions accessible.

---

## 11 — ACCESSIBILITY

Use semantic HTML.

Keyboard navigation must work.

Focus states must be visible.

Maintain readable contrast.

Do not communicate status only through color.

Use labels and text alongside status indicators.

---

## 12 — DO NOT USE

- Glassmorphism
- Excessive rounded cards
- Pills everywhere
- Giant gradients
- Neon cyberpunk styling
- Heavy shadows
- Stock photography
- Decorative illustrations without function
- Excessive animations
- Generic AI-chat layouts
- Colorful dashboard overload
- Centered-everything layouts

---

## 13 — DESIGN NORTH STAR

The product should look like:

`A Swiss-designed technical command center for Indian procurement intelligence.`

Every screen should answer:
- What am I looking at?
- What does the system know?
- What evidence supports it?
- What needs my attention?
- What action can I take next?
