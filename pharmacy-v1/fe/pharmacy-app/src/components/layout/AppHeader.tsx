import React from 'react';
import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppSelector } from '../../store/hooks';

interface AppHeaderProps {
  showSearch?: boolean;
  title?: string;
  showBack?: boolean;
  showCart?: boolean;
  searchText?: string;
  onSearchTextChange?: (text: string) => void;
  onSearchSubmit?: () => void;
  editableSearch?: boolean;
  customRightElement?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  showSearch = true, 
  title, 
  showBack = false,
  showCart = true,
  searchText,
  onSearchTextChange,
  onSearchSubmit,
  editableSearch = false,
  customRightElement
}) => {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { totalItemsBadge } = useAppSelector((state) => state.cart);

  return (
    <View className="bg-white border-b border-gray-100 pt-2 pb-3 px-4 shadow-sm z-50">
      <View className="flex-row items-center justify-between">
        {/* LEFT */}
        {showBack ? (
           <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
           </TouchableOpacity>
        ) : (
           !editableSearch && (
             <View className="flex-1 mr-2">
                 {title ? (
                   <Text className="text-xl font-bold text-blue-900">{title}</Text>
                 ) : (
                   <View className="flex-row items-center">
                      <Text className="text-gray-500 text-xs mr-1">Xin chào,</Text>
                      <Text className="text-sm font-bold text-blue-900" numberOfLines={1}>
                          {user?.username || 'Khách'}
                      </Text>
                   </View>
                 )}
             </View>
           )
        )}

        {/* CENTER: Search Bar */}
        {/* {showSearch && (
             <View className={`flex-1 bg-gray-100 rounded-lg flex-row items-center px-3 h-10 ${!showBack && !editableSearch ? 'mx-2' : 'mr-2'}`}>
                <Ionicons name="search-outline" size={18} color="#6B7280" />
                <TextInput 
                    placeholder="Tìm thuốc, sản phẩm..." 
                    className="flex-1 ml-2 text-sm text-gray-800"
                    onFocus={!editableSearch ? () => router.push('/(tabs)/products') : undefined} 
                    placeholderTextColor="#9CA3AF"
                    editable={editableSearch}
                    value={searchText}
                    onChangeText={onSearchTextChange}
                    onSubmitEditing={onSearchSubmit}
                    returnKeyType="search"
                />
             </View>
        )} */}


        {/* RIGHT: Actions */}
        <View className="flex-row items-center">
             {customRightElement ? (
                 customRightElement
             ) : (
                <>
                     {/* Cart */}
                     {showCart && (
                        <TouchableOpacity onPress={() => router.push('/(tabs)/cart')} className="ml-3 relative p-1">
                            <Ionicons name="cart-outline" size={26} color="#1F2937" />
                            {totalItemsBadge > 0 && (
                                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center border-2 border-white">
                                    <Text className="text-white text-[10px] font-bold">{totalItemsBadge}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                     )}

                     {/* Profile Avatar */}
                     {!showBack && (
                        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} className="ml-3">
                            <View className="w-9 h-9 bg-blue-50 rounded-full items-center justify-center border border-blue-100 overflow-hidden">
                                 {user?.profilePic  ? (
                                    <Image source={{ uri: user.profilePic }} className="w-full h-full" />
                                 ) : (
                                    <Ionicons name="person" size={18} color="#2563EB" />
                                 )}
                            </View>
                        </TouchableOpacity>
                     )}
                </>
             )}
        </View>
      </View>
    </View>
  );
};
