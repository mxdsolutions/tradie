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
    SparklesIcon,
    BuildingStorefrontIcon,
    ClockIcon,
    CurrencyDollarIcon,
    MapPinIcon,
    PencilSquareIcon,
    ExclamationTriangleIcon,
    CalendarDaysIcon,
} from 'react-native-heroicons/outline';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';
import { cn } from '../../lib/utils';

// --- Constants ---

const TRADE_CATEGORIES = [
    { id: 'Plumbing', icon: WrenchScrewdriverIcon },
    { id: 'Electrical', icon: BoltIcon },
    { id: 'Carpentry', icon: HomeModernIcon },
    { id: 'Painting', icon: PaintBrushIcon },
    { id: 'Landscaping', icon: SparklesIcon },
    { id: 'Tiling', icon: BuildingStorefrontIcon },
    { id: 'Roofing', icon: HomeModernIcon },
    { id: 'Fencing', icon: BuildingStorefrontIcon },
    { id: 'Concreting', icon: WrenchScrewdriverIcon },
    { id: 'Demolition', icon: ExclamationTriangleIcon },
    { id: 'Cleaning', icon: SparklesIcon },
    { id: 'General', icon: WrenchScrewdriverIcon },
];

const BUDGET_RANGES = [
    { id: 'under_500', label: '$0 – $500' },
    { id: '500_2k', label: '$500 – $2K' },
    { id: '2k_5k', label: '$2K – $5K' },
    { id: '5k_10k', label: '$5K – $10K' },
    { id: '10k_plus', label: '$10K+' },
    { id: 'not_sure', label: 'Not Sure' },
];

const URGENCY_OPTIONS = [
    { id: 'flexible', label: 'Flexible', description: 'No rush, whenever works', icon: CalendarDaysIcon },
    { id: 'within_week', label: 'Within a Week', description: 'Need it done soon', icon: ClockIcon },
    { id: 'urgent', label: 'Urgent', description: 'ASAP, it\'s critical', icon: ExclamationTriangleIcon },
];

const TITLE_PLACEHOLDERS: Record<string, string> = {
    Plumbing: 'e.g. Fix leaking shower head',
    Electrical: 'e.g. Install downlights in kitchen',
    Carpentry: 'e.g. Build custom bookshelf',
    Painting: 'e.g. Paint exterior of house',
    Landscaping: 'e.g. Redesign backyard garden',
    Tiling: 'e.g. Retile bathroom floor',
    Roofing: 'e.g. Replace roof tiles',
    Fencing: 'e.g. Install new Colorbond fence',
    Concreting: 'e.g. Pour new driveway slab',
    Demolition: 'e.g. Remove old garden shed',
    Cleaning: 'e.g. End of lease deep clean',
    General: 'e.g. General home maintenance',
};

const TOTAL_STEPS = 7;

const STEP_TITLES = [
    'What do you need?',
    'Give it a title',
    'Where is the job?',
    'Describe the work',
    'What\'s your budget?',
    'How soon?',
    'Review & Post',
];

// --- Component ---

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
    const [budgetRange, setBudgetRange] = useState('');
    const [urgency, setUrgency] = useState('');

    const canProceed = () => {
        switch (step) {
            case 1: return !!type;
            case 2: return !!title;
            case 3: return !!address;
            case 4: return true; // description is optional
            case 5: return !!budgetRange;
            case 6: return !!urgency;
            case 7: return true;
            default: return false;
        }
    };

    const handleNext = () => {
        if (!canProceed()) {
            const messages: Record<number, string> = {
                1: 'Please select a trade category',
                2: 'Please enter a title',
                3: 'Please enter the project address',
                5: 'Please select a budget range',
                6: 'Please select a timeline',
            };
            Alert.alert(messages[step] || 'Please complete this step');
            return;
        }

        if (step === TOTAL_STEPS) {
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
                type,
                address,
                status: 'Open',
                progress: 0,
            });

            if (error) throw error;
            router.replace('/(homeowner)/(tabs)');
        } catch (error: any) {
            Alert.alert('Error creating project', error.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Render ---

    return (
        <View className="flex-1 bg-background">
            <StatusBar style="light" />

            {/* Dark Header with Step Indicator */}
            <View
                className="bg-primary px-6 pb-6 border-b border-white/10 z-10 shadow-medium"
                style={{ paddingTop: insets.top + 12 }}
            >
                <View className="flex-row items-center justify-between mb-5">
                    <TouchableOpacity
                        onPress={() => step === 1 ? router.back() : setStep(step - 1)}
                        className="w-10 h-10 items-center justify-center -ml-2 rounded-full"
                    >
                        {/* @ts-ignore */}
                        <ArrowLeftIcon size={24} color="white" />
                    </TouchableOpacity>
                    <Typography variant="h3" className="text-white text-lg">{STEP_TITLES[step - 1]}</Typography>
                    <View className="w-10" />
                </View>

                {/* Step Dots */}
                <View className="flex-row justify-center items-center gap-2">
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                        <View
                            key={i}
                            className={cn(
                                "h-2 rounded-full",
                                i + 1 === step ? "w-6 bg-accent" :
                                    i + 1 < step ? "w-2 bg-white" : "w-2 bg-white/30"
                            )}
                        />
                    ))}
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1 px-6 pt-8"
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ====== STEP 1: Trade Category ====== */}
                    {step === 1 && (
                        <View>
                            <Typography variant="h2" className="text-2xl mb-2">What trade do you need?</Typography>
                            <Typography variant="body" className="text-slate-500 mb-8">Select the category that best matches your job.</Typography>

                            <View className="flex-row flex-wrap gap-2.5">
                                {TRADE_CATEGORIES.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        onPress={() => setType(item.id)}
                                        className={cn(
                                            "w-[31%] bg-white p-3.5 rounded-2xl border items-center justify-center h-28",
                                            type === item.id
                                                ? "border-primary bg-primary/5"
                                                : "border-slate-100"
                                        )}
                                    >
                                        <View className={cn(
                                            "w-11 h-11 rounded-full items-center justify-center mb-2.5",
                                            type === item.id ? "bg-primary" : "bg-slate-100"
                                        )}>
                                            {/* @ts-ignore */}
                                            <item.icon size={22} color={type === item.id ? "white" : "#64748B"} />
                                        </View>
                                        <Typography variant="caption" className={cn(
                                            "text-xs font-semibold text-center",
                                            type === item.id ? "text-primary" : "text-slate-600"
                                        )}>{item.id}</Typography>

                                        {type === item.id && (
                                            <View className="absolute top-2.5 right-2.5 bg-primary rounded-full p-0.5">
                                                {/* @ts-ignore */}
                                                <CheckIcon size={10} color="white" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* ====== STEP 2: Title ====== */}
                    {step === 2 && (
                        <View>
                            <Typography variant="h2" className="text-2xl mb-2">Give your project a title</Typography>
                            <Typography variant="body" className="text-slate-500 mb-8">A short, clear title helps tradies understand what you need at a glance.</Typography>

                            <Input
                                placeholder={TITLE_PLACEHOLDERS[type] || 'e.g. General home maintenance'}
                                value={title}
                                onChangeText={setTitle}
                                className="text-lg h-16"
                            />
                        </View>
                    )}

                    {/* ====== STEP 3: Address ====== */}
                    {step === 3 && (
                        <View>
                            <Typography variant="h2" className="text-2xl mb-2">Where is the job?</Typography>
                            <Typography variant="body" className="text-slate-500 mb-8">Tradies need to know the location before they can quote.</Typography>

                            <Input
                                placeholder="e.g. 123 Smith St, Collingwood VIC"
                                value={address}
                                onChangeText={setAddress}
                                className="text-lg h-16"
                            />
                        </View>
                    )}

                    {/* ====== STEP 4: Description ====== */}
                    {step === 4 && (
                        <View>
                            <Typography variant="h2" className="text-2xl mb-2">Describe the work</Typography>
                            <Typography variant="body" className="text-slate-500 mb-8">The more detail you provide, the better quotes you'll get. Include access info, materials preferences, anything helpful.</Typography>

                            <Input
                                placeholder="Describe the scope of work, any special requirements, access details..."
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={6}
                                style={{ height: 180, textAlignVertical: 'top' }}
                            />

                            <TouchableOpacity onPress={() => setStep(step + 1)} className="mt-4 self-end">
                                <Typography variant="body" className="text-accent text-sm font-semibold">Skip for now</Typography>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* ====== STEP 5: Budget ====== */}
                    {step === 5 && (
                        <View>
                            <Typography variant="h2" className="text-2xl mb-2">What's your budget?</Typography>
                            <Typography variant="body" className="text-slate-500 mb-8">This helps tradies decide if the job is right for them. You can always negotiate later.</Typography>

                            <View className="gap-3">
                                {BUDGET_RANGES.map((range) => (
                                    <TouchableOpacity
                                        key={range.id}
                                        onPress={() => setBudgetRange(range.id)}
                                        className={cn(
                                            "w-full py-4 px-5 rounded-2xl border flex-row items-center justify-between",
                                            budgetRange === range.id
                                                ? "bg-primary border-primary"
                                                : "bg-white border-slate-100"
                                        )}
                                    >
                                        <Typography variant="body" className={cn(
                                            "font-semibold text-base",
                                            budgetRange === range.id ? "text-white" : "text-slate-700"
                                        )}>{range.label}</Typography>
                                        {budgetRange === range.id && (
                                            <View className="bg-white/20 rounded-full p-1">
                                                {/* @ts-ignore */}
                                                <CheckIcon size={14} color="white" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* ====== STEP 6: Urgency ====== */}
                    {step === 6 && (
                        <View>
                            <Typography variant="h2" className="text-2xl mb-2">How soon do you need this?</Typography>
                            <Typography variant="body" className="text-slate-500 mb-8">Set expectations for tradies responding to your post.</Typography>

                            <View className="gap-3">
                                {URGENCY_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.id}
                                        onPress={() => setUrgency(option.id)}
                                        className={cn(
                                            "flex-row items-center p-5 rounded-2xl border",
                                            urgency === option.id
                                                ? "bg-primary/5 border-primary"
                                                : "bg-white border-slate-100"
                                        )}
                                    >
                                        <View className={cn(
                                            "w-12 h-12 rounded-full items-center justify-center mr-4",
                                            urgency === option.id ? "bg-primary" : "bg-slate-100"
                                        )}>
                                            {/* @ts-ignore */}
                                            <option.icon size={24} color={urgency === option.id ? "white" : "#64748B"} />
                                        </View>
                                        <View className="flex-1">
                                            <Typography variant="h3" className={cn(
                                                "text-base mb-0.5",
                                                urgency === option.id ? "text-primary" : "text-slate-900"
                                            )}>{option.label}</Typography>
                                            <Typography variant="caption" className="text-slate-500 text-xs">{option.description}</Typography>
                                        </View>
                                        {urgency === option.id && (
                                            <View className="bg-primary rounded-full p-1 ml-2">
                                                {/* @ts-ignore */}
                                                <CheckIcon size={14} color="white" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* ====== STEP 7: Review & Post ====== */}
                    {step === 7 && (
                        <View>
                            <Typography variant="h2" className="text-2xl mb-2">Looking good!</Typography>
                            <Typography variant="body" className="text-slate-500 mb-6">Review your post before it goes live.</Typography>

                            {/* Summary Card */}
                            <View className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
                                {/* Trade & Title */}
                                <View className="p-5 border-b border-slate-50">
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View className="flex-row items-center flex-1">
                                            <View className="w-11 h-11 rounded-full bg-primary items-center justify-center mr-3">
                                                {(() => {
                                                    const SelectedIcon = TRADE_CATEGORIES.find(t => t.id === type)?.icon || WrenchScrewdriverIcon;
                                                    // @ts-ignore
                                                    return <SelectedIcon size={22} color="white" />;
                                                })()}
                                            </View>
                                            <View className="flex-1">
                                                <Typography variant="caption" className="text-accent text-xs font-bold uppercase tracking-wider mb-0.5">{type}</Typography>
                                                <Typography variant="h3" className="text-lg">{title}</Typography>
                                            </View>
                                        </View>
                                        <TouchableOpacity onPress={() => setStep(1)} className="p-1.5">
                                            {/* @ts-ignore */}
                                            <PencilSquareIcon size={18} color="#94A3B8" />
                                        </TouchableOpacity>
                                    </View>
                                    {description ? (
                                        <Typography variant="body" className="text-slate-500 text-sm leading-5">{description}</Typography>
                                    ) : null}
                                </View>

                                {/* Location */}
                                <ReviewRow
                                    icon={<MapPinIcon size={18} color="#64748b" />}
                                    label="Location"
                                    value={address}
                                    onEdit={() => setStep(3)}
                                />

                                {/* Budget */}
                                <ReviewRow
                                    icon={<CurrencyDollarIcon size={18} color="#64748b" />}
                                    label="Budget"
                                    value={BUDGET_RANGES.find(b => b.id === budgetRange)?.label || '—'}
                                    onEdit={() => setStep(5)}
                                />

                                {/* Urgency */}
                                <ReviewRow
                                    icon={<ClockIcon size={18} color="#64748b" />}
                                    label="Timeline"
                                    value={URGENCY_OPTIONS.find(u => u.id === urgency)?.label || '—'}
                                    onEdit={() => setStep(6)}
                                    isLast
                                />
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Bottom CTA */}
                <View
                    className="p-6 bg-white border-t border-slate-100"
                    style={{ paddingBottom: insets.bottom + 20 }}
                >
                    <Button
                        label={
                            step === TOTAL_STEPS ? "Post Project" :
                                step === 4 ? "Continue" : "Continue"
                        }
                        onPress={handleNext}
                        loading={loading}
                        size="lg"
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

// --- Helper Component ---

function ReviewRow({ icon, label, value, onEdit, isLast = false }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    onEdit: () => void;
    isLast?: boolean;
}) {
    return (
        <View className={cn("flex-row items-center px-5 py-4", !isLast && "border-b border-slate-50")}>
            <View className="w-9 h-9 rounded-xl bg-slate-50 items-center justify-center mr-3">
                {/* @ts-ignore */}
                {icon}
            </View>
            <View className="flex-1">
                <Typography variant="caption" className="text-text-tertiary text-xs uppercase tracking-wider mb-0.5">{label}</Typography>
                <Typography variant="body" className="text-slate-900 font-medium">{value}</Typography>
            </View>
            <TouchableOpacity onPress={onEdit} className="p-1.5">
                {/* @ts-ignore */}
                <PencilSquareIcon size={16} color="#94A3B8" />
            </TouchableOpacity>
        </View>
    );
}
