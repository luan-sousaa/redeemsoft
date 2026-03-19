import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';

type LogoSize = 'sm' | 'md' | 'lg';

const sizeConfig: Record<LogoSize, { circle: number; letter: number; text: number }> = {
  sm: { circle: 30, letter: 16, text: 18 },
  md: { circle: 40, letter: 22, text: 24 },
  lg: { circle: 52, letter: 28, text: 30 },
};

export function Logo({ size = 'md' }: { size?: LogoSize }) {
  const config = sizeConfig[size];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.circle,
          { width: config.circle, height: config.circle, borderRadius: config.circle / 2 },
        ]}
      >
        <Text style={[styles.letter, { fontSize: config.letter }]}>R</Text>
      </View>
      <Text style={[styles.wordmark, { fontSize: config.text }]}>RedeemSoft</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circle: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    color: Colors.white,
    fontWeight: '800',
  },
  wordmark: {
    color: Colors.white,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
