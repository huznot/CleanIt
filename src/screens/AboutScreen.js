import React, { useRef, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'

export default function AboutScreen({ navigation }) {
  const insets = useSafeAreaInsets()
  const fadeAnim  = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(24)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 480, useNativeDriver: true }),
    ]).start()
  }, [])

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Close button */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* Logo + App name */}
          <View style={styles.logoSection}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} />
            <Text style={styles.appName}>CleanIt</Text>
            <Text style={styles.appTagline}>Trash for Cash · Winnipeg</Text>
          </View>

          {/* Mission */}
          <View style={styles.missionCard}>
            <Text style={styles.missionText}>
              CleanIt is a community-driven recycling initiative for the City of Winnipeg.
              Scan items, find your nearest drop-off, earn points, and redeem them for
              real rewards from local partners.
            </Text>
            <Text style={styles.missionText2}>
              Every piece picked up is a step toward a cleaner, healthier city:
              for everyone who lives here, and for those who will.
            </Text>
          </View>

          {/* Divider with leaf */}
          <View style={styles.leafDivider}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerIcon}>
              <Ionicons name="leaf" size={16} color={colors.primary} />
            </View>
            <View style={styles.dividerLine} />
          </View>

          {/* Wahkohtowin */}
          <Text style={styles.sectionTitle}>Built on Wahkohtowin</Text>

          <View style={styles.wahCard}>
            <LinearGradient
              colors={[colors.primaryLight, '#D4EDE0']}
              style={styles.wahGradient}
            >
              <View style={styles.wahHeader}>
                <Text style={styles.wahWord}>Wahkohtowin</Text>
                <Text style={styles.wahPronounce}>(wah-koh-TOH-win)</Text>
                <View style={styles.wahTag}>
                  <Text style={styles.wahTagText}>Cree  ·  nêhiyawêwin</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.wahBody}>
              <Text style={styles.wahDef}>
                <Text style={styles.wahDefBold}>Kinship.</Text>
                {' '}The Cree understanding that all living beings: human, animal, plant,
                water, earth: are related, and that this relatedness carries responsibility.
              </Text>
              <Text style={styles.wahBody2}>
                To live by Wahkohtowin is to acknowledge that the health of one
                is bound to the health of all. A clear river. A clean park.
                A neighbour's neighbourhood as much as your own.
              </Text>
              <Text style={styles.wahBody2}>
                CleanIt is built on this foundation. Every action in the app:
                scanning, dropping off, earning: is an act of kinship with this city
                and the land beneath it.
              </Text>
            </View>
          </View>

          {/* Treaty acknowledgment */}
          <View style={styles.treatyCard}>
            <Ionicons name="earth" size={20} color={colors.textSecondary} style={{ marginBottom: 10 }} />
            <Text style={styles.treatyText}>
              CleanIt operates on Treaty 1 Territory: the traditional homeland of the
              Anishinaabe, Cree, Oji-Cree, Dakota, and Dene peoples, and the homeland
              of the Métis Nation. We are grateful to be guests on this land and are
              committed to its stewardship.
            </Text>
          </View>

          {/* City partnership */}
          <View style={styles.partnerRow}>
            <View style={styles.partnerBadge}>
              <Text style={styles.partnerBadgeText}>Built by Winnipegers, for Winnipegers</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Logo section
  logoSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 14,
  },
  appName: {
    fontFamily: fonts.serif,
    fontSize: 36,
    color: colors.text,
    lineHeight: 42,
  },
  appTagline: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 3,
    letterSpacing: 0.4,
  },

  // Mission
  missionCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  missionText: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  missionText2: {
    fontFamily: fonts.serifItalic,
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 25,
  },

  // Leaf divider
  leafDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C8E8D6',
  },

  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 26,
    color: colors.text,
    marginBottom: 14,
  },

  // Wahkohtowin card
  wahCard: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#C8E8D6',
    marginBottom: 16,
  },
  wahGradient: {
    padding: 22,
  },
  wahHeader: {
    alignItems: 'flex-start',
  },
  wahWord: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.primaryDark,
    lineHeight: 38,
    marginBottom: 4,
  },
  wahPronounce: {
    fontFamily: fonts.serifItalic,
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  wahTag: {
    backgroundColor: 'rgba(0,107,60,0.12)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,107,60,0.2)',
  },
  wahTagText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  wahBody: {
    padding: 20,
    backgroundColor: colors.surface,
    gap: 12,
  },
  wahDef: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  wahDefBold: {
    fontFamily: fonts.sansBold,
    color: colors.primaryDark,
  },
  wahBody2: {
    fontFamily: fonts.sans,
    fontSize: 14.5,
    color: colors.textSecondary,
    lineHeight: 23,
  },

  // Treaty
  treatyCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  treatyText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },

  // Partner
  partnerRow: {
    alignItems: 'center',
    marginBottom: 28,
  },
  partnerBadge: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D0E3FF',
  },
  partnerBadgeText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.secondary,
  },

  // Credits
  creditsSection: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  creditsTitle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  creditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  creditKey: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  creditVal: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
  },
})
