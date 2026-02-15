import { Stack } from 'expo-router';

export default function TradieLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="calendar" />
            <Stack.Screen name="licences" />
        </Stack>
    );
}