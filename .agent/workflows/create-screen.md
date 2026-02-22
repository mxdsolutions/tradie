---
description: How to create a new screen in the ClearBuild app
---

# Creating a New Screen

## 1. Review the Design System

Before writing any code, read `DESIGN_SYSTEM.md` in the project root. It defines the header pattern, color tokens, spacing, and component conventions.

## 2. Create the Screen File

Place the file in the appropriate route group:
- **Homeowner screens**: `app/(homeowner)/`
- **Tradie screens**: `app/(tradie)/`
- **Shared screens**: `app/`
- **Dynamic routes**: Use `[param].tsx` naming (e.g. `transaction/[id].tsx`)

## 3. Use the Standard Header

Every screen **must** use the dark blue header:

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';
import { Typography } from '../../components/ui/Typography';

const insets = useSafeAreaInsets();

<StatusBar style="light" />
<View
    className="bg-primary px-6 pb-6 border-b border-white/10 z-10 shadow-medium"
    style={{ paddingTop: insets.top + 12 }}
>
    <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2 rounded-full">
            <ArrowLeftIcon size={24} color="white" />
        </TouchableOpacity>
        <Typography variant="h3" className="text-white text-lg">Screen Title</Typography>
        <View className="w-10" />
    </View>
</View>
```

## 4. Register the Route

Add the screen to the parent `_layout.tsx`:

```tsx
<Stack.Screen name="my-new-screen" options={{ presentation: 'card' }} />
```

## 5. Handle States

Every data-driven screen must handle:
- **Loading**: `<ActivityIndicator />`
- **Empty**: Styled empty state with message
- **Error**: Console error + user-facing message
- **Data**: The actual content

## 6. Use Existing UI Components

- `Typography` — all text
- `Card` — content cards
- `Button` — actions
- `Input` — form fields
- `Badge` — status indicators

Import from `components/ui/`.
