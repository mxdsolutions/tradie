import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { useUser, supabase, cn, TRADE_CATEGORIES, AUSTRALIAN_STATES } from '@tradie/core';
import { ClipboardDocumentListIcon, WrenchScrewdriverIcon, ArrowRightIcon, CheckIcon } from 'react-native-heroicons/outline';
import { Typography, Button, Input } from '@tradie/shared-ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    const [licenseState, setLicenseState] = useState('VIC');
    const [licenseValues, setLicenseValues] = useState<Record<string, string>>({});

    // Animation refs
    const progressAnim = useRef(new Animated.Value(33)).current;
    const slideOpacity = useRef(new Animated.Value(0)).current;
    const slideTranslateX = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        const targetWidth = step === 1 ? 33 : step === 2 ? 66 : 100;
        Animated.timing(progressAnim, {
            toValue: targetWidth,
            duration: 500,
            useNativeDriver: false,
        }).start();

        // Animate slide in for steps 2 and 3
        if (step > 1) {
            slideOpacity.setValue(0);
            slideTranslateX.setValue(50);
            Animated.parallel([
                Animated.timing(slideOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideTranslateX, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [step]);

    const handleRoleSelect = (selectedRole: 'homeowner' | 'tradie') => {
        setRole(selectedRole);
        if (selectedRole === 'homeowner') {
            setStep(3);
        } else {
            setStep(2);
        }
    };

    const handleDetailsComplete = () => {
        if (role === 'tradie') {
            if (!trade) {
                Alert.alert('Please select a trade');
                return;
            }
            const required = TRADE_CATEGORIES.find(t => t.id === trade)?.requiredLicenses || [];
            const missing = required.some(req => !licenseValues[req]);
            if (missing) {
                Alert.alert('Please fill in all required licenses');
                return;
            }
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

                const required = TRADE_CATEGORIES.find(t => t.id === trade)?.requiredLicenses || [];
                if (required.length > 0) {
                    const lics = required.map(req => ({
                        user_id: user.id,
                        license_number: licenseValues[req],
                        license_type: req,
                        state: licenseState
                    }));
                    const { error: licenseError } = await supabase.from('tradie_licenses').insert(lics);
                    if (licenseError) throw licenseError;
                }
            }

            await setUserMode(role!);

            // Redirect to tabs (this is the homeowner app)
            router.replace('/(tabs)');

        } catch (error: any) {
            Alert.alert('Error', error.code === '23505' ? 'User already exists' : error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View
            className="flex-1 bg-white px-6"
            style={{ paddingTop: insets.top + 20 }}
        >
            <StatusBar style="dark" />

            {/* Logo */}
            <View className="items-center mb-8">
                <Image
                    source={require('../../assets/logo_icon.png')}
                    style={{ width: 60, height: 60 }}
                    contentFit="contain"
                />
            </View>

            {/* Progress Bar */}
            <View className="flex-row h-1.5 bg-slate-100 rounded-full mb-8 overflow-hidden">
                <Animated.View
                    style={{
                        width: progressAnim.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'],
                        }),
                        height: '100%',
                        borderRadius: 9999,
                        backgroundColor: '#2563EB',
                    }}
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
                        className="bg-white border border-slate-100 p-6 rounded-3xl shadow-soft"
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
                        className="bg-white border border-slate-100 p-6 rounded-3xl shadow-soft"
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
                <Animated.View
                    style={{ opacity: slideOpacity, transform: [{ translateX: slideTranslateX }], flex: 1 }}
                >
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                        <Typography variant="h2" className="text-2xl mb-4 text-slate-900">Select your trade</Typography>
                        <View className="flex-row flex-wrap gap-2.5 mb-8">
                            {TRADE_CATEGORIES.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => {
                                        setTrade(item.id);
                                        setLicenseValues({});
                                    }}
                                    className={cn(
                                        "w-[31%] bg-white p-3.5 rounded-2xl border items-center justify-center h-28",
                                        trade === item.id
                                            ? "border-primary bg-primary/5"
                                            : "border-slate-100"
                                    )}
                                >
                                    <View className={cn(
                                        "w-11 h-11 rounded-full items-center justify-center mb-2.5",
                                        trade === item.id ? "bg-primary" : "bg-slate-100"
                                    )}>
                                        {/* @ts-ignore */}
                                        <item.icon size={22} color={trade === item.id ? "white" : "#64748B"} />
                                    </View>
                                    <Typography variant="caption" className={cn(
                                        "text-[11px] font-semibold text-center",
                                        trade === item.id ? "text-primary" : "text-slate-600"
                                    )}>{item.id}</Typography>
                                    {trade === item.id && (
                                        <View className="absolute top-2.5 right-2.5 bg-primary rounded-full p-0.5">
                                            {/* @ts-ignore */}
                                            <CheckIcon size={10} color="white" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {trade && (TRADE_CATEGORIES.find(t => t.id === trade)?.requiredLicenses?.length || 0) > 0 && (
                            <View className="gap-6 mb-6">
                                <Typography variant="h3" className="text-lg">License Details</Typography>

                                <View>
                                    <Typography variant="label" className="mb-2">License State</Typography>
                                    <View className="flex-row flex-wrap gap-2">
                                        {AUSTRALIAN_STATES.map((state) => (
                                            <TouchableOpacity
                                                key={state}
                                                onPress={() => setLicenseState(state)}
                                                className={cn(
                                                    "px-4 py-2 border rounded-full",
                                                    licenseState === state ? "bg-primary border-primary" : "bg-white border-slate-200"
                                                )}
                                            >
                                                <Typography variant="body" className={cn(
                                                    "font-medium",
                                                    licenseState === state ? "text-white" : "text-slate-600"
                                                )}>{state}</Typography>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {TRADE_CATEGORIES.find(t => t.id === trade)?.requiredLicenses?.map(req => (
                                    <Input
                                        key={req}
                                        label={req}
                                        placeholder={`Enter ${req} number`}
                                        value={licenseValues[req] || ''}
                                        onChangeText={(val) => setLicenseValues(prev => ({ ...prev, [req]: val }))}
                                        className="bg-slate-100"
                                    />
                                ))}
                            </View>
                        )}
                        <View className="mt-4 mb-10">
                            <Button
                                label="Next Step"
                                onPress={handleDetailsComplete}
                                size="lg"
                                icon={<ArrowRightIcon size={20} color="white" />}
                            />
                        </View>
                    </ScrollView>
                </Animated.View>
            )}

            {step === 3 && (
                <Animated.View
                    style={{ opacity: slideOpacity, transform: [{ translateX: slideTranslateX }], flex: 1 }}
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
                                            className="bg-slate-100"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Input
                                            label="Last Name"
                                            placeholder="Doe"
                                            value={lastName}
                                            onChangeText={setLastName}
                                            autoCapitalize="words"
                                            className="bg-slate-100"
                                        />
                                    </View>
                                </View>

                                <Input
                                    label="Location"
                                    placeholder="e.g. Melbourne, VIC"
                                    value={location}
                                    onChangeText={setLocation}
                                    autoCapitalize="words"
                                    className="bg-slate-100"
                                />

                                <Input
                                    label="Email"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    className="bg-slate-100"
                                />
                                <Input
                                    label="Password"
                                    placeholder="Min 6 characters"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    className="bg-slate-100"
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
                </Animated.View>
            )}
        </View>
    );
}
