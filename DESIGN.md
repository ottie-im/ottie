# Design System — Ottie

## 1. Visual Theme & Atmosphere

Ottie is a clean, warm, WhatsApp-inspired IM with an Agent twist. The design is bright and minimal — white canvas, soft green accents, and natural warm tones. Nothing flashy, nothing dark. The interface should feel like a conversation with a trusted friend, not a spaceship control panel.

The key differentiator from WhatsApp: a subtle "Agent lane" — the input area is a private channel between user and their AI secretary. The chat flow shows the Agent's polished output, not the user's raw instructions. Approval cards bridge the two worlds with a gentle cream background.

The visual hierarchy is typography + whitespace. No illustrations, no decorative graphics, no gradients. The chat UI itself is the product — message bubbles, approval cards, and the sidebar conversation list carry all the visual weight. System fonts keep the focus on content, not on the frame.

**Key Characteristics:**
- Predominantly white canvas with warm gray text — the background disappears so content shines
- Soft teal-green (`#25D366`) as the singular brand accent — WhatsApp green, familiar and warm
- Light gray sidebar (`#f0f2f5`) for conversation list — subtle separation without hard borders
- No dark mode (light only for Phase 3)
- No purple, no neon, no gradients, no decorative illustrations
- Rounded but not pill-shaped — 8px default radius for bubbles, 12px for cards
- Subtle shadows only — depth through layered surfaces, not heavy drop shadows
- System font stack — no custom fonts, native feel on every OS
- Chat bubbles are the primary visual element — green for outgoing, white for incoming

## 2. Color Palette & Roles

### Primary Brand
- **Ottie Green** (`#25D366`): Primary accent — send button, online indicators, outgoing bubble tint, unread badges, active nav items
- **Ottie Dark Green** (`#128C7E`): Header background, hover states on green buttons, secondary accent
- **Ottie Teal** (`#075E54`): Text on green surfaces, deepest accent for emphasis

### Surface & Background
- **White** (`#ffffff`): Chat area background, incoming bubble background, card surfaces, modal backgrounds
- **Cloud Gray** (`#f0f2f5`): Sidebar background, input area container, page background behind login card
- **Light Green Wash** (`#dcf8c6`): Outgoing message bubble background — the signature "my message" color
- **Snow White** (`#f7f8fa`): Hover states, user intent bubble, subtle differentiation from pure white
- **Cream** (`#fdf4e3`): Approval card background — warm, stands out from chat flow, signals "action needed"

### Text & Neutral
- **Primary Text** (`#111b21`): Main text, headings, message body — warm near-black
- **Secondary Text** (`#667781`): Timestamps, last-message preview, metadata, placeholders
- **Tertiary Text** (`#8696a0`): Disabled text, subtle labels, user intent prefix
- **Border** (`#e9edef`): Dividers between conversation items, card borders, input borders
- **Approval Border** (`#f0ddb8`): Approval card border — warm, matches cream background

### Semantic
- **Success** (`#25D366`): Online status dot, sent confirmation checkmarks, positive actions
- **Warning** (`#f59e0b`): Pending approval indicator, waiting states
- **Danger** (`#ef4444`): Reject button, error states, blocked user indicator, destructive actions
- **Info** (`#3b82f6`): Links in non-green context, notification badge count

### Gradient System
- **No gradients anywhere.** Depth comes from surface layering and subtle shadows, not color transitions. The brand is flat and clean — if you're reaching for a gradient, rethink the approach using the surface color hierarchy instead.

## 3. Typography Rules

### Font Family
- **All text**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`
- No custom fonts — system fonts for speed, native feel, and zero FOUT (flash of unstyled text)
- The font itself should be invisible — users should notice the words, not the typeface

### Hierarchy

| Role | Size | Weight | Line Height | Color | Notes |
|------|------|--------|-------------|-------|-------|
| Page Title | 20px | 600 | 1.30 | `#111b21` | Sidebar header ("Ottie"), chat contact name |
| Section Label | 14px | 600 | 1.40 | `#667781` | Uppercase section dividers in settings |
| Chat Name | 16px | 500 | 1.25 | `#111b21` | Contact name in conversation list |
| Last Message | 14px | 400 | 1.30 | `#667781` | Preview text in conversation list, single line truncate |
| Message Body | 14.2px | 400 | 1.45 | `#111b21` | Chat bubble text — WhatsApp uses 14.2px |
| Message Time | 11px | 400 | 1.20 | `#667781` | Timestamp at bottom-right of bubble |
| Input Text | 15px | 400 | 1.40 | `#111b21` | Text user types in input field |
| Input Placeholder | 15px | 400 | 1.40 | `#8696a0` | "跟 Ottie 说..." placeholder |
| Button Label | 14px | 500 | 1.00 | `#ffffff` on green, `#111b21` on gray | Button text |
| Badge | 12px | 700 | 1.00 | `#ffffff` | Unread count on green circle |
| Caption | 12px | 400 | 1.30 | `#667781` | Metadata, file sizes, "Ottie 拟好了消息：" label |
| User Intent | 13px | 400 italic | 1.35 | `#667781` | Dimmed original intent in approval card |

### Principles
- Weight 400 is the workhorse — body text, messages, descriptions. Never lighter
- Weight 500 for emphasis — contact names, button labels, draft text in approval cards
- Weight 600 only for page-level headings — sidebar title, login heading. Used sparingly
- Weight 700 only for badges — nowhere else
- Generous line-height (1.40+) in messages for comfortable reading
- 14.2px for message body is intentional (WhatsApp standard) — don't round to 14px

## 4. Component Stylings

### Chat Bubble — Outgoing (Agent Output)

- Background: `#dcf8c6` (Light Green Wash)
- Text: `#111b21`, 14.2px, weight 400
- Padding: 8px 12px
- Border-radius: 8px (top-left: 0px for first message in group)
- Max-width: 65%
- Shadow: none
- Tail: CSS triangle on right side, same green
- Timestamp: bottom-right corner, `#667781`, 11px
- Checkmarks: `#667781` single-check (sent), `#53bdeb` double-check (read)

### Chat Bubble — Incoming

- Background: `#ffffff`
- Border: 1px solid `#e9edef`
- Text: `#111b21`, 14.2px, weight 400
- Padding: 8px 12px
- Border-radius: 8px (top-right: 0px for first message in group)
- Max-width: 65%
- Tail: CSS triangle on left side, white with border
- Sender name: `#075E54`, 12.5px, weight 500 (only shown in future group chats)

### Chat Bubble — User Intent (dimmed, expandable)

- Background: `#f7f8fa` (Snow White)
- Text: `#667781`, 13px, italic
- Padding: 6px 10px
- Border-radius: 8px
- Opacity: 0.8
- Prefix: "🦦 你说：" in `#8696a0`, 12px
- Click to expand/collapse shows full original text
- Appears above the corresponding outgoing bubble

### Approval Card

- Background: `#fdf4e3` (Cream)
- Border: 1px solid `#f0ddb8`
- Border-radius: 12px
- Padding: 12px 16px
- Shadow: `0 1px 4px rgba(0,0,0,0.04)`
- Contains:
  - Label: "Ottie 拟好了消息：" — 12px, `#8696a0`, weight 400
  - Draft text: 14.2px, `#111b21`, weight 500
  - Original intent: 12px, italic, `#667781` — "原始指令：问他周五去不去吃饭"
  - Action buttons row, 8px gap:
    - ✅ 批准: `#25D366` background, white text, 8px radius
    - ✏️ 编辑: `#f0f2f5` background, `#111b21` text, 8px radius
    - ❌ 拒绝: `#ffffff` background, `#ef4444` text, 1px `#ef4444` border, 8px radius

### Input Area

- Container: `#f0f2f5` background, padding 8px 16px, border-top 1px `#e9edef`
- Input field:
  - Background: `#ffffff`
  - Border: none
  - Border-radius: 8px
  - Padding: 10px 12px
  - Font-size: 15px
  - Placeholder: "跟 Ottie 说..." in `#8696a0`
  - Focus: no visible border change (clean)
- Send button:
  - Background: `#25D366`
  - Icon: white arrow (Lucide `Send` icon)
  - Size: 40px circle
  - Border-radius: 50%
  - Hover: `#128C7E`
  - Disabled (empty input): `#e9edef` background, `#8696a0` icon
  - Margin-left: 8px

### Sidebar — Conversation List

- Container: `#f0f2f5` background, 30% width, min 320px, max 420px
- Header: `#128C7E` background, white text, 56px height, "Ottie" title left-aligned
- Search bar: `#ffffff` background, 8px radius, `#8696a0` placeholder "搜索", inside header
- Each conversation item:
  - Padding: 12px 16px
  - Border-bottom: 1px solid `#e9edef`
  - Avatar: 48px circle, `#25D366` background with white initial letter as fallback
  - Name: 16px, weight 500, `#111b21`
  - Last message preview: 14px, `#667781`, single line, `text-overflow: ellipsis`
  - Time: 12px, `#667781`, absolute top-right
  - Unread badge: 20px circle, `#25D366` background, white text, 12px weight 700
  - Hover: `#f7f8fa` background
  - Active (selected): `#e9edef` background

### Chat Header

- Background: `#ffffff`
- Border-bottom: 1px solid `#e9edef`
- Height: 56px
- Padding: 0 16px
- Contains: avatar (40px), name (16px weight 500), status text ("在线" / "离线")
- Status text: `#25D366` for online, `#8696a0` for offline

### Friend Request Card

- Background: `#ffffff`
- Border: 1px solid `#e9edef`
- Border-radius: 12px
- Padding: 16px
- Shadow: `0 1px 4px rgba(0,0,0,0.04)`
- Avatar: 48px circle
- Name: 16px weight 500, `#111b21`
- Message: 14px, `#667781`
- Buttons row, 8px gap:
  - 接受: `#25D366` background, white text, 8px radius
  - 拒绝: `#f0f2f5` background, `#667781` text, 8px radius

### Login Page

- Page background: `#f0f2f5`
- Card: `#ffffff`, max-width 400px, centered vertically and horizontally
- Card padding: 32px
- Card radius: 12px
- Card shadow: `0 2px 8px rgba(0,0,0,0.08)`
- Logo: 🦦 emoji 48px + "Ottie" text 24px weight 600, `#111b21`, centered
- Tagline: "你的 AI 秘书" — 14px, `#667781`, centered, margin-bottom 24px
- Input fields: full-width, 48px height, `#e9edef` 1px border, 8px radius, 15px text
- Input focus: border-color `#25D366`
- Login button: full-width, `#25D366` background, white text, 48px height, 8px radius
- Login button hover: `#128C7E`
- Spacing between elements: 16px

## 5. Layout Principles

### Spacing System
- **Base unit**: 4px
- **Scale**: 4px, 8px, 12px, 16px, 24px, 32px, 48px
- **Bubble padding**: 8px 12px — compact, content-first
- **Card padding**: 12px 16px — slightly roomier for approval cards
- **Sidebar items**: 12px 16px padding, 1px border between
- **Section gaps**: 16px–24px between major layout blocks
- **Login card**: 32px internal padding

### Grid & Container
- **Two-panel layout**: Sidebar (30%, min 320px, max 420px) + Chat Area (remaining)
- **No explicit grid** — the layout is sidebar + main content, not a multi-column grid
- **Chat messages**: left-aligned incoming, right-aligned outgoing, max-width 65%
- **Minimum window**: 800 × 600px

### Whitespace Philosophy
- Messages should breathe — 4px gap between consecutive messages from same sender, 12px between different senders
- Approval cards get extra margin (16px top and bottom) to stand out from chat flow
- Sidebar and chat area are separated by the gray/white color boundary — no visible border needed
- Empty states (no messages, no friends) show a centered icon + text, generous top margin

### Border Radius Scale

| Token | Value | Use |
|-------|-------|-----|
| xs | 4px | Badges, inline tags |
| sm | 8px | Bubbles, inputs, buttons, search bar |
| md | 12px | Cards (approval, friend request, login) |
| full | 50% | Avatars, send button, online indicator |

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Level 0 (Flat) | No shadow | Chat bubbles, sidebar items, input field |
| Level 1 (Subtle) | `0 1px 4px rgba(0,0,0,0.04)` | Approval cards, friend request cards — just enough to lift from chat flow |
| Level 2 (Card) | `0 2px 8px rgba(0,0,0,0.08)` | Login card, modal dialogs, floating panels |
| Level 3 (Popup) | `0 4px 16px rgba(0,0,0,0.12)` | Dropdown menus, tooltips, context menus |

### Shadow Philosophy
- Ottie uses almost no shadows — the design relies on **background color shifts** (white → gray → cream) for depth instead
- Chat bubbles have **zero shadow** — they're differentiated by color alone (green vs white vs cream)
- Only cards that "float above" the chat flow get Level 1 shadow
- If you're adding a shadow, ask: can this be achieved with background color instead? If yes, skip the shadow
- All shadows use warm black (`rgba(0,0,0,...)`) not cold/blue-tinted shadows

### Decorative Depth
- No gradients, no glow effects, no blur backgrounds
- No border used for containment when color difference is sufficient
- Sidebar/chat separation is purely color-based (`#f0f2f5` vs `#ffffff`) — no border

## 7. Do's and Don'ts

### Do
- Use `#25D366` (Ottie Green) as the single accent color — it should appear on send buttons, online indicators, unread badges, and outgoing bubble background
- Keep the white canvas dominant — at least 60% of any screen should be white or near-white
- Use system fonts everywhere — the font stack should feel invisible and native
- Differentiate message types through background color: green (outgoing), white (incoming), cream (approval), light gray (user intent)
- Use 14.2px for message body text — this is the WhatsApp standard, don't round it
- Keep bubble max-width at 65% — prevents messages from spanning the full width
- Make approval cards visually distinct with cream background and a subtle shadow — they're action items
- Show the user's original intent in dimmed italic above/inside approval cards — transparency is core
- Keep spacing between same-sender messages tight (4px) and different-sender messages looser (12px)
- Use Lucide React icons with outline style, 1.5px stroke, 20px size, `#667781` color

### Don't
- Use dark mode, dark backgrounds, or dark surfaces — Ottie is light-only in Phase 3
- Use purple, blue, orange, or any non-green brand color — green is the only accent
- Add gradients, glow effects, or blur backgrounds — depth comes from surface colors and subtle shadows
- Use heavy shadows (opacity > 12%) — everything should feel flat and clean
- Use custom or decorative fonts — system fonts only
- Make bubbles full-width — always cap at 65% max-width
- Use pill-shaped buttons (9999px radius) — 8px radius for all buttons and inputs
- Add illustrations, mascot graphics, or decorative imagery — the chat UI is the visual content
- Use borders where color differentiation is sufficient — sidebar vs chat is color-only, no border
- Put important actions in menus — approval buttons should be visible inline, not hidden
- Use skeleton loaders — a simple centered spinner is enough for Phase 3

## 8. Responsive Behavior

### Desktop (Tauri v2 — Phase 3 only)

| Breakpoint | Width | Key Changes |
|------------|-------|-------------|
| Narrow | < 900px | Sidebar collapses to 72px (avatars only, no text) |
| Standard | 900px–1200px | Full sidebar (320px) + chat area |
| Wide | > 1200px | Sidebar up to 420px, chat area expands |

### Window Constraints
- **Minimum**: 800 × 600px — below this, the app won't resize
- **Default**: 1024 × 768px — comfortable for sidebar + chat
- **Sidebar**: resizable via drag handle (min 320px, max 420px)

### Touch Targets
- All clickable areas: minimum 40px height
- Sidebar items: full-width clickable, 56px total height (12px padding top + bottom + content)
- Buttons: minimum 36px height with 8px vertical padding
- Send button: 40px circle — large and easy to click

### Collapsing Strategy
- **Sidebar at < 900px**: Shows only 48px avatars in a 72px column. Click avatar to open chat. No text, no search
- **Chat header**: Always visible, never collapses
- **Input area**: Always visible at bottom, never collapses
- **No mobile behavior** — Phase 3 is desktop-only, React Native is a separate codebase

### Image Behavior
- Avatars: always 48px in sidebar, 40px in chat header — never scale
- No decorative images to manage
- Future file attachments: thumbnail with 8px radius, max 300px width

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary Accent: Ottie Green (`#25D366`)
- Header: Ottie Dark Green (`#128C7E`)
- Deep Accent: Ottie Teal (`#075E54`)
- Background: White (`#ffffff`)
- Sidebar Background: Cloud Gray (`#f0f2f5`)
- Outgoing Bubble: Light Green Wash (`#dcf8c6`)
- Incoming Bubble: White (`#ffffff`) + border `#e9edef`
- Approval Card: Cream (`#fdf4e3`) + border `#f0ddb8`
- User Intent: Snow White (`#f7f8fa`)
- Primary Text: `#111b21`
- Secondary Text: `#667781`
- Tertiary Text: `#8696a0`
- Border: `#e9edef`
- Danger: `#ef4444`
- Warning: `#f59e0b`

### Example Component Prompts
- "Create a chat page with white background, a left sidebar (320px, #f0f2f5) showing conversation list, and a right chat area with green outgoing bubbles (#dcf8c6, 8px radius, max-width 65%) and white incoming bubbles (1px #e9edef border)"
- "Build a sidebar conversation item: 48px green circle avatar, 16px/500 contact name, 14px/#667781 last message preview truncated to one line, 12px/#667781 timestamp top-right, 20px green unread badge"
- "Design an approval card: #fdf4e3 background, 1px #f0ddb8 border, 12px radius, containing a 12px gray label, 14.2px/500 draft text, 12px italic original intent, and three action buttons (green approve, gray edit, red-outline reject)"
- "Create a login page: #f0f2f5 page background, centered white card (400px max, 32px padding, 12px radius, 0 2px 8px rgba(0,0,0,0.08) shadow), 🦦 emoji logo, two input fields (48px height, #e9edef border), green login button (#25D366, white text, 48px height)"
- "Build a chat input area: #f0f2f5 container with 1px #e9edef top border, white input field (8px radius, 15px text, '跟 Ottie 说...' placeholder), 40px green circle send button with white arrow icon"

### Iteration Guide
When refining existing screens generated with this design system:
1. Check all colors against the palette — no blues, purples, or off-brand colors should appear
2. Verify message bubbles use 14.2px body text and 65% max-width — not wider
3. Ensure approval cards use cream (#fdf4e3) background — they must stand out from chat
4. Confirm the sidebar uses #f0f2f5, not pure white — the color boundary creates the panel separation
5. Check button radius is 8px, not pill (9999px) — Ottie buttons are softly rounded, not pill-shaped
6. Verify shadows are subtle (4%–8% opacity) — if shadows look heavy, reduce opacity
7. The overall tone should feel like WhatsApp with a warm AI twist — familiar, clean, trustworthy, bright
