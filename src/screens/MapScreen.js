import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Dimensions, Animated,
} from 'react-native'
import { WebView } from 'react-native-webview'
import * as Location from 'expo-location'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'
import { getMapHtml } from '../components/MapHtml'

const { width } = Dimensions.get('window')

const FILTERS = [
  { id: 'all',      label: 'All',      icon: 'layers-outline' },
  { id: 'depots',   label: 'Depots',   icon: 'business-outline' },
  { id: 'recycle',  label: 'Recycling', icon: 'refresh-circle-outline' },
  { id: 'garbage',  label: 'General',  icon: 'trash-outline' },
]

const LEGEND = [
  { color: colors.secondary, size: 14, label: 'Depots' },
  { color: colors.primary,   size: 10, label: 'Recycling Bins' },
  { color: '#8FA898',        size: 8,  label: 'General Waste' },
]

export default function MapScreen() {
  const insets = useSafeAreaInsets()
  const [activeFilter, setActiveFilter] = useState('all')
  const [mapReady, setMapReady] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const webViewRef = useRef(null)
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions()

  const injectUserLocation = (coords) => {
    if (!coords || !webViewRef.current) return
    const { latitude, longitude } = coords
    webViewRef.current.injectJavaScript(
      `window.setUserLocation(${latitude},${longitude});window.locateUser&&window.locateUser();true;`
    )
  }

  const refreshLocation = async () => {
    let permission = locationPermission

    if (!permission?.granted) {
      permission = await requestLocationPermission()
    }

    if (!permission?.granted) {
      return
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    })
    injectUserLocation(position.coords)
  }

  const onMapReady = () => {
    setMapReady(true)
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start()
  }

  useEffect(() => {
    if (!mapReady) return
    refreshLocation().catch(() => {})
  }, [mapReady])

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ─── Header ─── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Winnipeg Map</Text>
          <Text style={styles.subtitle}>160+ locations across Winnipeg</Text>
        </View>
        <TouchableOpacity
          style={styles.locationBtn}
          activeOpacity={0.75}
          onPress={() => {
            refreshLocation().catch(() => {})
          }}
        >
          <Ionicons name="locate" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ─── Filter chips ─── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
        style={styles.filtersScroll}
      >
        {FILTERS.map((f) => {
          const active = activeFilter === f.id
          return (
            <TouchableOpacity
              key={f.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setActiveFilter(f.id)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={f.icon}
                size={13}
                color={active ? colors.white : colors.textSecondary}
              />
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* ─── Map ─── */}
      <View style={styles.mapWrap}>
        {!mapReady && (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={40} color={colors.textMuted} />
            <Text style={styles.mapLoadingText}>Loading map…</Text>
          </View>
        )}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
          <WebView
            ref={webViewRef}
            source={{ html: getMapHtml() }}
            style={styles.webview}
            onMessage={(e) => {
              try {
                const msg = JSON.parse(e.nativeEvent.data)
                if (msg.type === 'ready') onMapReady()
              } catch (_) {}
            }}
            javaScriptEnabled
            domStorageEnabled
            geolocationEnabled
            originWhitelist={['*']}
            mixedContentMode="always"
          />
        </Animated.View>
      </View>

      {/* ─── Legend ─── */}
      <View style={[styles.legend, { paddingBottom: insets.bottom + 90 }]}>
        {LEGEND.map((l) => (
          <View key={l.label} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: l.color, width: l.size + 10, height: l.size + 10 },
              ]}
            />
            <Text style={styles.legendLabel}>{l.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 26,
    color: colors.text,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  locationBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C8E8D6',
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filtersRow: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipLabelActive: {
    color: colors.white,
    fontFamily: fonts.sansSemiBold,
  },
  mapWrap: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.borderLight,
  },
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.borderLight,
  },
  mapLoadingText: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.textMuted,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    borderRadius: 99,
    borderWidth: 2,
    borderColor: colors.white,
  },
  legendLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
})
