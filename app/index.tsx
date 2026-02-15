import { View, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Typography } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';
import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

export default function LandingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isAuthenticated, userMode } = useUser();

    // Auto-redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            router.replace(userMode === 'homeowner' ? '/(homeowner)' : '/(tradie)');
        }
    }, [isAuthenticated, userMode]);

    return (
        <View className="flex-1">
            <StatusBar style="light" />

            <ImageBackground
                source={require('../assets/tradie_hero.jpg')}
                className="flex-1"
                resizeMode="cover"
            >
                <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
                    style={{ flex: 1, paddingHorizontal: 32, paddingTop: insets.top, paddingBottom: insets.bottom + 20, justifyContent: 'space-between' }}
                >
                    {/* Header */}
                    <View className="items-center mt-12">
                        <MotiView
                            from={{ opacity: 0, translateY: -20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 1000, delay: 500 }}
                            className="items-center"
                        >
                            <View className="w-20 h-20 bg-white/20 rounded-3xl items-center justify-center mb-6 backdrop-blur-md border border-white/30 transform rotate-3 shadow-lg shadow-black/20">
                                <Typography variant="h1" className="text-4xl text-white font-black">B</Typography>
                            </View>
                            <Typography variant="h2" className="text-white text-4xl font-bold tracking-widest uppercase opacity-90 shadow-sm">BasePro</Typography>
                        </MotiView>
                    </View>

                    {/* Bottom Content */}
                    <View className="w-full mb-8">
                        <MotiView
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 1000, delay: 800 }}
                            className="w-full space-y-8"
                        >
                            <View className="mb-4">
                                <Typography variant="h1" className="text-white text-[52px] font-bold leading-[1.05] tracking-tight mb-4 shadow-sm">
                                    Build with{'\n'}
                                    <Typography variant="h1" className="text-primary-400 font-extrabold text-[52px]">Confidence.</Typography>
                                </Typography>
                                <Typography variant="body" className="text-slate-200 text-xl leading-8 font-medium pr-8 opacity-90 shadow-sm">
                                    The trusted platform making building simpler for homeowners and tradies.
                                </Typography>
                            </View>

                            <View className="space-y-4">
                                <Button
                                    label="Get Started"
                                    onPress={() => router.push('/(auth)/onboarding')}
                                    size="lg"
                                    className="w-full bg-white active:bg-slate-100 shadow-xl shadow-black/20"
                                    textClassName="text-slate-900 font-extrabold text-lg"
                                />
                                <Button
                                    label="I already have an account"
                                    variant="ghost"
                                    onPress={() => router.push('/(auth)/sign-in')}
                                    className="w-full"
                                    textClassName="text-white font-semibold text-base opacity-90 tracking-wide"
                                />
                            </View>
                        </MotiView>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
}
