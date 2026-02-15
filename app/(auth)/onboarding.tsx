import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { MotiView } from 'moti';
import { ClipboardDocumentListIcon, WrenchScrewdriverIcon, ArrowRightIcon, CheckIcon } from 'react-native-heroicons/outline';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Onboarding() {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<'homeowner' | 'tradie' | null>(null);
    const { setUserMode } = useUser();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Form State
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [location, setLocation] = useState('');

    // Role Specific State
    const [trade, setTrade] = useState('');
    const [license, setLicense] = useState('');

    const handleRoleSelect = (selectedRole: 'homeowner' | 'tradie') => {
        setRole(selectedRole);
        if (selectedRole === 'homeowner') {
            setStep(3);
        } else {
            setStep(2);
        }
    };

    const handleDetailsComplete = () => {
        if (role === 'tradie' && (!trade || !license)) {
            Alert.alert('Please fill in all fields');
            return;
        }
        setStep(3);
    };

    const handleComplete = async () => {
        if (!email || !password || !firstName || !lastName || !location) {
            Alert.alert('Please fill in all fields');
            return;
        }

        try {
            setLoading(true);

            // 1. Sign Up
            const { data: { session, user }, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        location: location,
                        full_name: `${firstName} ${lastName}`,
                        role: role
                    }
                }
            });

            if (signUpError) throw signUpError;
            if (!user) throw new Error('No user created');

            // 2. Update User Profile (since trigger created it)
            const { error: userError } = await supabase.from('users').update({
                first_name: firstName,
                last_name: lastName,
                full_name: `${firstName} ${lastName}`,
                location: location,
                role: role
            }).eq('id', user.id);

            if (userError) {
                // If user trigger exists, this might fail on duplicate, which is fine, but better to upsert or ignore if so. 
                // For now assuming no trigger or manual handling.
                console.error('User insert error:', userError);
            }

            // 3. Insert role specific profile (Tradie only)
            if (role === 'tradie') {
                const { error: profileError } = await supabase.from('tradie_profiles').insert({
                    user_id: user.id,
                    trade: trade,
                    is_available: true
                });
                if (profileError) throw profileError;

                const { error: licenseError } = await supabase.from('tradie_licenses').insert({
                    user_id: user.id,
                    license_number: license
                });
                if (licenseError) throw licenseError;
            }

            await setUserMode(role!);

            // Redirect happens automatically via UserContext or manually here to be safe
            router.replace(role === 'homeowner' ? '/(homeowner)' : '/(tradie)');

        } catch (error: any) {
            Alert.alert('Error', error.code === '23505' ? 'User already exists' : error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View
            className="flex-1 bg-background px-6"
            style={{ paddingTop: insets.top + 20 }}
        >
            <StatusBar style="dark" />
            {/* Progress Bar */}
            <View className="flex-row h-1.5 bg-slate-100 rounded-full mb-10 overflow-hidden">
                <MotiView
                    animate={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
                    transition={{ type: 'timing', duration: 500 } as any}
                    className="h-full bg-accent rounded-full"
                />
            </View>

            <Typography variant="h1" className="mb-2">
                {step === 1 ? 'How will you use Base?' :
                    step === 2 ? (role === 'homeowner' ? 'What are you building?' : 'What is your trade?') :
                        'Create your account'}
            </Typography>
            <Typography variant="body" className="mb-10 text-text-tertiary">
                {step === 1 ? 'Select your role to get started.' :
                    step === 2 ? 'Help us customize your experience.' :
                        'Save your progress and get started.'}
            </Typography>

            {step === 1 && (
                <View className="space-y-6">
                    <TouchableOpacity
                        onPress={() => handleRoleSelect('homeowner')}
                        className="bg-white border border-slate-100 p-6 rounded-3xl shadow-soft active:border-accent active:bg-accent-light/10 ios:active:scale-[0.98] transition-all"
                    >
                        <View className="bg-accent-light w-14 h-14 rounded-2xl items-center justify-center mb-4">
                            {/* @ts-ignore */}
                            <ClipboardDocumentListIcon size={28} color="#2563EB" />
                        </View>
                        <Typography variant="h3" className="mb-2">I'm a Homeowner</Typography>
                        <Typography variant="body" className="text-sm text-text-secondary">I want to manage my renovation or build project.</Typography>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleRoleSelect('tradie')}
                        className="bg-white border border-slate-100 p-6 rounded-3xl shadow-soft active:border-accent active:bg-accent-light/10 ios:active:scale-[0.98] transition-all"
                    >
                        <View className="bg-orange-50 w-14 h-14 rounded-2xl items-center justify-center mb-4">
                            {/* @ts-ignore */}
                            <WrenchScrewdriverIcon size={28} color="#F97316" />
                        </View>
                        <Typography variant="h3" className="mb-2">I'm a Tradie</Typography>
                        <Typography variant="body" className="text-sm text-text-secondary">I want to manage jobs, quotes, and payments.</Typography>
                    </TouchableOpacity>
                </View>
            )}

            {step === 2 && (
                <MotiView
                    from={{ opacity: 0, translateX: 50 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'timing', duration: 300 } as any}
                    className="flex-1"
                >
                    <View className="gap-6">
                        <Input
                            label="License Number"
                            placeholder="e.g. 12345678"
                            value={license}
                            onChangeText={setLicense}
                        />
                        <Input
                            label="Trade"
                            placeholder="e.g. Electrician"
                            value={trade}
                            onChangeText={setTrade}
                        />
                    </View>

                    <View className="mt-auto mb-10">
                        <Button
                            label="Next Step"
                            onPress={handleDetailsComplete}
                            size="lg"
                            icon={<ArrowRightIcon size={20} color="white" />}
                        />
                    </View>
                </MotiView>
            )}

            {step === 3 && (
                <MotiView
                    from={{ opacity: 0, translateX: 50 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'timing', duration: 300 } as any}
                    className="flex-1"
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        className="flex-1"
                        keyboardVerticalOffset={10}
                    >
                        <ScrollView
                            className="flex-1"
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 40 }}
                        >
                            <View className="gap-6 mt-2">
                                <View className="flex-row gap-4">
                                    <View className="flex-1">
                                        <Input
                                            label="First Name"
                                            placeholder="John"
                                            value={firstName}
                                            onChangeText={setFirstName}
                                            autoCapitalize="words"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Input
                                            label="Last Name"
                                            placeholder="Doe"
                                            value={lastName}
                                            onChangeText={setLastName}
                                            autoCapitalize="words"
                                        />
                                    </View>
                                </View>

                                <Input
                                    label="Location"
                                    placeholder="e.g. Melbourne, VIC"
                                    value={location}
                                    onChangeText={setLocation}
                                    autoCapitalize="words"
                                />

                                <Input
                                    label="Email"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                                <Input
                                    label="Password"
                                    placeholder="Min 6 characters"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>

                            <View className="mt-10 mb-4">
                                <Button
                                    label="Complete Setup"
                                    onPress={handleComplete}
                                    loading={loading}
                                    size="lg"
                                    icon={<CheckIcon size={20} color="white" />}
                                />
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </MotiView>
            )}
        </View>
    );
}
