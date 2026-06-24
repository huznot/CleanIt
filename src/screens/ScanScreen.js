import React, { useRef, useEffect, useState } from 'react'
import {
  View, Text, TouchableOpacity, Animated, ScrollView,
  StyleSheet, Dimensions, StatusBar,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as Location from 'expo-location'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'
import { getItemIcon } from '../components/ItemIcon'
import ConfettiCannon from '../components/ConfettiCannon'

const { width, height } = Dimensions.get('window')

const FRAME_SIZE = width * 0.66
const frameLeft  = (width  - FRAME_SIZE) / 2
const frameTop   = (height - FRAME_SIZE) / 2 - 30

const DEMO_RESULT = {
  item:      'Plastic Bottle (PET #1)',
  category:  'Recyclables',
  points:    10,
}

const DEMO_BINS = [
  { name: 'Portage Ave Recycling Station', lat: 49.8893, lng: -97.1458, hours: 'Open 24 / 7', kind: 'recycling' },
  { name: 'North End Recycling Hub', lat: 49.9158, lng: -97.1451, hours: 'Open 24 / 7', kind: 'recycling' },
  { name: 'Osborne Village Blue Bin', lat: 49.8668, lng: -97.1458, hours: 'Open 24 / 7', kind: 'recycling' },
  { name: 'St. James Recycle Point', lat: 49.8852, lng: -97.2261, hours: 'Open 24 / 7', kind: 'recycling' },
  { name: 'St. Vital Recycling Point', lat: 49.8258, lng: -97.1119, hours: 'Open 24 / 7', kind: 'recycling' },
  { name: 'Transcona Eco Station', lat: 49.8988, lng: -97.0019, hours: 'Open 24 / 7', kind: 'recycling' },
  { name: 'West End Recycle Hub', lat: 49.9015, lng: -97.1784, hours: 'Open 24 / 7', kind: 'recycling' },
  { name: 'Pembina Recycling Point', lat: 49.8279, lng: -97.1532, hours: 'Open 24 / 7', kind: 'recycling' },
]

function toRad(value) {
  return (value * Math.PI) / 180
}

function distanceKm(aLat, aLng, bLat, bLng) {
  const R = 6371
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const lat1 = toRad(aLat)
  const lat2 = toRad(bLat)
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

function formatDistance(km) {
  if (km < 1) return `${Math.max(100, Math.round(km * 1000 / 10) * 10)} m`
  return `${km.toFixed(1)} km`
}

function estimateWalk(km) {
  return `${Math.max(2, Math.round(km * 12))} min walk`
}

function pickNearestBin(lat, lng) {
  return DEMO_BINS
    .map((bin) => {
      const km = distanceKm(lat, lng, bin.lat, bin.lng)
      return {
        ...bin,
        km,
        distanceLabel: formatDistance(km),
        walkLabel: estimateWalk(km),
      }
    })
    .sort((a, b) => a.km - b.km)[0]
}

// Compact Leaflet map showing the user and one nearby drop-off
const SCAN_MAP_HTML = `
<!DOCTYPE html><html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    *{margin:0;padding:0}html,body,#map{width:100%;height:100%;background:#E8F4EE}
  </style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.js"></script>
<script>
var DEF=[49.8951,-97.1384];
var map=L.map('map',{zoomControl:false,attributionControl:false,dragging:false,touchZoom:false,scrollWheelZoom:false,doubleClickZoom:false,boxZoom:false,keyboard:false}).setView(DEF,16);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{subdomains:'abcd',maxZoom:19}).addTo(map);

var uM=L.circleMarker(DEF,{radius:8,fillColor:'#4A90D9',fillOpacity:1,color:'white',weight:3});
var uP=L.circleMarker(DEF,{radius:17,fillColor:'#4A90D9',fillOpacity:0.14,color:'#4A90D9',weight:1.5,opacity:0.35});
uM.addTo(map);uP.addTo(map);

var bIcon=L.divIcon({className:'',html:'<div style="width:24px;height:24px;border-radius:50%;background:#006B3C;border:2.5px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,107,60,.45)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg></div>',iconSize:[24,24],iconAnchor:[12,12]});
var bM=L.marker([DEF[0]+0.0012,DEF[1]-0.0009],{icon:bIcon}).addTo(map);
var line=L.polyline([DEF,[DEF[0]+0.0012,DEF[1]-0.0009]],{color:'#006B3C',weight:2,dashArray:'5 5',opacity:0.45}).addTo(map);

function fit(u,b){map.fitBounds(L.latLngBounds([u,b]),{padding:[32,32]});}
fit(DEF,[DEF[0]+0.0012,DEF[1]-0.0009]);

window.setUserLocation=function(lat,lng){
  var u=[lat,lng];
  uM.setLatLng(u);
  uP.setLatLng(u);
  var b=bM.getLatLng();
  line.setLatLngs([u,b]);
  fit(u,b);
};
window.setDropoffLocation=function(lat,lng){
  var b=[lat,lng];
  bM.setLatLng(b);
  var u=uM.getLatLng();
  line.setLatLngs([u,b]);
  fit(u,b);
};
</script>
</body></html>
`

export default function ScanScreen({ navigation }) {
  const insets = useSafeAreaInsets()
  const [permission, requestPermission] = useCameraPermissions()
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions()
  const [torch,     setTorch]     = useState(false)
  const [hasResult, setHasResult] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)
  const [scanning,  setScanning]  = useState(false)
  const [dropoff, setDropoff] = useState(DEMO_BINS[0])

  const confettiRef  = useRef(null)
  const miniMapRef   = useRef(null)
  const scanLineY    = useRef(new Animated.Value(0)).current
  const cornerPulse  = useRef(new Animated.Value(1)).current
  const flashAnim    = useRef(new Animated.Value(0)).current
  const resultSlide  = useRef(new Animated.Value(height)).current
  const resultOpacity = useRef(new Animated.Value(0)).current

  const injectMiniMapLocation = (coords) => {
    if (!coords || !miniMapRef.current) return
    const { latitude, longitude } = coords
    const nearest = pickNearestBin(latitude, longitude)
    setDropoff(nearest)

    miniMapRef.current.injectJavaScript(
      `window.setUserLocation(${latitude},${longitude});window.setDropoffLocation(${nearest.lat},${nearest.lng});true;`
    )
  }

  const refreshMiniMapLocation = async () => {
    let permissionState = locationPermission

    if (!permissionState?.granted) {
      permissionState = await requestLocationPermission()
    }

    if (!permissionState?.granted) return

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    })
    injectMiniMapLocation(position.coords)
  }

  // Looping scan line + corner pulse
  useEffect(() => {
    const line = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, { toValue: FRAME_SIZE, duration: 1700, useNativeDriver: true }),
        Animated.timing(scanLineY, { toValue: 0,          duration: 1700, useNativeDriver: true }),
      ])
    )
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(cornerPulse, { toValue: 0.55, duration: 950, useNativeDriver: true }),
        Animated.timing(cornerPulse, { toValue: 1,    duration: 950, useNativeDriver: true }),
      ])
    )
    line.start()
    pulse.start()
    return () => { line.stop(); pulse.stop() }
  }, [])

  useEffect(() => {
    if (!hasResult) return
    refreshMiniMapLocation().catch(() => {})
  }, [hasResult])

  const handleScan = () => {
    if (scanning) return
    setScanning(true)

    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 60,  useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      setHasResult(true)
      setScanning(false)
      Animated.parallel([
        Animated.spring(resultSlide, {
          toValue: 0, useNativeDriver: true, tension: 70, friction: 13,
        }),
        Animated.timing(resultOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start()
    })
  }

  const dismissResult = () => {
    Animated.parallel([
      Animated.timing(resultSlide,   { toValue: height, duration: 280, useNativeDriver: true }),
      Animated.timing(resultOpacity, { toValue: 0,      duration: 200, useNativeDriver: true }),
    ]).start(() => { setHasResult(false); setCheckedIn(false) })
  }

  const handleCheckIn = () => {
    if (checkedIn) return
    setCheckedIn(true)
    confettiRef.current?.fire()
  }

  // ── Permission screens ──────────────────────────────────────────────────
  if (!permission) return <View style={styles.root} />

  if (!permission.granted) {
    return (
      <View style={[styles.root, styles.permRoot]}>
        <StatusBar barStyle="light-content" />
        <TouchableOpacity
          style={[styles.closeBtn, { top: insets.top + 12 }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>

        <Ionicons name="camera-outline" size={64} color="rgba(255,255,255,0.6)" />
        <Text style={styles.permTitle}>Camera Access</Text>
        <Text style={styles.permSub}>
          CleanIt needs your camera to identify items and guide you to the right drop-off.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.85}>
          <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.permBtnGrad}>
            <Text style={styles.permBtnText}>Allow Camera Access</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    )
  }

  // ── Main scan UI ────────────────────────────────────────────────────────
  const itemIcon = getItemIcon(DEMO_RESULT.item)

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Camera live feed fills screen */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
      />

      {/* Dark flash overlay */}
      <Animated.View
        style={[styles.flashOverlay, { opacity: flashAnim }]}
        pointerEvents="none"
      />

      {/* Vignette overlays around scan frame */}
      <View style={[styles.vigTop,    { height: frameTop }]}                  pointerEvents="none" />
      <View style={[styles.vigLeft,   { top: frameTop, width: frameLeft, height: FRAME_SIZE }]} pointerEvents="none" />
      <View style={[styles.vigRight,  { top: frameTop, left: frameLeft + FRAME_SIZE, right: 0, height: FRAME_SIZE }]} pointerEvents="none" />
      <View style={[styles.vigBottom, { top: frameTop + FRAME_SIZE }]}         pointerEvents="none" />

      {/* Scan frame */}
      <View
        style={[styles.frame, { top: frameTop, left: frameLeft }]}
        pointerEvents="none"
      >
        <Animated.View style={[styles.corner, styles.cTL, { opacity: cornerPulse }]} />
        <Animated.View style={[styles.corner, styles.cTR, { opacity: cornerPulse }]} />
        <Animated.View style={[styles.corner, styles.cBL, { opacity: cornerPulse }]} />
        <Animated.View style={[styles.corner, styles.cBR, { opacity: cornerPulse }]} />

        <Animated.View
          style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]}
        />
      </View>

      {/* ── Top bar ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.topBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.screenTitle}>Scan Item</Text>

        <TouchableOpacity
          style={[styles.topBtn, torch && styles.topBtnActive]}
          onPress={() => setTorch(!torch)}
          activeOpacity={0.7}
        >
          <Ionicons name={torch ? 'flash' : 'flash-off'} size={22} color={torch ? colors.gold : '#fff'} />
        </TouchableOpacity>
      </View>

      {/* Hint text below frame */}
      <Text style={[styles.hint, { top: frameTop + FRAME_SIZE + 20 }]}>
        Point camera at any recyclable item
      </Text>

      {/* ── Shutter button ── */}
      {!hasResult && (
        <View style={[styles.shutterWrap, { bottom: insets.bottom + 36 }]}>
          <TouchableOpacity onPress={handleScan} activeOpacity={0.85} disabled={scanning}>
            <LinearGradient
              colors={[colors.scanFrame, '#007A4E']}
              style={styles.shutter}
            >
              {scanning
                ? <Ionicons name="hourglass" size={28} color="#fff" />
                : <Ionicons name="camera" size={30} color="#fff" />}
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.shutterLabel}>Tap to Scan</Text>
        </View>
      )}

      {/* ── Full-screen result overlay ── */}
      <Animated.View
        style={[
          styles.resultOverlay,
          { opacity: resultOpacity, transform: [{ translateY: resultSlide }] },
        ]}
        pointerEvents={hasResult ? 'auto' : 'none'}
      >
        {/* Header */}
        <View style={[styles.resultHeader, { paddingTop: insets.top + 14 }]}>
          <TouchableOpacity onPress={dismissResult} style={styles.resultClose} activeOpacity={0.7}>
            <Ionicons name="arrow-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.resultHeaderTitle}>Item Identified</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Scrollable body */}
        <ScrollView
          style={styles.resultBody}
          contentContainerStyle={styles.resultBodyContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Icon */}
          <View style={[styles.resultIconCircle, { backgroundColor: itemIcon.bg }]}>
            <Ionicons name={itemIcon.icon} size={44} color={itemIcon.fg} />
          </View>

          {/* Item name */}
          <Text style={styles.resultItemName}>{DEMO_RESULT.item}</Text>

          {/* Chips row */}
          <View style={styles.chipsRow}>
            <View style={styles.categoryChip}>
              <Ionicons name="refresh-circle-outline" size={13} color={colors.primaryDark} />
              <Text style={styles.categoryChipText}>{DEMO_RESULT.category}</Text>
            </View>
            <View style={styles.ptsChip}>
              <Ionicons name="trophy" size={13} color={colors.gold} />
              <Text style={styles.ptsChipText}>+{DEMO_RESULT.points} pts</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.resDivider} />

          {/* Nearest bin info */}
          <Text style={styles.depotSectionLabel}>NEAREST RECYCLING BIN</Text>
          <View style={styles.depotCard}>
            <View style={styles.binIconBox}>
              <Ionicons name="refresh-circle" size={22} color={colors.primary} />
            </View>
            <View style={styles.depotInfo}>
              <Text style={styles.depotName}>{dropoff.name}</Text>
              <Text style={styles.depotMeta}>
                {dropoff.distanceLabel}  ·  {dropoff.walkLabel}
              </Text>
              <Text style={styles.depotHours}>{dropoff.hours}</Text>
            </View>
          </View>

          {/* Mini map */}
          <View style={styles.miniMap}>
            <WebView
              ref={miniMapRef}
              source={{ html: SCAN_MAP_HTML }}
              style={{ flex: 1 }}
              onLoadEnd={() => {
                if (hasResult) {
                  refreshMiniMapLocation().catch(() => {})
                }
              }}
              javaScriptEnabled
              domStorageEnabled
              geolocationEnabled
              originWhitelist={['*']}
              mixedContentMode="always"
              scrollEnabled={false}
            />
          </View>

          {/* Actions */}
          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.dirBtn} activeOpacity={0.8}>
              <Ionicons name="navigate" size={16} color={colors.primary} />
              <Text style={styles.dirBtnText}>Directions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.hereBtn, checkedIn && styles.hereBtnDone]}
              onPress={handleCheckIn}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={checkedIn ? ['#00A86B', '#007A4E'] : [colors.primary, colors.primaryDark]}
                style={styles.hereBtnGrad}
              >
                <Ionicons name={checkedIn ? 'checkmark-circle' : 'location'} size={16} color="#fff" />
                <Text style={styles.hereBtnText}>{checkedIn ? 'Checked In!' : "I'm Here"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {checkedIn && (
            <View style={styles.earnBanner}>
              <Ionicons name="sparkles" size={16} color={colors.gold} />
              <Text style={styles.earnBannerText}>
                +{DEMO_RESULT.points} pts added to your balance
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Confetti */}
        <ConfettiCannon ref={confettiRef} />
      </Animated.View>
    </View>
  )
}

const CORNER_SZ = 24
const CORNER_T  = 3.5

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.scanBg },

  permRoot: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  closeBtn: {
    position: 'absolute',
    left: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  permTitle: {
    fontFamily: fonts.serif,
    fontSize: 30, color: '#fff',
    textAlign: 'center', marginTop: 8,
  },
  permSub: {
    fontFamily: fonts.sans,
    fontSize: 15, color: 'rgba(255,255,255,0.6)',
    textAlign: 'center', lineHeight: 22,
  },
  permBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginTop: 8 },
  permBtnGrad: { padding: 18, alignItems: 'center' },
  permBtnText: { fontFamily: fonts.sansBold, fontSize: 16, color: '#fff' },

  // Flash overlay
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    zIndex: 90,
  },

  // Vignette
  vigTop:    { position: 'absolute', top: 0,  left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.55)' },
  vigLeft:   { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.55)' },
  vigRight:  { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.55)' },
  vigBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)' },

  // Scan frame
  frame: {
    position: 'absolute',
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    overflow: 'hidden',
  },
  corner:  { position: 'absolute', width: CORNER_SZ, height: CORNER_SZ, borderColor: colors.scanFrame, borderWidth: CORNER_T },
  cTL: { top: 0, left: 0,   borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius:     4 },
  cTR: { top: 0, right: 0,  borderLeftWidth: 0,  borderBottomWidth: 0, borderTopRightRadius:    4 },
  cBL: { bottom: 0, left: 0,  borderRightWidth: 0, borderTopWidth: 0,  borderBottomLeftRadius:  4 },
  cBR: { bottom: 0, right: 0, borderLeftWidth: 0,  borderTopWidth: 0,  borderBottomRightRadius: 4 },
  scanLine: {
    position: 'absolute', left: 0, right: 0, height: 2,
    backgroundColor: colors.scanFrame,
    shadowColor: colors.scanFrame,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95, shadowRadius: 8,
  },

  // Top bar
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 10,
  },
  topBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  topBtnActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  screenTitle: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: '#fff', letterSpacing: 0.3 },

  hint: {
    position: 'absolute', left: 0, right: 0,
    fontFamily: fonts.sans, fontSize: 13,
    color: 'rgba(255,255,255,0.52)',
    textAlign: 'center',
  },

  // Shutter
  shutterWrap: {
    position: 'absolute', left: 0, right: 0,
    alignItems: 'center', gap: 10,
  },
  shutter: {
    width: 74, height: 74, borderRadius: 37,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: colors.scanFrame,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 16,
    elevation: 10,
  },
  shutterLabel: { fontFamily: fonts.sansMedium, fontSize: 13, color: 'rgba(255,255,255,0.5)' },

  // Result overlay
  resultOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: colors.surface,
    zIndex: 80,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  resultClose: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  resultHeaderTitle: {
    fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.text,
  },

  resultBody: { flex: 1 },
  resultBodyContent: {
    alignItems: 'center', paddingHorizontal: 24, paddingTop: 28, paddingBottom: 30,
  },
  resultIconCircle: {
    width: 100, height: 100, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12,
    elevation: 6,
  },
  resultItemName: {
    fontFamily: fonts.serif, fontSize: 26, color: colors.text,
    textAlign: 'center', marginBottom: 14,
  },
  chipsRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.primaryLight, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: '#C8E8D6',
  },
  categoryChipText: {
    fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.primaryDark,
  },
  ptsChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.goldLight, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: '#EDD98A',
  },
  ptsChipText: {
    fontFamily: fonts.sansBold, fontSize: 12, color: colors.gold,
  },

  resDivider: { width: '100%', height: 1, backgroundColor: colors.borderLight, marginBottom: 20 },

  depotSectionLabel: {
    alignSelf: 'flex-start',
    fontFamily: fonts.sansSemiBold, fontSize: 10,
    color: colors.textMuted, letterSpacing: 1, marginBottom: 10,
  },
  depotCard: {
    width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 18, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#C8E8D6',
  },
  binIconBox: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: '#C8E8D6',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  depotIconBox: {
    width: 40, height: 40, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  depotInfo: { flex: 1 },
  depotName: {
    fontFamily: fonts.sansSemiBold, fontSize: 13.5, color: colors.text, marginBottom: 3,
  },
  depotMeta: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.primary, marginBottom: 2 },
  depotHours: { fontFamily: fonts.sans, fontSize: 11, color: colors.textMuted },

  miniMap: {
    width: '100%',
    height: 192,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  resultActions: { width: '100%', flexDirection: 'row', gap: 12 },
  dirBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    backgroundColor: colors.primaryLight, borderRadius: 16, paddingVertical: 15,
    borderWidth: 1.5, borderColor: '#C8E8D6',
  },
  dirBtnText: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.primary },
  hereBtn: { flex: 1, borderRadius: 16, overflow: 'hidden', elevation: 4 },
  hereBtnDone: {},
  hereBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    paddingVertical: 15, borderRadius: 16,
  },
  hereBtnText: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: '#fff' },

  earnBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 16, backgroundColor: colors.goldLight,
    borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12,
    borderWidth: 1, borderColor: '#EDD98A',
  },
  earnBannerText: {
    fontFamily: fonts.sansSemiBold, fontSize: 13, color: '#9A7100',
  },
})
