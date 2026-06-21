import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import type { ProjetoDev } from '@/services/profileService';

const GRID_GAP = 12;
const GRID_PADDING = 24;
const CARD_WIDTH = (Dimensions.get('window').width - GRID_PADDING * 2 - GRID_GAP) / 2;

type Props = {
  projeto: ProjetoDev;
  editable?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function ProjetoCard({ projeto, editable = false, onEdit, onDelete }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.cardImageContainer}>
        {projeto.foto ? (
          <Image source={{ uri: projeto.foto }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImageEmpty}>
            <Ionicons name="code-slash-outline" size={32} color={Colors.textSecondary} />
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitulo} numberOfLines={2}>{projeto.titulo}</Text>

        {projeto.stack.length > 0 && (
          <View style={styles.stackRow}>
            {projeto.stack.slice(0, 3).map(s => (
              <View key={s} style={styles.stackChip}>
                <Text style={styles.stackChipText}>{s}</Text>
              </View>
            ))}
            {projeto.stack.length > 3 && (
              <View style={styles.stackChip}>
                <Text style={styles.stackChipText}>+{projeto.stack.length - 3}</Text>
              </View>
            )}
          </View>
        )}

        {editable && (
          <View style={styles.cardActions}>
            <Pressable style={styles.editBtn} onPress={onEdit}>
              <Ionicons name="pencil-outline" size={14} color={Colors.primary} />
              <Text style={styles.editBtnText}>Editar</Text>
            </Pressable>
            <Pressable style={styles.deleteBtn} onPress={onDelete}>
              <Ionicons name="trash-outline" size={16} color={Colors.error} />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardImageContainer: { width: '100%', height: CARD_WIDTH * 0.65 },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardImageEmpty: {
    width: '100%', height: '100%',
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { padding: 10, gap: 6 },
  cardTitulo: { fontSize: 13, fontWeight: '700', color: Colors.text, lineHeight: 18 },
  stackRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  stackChip: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
  },
  stackChipText: { fontSize: 10, color: Colors.primary, fontWeight: '600' },
  cardActions: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 4,
  },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5,
  },
  editBtnText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  deleteBtn: { padding: 5 },
});
