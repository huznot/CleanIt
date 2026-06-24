import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Animated, Easing, StyleSheet, Vibration, View } from 'react-native'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'

const COLORS = ['#006B3C', '#00A86B', '#4A90D9', '#D4A017', '#FF6B35']

const SPARKS = [
  { angle: -90, distance: 52, size: 10 },
  { angle: -45, distance: 44, size: 8 },
  { angle: 0, distance: 54, size: 10 },
  { angle: 45, distance: 44, size: 8 },
  { angle: 90, distance: 52, size: 10 },
  { angle: 135, distance: 40, size: 7 },
  { angle: 180, distance: 54, size: 9 },
  { angle: -135, distance: 40, size: 7 },
]

function createSpark(i) {
  const spec = SPARKS[i % SPARKS.length]
  const radians = (spec.angle * Math.PI) / 180
  return {
    progress: new Animated.Value(0),
    opacity: new Animated.Value(0),
    color: COLORS[i % COLORS.length],
    ...spec,
    xTo: Math.cos(radians) * spec.distance,
    yTo: Math.sin(radians) * spec.distance,
  }
}

const ConfettiCannon = forwardRef(function ConfettiCannon(_, ref) {
  const [active, setActive] = useState(false)
  const centerScale = useRef(new Animated.Value(0.7)).current
  const ringScale = useRef(new Animated.Value(0.4)).current
  const ringOpacity = useRef(new Animated.Value(0)).current
  const overlayOpacity = useRef(new Animated.Value(0)).current
  const blurOpacity = useRef(new Animated.Value(0)).current
  const checkScale = useRef(new Animated.Value(0.2)).current
  const checkOpacity = useRef(new Animated.Value(0)).current
  const sparks = useRef(Array.from({ length: 8 }, (_, i) => createSpark(i))).current
  const hideTimer = useRef(null)
  const runId = useRef(0)

  const resetAnimations = () => {
    centerScale.setValue(0.7)
    ringScale.setValue(0.4)
    ringOpacity.setValue(0)
    overlayOpacity.setValue(0)
    blurOpacity.setValue(0)
    checkScale.setValue(0.2)
    checkOpacity.setValue(0)
    sparks.forEach((spark) => {
      spark.progress.setValue(0)
      spark.opacity.setValue(0)
    })
  }

  const fire = () => {
    runId.current += 1
    const currentRun = runId.current

    if (hideTimer.current) clearTimeout(hideTimer.current)
    Vibration.vibrate(35)
    setActive(true)
    resetAnimations()

    Animated.parallel([
      Animated.sequence([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 90,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(520),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(blurOpacity, {
          toValue: 1,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(380),
        Animated.timing(blurOpacity, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(centerScale, {
          toValue: 1.18,
          duration: 130,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(centerScale, {
          toValue: 1,
          friction: 5,
          tension: 110,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(ringOpacity, {
          toValue: 0.7,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 1.75,
            duration: 520,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 520,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.timing(checkScale, {
          toValue: 1,
          duration: 170,
          easing: Easing.out(Easing.back(1.6)),
          useNativeDriver: true,
        }),
        Animated.timing(checkOpacity, {
          toValue: 1,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.delay(220),
        Animated.timing(checkOpacity, {
          toValue: 0,
          duration: 240,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(checkScale, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
    ]).start()

    sparks.forEach((spark, i) => {
      const delay = i * 32
      setTimeout(() => {
        if (runId.current !== currentRun) return

        spark.opacity.setValue(1)
        Animated.parallel([
          Animated.timing(spark.progress, {
            toValue: 1,
            duration: 680,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(spark.opacity, {
            toValue: 0,
            duration: 680,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start()

      }, delay)
    })

    hideTimer.current = setTimeout(() => {
      if (runId.current === currentRun) setActive(false)
    }, 1200)
  }

  useImperativeHandle(ref, () => ({ fire }))

  if (!active) return null

  return (
    <Animated.View pointerEvents="none" style={[styles.overlay, { opacity: overlayOpacity }]}>
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: blurOpacity }]}>
        <BlurView intensity={24} tint="light" style={StyleSheet.absoluteFillObject} />
        <View style={styles.blurTint} />
      </Animated.View>

      <Animated.View
        style={[
          styles.ring,
          {
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
      />

      {sparks.map((spark, i) => {
        const translateX = spark.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, spark.xTo],
        })
        const translateY = spark.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, spark.yTo],
        })
        const scale = spark.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1],
        })

        return (
          <Animated.View
            key={i}
            style={[
              styles.spark,
              {
                opacity: spark.opacity,
                backgroundColor: spark.color,
                width: spark.size,
                height: spark.size,
                borderRadius: spark.size / 2,
                transform: [
                  { translateX },
                  { translateY },
                  { scale },
                ],
              },
            ]}
          />
        )
      })}

      <Animated.View
        style={[
          styles.center,
          {
            transform: [{ scale: centerScale }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.checkWrap,
            {
              transform: [{ scale: checkScale }],
              opacity: checkOpacity,
            },
          ]}
        >
          <Ionicons name="checkmark" size={30} color="#fff" />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  )
})

export default ConfettiCannon

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: '#D4A017',
  },
  blurTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(243, 248, 244, 0.18)',
  },
  center: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#006B3C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#006B3C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 12,
  },
  checkWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -5,
    marginTop: -5,
  },
})
