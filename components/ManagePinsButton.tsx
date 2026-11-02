import { View, Text } from "react-native";

export default function ManagePinsButton(props: {text: string}){
    const {text} = props
    return <View style={{
        padding: 12,
        backgroundColor: '#DDD',
        borderRadius: 8,
        boxShadow: '0px 2px 4px rgba(50,50,50,0.1)',
        }}>
        <Text style={{fontSize: 24}}>{text}</Text>
    </View>
}