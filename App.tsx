import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import "./styles/global.css";
import Home1 from "./pages/Home1";
import Article1 from "./pages/Article1";
import { StatusBar } from "react-native";

// Define the types for our navigation parameters
export type RootStackParamList = {
  Home: undefined;
  Article: {
    articleLink: string;
    articleTitle: string;
    articleImage?: string;
    articleAuthor?: string;
    articleDescription?: string;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: "#121212" },
            }}
          >
            <Stack.Screen name="Home" component={Home1} />
            <Stack.Screen name="Article" component={Article1} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
