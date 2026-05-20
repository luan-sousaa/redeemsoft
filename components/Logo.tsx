import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

type LogoSize = 'sm' | 'md' | 'lg';

const sizeConfig: Record<LogoSize, number> = {
  sm: 48,
  md: 80,
  lg: 110,
};

const logoImage = require('@/assets/images/logo.png');

export function Logo({ size = 'md' }: { size?: LogoSize }) {
  const diameter = sizeConfig[size];

  return (
    <View
      style={[
        styles.circle,
        { width: diameter, height: diameter, borderRadius: diameter / 2 },
      ]}
    >
      <Image
        source={logoImage}
        style={{ width: diameter, height: diameter, borderRadius: diameter / 2 }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
