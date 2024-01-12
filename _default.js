import { CardStyleInterpolators } from "@react-navigation/stack"

module.exports = {
  LocalStorageName: {
    apikey: "apikey",
  },
  Hosting: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
  NavigationAnimate: {
    // gestureDirection: "horizontal",
    gestureEnabled: false,
    cardStyleInterpolator: CardStyleInterpolators.forRevealFromBottomAndroid
  }
}