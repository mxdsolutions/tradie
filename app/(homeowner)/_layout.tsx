import { Stack } from 'expo-router';

export default function HomeownerLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="projects" />
            <Stack.Screen name="project/[id]" />
            <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
            <Stack.Screen name="notification-settings" options={{ headerShown: false }} />
            <Stack.Screen name="tradie-profile/[id]" options={{ headerShown: false }} />
        </Stack>
    );
}