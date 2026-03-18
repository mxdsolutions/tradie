import { View, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography, Button } from '@tradie/shared-ui';
import { ArrowLeftIcon, CameraIcon, CheckBadgeIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useUser, supabase } from '@tradie/core';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user } = useUser();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            loadUserData();
        }
    }, [user]);

    const loadUserData = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user?.id)
                .single();

            if (error) throw error;
            if (data) {
                setFirstName(data.first_name || '');
                setLastName(data.last_name || '');
                setEmail(data.email || user?.email || '');
                setPhone(data.phone || '');
                setLocation(data.location || '');
                setAvatarUrl(data.avatar_url || null);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                uploadAvatar(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Error picking image');
        }
    };

    const uploadAvatar = async (uri: string) => {
        try {
            setUploading(true);
            const response = await fetch(uri);
            const blob = await response.blob();
            const arrayBuffer = await new Response(blob).arrayBuffer();

            const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpeg';
            const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, arrayBuffer, {
                    contentType: `image/${fileExt}`,
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(data.publicUrl);
        } catch (error: any) {
            Alert.alert('Error uploading image', error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const updates = {
                first_name: firstName,
                last_name: lastName,
                full_name: `${firstName} ${lastName}`.trim(),
                location,
                avatar_url: avatarUrl,
                updated_at: new Date(),
            };

            const { error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;

            Alert.alert('Success', 'Profile updated successfully');
            router.back();
        } catch (error: any) {
            Alert.alert('Error updating profile', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <View
                className="px-6 py-4 border-b border-white/10 flex-row items-center bg-primary"
                style={{ paddingTop: insets.top + 10 }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-4 active:opacity-70"
                >
                    {/* @ts-ignore */}
                    <ArrowLeftIcon size={24} color="white" />
                </TouchableOpacity>
                <Typography variant="h2" className="text-xl font-bold text-white">Edit Profile</Typography>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                {/* Avatar Section */}
                <View className="items-center mb-8">
                    <View className="relative">
                        <View className="w-28 h-28 rounded-full bg-slate-100 items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                            {avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} className="w-full h-full" />
                            ) : (
                                <Typography variant="h1" className="text-slate-400 text-4xl">
                                    {(firstName?.[0] || '') + (lastName?.[0] || '') || 'JD'}
                                </Typography>
                            )}
                            {uploading && (
                                <View className="absolute inset-0 bg-black/30 items-center justify-center">
                                    <ActivityIndicator color="white" />
                                </View>
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={pickImage}
                            className="absolute bottom-0 right-0 bg-primary p-2.5 rounded-full border-2 border-white shadow-md"
                        >
                            {/* @ts-ignore */}
                            <CameraIcon size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={pickImage} className="mt-4 py-2 px-4 rounded-full active:bg-slate-50">
                        <Typography variant="body" className="text-primary font-bold text-sm">Change Profile Photo</Typography>
                    </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View className="gap-y-8">
                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Typography variant="caption" className="text-slate-500 mb-2 font-medium ml-1">First Name</Typography>
                            <TextInput
                                value={firstName}
                                onChangeText={setFirstName}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base text-slate-900 font-medium"
                            />
                        </View>
                        <View className="flex-1">
                            <Typography variant="caption" className="text-slate-500 mb-2 font-medium ml-1">Last Name</Typography>
                            <TextInput
                                value={lastName}
                                onChangeText={setLastName}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base text-slate-900 font-medium"
                            />
                        </View>
                    </View>

                    <View>
                        <Typography variant="caption" className="text-slate-500 mb-2 font-medium ml-1">Location</Typography>
                        <TextInput
                            value={location}
                            onChangeText={setLocation}
                            placeholder="e.g. Melbourne, VIC"
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base text-slate-900 font-medium"
                        />
                    </View>

                    <View>
                        <Typography variant="caption" className="text-slate-500 mb-2 font-medium ml-1">Email Address</Typography>
                        <TextInput
                            value={email}
                            editable={false}
                            className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-4 text-base text-slate-500 font-medium"
                        />
                    </View>

                    <View>
                        <View className="flex-row justify-between mb-2 ml-1">
                            <Typography variant="caption" className="text-slate-500 font-medium">Phone Number</Typography>
                            <View className="flex-row items-center gap-1">
                                {/* @ts-ignore */}
                                <CheckBadgeIcon size={14} color="#22C55E" />
                                <Typography variant="caption" className="text-green-600 font-bold text-[10px]">VERIFIED</Typography>
                            </View>
                        </View>
                        <TextInput
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="+61 400 000 000"
                            keyboardType="phone-pad"
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base text-slate-900 font-medium"
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View className="p-6 border-t border-slate-100 bg-white" style={{ paddingBottom: insets.bottom + 20 }}>
                <Button
                    label="Save Changes"
                    onPress={handleSave}
                    loading={loading}
                    size="lg"
                    className="w-full shadow-lg shadow-blue-100"
                />
            </View>
        </View>
    );
}
