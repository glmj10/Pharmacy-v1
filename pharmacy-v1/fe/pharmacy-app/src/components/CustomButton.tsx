import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { clsx } from 'clsx';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  variant = 'primary',
  disabled = false,
}) => {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading || disabled}
      className={clsx(
        "rounded-xl py-3.5 items-center justify-center shadow-sm mt-2",
        isPrimary ? "bg-blue-600 active:bg-blue-700" : "bg-transparent border border-blue-600", // Đổi emerald -> blue
        disabled && "opacity-70"
      )}
    >
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? "white" : "#2563EB"} />
      ) : (
        <Text
          className={clsx(
            "font-bold text-lg",
            isPrimary ? "text-white" : "text-blue-600" // Đổi emerald -> blue
          )}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};