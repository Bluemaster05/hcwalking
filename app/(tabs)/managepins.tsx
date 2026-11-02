import ManagePinsButton from "@/components/ManagePinsButton";
import QRScanner, { Pin } from "@/components/QRScanner";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Directory, File, Paths } from "expo-file-system";
import { useFocusEffect, useRouter } from "expo-router";
import { useContext, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from "react-native-safe-area-context";
import { Loc } from ".";
import { randomPointInCircle } from '../../scripts/choordutils';
import { isPinsFile } from "../../scripts/pinsFileHelper";
import { GlobalContext } from "../_layout";

function GrabPins(setPins: React.Dispatch<React.SetStateAction<{ choord: { lat: number, long: number }, name: string }[]>>, setQrpin: React.Dispatch<React.SetStateAction<Pin | null>>) {
    const dir = new Directory(Paths.document, 'pins')
    const file = new File(dir, 'PinsFile.json')
    if (file.exists) {
        const pinsJsonString = file.textSync()
        const pinsJson = JSON.parse(pinsJsonString)
        if (isPinsFile(pinsJson)) {
            setPins(pinsJson.pins)
        }
    } else {
        console.log("PinsFile.json does not exist")
    }

    setQrpin(null)
}



export default function ManagePin() {
    const [pageState, setPageState] = useState<'start' | 'loadPin' | 'sharePin' | 'scanPin' | 'randomPin'>('start')
    const [pins, setPins] = useState<{ choord: { lat: number, long: number }, name: string }[]>([])
    const navigation = useRouter()
    const { setActivePin, setCircleLoc, setCloseDistanceMet, location, setCircleRadius} = useContext(GlobalContext)
    const [qrpin, setQrpin] = useState<Pin | null>(null)
    const [deleteMode, setDeleteMode] = useState<boolean>(false)
    
    function loadPinRandomly(distance: number, startLocation: Loc, ){
        const location = randomPointInCircle(startLocation, distance)
        setActivePin(location)
        setCircleLoc(null)
        setCircleRadius(100)
        setCloseDistanceMet(false)
        navigation.navigate('/(tabs)')
    }
    
    useFocusEffect(() => {
        // Load existing pins from PinsFile.json
        GrabPins(setPins, setQrpin)
        
    })


    useFocusEffect(() => {
        setPageState('start')
    })


    return <SafeAreaView style={{
        padding: 16,
        display: 'flex',
        gap: 20,
        backgroundColor: '#91C499',
        height: '100%',
    }}>
        {pageState === 'start' && <>
            <TouchableOpacity onPress={() => setPageState('loadPin')}>
                <ManagePinsButton text="Load Pin" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPageState('sharePin')}>
                <ManagePinsButton text="Share Pin" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPageState('scanPin')}>
                <ManagePinsButton text="Scan Pin" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPageState('randomPin')}>
                <ManagePinsButton text="Load Random Pin" />
            </TouchableOpacity>
        </>}
        {pageState === 'loadPin' && <>
            <TouchableOpacity>
                <MaterialIcons name="arrow-back" size={32} onPress={() => { setPageState('start'); setDeleteMode(false) }} />
                <MaterialIcons name={deleteMode ? "delete-forever" : "delete"} size={32} style={{ position: 'absolute', top: 0, right: 0 }} onPress={() => setDeleteMode(prev => !prev)} />
            </TouchableOpacity>
            <ScrollView style={{ height: '95%' }} contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 8, display: 'flex', gap: 20 }}>
                {pins.map((pin, index) => {
                    return <TouchableOpacity key={index} onPress={() => {
                        //Set Context to this pin
                        if (deleteMode) {
                            // Delete pin from PinsFile.json
                            const dir = new Directory(Paths.document, 'pins')
                            const file = new File(dir, 'PinsFile.json')
                            if (file.exists) {
                                const pinsJsonString = file.textSync()
                                const pinsJson = JSON.parse(pinsJsonString)
                                if (isPinsFile(pinsJson)) {
                                    const newPins = pinsJson.pins.filter((p: Pin) => !(p.choord.lat === pin.choord.lat && p.choord.long === pin.choord.long && p.name === pin.name))
                                    const newPinsJson = {
                                        pins: newPins
                                    }
                                    file.write(JSON.stringify(newPinsJson))
                                    setPins(newPins)
                                }


                            }
                            return;
                        }
                        setActivePin(pin.choord)
                        setCircleLoc(null)
                        setCircleRadius(100)
                        setCloseDistanceMet(false)
                        navigation.navigate('/(tabs)')
                    }}>
                        <ManagePinsButton text={pin.name} />
                    </TouchableOpacity>
                })}

            </ScrollView>
        </>}
        {pageState === 'scanPin' && <>
            <QRScanner setPageState={setPageState} onScan={() => GrabPins(setPins, setQrpin)}></QRScanner>

        </>}
        {pageState === 'sharePin' && <>
            <TouchableOpacity>
                <MaterialIcons name="arrow-back" size={32} onPress={() => { setPageState('start'); setQrpin(null) }} />
            </TouchableOpacity>
            {qrpin && <>
                {/* <QRCode value={JSON.stringify(qrpin)} size={200}></QRCode> */}
                <View style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 20
                }}>
                    <Text>{qrpin.name}</Text>
                    <QRCode value={JSON.stringify(qrpin)} size={300}></QRCode>
                </View>
            </>}
            {!qrpin && <>
                <ScrollView style={{ height: '95%' }} contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 8, display: 'flex', gap: 20 }}>
                    {pins.map((pin, index) => {
                        return <TouchableOpacity key={index} onPress={() => {
                            //Set Context to this pin
                            setQrpin(pin)
                        }}>
                            <ManagePinsButton text={pin.name} />
                        </TouchableOpacity>
                    })}
                </ScrollView>


            </>}
        </>}
        {pageState === 'randomPin' && <>
            <TouchableOpacity>
                <MaterialIcons name="arrow-back" size={32} onPress={() => { setPageState('start'); }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() =>{ if (location) loadPinRandomly(50, { lat: location.coords.latitude, long: location.coords.longitude })}}>
                <ManagePinsButton text="within 50m"></ManagePinsButton>
            </TouchableOpacity>
            <TouchableOpacity onPress={() =>{ if (location) loadPinRandomly(100, { lat: location.coords.latitude, long: location.coords.longitude })}}>
                <ManagePinsButton text="within 100m"></ManagePinsButton>
            </TouchableOpacity>
            <TouchableOpacity onPress={() =>{ if (location) loadPinRandomly(200, { lat: location.coords.latitude, long: location.coords.longitude })}}>
                <ManagePinsButton text="within 200m"></ManagePinsButton>
            </TouchableOpacity>
            <TouchableOpacity onPress={() =>{ if (location) loadPinRandomly(300, { lat: location.coords.latitude, long: location.coords.longitude })}}>
                <ManagePinsButton text="within 300m"></ManagePinsButton>
            </TouchableOpacity>

        </>}


    </SafeAreaView>
}