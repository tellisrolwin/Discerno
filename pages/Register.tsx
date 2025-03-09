// pages/Register.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App";

const YOUR_COMPUTER_IP = "192.168.0.106";

const { width: screenWidth } = Dimensions.get("window");
const vw = (percentageWidth: number) => screenWidth * (percentageWidth / 100);
const vh = (percentageHeight: number) =>
  Dimensions.get("window").height * (percentageHeight / 100);

type RegisterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Register"
>;

const Register = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = () => {
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsLoading(true);

    // Connect to your server for registration
    fetch(`http://${YOUR_COMPUTER_IP}:8080/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        Alert.alert("Success", "Registration successful. Please login.", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]);
      })
      .catch((error) => {
        Alert.alert("Error", "Registration failed. Please try again.");
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
              />
            </View>

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

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#666"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? "Creating Account..." : "Register"}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Login</Text>
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
  registerButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: vw(4),
    alignItems: "center",
    marginTop: vh(2),
  },
  registerButtonText: {
    color: "#fff",
    fontSize: vw(3.5),
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: vh(3),
  },
  loginText: {
    color: "#aaa",
    fontSize: vw(3.5),
  },
  loginLink: {
    color: "#007AFF",
    fontSize: vw(3.5),
    fontWeight: "bold",
    marginLeft: vw(1),
  },
});

export default Register;
