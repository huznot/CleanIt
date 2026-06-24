import React, { useRef, useEffect } from 'react'
import {
  View, TouchableOpacity, Animated,
  Dimensions, StyleSheet, Text,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'

const { width } = Dimensions.get('window')

const TABS = [
  { name: 'Home',    route: 'Home',    icon: 'leaf-outline',    iconActive: 'leaf'    },
  { name: 'Scan',    route: 'ScanTab', icon: 'scan-outline',    iconActive: 'scan',    isScan: true },
  { name: 'Map',     route: 'Map',     icon: 'map-outline',     iconActive: 'map'     },
  { name: 'Rewards', route: 'Rewards', icon: 'trophy-outline',  iconActive: 'trophy'  },
]

const BAR_H   = 68
const PILL_W  = 68
const PILL_H  = 46
const MARGIN  = 20

export default function CustomTabBar({ state, navigation }) {
  const insets  = useSafeAreaInsets()
  const active  = state.index
  const tabW    = (width - MARGIN * 2) / TABS.length

  const pillX = useRef(
    new Animated.Value(active * tabW + (tabW - PILL_W) / 2)
  ).current

  const scales = useRef(TABS.map(() => new Animated.Value(1))).current

  useEffect(() => {
    Animated.spring(pillX, {
      toValue: active * tabW + (tabW - PILL_W) / 2,
      useNativeDriver: true, tension: 280, friction: 22,
    }).start()

    scales.forEach((s, i) => {
      Animated.spring(s, {
        toValue: i === active ? 1.14 : 1,
        useNativeDriver: true, tension: 300, friction: 20,
      }).start()
    })
  }, [active])

  const handlePress = (tab, index) => {
    if (tab.isScan) {
      // Navigate to the root stack's full-screen Scan modal
      navigation.getParent()?.navigate('Scan')
      return
    }
    const route = state.routes[index]
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
    if (active !== index && !event.defaultPrevented) {
      navigation.navigate(tab.route)
    }
  }

  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
        <Animated.View style={[styles.pill, { transform: [{ translateX: pillX }] }]} />

        {TABS.map((tab, i) => {
          const focused = active === i && !tab.isScan

          if (tab.isScan) {
            return (
              <TouchableOpacity
                key={tab.route}
                style={[styles.tab, { width: tabW }]}
                onPress={() => handlePress(tab, i)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.scanFab}
                >
                  <Ionicons name="scan" size={22} color="#fff" />
                </LinearGradient>
                <Text style={[styles.label, styles.labelScan]}>Scan</Text>
              </TouchableOpacity>
            )
          }

          return (
            <TouchableOpacity
              key={tab.route}
              style={[styles.tab, { width: tabW }]}
              onPress={() => handlePress(tab, i)}
              activeOpacity={0.75}
            >
              <Animated.View style={{ transform: [{ scale: scales[i] }] }}>
                <Ionicons
                  name={focused ? tab.iconActive : tab.icon}
                  size={21}
                  color={focused ? colors.primary : colors.textMuted}
                />
              </Animated.View>
              <Text style={[styles.label, focused && styles.labelActive]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: MARGIN,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.tabBar,
    borderRadius: 26,
    height: BAR_H,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  pill: {
    position: 'absolute',
    width: PILL_W,
    height: PILL_H,
    backgroundColor: colors.primaryLight,
    borderRadius: 23,
    top: (BAR_H - PILL_H) / 2,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 3,
  },
  scanFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 1,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  labelActive: {
    fontFamily: fonts.sansSemiBold,
    color: colors.primary,
  },
  labelScan: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.primary,
  },
})
