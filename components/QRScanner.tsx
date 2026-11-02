import { Loc } from "@/app/(tabs)";
import { isPin, isPinsFile } from "@/scripts/pinsFileHelper";
import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Directory, File, Paths } from "expo-file-system";
import { useState } from "react";
import { ActivityIndicator, Button, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type Pin = {
    choord: Loc,
    name: string
}


export default function QRScanner(props: {setPageState: React.Dispatch<React.SetStateAction<"start" | "loadPin" | "sharePin" | "scanPin" | "randomPin">>, onScan?: () => void}) {
    const {setPageState} = props
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState<boolean>(false);
    const [validScan, setValidScan] = useState<boolean | null>(null);

    if (!permission) {
        return <SafeAreaView style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
        }}>
            <ActivityIndicator size={"large"}></ActivityIndicator>
        </SafeAreaView>
    }

    if (!permission.granted) {
        return <View style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
        }}>
            <Text>We need camera permission to scan QR codes.</Text>
            <Button title="Grant Permission" onPress={requestPermission}></Button>
        </View>
    }

    return <>
        {!scanned && <>
            <CameraView facing="back" barcodeScannerSettings={{ barcodeTypes: ["qr"] }} style={{ width: '100%', height: '100%' }} onBarcodeScanned={(result) => {
                if (!scanned) {
                    setScanned(true);
                    // Validate QR code here
                    const data = result.data;
                    const jsondata = JSON.parse(data);
                    if (isPin(jsondata)) {
                        setValidScan(true);

                        const dir = new Directory(Paths.document, 'pins')
                                    if (!dir.exists){
                                      dir.create()
                                    }
                                    const file = new File(dir, 'PinsFile.json')
                                    if (file.exists){
                                      const pinsJsonString = file.textSync()
                                      const pinsJson = JSON.parse(pinsJsonString)
                                      if (isPinsFile(pinsJson)){
                                        pinsJson.pins.push({choord: jsondata.choord, name: jsondata.name})
                                        file.write(JSON.stringify(pinsJson))
                                      } else {
                                        // Invalid Pins File
                                        const pinsJSON = {
                                          pins: [{choord: jsondata.choord, name: jsondata.name}]
                                        }
                                        file.write(JSON.stringify(pinsJSON))
                                      }
                                    } else {
                                      const pinsJSON = {
                                          pins: [{choord: jsondata.choord, name: jsondata.name}]
                                        }
                                        file.write(JSON.stringify(pinsJSON))
                                    }
                                    props.onScan && props.onScan()
                        

                    }
                }
            }}>

            </CameraView>

        </>}

        {scanned && <>
            <View style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%'
            }}>
                <TouchableOpacity>
                    <MaterialIcons name="arrow-back" size={32} onPress={() => setPageState('start')}/>
                </TouchableOpacity>
                {validScan && <Text>Scan successful! Location Added</Text>}
                {validScan === false && <Text>Invalid QR Code. Try Again</Text>}
            </View>
        </>}


    </>

}