import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  Pressable,
} from 'react-native';

interface FormInputProps extends TextInputProps {
  label: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4 w-full">
      {/* Label */}
      <Text className="text-sm font-semibold text-slate-800 mb-2">
        {label}
      </Text>

      {/* Input Box */}
      <View
        className={`flex-row items-center bg-white rounded-2xl border px-4 py-3.5 shadow-xs ${
          error
            ? 'border-rose-400 bg-rose-50/20'
            : isFocused
            ? 'border-indigo-500 bg-white ring-2 ring-indigo-100'
            : 'border-slate-100'
        }`}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}

        <TextInput
          placeholderTextColor="#94A3B8"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 text-base text-slate-900 py-0"
          {...props}
        />

        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="ml-2"
          >
            {rightIcon}
          </Pressable>
        )}
      </View>

      {/* Error message */}
      {error ? (
        <Text className="text-xs text-rose-500 font-medium mt-1.5 ml-1">
          {error}
        </Text>
      ) : null}
    </View>
  );
};

export default FormInput;
