import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Image } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

const FooterSection = ({ title, children }: any) => {
    return (
        <View className="mb-6">
            <Text className="text-white font-bold text-lg mb-4">{title}</Text>
            {children}
        </View>
    );
};

const FooterLink = ({ text, onPress }: { text: string, onPress?: () => void }) => (
    <TouchableOpacity onPress={onPress} className="mb-2 flex-row items-center">
        <Ionicons name="chevron-forward" size={12} color="#60A5FA" className="mr-2" />
        <Text className="text-gray-400 text-sm ml-2">{text}</Text>
    </TouchableOpacity>
);

const SocialIcon = ({ name, color }: { name: any, color: string }) => (
    <TouchableOpacity className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center mr-3 hover:bg-gray-700">
        <FontAwesome name={name} size={18} color={color} />
    </TouchableOpacity>
);

export const AppFooter: React.FC = () => {
  return (
    <View className="bg-slate-900 pt-8 pb-20 px-4 mt-8">
      {/* Brand Info */}
      <View className="mb-8 border-b border-gray-800 pb-8">
        <View className="flex-row items-center mb-4">
             <View className="w-10 h-10 bg-blue-600 rounded-lg items-center justify-center mr-3">
                <Ionicons name="medical" size={24} color="white" />
             </View>
             <Text className="text-white text-xl font-bold">Pharmacy App</Text>
        </View>
        <Text className="text-gray-400 text-sm leading-6">
            Hệ thống nhà thuốc đạt chuẩn GPP. Chuyên cung cấp thuốc, thực phẩm chức năng chính hãng với dược sĩ tư vấn tận tâm.
        </Text>
        <View className="flex-row mt-4">
            <SocialIcon name="facebook" color="#3b5998" />
            <SocialIcon name="instagram" color="#C13584" />
            <SocialIcon name="youtube" color="#FF0000" />
        </View>
      </View>
      
      {/* Links */}
      <FooterSection title="Về chúng tôi">
         <FooterLink text="Giới thiệu" />
         <FooterLink text="Hệ thống cửa hàng" />
         <FooterLink text="Giấy phép kinh doanh" />
         <FooterLink text="Chính sách bảo mật" />
      </FooterSection>

      <FooterSection title="Danh mục">
         <FooterLink text="Thuốc không kê đơn" />
         <FooterLink text="Thực phẩm chức năng" />
         <FooterLink text="Chăm sóc cá nhân" />
         <FooterLink text="Thiết bị y tế" />
      </FooterSection>
      
      {/* Contact */}
      <FooterSection title="Liên hệ">
         <View className="space-y-3">
             <View className="flex-row items-start mb-3">
                 <Ionicons name="location" size={20} color="#3B82F6" style={{ marginTop: 2 }} />
                 <Text className="text-gray-400 ml-3 flex-1 text-sm">123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM</Text>
             </View>
             <View className="flex-row items-center mb-3">
                 <Ionicons name="call" size={20} color="#3B82F6" />
                 <Text className="text-gray-400 ml-3 text-sm">1900 123 456</Text>
             </View>
             <View className="flex-row items-center">
                 <Ionicons name="mail" size={20} color="#3B82F6" />
                 <Text className="text-gray-400 ml-3 text-sm">hotro@pharmacy.com</Text>
             </View>
         </View>
      </FooterSection>

      {/* Copyright */}
      <View className="border-t border-gray-800 pt-6 mt-2 items-center">
          <Text className="text-gray-500 text-xs">
              © {new Date().getFullYear()} Pharmacy App. All rights reserved.
          </Text>
          <Text className="text-gray-600 text-[10px] mt-1">
              Version 1.0.0
          </Text>
      </View>
    </View>
  );
};
