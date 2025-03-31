// App.tsx
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import "./styles/global.css";
import Home1 from "./pages/Home1";
import Article1 from "./pages/Article1";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ArticleSummary from "./pages/ArticleSummary";
import Aggregator from "./pages/Aggregator"; // Import the new component
import { StatusBar } from "react-native";
import { initializeStorage, isAuthenticated } from "./services/AuthService";

// Define the types for our navigation parameters
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Article: {
    articleLink: string;
    articleTitle: string;
    articleImage?: string;
    articleAuthor?: string;
    articleDescription?: string;
    articleCategory?: string;
    selectedFilter: string;

    articleSource?: string;

  };
  ArticleSummary: { summary: string, insights: string };
  Aggregator: {
    userId: number | null;
  }; // Add the new route
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Initialize the storage with our mock localStorage
    initializeStorage();

    // Check if user is already logged in
    setIsLoggedIn(isAuthenticated());

    // Set app as ready
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={isLoggedIn ? "Home" : "Login"}
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: "#121212" },
            }}
          >
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Home" component={Home1} />
            <Stack.Screen name="Article" component={Article1} />
            <Stack.Screen name="ArticleSummary" component={ArticleSummary} />
            <Stack.Screen name="Aggregator" component={Aggregator} />
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