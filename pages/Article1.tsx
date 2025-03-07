import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");

const Article1 = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.phoneFrame}>
        <View style={styles.content}>
          <Text style={styles.publication}>The Verge</Text>
          <Text style={styles.title}>
            Lenovo's transparent laptop concept resurfaces in new leak
          </Text>
          <Text style={styles.author}>
            By Jon Porter, a reporter with five years of experience covering
            consumer tech releases, EU tech policy, online platforms, and
            mechanical keyboards.
          </Text>

          <Image source={{}} style={styles.image} />

          <Text style={styles.bodyText}>
            Leaker Evan Blass has offered another look at Lenovo's transparent
            laptop concept ahead of its presumed unveiling at Mobile World
            Congress in Barcelona later this month. The new leaked press image
            shows two of the concept laptops on a desk, with one of the devices
            being ...
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark background
  },
  phoneFrame: {
    // backgroundColor: 'white',  // Phone frame background (optional)
    // borderColor: '#888',      // Phone frame border (optional)
    // borderWidth: 2,            // Phone frame border width (optional)
    // borderRadius: 40,         // Phone frame border radius (optional)
    // overflow: 'hidden',       // Clip content to the frame (optional)
    width: width,
    height: height,
    alignSelf: "center",
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: width * 0.05, // 5% of screen width
    paddingTop: height * 0.04, // 4% of screen height (adjust as needed)
    paddingBottom: height * 0.01,
  },
  time: {
    color: "white",
    fontSize: width * 0.04, // 4% of screen width
  },
  statusBarIcons: {
    flexDirection: "row",
  },
  iconPlaceholder: {
    width: width * 0.05, // 5% of screen width
    height: width * 0.05, // 5% of screen width
    backgroundColor: "gray", // Placeholder color
    marginLeft: width * 0.01, // 1% of screen width
  },
  content: {
    paddingHorizontal: width * 0.05, // 5% of screen width
    paddingBottom: height * 0.05, // 5% of screen height
  },
  publication: {
    color: "white",
    fontSize: width * 0.045, // 4.5% of screen width
    fontWeight: "bold",
    marginBottom: height * 0.01, // 1% of screen height
  },
  title: {
    color: "white",
    fontSize: width * 0.08, // 8% of screen width
    fontWeight: "bold",
    marginBottom: height * 0.02, // 2% of screen height
  },
  author: {
    color: "#AAAAAA", // Light gray
    fontSize: width * 0.04, // 4% of screen width
    marginBottom: height * 0.03, // 3% of screen height
  },
  image: {
    width: "100%",
    height: height * 0.3, // 30% of screen height
    resizeMode: "cover", // or 'contain', 'stretch', etc.
    marginBottom: height * 0.02, // 2% of screen height
  },
  bodyText: {
    color: "white",
    fontSize: width * 0.045, // 4.5% of screen width
    lineHeight: height * 0.03, // Adjust line height as needed
  },
});

export default Article1;
