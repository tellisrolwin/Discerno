import { StyleSheet, Text, View, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";
import "./styles/global.css";
import Home1 from "./pages/Home1";
import Article1 from "./pages/Article1";

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <View style={styles.container}>
          <StatusBar
            barStyle="light-content"
            backgroundColor="#121212"
          ></StatusBar>
          <Home1></Home1>
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
