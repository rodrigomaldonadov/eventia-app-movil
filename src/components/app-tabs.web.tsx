import { Tabs, TabList, TabTrigger, TabSlot, type TabTriggerSlotProps } from 'expo-router/ui';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  const theme = useTheme();
  return (
    <Pressable
      {...props}
      style={[
        styles.tabButton,
        isFocused && { backgroundColor: theme.backgroundElement },
      ]}>
      <ThemedText type="smallBold" themeColor={isFocused ? 'text' : 'textSecondary'}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

export default function AppTabs() {
  const theme = useTheme();

  return (
    <Tabs style={styles.root}>
      <TabSlot style={styles.slot} />
      <TabList style={[styles.list, { backgroundColor: theme.background }]}>
        <View style={styles.inner}>
          <TabTrigger name="index" href="/" asChild>
            <TabButton>Explorar</TabButton>
          </TabTrigger>
          <TabTrigger name="tickets" href="/tickets" asChild>
            <TabButton>Mis Tickets</TabButton>
          </TabTrigger>
          <TabTrigger name="saved" href="/saved" asChild>
            <TabButton>Guardados</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton>Perfil</TabButton>
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  slot: { flex: 1 },
  list: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  inner: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: MaxContentWidth,
    justifyContent: 'space-around',
    gap: Spacing.two,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
});