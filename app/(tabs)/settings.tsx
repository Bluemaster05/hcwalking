import Slider from "@react-native-community/slider";
import { useContext } from "react";
import { Switch, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlobalContext } from "../_layout";

export default function Settings(){
    const { showActivePin, setShowActivePin, showDistance, setShowDistance, showDirection, setShowDirection, winDistance, setWinDistance } = useContext(GlobalContext);

    return <SafeAreaView style={{
        padding: 16,
        backgroundColor: '#91C499',
        height: '100%',

    }}>
        <TouchableOpacity onPress={()=>{setShowActivePin(prev => !prev)}} style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            paddingHorizontal: 8,
        }}>
            <Text style={{fontSize: 18}}>Show Active Pin</Text>
            <Switch value={showActivePin} onValueChange={setShowActivePin}></Switch>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>{setShowActivePin(prev => !prev)}} style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            paddingHorizontal: 8,
        }}>
            <Text style={{fontSize: 18}}>Show Distance</Text>
            <Switch value={showDistance} onValueChange={setShowDistance}></Switch>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>{setShowDirection(prev => !prev)}} style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            paddingHorizontal: 8,
        }}>
            <Text style={{fontSize: 18}}>Show Direction</Text>
            <Switch value={showDirection} onValueChange={setShowDirection}></Switch>
        </TouchableOpacity>
        <Text style={{fontSize: 18, marginBottom: 10, marginLeft: 8}}>Winning Distance: {winDistance.toFixed(1)} meters</Text>
        <Slider minimumValue={1} maximumValue={10} step={0.1} value={winDistance} onValueChange={setWinDistance}></Slider>
    </SafeAreaView>
}