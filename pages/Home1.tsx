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
  ActivityIndicator, // Import ActivityIndicator
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const { width: screenWidth } = Dimensions.get("window");

const vw = (percentageWidth: number) => screenWidth * (percentageWidth / 100);
const vh = (percentageHeight: number) =>
  Dimensions.get("window").height * (percentageHeight / 100);

interface Headline {
  title: string;
  link: string;
  summary: string;
}

interface CategorizedHeadlines {
  [category: string]: Headline[];
}

const Home1 = () => {
  const [selectedFilter, setSelectedFilter] = useState("technology");
  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [newsData, setNewsData] = useState<CategorizedHeadlines>({});
  const [loading, setLoading] = useState(true);
  const [articleContent, setArticleContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const YOUR_COMPUTER_IP = "192.168.0.106";

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

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://${YOUR_COMPUTER_IP}:8000/news`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: CategorizedHeadlines = await response.json();
        setNewsData(data);
      } catch (error: any) {
        console.error("Could not fetch news:", error);
        setError(error.message || "Failed to load news.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const fetchArticle = async (link: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://${YOUR_COMPUTER_IP}:8000/article?link=${encodeURIComponent(
          link
        )}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: { article: string } = await response.json();
      setArticleContent(data.article); // Store the article content
      Alert.alert("Article", data.article, [
        //use alert for now,
        { text: "OK", onPress: () => setArticleContent(null) }, //clear on OK
      ]);
    } catch (error: any) {
      console.error("Could not fetch article:", error);
      setError(error.message || "Failed to load article.");
    } finally {
      setLoading(false);
    }
  };

  // --- Conditional Rendering based on loading and data ---
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            dropdownIconColor="white"
            itemStyle={{ color: "white", fontSize: vw(3) }}
          >
            {/* Dynamically generate Picker.Items from categories */}
            {Object.keys(newsData).map((category) => (
              <Picker.Item key={category} label={category} value={category} />
            ))}
          </Picker>
        </View>

        {/* --- Display News Data --- */}
        {Object.keys(newsData)
          .filter(
            (category) =>
              selectedFilter.toLowerCase() === category.toLowerCase()
          ) //for the picker to select
          .map((category: string) => (
            <View key={category}>
              {newsData[category].map((item: Headline, index: number) => (
                <View key={index} style={styles.newsItem}>
                  {/* Assuming no images for now, add back if needed */}
                  <View style={styles.newsContent}>
                    <TouchableOpacity
                      onPress={() => {
                        fetchArticle(item.link);
                      }}
                    >
                      <Text style={styles.newsTitle}>{item.title}</Text>
                    </TouchableOpacity>
                    <View style={styles.newsSource}>
                      {/* No source logo for now */}
                      <Text style={styles.newsSourceName}>BBC News</Text>
                      {/*  <Text style={styles.newsTime}>• {item.time}</Text> */}
                    </View>
                  </View>
                  <TouchableOpacity style={styles.ellipsisBtn}>
                    <Text style={styles.ellipsisText}>•••</Text>
                  </TouchableOpacity>
                </View>
              ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});

export default Home1;
