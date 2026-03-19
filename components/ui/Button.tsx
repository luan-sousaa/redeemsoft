import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

type ButtonVariant = 'primary' | 'outline' | 'ghost';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  leftIcon,
  style,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  }

  function handlePressOut() {
    scale.value = withSpring(1.0, { damping: 15, stiffness: 300 });
  }

  const isDisabled = disabled || isLoading;

  const containerStyle = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'outline' && styles.outline,
    variant === 'ghost' && styles.ghost,
    isDisabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    variant === 'primary' && styles.textPrimary,
    variant === 'outline' && styles.textOutline,
    variant === 'ghost' && styles.textGhost,
  ];

  const indicatorColor =
    variant === 'primary' ? Colors.white : Colors.primary;

  return (
    <Animated.View style={[animatedStyle, { width: '100%' }]}>
      <Pressable
        onPress={isDisabled ? undefined : onPress}
        onPressIn={isDisabled ? undefined : handlePressIn}
        onPressOut={isDisabled ? undefined : handlePressOut}
        style={containerStyle}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      >
        {isLoading ? (
          <ActivityIndicator color={indicatorColor} size="small" />
        ) : (
          <>
            {leftIcon && <>{leftIcon}</>}
            <Text style={[textStyle, leftIcon ? { marginLeft: 10 } : undefined]}>
              {title}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 24,
    width: '100%',
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  outline: {
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: Colors.transparent,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
  textPrimary: {
    color: Colors.white,
  },
  textOutline: {
    color: Colors.primary,
  },
  textGhost: {
    color: Colors.textSecondary,
  },
});
