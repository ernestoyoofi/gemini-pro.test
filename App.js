import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import { useFonts } from 'expo-font'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import localstorage from '@react-native-async-storage/async-storage'
import _default from "./_default"
import Pages_ChatAI from './pages/chat-ai'
import Pages_SettingsInfo from './pages/settings'

const Stack = createStackNavigator()
export default function __AppRegister() {
  const [fontsLoaded] = useFonts({
    "GoogleSans": require('./assets/googlesans.ttf'),
  })
  
  if(!fontsLoaded) {
    return <View>
      <Text>Loading...</Text>
    </View>
  }

  return <>
    <StatusBar style="dark" backgroundColor='#141414'/>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerShown: false,
        ..._default.NavigationAnimate,
        // headerPressColor: "#ffffff"
      }}>
        <Stack.Screen name="chat-ai">
          {(e) => <Pages_ChatAI {...e}/>}
        </Stack.Screen>
        <Stack.Screen name="settings">
          {(e) => <Pages_SettingsInfo {...e}/>}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  </>
}