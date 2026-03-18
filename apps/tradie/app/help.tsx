import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '@tradie/shared-ui';
import { ArrowLeftIcon, QuestionMarkCircleIcon, ChatBubbleLeftRightIcon, BookOpenIcon, ShieldCheckIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HelpScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const HelpItem = ({ icon: Icon, title, description }: any) => (
        <TouchableOpacity className="flex-row items-center p-4 bg-white rounded-2xl mb-4 border border-slate-100 active:bg-slate-50">
            <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center mr-4">
                <Icon size={24} color="#0F172A" />
            </View>
            <View className="flex-1">
                <Typography variant="h3" className="text-base mb-0.5">{title}</Typography>
                <Typography variant="caption" className="text-slate-500">{description}</Typography>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View
                className="px-6 py-4 border-b border-white/10 flex-row items-center bg-primary"
                style={{ paddingTop: insets.top + 10 }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-4 active:opacity-70"
                >
                    <ArrowLeftIcon size={24} color="white" />
                </TouchableOpacity>
                <Typography variant="h2" className="text-xl font-bold text-white">Help & Support</Typography>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                <View className="mb-8">
                    <Typography variant="h1" className="text-3xl mb-2">How can we help?</Typography>
                    <Typography variant="body" className="text-slate-500 text-lg">
                        Find answers to common questions or get in touch with our team.
                    </Typography>
                </View>

                <View>
                    <HelpItem
                        icon={BookOpenIcon}
                        title="Knowledge Base"
                        description="Browse articles and guides for using TRADIE"
                    />
                    <HelpItem
                        icon={ChatBubbleLeftRightIcon}
                        title="Contact Support"
                        description="Chat with our friendly support team"
                    />
                    <HelpItem
                        icon={ShieldCheckIcon}
                        title="Safety & Trust"
                        description="Our commitment to your security"
                    />
                </View>

                <View className="mt-8 p-6 bg-primary rounded-3xl items-center">
                    <QuestionMarkCircleIcon size={48} color="white" className="mb-4 opacity-50" />
                    <Typography variant="h3" className="text-white text-center mb-2">Still need help?</Typography>
                    <Typography variant="body" className="text-blue-100 text-center mb-6">
                        We're available 9am-5pm AEDT, Monday to Friday.
                    </Typography>
                    <TouchableOpacity className="bg-white py-3 px-8 rounded-full">
                        <Typography className="text-primary font-bold">Email Us</Typography>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
