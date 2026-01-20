# Frontend Development Guide

**Version 1.0 | January 2026**

---

## Overview

Our frontend stack is **Next.js + shadcn/ui + Tailwind CSS**. This guide explains why we chose this approach and how to use it effectively.

Most of our work is backend-heavy, but when we build UIs, they should be:

- Consistent across products
- Professional-looking without heavy design investment
- Fast to build
- Easy to maintain

---

## The Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Framework | Next.js | React framework with routing, SSR, API routes |
| Components | shadcn/ui | Pre-built, accessible UI components |
| Styling | Tailwind CSS | Utility-first CSS |
| Theme | Custom (our brand) | Colors, typography, spacing |

---

## What is shadcn/ui?

shadcn/ui is a component library with a different philosophy: **you own the code**.

Traditional component libraries (Material UI, Chakra, Ant Design) work like this:

```bash
npm install @mui/material
```

Then you import components from `node_modules`. You're dependent on the library's updates, API changes, and design decisions. Customization means fighting the library's opinions.

shadcn/ui works differently:

```bash
npx shadcn-ui@latest add button
```

This copies a `button.tsx` file directly into your project. It's now your code — you can read it, modify it, delete it. No dependency, no version conflicts, no upgrade surprises.

### Why This Matters

| Traditional Libraries | shadcn/ui |
|-----------------------|-----------|
| Code lives in `node_modules` | Code lives in your repo |
| Customization via props/overrides | Direct code modification |
| Version upgrades can break things | Your code doesn't change unless you change it |
| Import entire library | Only add components you use |
| Library's design opinions | Your design opinions |

---

## Project Structure

When you scaffold a project using the `nextjs-frontend` template, you get:

```
src/
├── app/                    # Next.js app router
│   ├── layout.tsx
│   ├── page.tsx
│   └── ...
├── components/
│   ├── ui/                 # shadcn/ui components (copied here)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   └── ...                 # Your custom components
├── lib/
│   └── utils.ts            # Utility functions (cn helper, etc.)
└── styles/
    └── globals.css         # Tailwind + theme variables
```

The `components/ui/` directory contains all shadcn/ui components. These are copied in, not imported from a package.

---

## Our Brand Theme

We maintain a custom theme that all projects start from. This includes:

- **Colors** — primary, secondary, accent, destructive, muted
- **Typography** — font family, sizes, weights
- **Spacing** — consistent padding/margin scale
- **Border radius** — our standard roundedness
- **Shadows** — elevation system

The theme is defined in `globals.css` using CSS variables:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode values */
  }
}
```

All shadcn/ui components reference these variables, so changing the theme updates everything consistently.

---

## Adding Components

When you need a new component:

```bash
# Add a single component
npx shadcn-ui@latest add dialog

# Add multiple components
npx shadcn-ui@latest add card table tabs

# See all available components
npx shadcn-ui@latest add
```

This copies the component into `components/ui/`. From then on, it's your code.

### Available Components

shadcn/ui provides 40+ components including:

- **Layout:** Card, Separator, Aspect Ratio
- **Forms:** Input, Textarea, Select, Checkbox, Radio, Switch, Slider
- **Feedback:** Alert, Toast, Progress, Skeleton
- **Overlay:** Dialog, Drawer, Popover, Tooltip, Dropdown Menu
- **Data Display:** Table, Avatar, Badge, Calendar
- **Navigation:** Tabs, Breadcrumb, Pagination, Command (search)

Full list: https://ui.shadcn.com/docs/components

---

## Using Components

Import from your local `components/ui/` directory:

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function LoginForm() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <Input type="email" placeholder="Email" />
          <Input type="password" placeholder="Password" />
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

### The `cn` Helper

shadcn/ui includes a utility function for combining Tailwind classes:

```tsx
import { cn } from "@/lib/utils"

// Conditionally apply classes
<Button className={cn(
  "default-classes",
  isActive && "bg-primary",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
  Click me
</Button>
```

This uses `clsx` and `tailwind-merge` under the hood to handle class conflicts properly.

---

## Customizing Components

Since you own the code, customization is straightforward. Open the component file and edit it.

### Example: Modifying Button Variants

The button component (`components/ui/button.tsx`) defines variants:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center ...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground ...",
        outline: "border border-input bg-background ...",
        secondary: "bg-secondary text-secondary-foreground ...",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

Want a new variant? Add it:

```tsx
variant: {
  // ... existing variants
  brand: "bg-brand text-white hover:bg-brand/90",
}
```

Want different default sizing? Change `defaultVariants`.

---

## Building Custom Components

For components not in shadcn/ui, follow the same patterns:

1. Use Tailwind for styling
2. Reference theme CSS variables for colors
3. Use the `cn` helper for conditional classes
4. Keep components in `components/` (not in `components/ui/`)

```tsx
// components/status-badge.tsx
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "active" | "pending" | "failed"
  children: React.ReactNode
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        status === "active" && "bg-green-100 text-green-800",
        status === "pending" && "bg-yellow-100 text-yellow-800",
        status === "failed" && "bg-red-100 text-red-800"
      )}
    >
      {children}
    </span>
  )
}
```

---

## Dark Mode

shadcn/ui supports dark mode out of the box. The theme defines both light and dark CSS variables.

To toggle dark mode, add the `dark` class to your `<html>` element:

```tsx
// Using next-themes (recommended)
import { ThemeProvider } from "next-themes"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

Then use the `useTheme` hook:

```tsx
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle theme
    </Button>
  )
}
```

---

## Accessibility

shadcn/ui components are built on Radix UI primitives, which means they're accessible by default:

- Keyboard navigation works
- Focus states are visible
- ARIA attributes are correct
- Screen readers work properly

Don't break this. When customizing components, preserve:

- Focus indicators
- Keyboard handlers
- ARIA attributes
- Semantic HTML

---

## Do's and Don'ts

### Do

- Use shadcn/ui components as your starting point
- Customize components by editing the source
- Keep styling consistent with Tailwind + theme variables
- Build on top of the existing patterns

### Don't

- Install other component libraries (no Material UI, Chakra, etc.)
- Write raw CSS (use Tailwind)
- Override theme variables per-component (update the theme instead)
- Remove accessibility features when customizing

---

## Resources

- **shadcn/ui docs:** https://ui.shadcn.com
- **Tailwind CSS docs:** https://tailwindcss.com/docs
- **Next.js docs:** https://nextjs.org/docs
- **Radix UI (underlying primitives):** https://www.radix-ui.com

---

*— End of Document —*
