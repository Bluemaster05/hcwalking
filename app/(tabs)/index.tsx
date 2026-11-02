import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import { Text } from "@react-navigation/elements";
import { Directory, File, Paths } from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Button, KeyboardAvoidingView, Platform, TextInput, useColorScheme, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Animated, { useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { distanceMeters, getBearing, randomPointInCircle } from '../../scripts/choordutils';
import { isPinsFile } from '../../scripts/pinsFileHelper';
import { GlobalContext } from "../_layout";

//Types 
export type Loc = {
  lat: number,
  long: number
}

export type PinsFile = {
  pins: {
    choord: Loc,
    name: string
  }[]
}


export default function HomeScreen() {
  
  const [distance, setDistance] = useState<number>(0)
  const [started, setStarted] = useState<boolean>(false)
  const [startedDistance, setStartedDistance] = useState<number>(0)
  const [heading, setHeading] = useState<number>(0)
  const [loadingPinChoords, setLoadingPinChoords] = useState<Loc | null>(null)
  const [touchSpaceState, setTouchSpaceState] = useState<'Game' | 'LoadingPinChoords' | 'success'>('Game')
  const [loadingPinText, setLoadingPinText] = useState<string>("")
  const mapRef = useRef<MapView | null>(null)
  const { activePin, setActivePin, showActivePin, showDistance, showDirection, winDistance, circleRadius, setCircleRadius, circleLoc, setCircleLoc, closeDistanceMet, setCloseDistanceMet, location, setLocation } = useContext(GlobalContext)
  const [delay, setDelay] = useState(1000)
  const lastHeadingUpdate = useRef<number>(0)
  const [steps, setSteps] = useState<number>(0)
  const [startSteps, setStartSteps] = useState<number>(0)
  const [cameraHeading, setCameraHeading] = useState<number>(0)
  const [arrowColor] = useState<string>('white')
  const [timer, setTimer] = useState<number>(0)
  const colorScheme = useColorScheme()  
  const scale = useSharedValue(1)
  


  const animateScale = useCallback(() => {
    scale.value = withSequence(
      withTiming(1.5, { duration: 200 }),
      withTiming(1, {duration: 200})
    )
  }, [scale])

  // Process Step Counter
  useEffect(()=>{
    (async ()=>{
      await Pedometer.requestPermissionsAsync()

      Pedometer.watchStepCount((result) =>{
        setSteps(result.steps)
      })
      
    })()


  }, [])

  // Process Timer and reset timer and steps on start
  useEffect(()=>{
    const int = setInterval(()=>{
      if (started){
        setTimer(prev => prev + 1)
      }
    }, 1000)

    return () => clearInterval(int)
  }, [started, steps])

  // Handle Location Permission Request and Update Location When changes
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      await Location.watchPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        mayShowUserSettingsDialog: true,
        distanceInterval: 1,


      }, (loc) => {
        setLocation(loc)
      })



    })()

    return
  }, [setLocation])

  // Update Distance and Heading When Location or Active Pin changes
  useEffect(() => {
    if (location && activePin) {
      setDistance(distanceMeters(location.coords.latitude, location.coords.longitude, activePin.lat, activePin.long))
      const now = Date.now()
      let headingDelay = delay * 10 
      let distancePercent = distance / startedDistance
      headingDelay = headingDelay * distancePercent
      
      if (now - lastHeadingUpdate.current >= headingDelay || lastHeadingUpdate.current === 0) {
        setHeading(getBearing(location.coords.latitude, location.coords.longitude, activePin.lat, activePin.long))
        animateScale()
        lastHeadingUpdate.current = now
      }


    }
  }, [location, activePin, distance, startedDistance, delay, cameraHeading, animateScale])

  // Handle Haptics When Started and Distance changes
  useEffect(() => {
    if (started) {
      let tdelay = delay
      let distancePercent = distance / startedDistance
      tdelay = tdelay * distancePercent
      const int = setInterval(() => {
        Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Reject)
      }, tdelay)

      return () => {
        clearInterval(int)
      }
    }
  }, [distance, started, startedDistance, delay])

  // Handle Success When Distance is less than winDistance
  useEffect(() => {
    if (distance <= winDistance && activePin && started) {
      setTouchSpaceState('success')
      setActivePin(null)
      setStarted(false)
      Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm)
    }
  }, [distance, winDistance, activePin, started, setActivePin, setStarted, steps])

  // Handle Circle Location and closeDistanceMet
  useEffect(() => {
    if (activePin && location){
      if (circleLoc === null){
        setCircleLoc(randomPointInCircle(activePin, circleRadius))
      } else if (distance < 20 && !closeDistanceMet){
        setCloseDistanceMet(true)
        setCircleRadius(20)
        setCircleLoc(randomPointInCircle(activePin, 20))
      }

    }
  }, [activePin, location, circleRadius, distance, circleLoc, closeDistanceMet, setCircleLoc, setCircleRadius, setCloseDistanceMet])


  // Show Loading When Location is not yet available
  if (!location) {
    return <SafeAreaView style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%'
    }}>
      <ActivityIndicator size={"large"}></ActivityIndicator>
    </SafeAreaView>
  }
  
  // Make Choords easier to access for Markup Below
  const { latitude, longitude } = location.coords


  return <SafeAreaView style={{
    flex: 1,
    backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#91C499',
  }} edges={['top', 'left', 'right']}>
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{flex: 1,
         backgroundColor: '#91C499'
      }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={{
        flex: touchSpaceState === 'LoadingPinChoords' ? 2 : 4,
      }}>
        <MapView provider={PROVIDER_GOOGLE}  onLongPress={(event)=>{
          const {latitude, longitude} = event.nativeEvent.coordinate
          setTouchSpaceState('LoadingPinChoords')
          setLoadingPinChoords({lat: latitude, long: longitude})
          Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Long_Press)
        }} mapType='hybrid' showsCompass showsUserLocation ref={mapRef} style={{
          flex: 1
        }} initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003
        }} onRegionChange={async ()=>{
          if (mapRef.current){
            const camera = await mapRef.current.getCamera()
            setCameraHeading(camera.heading)
          }
        }}>
          { circleLoc && <Circle center={{ latitude: circleLoc.lat, longitude: circleLoc.long }} radius={circleRadius} strokeColor='green' fillColor='rgb(35,35,35,0.5)'></Circle>}
          {activePin && showActivePin && <Marker coordinate={{ latitude: activePin.lat, longitude: activePin.long }}></Marker>}
          {loadingPinChoords && <Marker coordinate={{latitude: loadingPinChoords.lat, longitude: loadingPinChoords.long}} pinColor='yellow'></Marker>}
          {showDirection && <Marker coordinate={{ latitude, longitude }}>
            <Animated.View style={{ transform: [{ rotate: `${heading - cameraHeading}deg` }, {scale: scale}]}}>
              <MaterialIcons size={50} style={{}} color={arrowColor} name='arrow-upward'></MaterialIcons>
            </Animated.View>
          </Marker>}
        </MapView>
        {showDirection && 
        <Animated.View style={{ position: 'absolute', top: 120, right: 5, transform: [{ rotate: `${heading - cameraHeading}deg` }, {scale: scale}] }}>
          <MaterialIcons size={50}  color={arrowColor} name='arrow-upward'></MaterialIcons>
        </Animated.View>
        
        }
      </View>
      <View style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        gap: 10
      }}>
        {touchSpaceState === 'LoadingPinChoords' && loadingPinChoords &&  <>
          <TextInput 
            style={{borderWidth: 1, borderColor: 'gray', width: '40%', padding: 8}} 
            value={loadingPinText} 
            onChangeText={setLoadingPinText}
            placeholder="Pin name"
          />
          <Button title='Save Pin' onPress={()=>{
            // Save Pin to Pins.json
            const dir = new Directory(Paths.document, 'pins')
            if (!dir.exists){
              dir.create()
            }
            const file = new File(dir, 'PinsFile.json')
            if (file.exists){
              const pinsJsonString = file.textSync()
              const pinsJson = JSON.parse(pinsJsonString)
              if (isPinsFile(pinsJson)){
                pinsJson.pins.push({choord: loadingPinChoords, name: loadingPinText || 'New Pin'})
                file.write(JSON.stringify(pinsJson))
              } else {
                // Invalid Pins File
                const pinsJSON = {
                  pins: [{choord: loadingPinChoords, name: loadingPinText || 'New Pin'}]
                }
                file.write(JSON.stringify(pinsJSON))
              }
            } else {
              const pinsJSON = {
                  pins: [{choord: loadingPinChoords, name: loadingPinText || 'New Pin'}]
                }
                file.write(JSON.stringify(pinsJSON))
            }

            //Reset State
            setTouchSpaceState('Game')
            setLoadingPinChoords(null)



          }}></Button>
          <Button title='Cancel' onPress={()=>{
            setTouchSpaceState('Game')
            setLoadingPinChoords(null)
          }}></Button>
        </>}
        {touchSpaceState === 'Game' && <>
          <Text>Timer: {timer} seconds, Steps: {steps - startSteps}</Text>
          {showDistance && <Text>Distance: {Math.round(distance * 100) / 100} m, maxDelay: {delay}ms</Text>}
          {!showDistance && <Text>maxDelay: {delay}</Text>}
          <Slider minimumValue={0} maximumValue={5000} value={delay} onValueChange={(e)=>{ setDelay(e)}} style={{width: '80%'}} step={100}></Slider>
          <Button title={started ? "Stop" : "Start"} onPress={() => { setStarted(prev => !prev); setStartedDistance(distance); if (!started) setStartSteps(steps); }}></Button>
        </>}
        {touchSpaceState === 'success' && <>
          <Text>You have made it!!! Load Another Pin to Start again!</Text>
          <Text>You made it in {steps - startSteps} steps, and {timer} seconds</Text>
          <Button title='Load Another Pin' onPress={() => {
            setTouchSpaceState('Game')
            setActivePin(null)
            setTimer(0)
            setStartSteps(steps)
          }}></Button>
        </>}
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
}
