import { Text, View, StyleSheet, Dimensions, TouchableOpacity, TextInput } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import NavigationLayout from "../layout/navigation"
import { useState, useRef, useEffect } from "react"
import _default from "../_default"
import localstorage from '@react-native-async-storage/async-storage'

const { width, height } = Dimensions.get("window")
export default function Pages_SettingsInfo({ navigation }) {
  const inputApikey = useRef()
  const [apikey, setapikeyview] = useState(null)

  useEffect(() => {
    if(typeof apikey != "string") {
      localstorage.getItem(_default.LocalStorageName.apikey)
      .then(a => {
        setapikeyview(a || "")
      })
    }
  })

  return <View style={{...s.boxcenter, height: height+200 }}>
    <SafeAreaView>
      <NavigationLayout
        title="Settings"
        backBtn={true}
        navigation={navigation}
      />
      <View style={s.boxcontent}>
        <Text style={[s.fonts,{fontSize:15}]}>Auth API Key</Text>
        <View style={{backgroundColor:"#262626",padding:4,paddingHorizontal:16,borderRadius:9,marginVertical:10,marginTop:20}}>
          <TextInput
            placeholder="AIza..."
            placeholderTextColor="#c4c4c4"
            cursorColor="#ffffff"
            defaultValue={apikey}
            style={[s.fonts]}
            onChangeText={(a) => {
              inputApikey.current = a
            }}
          />
        </View>
        <TouchableOpacity style={{backgroundColor:"#9d00ff",padding:9,paddingHorizontal:16,borderRadius:9}} onPress={() => {
          if(!inputApikey.current) {
            localstorage.removeItem(_default.LocalStorageName.apikey)
            return;
          }
          localstorage.setItem(_default.LocalStorageName.apikey, inputApikey.current)
          setapikeyview(inputApikey.current)
        }}>
          <Text style={[s.fonts, {textAlign:"center"}]}>Save New API Key</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  </View>
}

const s = StyleSheet.create({
  fonts: {
    fontFamily: "GoogleSans",
    color: "#ffffff"
  },
  boxcenter: {
    backgroundColor: "#141414"
  },
  boxcontent: {
    padding: 15,
    paddingVertical: 2,
  }
})