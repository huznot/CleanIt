import React, { useRef, useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  Animated, StyleSheet, Dimensions, Easing,
} from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'
import ConfettiCannon from '../components/ConfettiCannon'

const { width } = Dimensions.get('window')
const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const RING_R    = 60
const RING_CIRC = 2 * Math.PI * RING_R
const RING_SZ   = 154

const USER_PTS = 1240
const STREAK   = 5
const RANK     = 47

const TIERS = [
  { id: 'starter',  name: 'Eco Starter',  label: 'Starter',  min: 0,    max: 500,  color: '#CD7F32', icon: 'leaf-outline'        },
  { id: 'warrior',  name: 'Eco Warrior',  label: 'Warrior',  min: 501,  max: 2000, color: '#A8A9AD', icon: 'shield-half-outline' },
  { id: 'champion', name: 'Eco Champion', label: 'Champion', min: 2001, max: 5000, color: '#D4A017', icon: 'star-half-outline'   },
  { id: 'legend',   name: 'Eco Legend',   label: 'Legend',   min: 5001, max: 99999,color: '#5DE0E6', icon: 'diamond-outline'     },
]

function getTier(pts) {
  return TIERS.find((t, i) => pts >= t.min && (i === TIERS.length - 1 || pts < TIERS[i + 1].min)) || TIERS[0]
}

const currentTier   = getTier(USER_PTS)
const nextTierIdx   = TIERS.indexOf(currentTier) + 1
const nextTier      = TIERS[nextTierIdx] || null
const TIER_PROGRESS = nextTier
  ? (USER_PTS - currentTier.min) / (nextTier.min - currentTier.min)
  : 1

const PARTNERS = [
  { name: 'Prairie Donuts', tag: 'PD',   pts: 500,  bg: '#C94073', fg: '#fff',    desc: '2 Free Donuts',       icon: 'cafe-outline'              },
  { name: 'The Forks',      tag: 'TF',   pts: 600,  bg: '#7B5E3A', fg: '#fff',    desc: 'Free Market Entry',   icon: 'storefront-outline'        },
  { name: 'Tim Hortons',    tag: 'TH',   pts: 800,  bg: '#C8102E', fg: '#fff',    desc: 'Free Medium Coffee',  icon: 'cafe'                      },
  { name: 'Canadian Tire',  tag: 'CT',   pts: 1200, bg: '#003087', fg: '#fff',    desc: '$10 Gift Card',       icon: 'card-outline'              },
  { name: 'Skip the Dishes',tag: 'Skip', pts: 1500, bg: '#FF6900', fg: '#fff',    desc: '$15 Delivery Credit', icon: 'bicycle-outline'           },
  { name: 'MEC',            tag: 'MEC',  pts: 2000, bg: '#2D6A4F', fg: '#fff',    desc: '$20 Store Credit',    icon: 'bag-handle-outline'        },
  { name: 'Blue Bombers',   tag: 'BB',   pts: 2500, bg: '#003F8A', fg: '#FFD700', desc: 'Game Day Ticket',     icon: 'american-football-outline' },
  { name: 'Thermea Spa',    tag: 'Spa',  pts: 3000, bg: '#5C3D2E', fg: '#E8D5C0', desc: 'Full Day Pass',       icon: 'water-outline'             },
]

const CHALLENGES = [
  { id: 1, label: 'Scan 3 items today',      progress: 2,  total: 3,   reward: 50,  icon: 'scan-outline',         color: '#006B3C' },
  { id: 2, label: 'Visit a drop-off depot',  progress: 0,  total: 1,   reward: 100, icon: 'location-outline',     color: '#003F8A' },
  { id: 3, label: 'Earn 100 points',         progress: 82, total: 100, reward: 25,  icon: 'flash-outline',        color: '#D4A017' },
  { id: 4, label: 'Share your streak',       progress: 0,  total: 1,   reward: 30,  icon: 'share-social-outline', color: '#9370DB' },
]

export default function RewardsScreen() {
  const insets      = useSafeAreaInsets()
  const confettiRef = useRef(null)

  const progressAnim    = useRef(new Animated.Value(0)).current
  const ptsAnim         = useRef(new Animated.Value(0)).current
  const [displayPts, setDisplayPts] = useState(0)
  const headerOpacity   = useRef(new Animated.Value(0)).current
  const headerTranslate = useRef(new Animated.Value(14)).current
  const challengeAnims  = useRef(CHALLENGES.map(() => new Animated.Value(0))).current
  const cardAnims       = useRef(PARTNERS.map(() => new Animated.Value(0))).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity,   { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.spring(headerTranslate, { toValue: 0, friction: 10, tension: 90, useNativeDriver: true }),
    ]).start()

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1900,
      delay: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()

    const listenerId = ptsAnim.addListener(({ value }) => setDisplayPts(Math.floor(value)))
    Animated.timing(ptsAnim, {
      toValue: USER_PTS,
      duration: 1500,
      delay: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()

    CHALLENGES.forEach((c, i) => {
      Animated.timing(challengeAnims[i], {
        toValue: c.progress / c.total,
        duration: 800,
        delay: 550 + i * 110,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start()
    })

    Animated.stagger(70, cardAnims.map(a =>
      Animated.spring(a, { toValue: 1, friction: 8, tension: 100, useNativeDriver: true })
    )).start()

    return () => ptsAnim.removeListener(listenerId)
  }, [])

  const strokeDashoffset = progressAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [RING_CIRC, RING_CIRC * (1 - TIER_PROGRESS)],
  })

  const handleRedeem = (partner) => {
    if (USER_PTS >= partner.pts) confettiRef.current?.fire()
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ConfettiCannon ref={confettiRef} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
      >
        {/* Header */}
        <Animated.View style={{ opacity: headerOpacity, transform: [{ translateY: headerTranslate }] }}>
          <LinearGradient
            colors={['#012B16', '#006B3C', '#008A4C']}
            style={[styles.header, { paddingTop: insets.top + 18 }]}
          >
            <View style={styles.tierRow}>
              <View style={[styles.tierBadge, { borderColor: currentTier.color }]}>
                <Ionicons name={currentTier.icon} size={12} color={currentTier.color} />
                <Text style={[styles.tierBadgeText, { color: currentTier.color }]}>
                  {currentTier.name.toUpperCase()}
                </Text>
              </View>
              <View style={styles.streakPill}>
                <Ionicons name="flame" size={13} color="#FF6B35" />
                <Text style={styles.streakText}>{STREAK}-day streak</Text>
              </View>
            </View>

            <View style={styles.ringRow}>
              <View style={{ width: RING_SZ, height: RING_SZ, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={RING_SZ} height={RING_SZ} style={{ position: 'absolute' }}>
                  <Circle
                    cx={RING_SZ / 2} cy={RING_SZ / 2} r={RING_R}
                    fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={10}
                  />
                  <Circle
                    cx={RING_SZ / 2} cy={RING_SZ / 2} r={RING_R}
                    fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={18}
                  />
                  <AnimatedCircle
                    cx={RING_SZ / 2} cy={RING_SZ / 2} r={RING_R}
                    fill="none"
                    stroke={currentTier.color}
                    strokeWidth={10}
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRC}
                    strokeDashoffset={strokeDashoffset}
                    rotation="-90"
                    origin={`${RING_SZ / 2},${RING_SZ / 2}`}
                  />
                </Svg>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.ptsNum}>{displayPts.toLocaleString()}</Text>
                  <Text style={styles.ptsLabel}>POINTS</Text>
                </View>
              </View>

              <View style={styles.sideStats}>
                <View style={styles.sideStat}>
                  <Text style={styles.sideStatLabel}>CITY RANK</Text>
                  <Text style={styles.sideStatVal}>#{RANK}</Text>
                  <Text style={styles.sideStatSub}>Winnipeg</Text>
                </View>
                <View style={styles.sideDivider} />
                {nextTier && (
                  <View style={styles.sideStat}>
                    <Text style={styles.sideStatLabel}>NEXT TIER</Text>
                    <Text style={[styles.sideStatVal, { color: nextTier.color, fontSize: 16 }]}>
                      {nextTier.label}
                    </Text>
                    <Text style={styles.sideStatSub}>{(nextTier.min - USER_PTS).toLocaleString()} pts</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.tierBarRow}>
              <Text style={styles.tierBarLabel}>{currentTier.label}</Text>
              <Text style={styles.tierBarPct}>
                {Math.round(TIER_PROGRESS * 100)}% to {nextTier ? nextTier.label : 'Max'}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          {[
            { icon: 'scan-circle-outline', val: '87',        sub: 'Items Scanned' },
            { icon: 'flame-outline',       val: `${STREAK}`, sub: 'Day Streak'    },
            { icon: 'ribbon-outline',      val: `#${RANK}`,  sub: 'City Rank'     },
          ].map((s, i) => (
            <View key={i} style={[styles.statCell, i < 2 && styles.statCellBorder]}>
              <Ionicons name={s.icon} size={18} color={colors.primary} />
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statSub}>{s.sub}</Text>
            </View>
          ))}
        </View>

        {/* Featured: almost there */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Ionicons name="flash" size={14} color={colors.gold} />
            <Text style={styles.sectionTitle}>Almost Yours</Text>
          </View>
          <View style={styles.featCard}>
            {/* Decorative circles */}
            <View style={styles.featDecor1} />
            <View style={styles.featDecor2} />
            <View style={{ flex: 1 }}>
              <View style={styles.featLogoBox}>
                <Text style={styles.featLogoText}>Skip</Text>
              </View>
              <Text style={styles.featName}>Skip the Dishes</Text>
              <Text style={styles.featDesc}>$15 Delivery Credit</Text>
              <View style={styles.featBarTrack}>
                <View style={[styles.featBarFill, { width: `${Math.min((USER_PTS / 1500) * 100, 100)}%` }]} />
              </View>
              <Text style={styles.featProg}>{USER_PTS} / 1,500 pts: only {1500 - USER_PTS} more!</Text>
            </View>
            <View style={styles.featBadge}>
              <Ionicons name="lock-closed" size={18} color="#FF6900" />
              <Text style={styles.featBadgePts}>{1500 - USER_PTS}</Text>
              <Text style={styles.featBadgeLbl}>pts left</Text>
            </View>
          </View>
        </View>

        {/* All Rewards */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Ionicons name="gift-outline" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>All Rewards</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
            {PARTNERS.map((p, i) => {
              const unlocked  = USER_PTS >= p.pts
              const almost    = !unlocked && p.pts - USER_PTS <= 300
              const cardScale = cardAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] })

              return (
                <Animated.View
                  key={p.name}
                  style={[styles.rewardCard, {
                    opacity:   cardAnims[i],
                    transform: [{ scale: cardScale }],
                  }]}
                >
                  <LinearGradient colors={[p.bg, `${p.bg}BB`]} style={styles.cardTop}>
                    {almost && (
                      <View style={styles.almostBadge}><Text style={styles.almostText}>Almost!</Text></View>
                    )}
                    {unlocked && (
                      <View style={styles.unlockedBadge}>
                        <Ionicons name="checkmark-circle" size={11} color="#4CAF50" />
                        <Text style={styles.unlockedText}>Unlocked</Text>
                      </View>
                    )}
                    <View style={[styles.logoCircle, { borderColor: `${p.fg}40` }]}>
                      <Text style={[styles.logoText, { color: p.fg }]}>{p.tag}</Text>
                    </View>
                    <Ionicons name={p.icon} size={15} color={`${p.fg}66`} style={styles.cardBgIcon} />
                  </LinearGradient>

                  <View style={styles.cardBody}>
                    <Text style={styles.cardName} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>{p.desc}</Text>
                    <View style={styles.cardFooter}>
                      <View style={styles.ptsChip}>
                        <Ionicons name="star" size={9} color={colors.gold} />
                        <Text style={styles.ptsChipText}>{p.pts.toLocaleString()}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRedeem(p)}
                        disabled={!unlocked}
                        activeOpacity={0.8}
                        style={[styles.redeemBtn, !unlocked && styles.redeemBtnLocked]}
                      >
                        <Text style={[styles.redeemText, !unlocked && styles.redeemTextLocked]}>
                          {unlocked ? 'Redeem' : 'Locked'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              )
            })}
          </ScrollView>
        </View>

        {/* Daily Challenges */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Ionicons name="checkmark-done-circle-outline" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Daily Challenges</Text>
            <View style={styles.resetPill}><Text style={styles.resetText}>Resets midnight</Text></View>
          </View>
          {CHALLENGES.map((c, i) => {
            const done = c.progress >= c.total
            return (
              <View key={c.id} style={[styles.challengeCard, done && styles.challengeCardDone]}>
                <View style={[styles.challengeIconBox, { backgroundColor: `${c.color}1A` }]}>
                  <Ionicons
                    name={done ? 'checkmark-circle' : c.icon}
                    size={20}
                    color={done ? '#4CAF50' : c.color}
                  />
                </View>
                <View style={{ flex: 1, gap: 5 }}>
                  <View style={styles.challengeTopRow}>
                    <Text style={[styles.challengeLabel, done && styles.challengeLabelDone]} numberOfLines={1}>
                      {c.label}
                    </Text>
                    <View style={styles.challengeRewardChip}>
                      <Ionicons name="star" size={9} color={colors.gold} />
                      <Text style={styles.challengeRewardText}>+{c.reward}</Text>
                    </View>
                  </View>
                  <View style={styles.challengeBarTrack}>
                    <Animated.View style={[styles.challengeBarFill, {
                      width: challengeAnims[i].interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                      backgroundColor: done ? '#4CAF50' : c.color,
                    }]} />
                  </View>
                  <Text style={styles.challengeCount}>
                    {c.progress} / {c.total}{done ? ': Complete!' : ''}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>

        {/* Leaderboard card */}
        <View style={styles.section}>
          <TouchableOpacity activeOpacity={0.88} style={styles.lbCard}>
            <LinearGradient
              colors={['#002B65', '#003F8A', '#0055BA']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.lbGrad}
            >
              <View style={styles.lbLeft}>
                <Ionicons name="trophy" size={30} color={colors.gold} />
                <View style={{ marginLeft: 14 }}>
                  <Text style={styles.lbRank}>Rank #{RANK}</Text>
                  <Text style={styles.lbSub}>Top 12% in Winnipeg</Text>
                </View>
              </View>
              <View style={styles.lbCtaBox}>
                <Text style={styles.lbCtaText}>View Board</Text>
                <Ionicons name="chevron-forward" size={14} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 22,
    paddingBottom: 26,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    shadowColor: '#006B3C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  tierBadgeText: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1.1,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  streakText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: '#fff',
  },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  ptsNum: {
    fontFamily: fonts.sansBold,
    fontSize: 29,
    color: '#fff',
    letterSpacing: -0.5,
  },
  ptsLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 9,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 2.2,
    marginTop: -1,
  },
  sideStats: { gap: 0 },
  sideStat: { gap: 1 },
  sideStatLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.8,
  },
  sideStatVal: {
    fontFamily: fonts.sansBold,
    fontSize: 22,
    color: '#fff',
    letterSpacing: -0.3,
  },
  sideStatSub: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
  },
  sideDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.11)',
    marginVertical: 9,
  },
  tierBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingHorizontal: 2,
  },
  tierBarLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
  },
  tierBarPct: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
  },

  statsStrip: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statCellBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
  },
  statVal: {
    fontFamily: fonts.sansBold,
    fontSize: 18,
    color: colors.text,
    letterSpacing: -0.3,
  },
  statSub: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },

  section: {
    marginTop: 22,
    paddingHorizontal: 20,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 13,
  },
  sectionTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 17,
    color: colors.text,
    flex: 1,
  },
  resetPill: {
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  resetText: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.primary,
  },

  featCard: {
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FF6900',
    overflow: 'hidden',
    shadowColor: '#FF6900',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.26,
    shadowRadius: 18,
    elevation: 9,
  },
  featDecor1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -60,
    right: -40,
  },
  featDecor2: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -40,
    right: 80,
  },
  featLogoBox: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  featLogoText: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: '#fff',
    letterSpacing: 0.8,
  },
  featName: {
    fontFamily: fonts.sansBold,
    fontSize: 18,
    color: '#fff',
    marginBottom: 2,
  },
  featDesc: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  featBarTrack: {
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  featBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  featProg: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
  },
  featBadge: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  featBadgePts: {
    fontFamily: fonts.sansBold,
    fontSize: 18,
    color: '#FF6900',
    letterSpacing: -0.3,
  },
  featBadgeLbl: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: '#FF6900',
  },

  cardsRow: {
    paddingRight: 20,
    gap: 12,
  },
  rewardCard: {
    width: 158,
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 5,
  },
  cardTop: {
    height: 102,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  almostBadge: {
    position: 'absolute',
    top: 8, right: 8,
    backgroundColor: '#FFE0B2',
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  almostText: {
    fontFamily: fonts.sansBold,
    fontSize: 9,
    color: '#E65100',
    letterSpacing: 0.4,
  },
  unlockedBadge: {
    position: 'absolute',
    top: 8, right: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  unlockedText: {
    fontFamily: fonts.sansBold,
    fontSize: 9,
    color: '#2E7D32',
    letterSpacing: 0.3,
  },
  logoCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    letterSpacing: 0.4,
  },
  cardBgIcon: {
    position: 'absolute',
    bottom: 7,
    right: 9,
  },
  cardBody: {
    padding: 12,
    gap: 3,
  },
  cardName: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.text,
  },
  cardDesc: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
    minHeight: 30,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  ptsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.goldLight,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  ptsChipText: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: colors.gold,
  },
  redeemBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  redeemBtnLocked: {
    backgroundColor: '#EFEFEF',
  },
  redeemText: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: '#fff',
  },
  redeemTextLocked: {
    color: '#B0B0B0',
  },

  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  challengeCardDone: {
    backgroundColor: '#F1FBF4',
    borderColor: '#C3E8CB',
  },
  challengeIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  challengeLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  challengeLabelDone: {
    color: '#3A8C3A',
  },
  challengeRewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.goldLight,
    borderRadius: 7,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  challengeRewardText: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    color: colors.gold,
  },
  challengeBarTrack: {
    height: 6,
    backgroundColor: '#EAEAEA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  challengeBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  challengeCount: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textMuted,
  },

  lbCard: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#003F8A',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  lbGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  lbLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lbRank: {
    fontFamily: fonts.sansBold,
    fontSize: 22,
    color: '#fff',
  },
  lbSub: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
  },
  lbCtaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  lbCtaText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: '#fff',
  },
})
