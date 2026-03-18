import { View, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useUser, supabase } from '@tradie/core';
import { Typography, Button, Input } from '@tradie/shared-ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function SignIn() {
    const router = useRouter();
    const { setUserMode } = useUser();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert('Email Required', 'Please enter your email address first so we know where to send the reset instructions.');
            return;
        }

        try {
            setResetLoading(true);
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'https://tradieapp.netlify.app/reset-password/',
            });

            if (error) throw error;
            Alert.alert('Reset Email Sent', 'Password reset instructions have been sent to your email.');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setResetLoading(false);
        }
    };

    const resendConfirmationEmail = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: 'https://tradieapp.netlify.app/confirmation/'
                }
            });

            if (error) throw error;
            Alert.alert('Success', 'Confirmation email has been resent. Please check your inbox.');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        try {
            setLoading(true);
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message.includes('Email not confirmed')) {
                    Alert.alert(
                        'Email Not Confirmed',
                        'Would you like to resend the confirmation email?',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Resend', onPress: resendConfirmationEmail }
                        ]
                    );
                    return;
                }
                throw error;
            }

            if (authData?.user) {
                await setUserMode('tradie');
                router.replace('/(tabs)');
            }
        } catch (error: any) {
            if (!error.message.includes('Email not confirmed')) {
                Alert.alert('Error', error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View
                    className="flex-1 px-8 justify-center"
                    style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
                >
                    <StatusBar style="dark" />

                    {/* Header Section */}
                    <View className="items-center mb-16 mt-12">
                        <Image
                            source={require('../../assets/logo_icon.png')}
                            style={{ width: 80, height: 80, marginBottom: 24 }}
                            contentFit="contain"
                        />
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
                                <TouchableOpacity onPress={handleForgotPassword} disabled={resetLoading}>
                                    <Typography variant="caption" className="text-right mt-2 text-primary font-medium">
                                        {resetLoading ? 'Sending...' : 'Forgot Password?'}
                                    </Typography>
                                </TouchableOpacity>
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
