// pages/Login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App";
import AsyncStorage from '@react-native-async-storage/async-storage';

const YOUR_COMPUTER_IP = "192.168.0.106";

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

const { width: screenWidth } = Dimensions.get("window");
const vw = (percentageWidth: number) => screenWidth * (percentageWidth / 100);
const vh = (percentageHeight: number) =>
  Dimensions.get("window").height * (percentageHeight / 100);

const Login = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);

    fetch(`http://${YOUR_COMPUTER_IP}:8080/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Invalid credentials");
        }
        return response.json();
      })
      .then((data) => {
        AsyncStorage.setItem("isLoggedIn", "true");
        AsyncStorage.setItem("userId", String(data.user.id));
        AsyncStorage.setItem("currentUser", JSON.stringify(data.user));

        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      })
      .catch((error) => {
        Alert.alert("Error", "Invalid email or password");
        console.error("Error:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to your account</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121826",
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: vw(8),
  },
  title: {
    fontSize: vw(8),
    fontWeight: "bold",
    color: "#fff",
    marginBottom: vh(1),
  },
  subtitle: {
    fontSize: vw(4),
    color: "#aaa",
    marginBottom: vh(6),
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: vh(3),
  },
  label: {
    fontSize: vw(3.5),
    color: "#fff",
    marginBottom: vh(1),
  },
  input: {
    backgroundColor: "#292d39",
    borderRadius: 8,
    padding: vw(4),
    color: "#fff",
    fontSize: vw(3.5),
  },
  loginButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: vw(4),
    alignItems: "center",
    marginTop: vh(2),
  },
  loginButtonText: {
    color: "#fff",
    fontSize: vw(3.5),
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: vh(3),
  },
  registerText: {
    color: "#aaa",
    fontSize: vw(3.5),
  },
  registerLink: {
    color: "#007AFF",
    fontSize: vw(3.5),
    fontWeight: "bold",
    marginLeft: vw(1),
  },
});

export default Login;