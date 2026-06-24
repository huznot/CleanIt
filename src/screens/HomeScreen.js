import React, { useRef, useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, Animated,
  StyleSheet, Dimensions, Image,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'

const { width } = Dimensions.get('window')

const USER_STREAK = 5
const USER_TIER   = { name: 'Eco Warrior', color: '#A8A9AD', icon: 'shield-half-outline' }

const RECENT_ACTIVITY = [
  { id: 1, item: 'Plastic Bottle (PET #1)', category: 'Recyclables',     pts: '+10', time: '2h ago',      icon: 'water',          color: '#3A7DBF' },
  { id: 2, item: 'Cardboard Box',           category: 'Paper & Cardboard',pts: '+15', time: 'Yesterday',   icon: 'document-text',  color: '#A0774A' },
  { id: 3, item: 'Aluminum Can',            category: 'Metals',           pts: '+8',  time: '2 days ago',  icon: 'hardware-chip',  color: '#8A9BA8' },
]

const QUICK_CHALLENGES = [
  { label: 'Scan 3 items today', progress: 2, total: 3, reward: 50,  color: colors.primary },
  { label: 'Earn 100 points',    progress: 82,total: 100,reward: 25, color: colors.gold    },
]

const STEPS = [
  { n: '1', icon: 'camera-outline', label: 'Scan',     desc: 'Photograph any item to identify it' },
  { n: '2', icon: 'map-outline',    label: 'Find',     desc: 'Locate your nearest drop-off point' },
  { n: '3', icon: 'navigate-outline', label: 'Drop Off', desc: "Head to the spot: we'll guide you" },
  { n: '4', icon: 'trophy-outline', label: 'Earn',     desc: 'Collect points, unlock local rewards' },
]

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets()
  const [points, setPoints] = useState(0)

  const fadeAnim      = useRef(new Animated.Value(0)).current
  const slide1        = useRef(new Animated.Value(28)).current
  const slide2        = useRef(new Animated.Value(28)).current
  const slide3        = useRef(new Animated.Value(28)).current
  const challengeAnims = useRef(QUICK_CHALLENGES.map(() => new Animated.Value(0))).current

  useEffect(() => {
    Animated.stagger(80, [
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slide1,   { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(slide2, { toValue: 0, duration: 480, useNativeDriver: true }),
      Animated.timing(slide3, { toValue: 0, duration: 480, useNativeDriver: true }),
    ]).start()

    // Challenge bars
    QUICK_CHALLENGES.forEach((c, i) => {
      Animated.timing(challengeAnims[i], {
        toValue: c.progress / c.total,
        duration: 800,
        delay: 600 + i * 120,
        useNativeDriver: false,
      }).start()
    })

    // Count-up animation for points
    const target = 1240
    let current = 0
    const step  = target / 30
    const timer = setInterval(() => {
      current += step
      if (current >= target) { setPoints(target); clearInterval(timer) }
      else setPoints(Math.floor(current))
    }, 40)
    return () => clearInterval(timer)
  }, [])

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ─── Header ─── */}
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slide1 }] }]}>
        <View style={styles.headerLeft}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImg} />
          <View>
            <Text style={styles.appName}>CleanIt</Text>
            <Text style={styles.appTagline}>Trash for Cash</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {/* Streak pill */}
          <View style={styles.streakChip}>
            <Ionicons name="flame" size={13} color="#FF6B35" />
            <Text style={styles.streakChipText}>{USER_STREAK}</Text>
          </View>
          {/* Tier badge */}
          <View style={[styles.tierChip, { borderColor: USER_TIER.color }]}>
            <Ionicons name={USER_TIER.icon} size={12} color={USER_TIER.color} />
            <Text style={[styles.tierChipText, { color: USER_TIER.color }]}>
              {USER_TIER.name.split(' ')[1].toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.infoBtn}
            onPress={() => navigation.navigate('About')}
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle-outline" size={26} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: 120 }]}
      >
        {/* ─── Greeting ─── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slide1 }] }}>
          <Text style={styles.greeting}>Good morning 👋</Text>
          <Text style={styles.greetingSub}>Every piece you recycle counts.</Text>
        </Animated.View>

        {/* ─── Impact Card ─── */}
        <Animated.View style={[styles.impactCard, { transform: [{ translateY: slide2 }], opacity: fadeAnim }]}>
          <View style={styles.impactDecorCircle} />
          <View style={styles.impactDecorCircle2} />

          <View style={styles.impactTopRow}>
            <Text style={styles.impactLabel}>YOUR IMPACT</Text>
            <View style={[styles.impactTierBadge, { borderColor: USER_TIER.color }]}>
              <Ionicons name={USER_TIER.icon} size={10} color={USER_TIER.color} />
              <Text style={[styles.impactTierText, { color: USER_TIER.color }]}>
                {USER_TIER.name.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.pointsNumber}>
            {points.toLocaleString()}
          </Text>
          <Text style={styles.pointsUnit}>points earned</Text>

          <View style={styles.impactDivider} />

          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Ionicons name="cube-outline" size={15} color={colors.primaryDark} />
              <Text style={styles.statVal}>87</Text>
              <Text style={styles.statKey}>items</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statChip}>
              <Ionicons name="leaf-outline" size={15} color={colors.primaryDark} />
              <Text style={styles.statVal}>12 kg</Text>
              <Text style={styles.statKey}>CO₂ saved</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statChip}>
              <Ionicons name="flame-outline" size={15} color={colors.primaryDark} />
              <Text style={styles.statVal}>5</Text>
              <Text style={styles.statKey}>day streak</Text>
            </View>
          </View>
        </Animated.View>

        {/* ─── Scan CTA ─── */}
        <Animated.View style={{ transform: [{ translateY: slide2 }], opacity: fadeAnim }}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation.navigate('Scan')}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scanCta}
            >
              <View style={styles.scanCtaIconWrap}>
                <Ionicons name="scan" size={22} color={colors.white} />
              </View>
              <View style={styles.scanCtaText}>
                <Text style={styles.scanCtaTitle}>Scan an Item</Text>
                <Text style={styles.scanCtaHint}>Earn 8 – 50 pts per drop-off</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ─── Quick Challenges ─── */}
        <Animated.View style={{ transform: [{ translateY: slide2 }], opacity: fadeAnim }}>
          <View style={styles.challengesHeader}>
            <Ionicons name="checkmark-done-circle-outline" size={15} color={colors.primary} />
            <Text style={styles.challengesTitle}>Today's Challenges</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Rewards')} activeOpacity={0.7}>
              <Text style={styles.challengesSeeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.challengesCard}>
            {QUICK_CHALLENGES.map((c, i) => (
              <View key={i} style={[styles.qChallenge, i < QUICK_CHALLENGES.length - 1 && styles.qChallengeBorder]}>
                <View style={{ flex: 1, gap: 5 }}>
                  <View style={styles.qChallengeRow}>
                    <Text style={styles.qChallengeLabel}>{c.label}</Text>
                    <View style={styles.qRewardChip}>
                      <Ionicons name="star" size={9} color={colors.gold} />
                      <Text style={styles.qRewardText}>+{c.reward}</Text>
                    </View>
                  </View>
                  <View style={styles.qBarTrack}>
                    <Animated.View style={[styles.qBarFill, {
                      width: challengeAnims[i].interpolate({ inputRange:[0,1], outputRange:['0%','100%'] }),
                      backgroundColor: c.color,
                    }]} />
                  </View>
                  <Text style={styles.qCount}>{c.progress} / {c.total}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ─── How It Works ─── */}
        <Animated.View style={{ transform: [{ translateY: slide3 }], opacity: fadeAnim }}>
          <Text style={styles.sectionTitle}>How It Works</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stepsRow}
          >
            {STEPS.map((s) => (
              <View key={s.n} style={styles.stepCard}>
                <View style={styles.stepNumWrap}>
                  <Text style={styles.stepNum}>{s.n}</Text>
                </View>
                <View style={styles.stepIconWrap}>
                  <Ionicons name={s.icon} size={22} color={colors.primary} />
                </View>
                <Text style={styles.stepLabel}>{s.label}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ─── Recent Activity ─── */}
        <Animated.View style={{ transform: [{ translateY: slide3 }], opacity: fadeAnim }}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>

          {RECENT_ACTIVITY.map((a) => (
            <View key={a.id} style={styles.activityRow}>
              <View style={[styles.activityDot, { backgroundColor: a.color }]}>
                <Ionicons name={a.icon} size={14} color={colors.white} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityItem}>{a.item}</Text>
                <Text style={styles.activityCat}>{a.category}</Text>
              </View>
              <View style={styles.activityRight}>
                <Text style={styles.activityPts}>{a.pts} pts</Text>
                <Text style={styles.activityTime}>{a.time}</Text>
              </View>
            </View>
          ))}
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  appName: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.text,
    lineHeight: 24,
  },
  appTagline: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.5,
    lineHeight: 13,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF1EB',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#FFD5C0',
  },
  streakChipText: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: '#E05A00',
  },
  tierChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  tierChipText: {
    fontFamily: fonts.sansBold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  infoBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },

  // Greeting
  greeting: {
    fontFamily: fonts.serif,
    fontSize: 30,
    color: colors.text,
    marginTop: 10,
    lineHeight: 38,
  },
  greetingSub: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 20,
  },

  // Impact Card
  impactCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 22,
    padding: 24,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#C8E8D6',
  },
  impactDecorCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(0,107,60,0.07)',
    right: -40,
    top: -40,
  },
  impactDecorCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,107,60,0.05)',
    right: 60,
    bottom: -30,
  },
  impactTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  impactLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  impactTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  impactTierText: {
    fontFamily: fonts.sansBold,
    fontSize: 8.5,
    letterSpacing: 0.8,
  },
  pointsNumber: {
    fontFamily: fonts.serif,
    fontSize: 58,
    color: colors.primaryDark,
    lineHeight: 64,
    letterSpacing: -1,
  },
  pointsUnit: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 16,
  },
  impactDivider: {
    height: 1,
    backgroundColor: 'rgba(0,107,60,0.15)',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statChip: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statSep: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(0,107,60,0.15)',
  },
  statVal: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: colors.primaryDark,
    marginTop: 2,
  },
  statKey: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textSecondary,
  },

  // Scan CTA
  scanCta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 18,
    marginBottom: 28,
    gap: 14,
  },
  scanCtaIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanCtaText: { flex: 1 },
  scanCtaTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: colors.white,
  },
  scanCtaHint: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 2,
  },

  // Section title
  sectionTitle: {
    fontFamily: fonts.serifItalic,
    fontSize: 24,
    color: colors.text,
    marginBottom: 14,
  },

  // How it works
  stepsRow: {
    paddingRight: 20,
    gap: 12,
    marginBottom: 28,
  },
  stepCard: {
    width: 136,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  stepNumWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stepNum: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: colors.white,
  },
  stepIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  stepLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  stepDesc: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
  },

  // Recent activity
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  activityDot: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  activityInfo: { flex: 1 },
  activityItem: {
    fontFamily: fonts.sansMedium,
    fontSize: 13.5,
    color: colors.text,
  },
  activityCat: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  activityRight: { alignItems: 'flex-end' },
  activityPts: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.primary,
  },
  activityTime: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },

  challengesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  challengesTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  challengesSeeAll: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.primary,
  },
  challengesCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  qChallenge: {
    padding: 14,
  },
  qChallengeBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  qChallengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qChallengeLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  qRewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.goldLight,
    borderRadius: 7,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  qRewardText: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    color: colors.gold,
  },
  qBarTrack: {
    height: 5,
    backgroundColor: '#EAEAEA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  qBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  qCount: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textMuted,
  },
})
