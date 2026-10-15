import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  children: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, children }) => {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      className="flex-row items-center my-3 active:opacity-75"
    >
      <View
        className={`w-5 h-5 rounded-md border items-center justify-center mr-3 ${
          checked
            ? 'bg-indigo-600 border-indigo-600'
            : 'bg-white border-slate-300'
        }`}
      >
        {checked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
      </View>
      <View className="flex-1">{children}</View>
    </Pressable>
  );
};

export default Checkbox;
