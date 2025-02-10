import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import SparkleSvg from "../assets/images/sparkle1.svg"; // Assuming you're using the direct import method

const windowWidth = Dimensions.get("window").width;

const Home1 = () => {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Morning! 🔆");
    } else if (hour < 18) {
      setGreeting("Afternoon! ☀️");
    } else {
      setGreeting("Evening! 🌙");
    }
  }, []);

  const date = new Date();
  const options = { weekday: "short", day: "numeric", month: "short" };
  const formattedDate = date.toLocaleDateString("en-US", options);

  return (
    <View style={styles.homeContainer}>
      <View style={styles.leftContainer}>
        <Text style={styles.greetText}>
          Good{"\n"}
          {greeting}
        </Text>
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>
      <View style={styles.rightContainer}>
        <SparkleSvg width={windowWidth * 0.15} height={windowWidth * 0.15} />
        <Text style={styles.categoriesText}>categoriesDD</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  homeContainer: {
    flexDirection: "row", // Keep as row
    justifyContent: "space-between",
    backgroundColor: "#121212",
    paddingLeft: windowWidth * 0.03,
    paddingRight: windowWidth * 0.02,
    minHeight: "100%",
    paddingTop: windowWidth * 0.1, // Add top padding to the whole container
  },
  leftContainer: {
    // Add a container for the left side for easier styling, if needed
    flexDirection: "column", // Default, but good to be explicit
  },
  rightContainer: {
    flexDirection: "column", // Stack sparkle and categories vertically
    alignItems: "center", // Center items horizontally within the column
    justifyContent: "flex-start", // Align items to the top of the container
    paddingTop: windowWidth * 0.05,
  },
  greetText: {
    fontSize: windowWidth * 0.1,
    fontWeight: "bold",
    color: "white",
    maxWidth: "100%",
  },
  dateText: {
    fontSize: windowWidth * 0.06,
    fontWeight: "bold",
    color: "#999999",
  },
  categoriesText: {
    fontSize: windowWidth * 0.06,
    fontWeight: "bold",
    color: "#999999",
    marginTop: windowWidth * 0.02, // Add some space between sparkle and text
  },
});

export default Home1;
