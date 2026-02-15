import "../global.css";
import { Stack } from "expo-router";
import { UserProvider } from "../context/UserContext";
import { StatusBar } from "expo-status-bar";
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';

export default function Layout() {
    return (
        <UserProvider>
            <StatusBar style="dark" />
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
                    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="(homeowner)" options={{ headerShown: false }} />
                        <Stack.Screen name="(tradie)" options={{ headerShown: false }} />
                        <Stack.Screen name="notifications" options={{ headerShown: false, presentation: 'card' }} />
                    </Stack>
                </View>
            </TouchableWithoutFeedback>
        </UserProvider>
    );
}
