import { StyleSheet, Text, View, StatusBar } from "react-native";
import "./styles/global.css";
import Home1 from "./pages/Home1";

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212"></StatusBar>
      <Home1></Home1>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
