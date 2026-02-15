import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeftIcon, HomeModernIcon, SparklesIcon, BuildingStorefrontIcon, WrenchScrewdriverIcon, CheckIcon } from 'react-native-heroicons/outline';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';
import { cn } from '../../lib/utils';
import { Alert } from 'react-native';

const PROJECT_TYPES = [
    { id: 'Renovation', icon: HomeModernIcon },
    { id: 'Extension', icon: SparklesIcon },
    { id: 'New Build', icon: BuildingStorefrontIcon },
    { id: 'Repairs', icon: WrenchScrewdriverIcon }
];

export default function CreateProjectScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useUser();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [type, setType] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');

    const handleNext = () => {
        if (step === 1 && !type) {
            Alert.alert('Please select a project type');
            return;
        }
        if (step === 2 && (!title || !address)) {
            Alert.alert('Please fill in the project details');
            return;
        }

        if (step === 2) {
            handleSubmit();
        } else {
            setStep(step + 1);
        }
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('projects').insert({
                homeowner_id: user.id,
                title,
                description,
                type,
                location: address,
                status: 'Planning',
                progress: 0
            });

            if (error) throw error;
            router.replace('/(homeowner)/(tabs)');
        } catch (error: any) {
            Alert.alert('Error creating project', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-background">
            <StatusBar style="dark" />
            <View
                className="bg-white px-6 pb-4 border-b border-slate-100 z-10"
                style={{ paddingTop: insets.top }}
            >
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity
                        onPress={() => step === 1 ? router.back() : setStep(step - 1)}
                        className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-slate-50"
                    >
                        <ArrowLeftIcon size={24} color="#0F172A" />
                    </TouchableOpacity>
                    <Typography variant="h3">New Project</Typography>
                    <View className="w-10" />
                </View>

                {/* Progress Bar */}
                <View className="flex-row h-1 bg-slate-100 rounded-full overflow-hidden">
                    <View
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: step === 1 ? '50%' : '100%' }}
                    />
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="flex-1 px-6 pt-6">
                    {step === 1 ? (
                        <View>
                            <Typography variant="h2" className="mb-2">What kind of project is this?</Typography>
                            <Typography variant="body" className="text-slate-500 mb-8">Choose the category that best fits your needs.</Typography>

                            <View className="flex-row flex-wrap gap-3">
                                {PROJECT_TYPES.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        onPress={() => setType(item.id)}
                                        className={cn(
                                            "w-[48%] bg-white p-4 rounded-2xl border mb-1 h-36 justify-between transition-all",
                                            type === item.id
                                                ? "border-primary bg-primary/5 shadow-md"
                                                : "border-slate-100 shadow-sm"
                                        )}
                                    >
                                        <View className={cn(
                                            "w-12 h-12 rounded-full items-center justify-center",
                                            type === item.id ? "bg-primary" : "bg-slate-100"
                                        )}>
                                            <item.icon size={24} color={type === item.id ? "white" : "#64748B"} />
                                        </View>

                                        <View>
                                            <Typography variant="h3" className={cn(
                                                "text-base mb-1",
                                                type === item.id ? "text-primary" : "text-slate-900"
                                            )}>{item.id}</Typography>
                                        </View>

                                        {type === item.id && (
                                            <View className="absolute top-4 right-4 bg-primary rounded-full p-1">
                                                <CheckIcon size={12} color="white" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <View className="gap-6">
                            <View>
                                <Typography variant="h2" className="mb-2">Project Details</Typography>
                                <Typography variant="body" className="text-slate-500">Tell us a bit more about what you're planning.</Typography>
                            </View>

                            <Input
                                label="Project Title"
                                placeholder="e.g. Dream Kitchen Renovation"
                                value={title}
                                onChangeText={setTitle}
                            />

                            <Input
                                label="Project Address"
                                placeholder="e.g. 123 Smith St, Collingwood"
                                value={address}
                                onChangeText={setAddress}
                            />

                            <View>
                                <Typography variant="label" className="mb-2 text-slate-700">Description (Optional)</Typography>
                                <Input
                                    placeholder="Describe your vision, requirements, etc."
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={4}
                                    style={{ height: 120, textAlignVertical: 'top' }}
                                />
                            </View>
                        </View>
                    )}
                </ScrollView>

                <View
                    className="p-6 bg-white border-t border-slate-100"
                    style={{ paddingBottom: insets.bottom + 20 }}
                >
                    <Button
                        label={step === 1 ? "Next Step" : "Create Project"}
                        onPress={handleNext}
                        loading={loading}
                        size="lg"
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
