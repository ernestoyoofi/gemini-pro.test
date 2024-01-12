import { View, Text, Dimensions, StyleSheet, TouchableOpacity } from "react-native"
import { Feather } from '@expo/vector-icons'

const { width } = Dimensions.get("window")
export default function NavigationLayout({ title, backBtn, btnIcon = [], navigation }) {
  let buttonArry = []

  for(let i in btnIcon.slice(0, 3)) {
    buttonArry.push(
      <TouchableOpacity onPress={btnIcon[i].click} style={s.backbutton} key={`button-${i}`}>
        {btnIcon[i].icon}
      </TouchableOpacity>
    )
  }

  let maxTips = btnIcon.slice(0, 3).length
  if(backBtn) {
    maxTips = maxTips + 1
  }

  return <View style={s.box_navigation}>
    {backBtn? <TouchableOpacity style={s.backbutton} onPress={() => { navigation.goBack() }}>
      <Feather name="chevron-left" size={20} color="#ffffff"/>
    </TouchableOpacity> : ""}
    <Text numberOfLines={1} style={{...s.font, paddingHorizontal: 15, width: width - (maxTips*50)}}>{title}</Text>
    {buttonArry}
  </View>
}

const s = StyleSheet.create({
  font: {
    fontFamily: "GoogleSans",
    color: "#ffffff",
    fontSize: 17
  },
  backbutton: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center"
  },
  box_navigation: {
    height: 50,
    alignItems: "center",
    flexDirection: "row"
  }
})