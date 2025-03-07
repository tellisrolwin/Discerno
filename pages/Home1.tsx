import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const { width: screenWidth } = Dimensions.get("window");

const vw = (percentageWidth: number) => screenWidth * (percentageWidth / 100);
const vh = (percentageHeight: number) =>
  Dimensions.get("window").height * (percentageHeight / 100);

const Home1 = () => {
  const [selectedFilter, setSelectedFilter] = useState("technology");
  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const updateGreetingAndDate = () => {
      const now = new Date();
      const hours = now.getHours();

      // Determine greeting
      let newGreeting = "";
      if (hours >= 5 && hours < 12) {
        newGreeting = "Good\nMorning";
      } else if (hours >= 12 && hours < 18) {
        newGreeting = "Good\nAfternoon";
      } else {
        newGreeting = "Good\nEvening";
      }
      setGreeting(newGreeting);

      // Format date (e.g., "Tue 20 Feb")
      const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "short" }); // "Tue"
      const dayOfMonth = now.getDate(); // "20"
      const month = now.toLocaleDateString("en-US", { month: "short" }); // "Feb"
      setCurrentDate(`${dayOfWeek}, ${dayOfMonth} ${month}`);
    };

    updateGreetingAndDate(); // Call immediately

    // Update greeting and date every minute (optional, but good for accuracy)
    const intervalId = setInterval(updateGreetingAndDate, 60000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this effect runs once on mount

  const newsItems = [
    {
      title: "Tencent's gaming cash cow Honor of Kings sets sights on MENA",
      source: "TechCrunch",
      time: "10m",
      image: "", // Replace with your image URL or require statement
      sourceLogo: "", // Replace with your logo URL or require statement
    },
    {
      title:
        "Apple smart ring development accelerating, claims extremely sketchy report",
      source: "9to5Mac",
      time: "13m",
      image: "",
      sourceLogo: "",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.goodMorning}>{greeting}</Text>
            <Text style={styles.date}>{currentDate}</Text>
          </View>
          <View style={styles.sparkleContainer}>
            <Text style={styles.sparkle}>✨</Text>
          </View>
        </View>

        <View style={styles.filter}>
          <Picker
            selectedValue={selectedFilter}
            onValueChange={(itemValue) => setSelectedFilter(itemValue)}
            style={styles.filterSelect}
            dropdownIconColor="white" // For iOS, to change the dropdown arrow color
            itemStyle={{ color: "white", fontSize: vw(3) }} // Style for individual options
          >
            <Picker.Item label="Technology" value="technology" />
            <Picker.Item label="Business" value="business" />
            <Picker.Item label="World" value="world" />
          </Picker>
        </View>

        {newsItems.map((item, index) => (
          <View key={index} style={styles.newsItem}>
            <View style={styles.newsImage}>
              <Image
                source={item.image ? { uri: item.image } : undefined}
                style={styles.image}
              />
            </View>
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <View style={styles.newsSource}>
                <View style={styles.newsSourceLogo}>
                  <Image
                    source={
                      item.sourceLogo ? { uri: item.sourceLogo } : undefined
                    }
                    style={styles.sourceLogoImage}
                  />
                </View>
                <Text style={styles.newsSourceName}>{item.source}</Text>
                <Text style={styles.newsTime}>• {item.time}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.ellipsisBtn}>
              <Text style={styles.ellipsisText}>•••</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121826",
  },
  container: {
    width: "100%",
    maxWidth: 5000,
    backgroundColor: "#121826",
    borderRadius: 20,
    //overflow: 'hidden', // Handled by border radius on Android, SafeAreaView on iOS
    // Removed box-shadow and used elevation for Android, shadow props for iOS
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8, // This adds the shadow effect on Android
      },
    }),
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: vw(4),
    paddingTop: vh(3),
    paddingBottom: 0, // Adjusted padding to match overall structure
  },
  goodMorning: {
    fontSize: vw(9),
    fontWeight: "bold",
    color: "#fff",
  },
  date: {
    fontSize: vw(4),
    color: "#ddd",
  },
  sparkleContainer: {
    position: "relative",
    width: vw(8),
    height: vw(8),
  },
  sparkle: {
    position: "absolute",
    fontSize: vw(7),
    color: "#fff",
    right: vw(2),
  },
  filter: {
    paddingHorizontal: vw(4),
    paddingTop: vh(1),
    paddingBottom: vh(2),
  },
  filterSelect: {
    backgroundColor: "#292d39",
    color: "white",
    borderRadius: 10,
    // fontSize is set in the <Picker> component's itemStyle prop
  },
  newsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: vh(2),
    paddingHorizontal: vw(4),
    borderBottomWidth: 1,
    borderBottomColor: "#292d39",
  },
  newsImage: {
    width: vw(15),
    height: vw(15),
    marginRight: vw(3),
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    fontSize: vw(3.5),
    fontWeight: "bold",
    marginBottom: vh(1),
    lineHeight: vw(4.5), // Adjust as needed
    color: "#fff",
  },
  newsSource: {
    flexDirection: "row",
    alignItems: "center",
  },
  newsSourceLogo: {
    width: vw(3),
    height: vw(3),
    borderRadius: vw(1.5), // 50% of width/height
    marginRight: vw(1),
    overflow: "hidden",
  },
  sourceLogoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  newsSourceName: {
    fontSize: vw(2.5),
    color: "#aaa",
    marginRight: vw(1),
  },
  newsTime: {
    fontSize: vw(2.5),
    color: "#aaa",
  },
  ellipsisBtn: {
    marginLeft: vw(6),
    marginRight: vw(1),
    width: vw(8),
  },
  ellipsisText: {
    color: "#666",
    fontSize: vw(5), // Make sure the text is large enough to be tappable
  },
});

export default Home1;
