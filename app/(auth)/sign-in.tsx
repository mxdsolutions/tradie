import { View, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function SignIn() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            // Redirect is handled by UserContext auth state change listener
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-background"
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View
                    className="flex-1 px-8 justify-center"
                    style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
                >
                    <StatusBar style="dark" />

                    {/* Header Section */}
                    <View className="items-center mb-16">
                        <View className="w-20 h-20 bg-primary/10 rounded-3xl items-center justify-center mb-6 transform rotate-3">
                            <Typography variant="h1" className="text-4xl text-primary">B</Typography>
                        </View>
                        <Typography variant="h1" className="mb-3 text-4xl tracking-tight text-slate-900">Welcome Back</Typography>
                        <Typography variant="body" className="text-center text-slate-500 text-lg">Sign in to continue building</Typography>
                    </View>

                    {/* Form Section */}
                    <View className="w-full gap-6">
                        <View className="gap-6">
                            <Input
                                label="Email"
                                placeholder="name@example.com"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            <View>
                                <Input
                                    label="Password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                                <Typography variant="caption" className="text-right mt-2 text-primary font-medium">
                                    Forgot Password?
                                </Typography>
                            </View>
                        </View>

                        <View className="pt-4 space-y-4">
                            <Button
                                label="Sign In"
                                onPress={handleSignIn}
                                loading={loading}
                                size="lg"
                                className="shadow-lg shadow-blue-200"
                            />

                            <View className="flex-row items-center justify-center space-x-1 mt-4">
                                <Typography variant="body" className="text-slate-500">Don't have an account?</Typography>
                                <Button
                                    label="Create Account"
                                    variant="ghost"
                                    onPress={() => router.push('/(auth)/onboarding')}
                                    className="px-2"
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
