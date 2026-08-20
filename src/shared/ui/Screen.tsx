import { useTheme } from './theme';
import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  style?: ViewStyle;
}

export function Screen({ children, scroll, style }: ScreenProps) {
  const { colors } = useTheme();
  const safeStyle = [styles.safe, { backgroundColor: colors.background }];
  const contentStyle = [styles.content, { backgroundColor: colors.background }, style];

  if (scroll) {
    return (
      <SafeAreaView style={safeStyle}>
        <ScrollView contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={safeStyle}>
      <View style={contentStyle}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    padding: 16
  }
});
