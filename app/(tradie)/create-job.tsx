import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
    ArrowLeftIcon,
    WrenchScrewdriverIcon,
    BoltIcon,
    PaintBrushIcon,
    HomeModernIcon,
    CheckIcon,
} from 'react-native-heroicons/outline';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';
import { cn } from '../../lib/utils';

const JOB_TYPES = [
    { id: 'Plumbing', icon: WrenchScrewdriverIcon },
    { id: 'Electrical', icon: BoltIcon },
    { id: 'Carpentry', icon: HomeModernIcon },
    { id: 'Painting', icon: PaintBrushIcon },
    { id: 'Landscaping', icon: HomeModernIcon },
    { id: 'General', icon: WrenchScrewdriverIcon },
];

export default function CreateJobScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useUser();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [type, setType] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [amount, setAmount] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');

    const handleNext = () => {
        if (step === 1 && !type) {
            Alert.alert('Please select a job type');
            return;
        }
        if (step === 2 && (!title || !location)) {
            Alert.alert('Please fill in the job details');
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
            const { error } = await supabase.from('jobs').insert({
                tradie_id: user.id,
                title,
                description,
                type,
                location,
                amount: amount ? parseFloat(amount) : 0,
                scheduled_date: scheduledDate || null,
                status: 'Scheduled',
            });

            if (error) throw error;
            router.back();
        } catch (error: any) {
            Alert.alert('Error creating job', error.message);
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
                        {/* @ts-ignore */}
                        <ArrowLeftIcon size={24} color="#0F172A" />
                    </TouchableOpacity>
                    <Typography variant="h3">New Job</Typography>
                    <View className="w-10" />
                </View>

                {/* Progress Bar */}
                <View className="flex-row h-1 bg-slate-100 rounded-full overflow-hidden">
                    <View
                        className="h-full bg-primary"
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
                            <Typography variant="h2" className="mb-2">What type of job is this?</Typography>
                            <Typography variant="body" className="text-slate-500 mb-8">Choose the category that best fits this job.</Typography>

                            <View className="flex-row flex-wrap gap-3">
                                {JOB_TYPES.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        onPress={() => setType(item.id)}
                                        className={cn(
                                            "w-[48%] bg-white p-4 rounded-2xl border mb-1 h-36 justify-between",
                                            type === item.id
                                                ? "border-primary bg-primary/5 shadow-md"
                                                : "border-slate-100 shadow-sm"
                                        )}
                                    >
                                        <View className={cn(
                                            "w-12 h-12 rounded-full items-center justify-center",
                                            type === item.id ? "bg-primary" : "bg-slate-100"
                                        )}>
                                            {/* @ts-ignore */}
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
                                                {/* @ts-ignore */}
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
                                <Typography variant="h2" className="mb-2">Job Details</Typography>
                                <Typography variant="body" className="text-slate-500">Add the details for this job.</Typography>
                            </View>

                            <Input
                                label="Job Title"
                                placeholder="e.g. Kitchen Plumbing Repair"
                                value={title}
                                onChangeText={setTitle}
                            />

                            <Input
                                label="Location"
                                placeholder="e.g. 123 Smith St, Collingwood"
                                value={location}
                                onChangeText={setLocation}
                            />

                            <Input
                                label="Amount ($)"
                                placeholder="e.g. 1500"
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                            />

                            <Input
                                label="Scheduled Date"
                                placeholder="e.g. 2026-03-15"
                                value={scheduledDate}
                                onChangeText={setScheduledDate}
                            />

                            <View>
                                <Typography variant="label" className="mb-2 text-slate-700">Description (Optional)</Typography>
                                <Input
                                    placeholder="Describe the scope of work..."
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
                        label={step === 1 ? "Next Step" : "Create Job"}
                        onPress={handleNext}
                        loading={loading}
                        size="lg"
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
