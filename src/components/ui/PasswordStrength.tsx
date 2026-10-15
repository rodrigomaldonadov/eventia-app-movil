import React from 'react';
import { View, Text } from 'react-native';

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const getStrengthScore = (pwd: string): number => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
    if (pwd.length >= 10 && /[^A-Za-z0-9]/.test(pwd)) score += 1;
    return Math.min(score, 3);
  };

  const score = getStrengthScore(password);

  const getBarColor = (index: number) => {
    if (score === 0) return 'bg-indigo-100/70';
    if (index >= score) return 'bg-slate-200';

    if (score === 1) return 'bg-rose-400';
    if (score === 2) return 'bg-amber-400';
    return 'bg-indigo-600';
  };

  return (
    <View className="flex-row items-center w-full -mt-2 mb-4 px-1">
      {/* 3 Segments */}
      <View className="flex-1 flex-row items-center gap-1.5 mr-3">
        <View className={`flex-1 h-1.5 rounded-full ${getBarColor(0)}`} />
        <View className={`flex-1 h-1.5 rounded-full ${getBarColor(1)}`} />
        <View className={`flex-1 h-1.5 rounded-full ${getBarColor(2)}`} />
      </View>

      {/* Label */}
      <Text className="text-xs text-slate-400 font-medium">
        Seguridad
      </Text>
    </View>
  );
};

export default PasswordStrength;
