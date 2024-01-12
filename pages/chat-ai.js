import { Text, View, StyleSheet, Dimensions, ScrollView, TextInput, Keyboard, TouchableOpacity, Clipboard, Alert, ActivityIndicator, Linking } from "react-native"
import { MaterialCommunityIcons, MaterialIcons, FontAwesome } from '@expo/vector-icons'
import { SafeAreaView } from "react-native-safe-area-context"
import NavigationLayout from "../layout/navigation"
import { useEffect, useRef, useState } from "react"
import Animated, { useSharedValue, withSpring, withTiming, Easing } from 'react-native-reanimated'
import _default from "../_default"
import localstorage from '@react-native-async-storage/async-storage'
import axios from "axios"

function ChatBoxContent({ name, content, source, loading }) {
  return <View style={s.chatbox}>
    <Text style={[s.defaultFont, 
      { color: "#c4c4c4", fontSize: 12, marginBottom: 5, }
    ]}>{name} {(!loading && !content)? <Text>- <Text style={{color:"red"}}>Bad request</Text></Text>:""}</Text>
    {loading? <View style={{flexDirection: "row", alignItems: "center"}}><ActivityIndicator /><Text style={{...s.defaultFont, fontSize: 12, marginLeft: 10}}>Start Request...</Text></View>: <Text style={s.defaultFont} onLongPress={() => {
      Clipboard.setString(content)
      Alert.alert(
        "Success Copy Text !"
      )
    }}>{(!loading && !content)? <Text style={{...s.defaultFont,color:"red"}}>No Content !</Text>:content}</Text>}
    {Array.isArray(source)? source.map(a => (<TouchableOpacity onPress={() => {
      Linking.openURL(a.link)
    }}><Text style={{color:"white"}}>{a.title || a.label}</Text></TouchableOpacity>)):""}
  </View>
}

function MessageOfError({ message, click, style }) {
  return <TouchableOpacity style={[s.box_msgerror, style]} onPress={click}>
    <Text style={s.defaultFont}><Text style={{fontWeight:"bold"}}>Mention Error: </Text>{message}</Text>
  </TouchableOpacity>
}

const { width, height } = Dimensions.get("window")
export default function Pages_ChatAI({ navigation }) {
  const [isLoading, setLoading] = useState(false)
  const [message, setMessage] = useState([])
  const [msgError, setMsgError] = useState(null)
  const textInputContent = useRef()
  const textRequest = useRef()
  const scrollContent = useRef()
  const heightError = useSharedValue(0)
  const heightKeyboard = useSharedValue(height - 50 - 80)

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', (e) => {
      heightKeyboard.value = withTiming(height - 50 - 80 - e.endCoordinates.height, {
        duration: 80,
      })
      scrollContent.current.scrollToEnd({ animated: true })
    })
    Keyboard.addListener('keyboardDidHide', () => {
      heightKeyboard.value = withTiming(height - 50 - 80, {
        duration: 80,
      })
    })
    return () => {
      Keyboard.removeAllListeners("keyboardWillShow")
      Keyboard.removeAllListeners("keyboardWillHide")
    }
  })

  const openMessageError = (msg) => {
    console.log("Errored", msg)
    heightError.value = withTiming(40, {
      duration: 400,
      easing: Easing.in(Easing.elastic(2)),
    })
    setMsgError(msg)
  }

  const submitRequestContent = async () => {
    scrollContent.current.scrollToEnd({ animated: true })
    try {
      if(isLoading) {
        return;
      }
      if(typeof textRequest.current != "string" || textRequest.current.length < 2) {
        openMessageError("Add your message !")
        return textInputContent.current.focus()
      }
      textInputContent.current.clear()
      textInputContent.current.blur()
      const authkey = await localstorage.getItem(_default.LocalStorageName.apikey)
      if(!authkey) {
        return navigation.push("settings")
      }
      const toDataForm = {
        contents: [
          ...message.map(a => ({
            role: a.type,
            parts: [{text: a.content}]
          })),
          {
            role: "user",
            parts: [{text: textRequest.current}]
          }
        ]
      }
      let content = message
      content.push({
        name: "User",
        type: "user",
        content: textRequest.current
      })
      content.push({
        name: "Model - Gemini",
        type: "model",
        loading: true
      })
      setLoading(true)
      setMessage(content)
      textRequest.current = ""
      const datainfo = await axios.post(`${_default.Hosting}?key=${authkey}`, toDataForm)
      const aiContent = datainfo.data
      if(!aiContent.candidates || !aiContent.candidates[0].content) {
        openMessageError("No Content Response")
        let isMessage = message
        isMessage[message.length - 1] = {
          name: "Model - Gemini",
          type: "model",
          content: ""
        }
        setMessage(isMessage)
        setLoading(false)
        scrollContent.current.scrollToEnd({ animated: true })
        return textInputContent.current.focus()
      }
      const textSplit = aiContent.candidates[0].content.parts[0].text.split("")
      let isMessage = message
      isMessage[message.length - 1] = {
        name: "Model - Gemini",
        type: "model",
        content: textSplit.join(""),
        source: aiContent.candidates[0].content.citationMetadata? aiContent.candidates[0].content.citationMetadata.citationSources.map(a => ({
          title: new URL(uri).hostname,
          link: uri
        })) : null
      }
      setMessage(isMessage)
      setLoading(false)
      scrollContent.current.scrollToEnd({ animated: true })
      textInputContent.current.focus()
    } catch(err) {
      console.log(err)
      Alert.alert(err.message)
      openMessageError(err.message)
      if(err.response) {
        openMessageError(JSON.stringify(err.response.data))
      }
      let isMessage = message
      isMessage[message.length - 1] = {
        name: "Model - Gemini",
        type: "model",
        content: ""
      }
      setMessage(isMessage)
      setLoading(false)
      scrollContent.current.scrollToEnd({ animated: true })
      textInputContent.current.focus()
    }
  }
  return <View style={{...s.boxcenter, height: height+200 }}>
    <SafeAreaView>
      <NavigationLayout
        title="Gemini Pro"
        navigation={navigation}
        btnIcon={[
          {
            icon: <MaterialCommunityIcons name="restart" size={22} color="white" />,
            click: () => {
              if(isLoading) {
                return Alert.alert(
                  'Errored !',
                  "Can't delete previous chat because there is still a process behind it!",
                )
              }
              if(message.length > 1) {
                return Alert.alert(
                  'Are your sure?',
                  "Are you sure you want to repeat this chat again?, everything will just disappear because there is no backup history.",
                  [{text:"Cancel"},{text:"Reset",onPress:() => {setMessage([])}}]
                )
              }
              setMessage([])
            }
          },
          {
            icon: <MaterialIcons name="settings" size={20} color="white" />,
            click: () => {
              navigation.push("settings")
            }
          }
        ]}
      />
      <View style={s.boxcenter}>
        <Animated.ScrollView style={{height: heightKeyboard}} ref={scrollContent}>
          <Animated.View style={{height: heightError, width: width, backgroundColor:"red", alignItems: "center", flexDirection: "row"}}>
            <MessageOfError
              message={msgError}
              click={() => {
                heightError.value = withTiming(0, {
                  duration: 400,
                  easing: Easing.in(Easing.elastic(0)),
                })
              }}
            />
          </Animated.View>
          {message.map((data, i) => (
            <ChatBoxContent {...data} key={i}/>
          ))}
        </Animated.ScrollView>
        <View style={s.boxinput}>
          <View style={s.boxinput_content}>
            <TextInput
              placeholder="Message"
              cursorColor="#ffffff"
              placeholderTextColor="#c4c4c4"
              style={s.defaultFont}
              ref={textInputContent}
              onChangeText={(e) => {
                textRequest.current = e
              }}
              onFocus={() => {
                if(isLoading) {
                  textInputContent.current.blur()
                }
              }}
            />
          </View>
          <TouchableOpacity onPress={submitRequestContent} style={s.boxinput_btn}>
            <FontAwesome name="send" size={15} style={{marginRight: 2,marginBottom: 2}} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  </View>
}

const s = StyleSheet.create({
  defaultFont: {
    fontFamily: "GoogleSans",
    color: "white",
  },
  boxcenter: {
    backgroundColor: "#141414"
  },
  chatbox: {
    padding: 10,
    paddingHorizontal: 20
  },
  boxinput: {
    width: width,
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    // backgroundColor: "#ffffff"
  },
  boxinput_content: {
    width: width - 40 - 55 - 10,
    padding: 9,
    paddingHorizontal: 20,
    borderRadius: 40,
    backgroundColor: "#262626"
  },
  boxinput_btn: {
    width: 48,
    height: 48,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40,
    backgroundColor: "#26344a"
  },
  box_msgerror: {
    width: width,
    paddingHorizontal: 15,
    backgroundColor: "red"
  }
})