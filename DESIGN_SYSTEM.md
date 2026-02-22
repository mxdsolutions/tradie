# ClearBuild Design System

Reference for agents and developers to maintain visual consistency across all screens.

## Color Tokens (Tailwind)

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#0F172A` | Headers, dark backgrounds, primary buttons |
| `primary-light` | `#334155` | Secondary dark surfaces |
| `accent` | `#2563EB` | CTA buttons, links, active states |
| `accent-light` | `#EFF6FF` | Soft blue backgrounds |
| `background` | `#F8FAFC` | Page backgrounds |
| `background-paper` | `#FFFFFF` | Cards, modals |
| `status-success` | `#10B981` | Success states |
| `status-warning` | `#F59E0B` | Warning states |
| `status-error` | `#EF4444` | Error states |
| `text-primary` | `#0F172A` | Body text |
| `text-secondary` | `#64748B` | Subtle text |
| `text-tertiary` | `#94A3B8` | Placeholder text |

## Screen Header Pattern

**Every screen must use the dark blue header.** This is the standard:

```tsx
<StatusBar style="light" />
<View
    className="bg-primary px-6 pb-6 border-b border-white/10 z-10 shadow-medium"
    style={{ paddingTop: insets.top + 12 }}
>
    {/* Back button (if sub-screen) */}
    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2 rounded-full">
        <ArrowLeftIcon size={24} color="white" />
    </TouchableOpacity>

    {/* Title */}
    <Typography variant="h3" className="text-white text-lg">Screen Title</Typography>
</View>
```

Key rules:
- Background: `bg-primary` (#0F172A dark blue)
- StatusBar: `style="light"` (white status bar text)
- Text/icons: always **white** on the header
- Safe area: `paddingTop: insets.top + 12`
- Search bars on dark headers: `bg-white/10 border border-white/10`, white text, light placeholder

## Typography Variants

| Variant | Usage |
|---|---|
| `h1` | Page titles, large numbers |
| `h2` | Section titles |
| `h3` | Card titles, sub-headings |
| `body` | Body text |
| `label` | Form labels, small caps |
| `caption` | Meta text, timestamps |

## Card Pattern

```tsx
<Card variant="flat" className="p-5 bg-white border border-slate-50 shadow-sm rounded-3xl">
```

Standard border-radius: `rounded-3xl` (22px).

## Button Variants

| Variant | Style |
|---|---|
| `primary` | `bg-accent` blue, white text |
| `secondary` | Transparent, border, dark text |
| `ghost` | Transparent, accent text |
| `danger` | `bg-status-error`, white text |

On dark backgrounds, use semi-transparent white:
```tsx
className="bg-white/15 border border-white/20"
```

## Form Inputs

Use the `<Input />` component from `components/ui/Input.tsx`:
- Label styling: `text-sm font-medium text-text-secondary uppercase tracking-wider`
- Input: `bg-slate-50 rounded-xl px-4 h-14`
- Focus: blue border, white bg

## Spacing Scale

| Size | Usage |
|---|---|
| `px-6` | Standard page horizontal padding |
| `mb-4` / `mb-5` | Section spacing |
| `mb-8` | Major section gaps |
| `pb-20` | Bottom padding (tab bar clearance) |

## Supabase Patterns

- Use `supabase.channel()` + `postgres_changes` for real-time subscriptions
- Always handle loading/error/empty states
- Use `useSafeAreaInsets()` for safe area padding
