import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { Controller, Control } from 'react-hook-form';
import { clsx } from 'clsx';

interface FormFieldProps extends TextInputProps {
  control: Control<any>;
  name: string;
  label: string;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  control,
  name,
  label,
  error,
  ...props
}) => {
  return (
    <View className="mb-4">
      <Text className="text-gray-700 font-medium mb-1.5 ml-1">{label}</Text>
      
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className={clsx(
              "bg-white border rounded-xl px-4 py-3 text-base text-gray-800",
              error ? "border-red-500" : "border-gray-200 focus:border-blue-500" // Đổi emerald -> blue
            )}
            placeholderTextColor="#9CA3AF"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            {...props}
          />
        )}
      />
      
      {error && (
        <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
};