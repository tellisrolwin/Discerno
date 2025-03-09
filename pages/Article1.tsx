import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  RouteProp,
  useRoute,
  useNavigation,
  NavigationProp,
} from "@react-navigation/native"; // Import NavigationProp
import { RootStackParamList } from "../App"; // Import the types from App.tsx

const { width, height } = Dimensions.get("window");

type ArticleScreenRouteProp = RouteProp<RootStackParamList, "Article">;

// Correctly type the navigation prop
type ArticleScreenNavigationProp = NavigationProp<
  RootStackParamList,
  "Article"
>;

const Article1 = () => {
  const route = useRoute<ArticleScreenRouteProp>();
  // Use the typed navigation prop
  const navigation = useNavigation<ArticleScreenNavigationProp>();
  const {
    articleLink,
    articleTitle,
    articleImage,
    articleAuthor,
    articleDescription,
  } = route.params;

  const [loadingSummary, setLoadingSummary] = useState(false);

  // Construct the author byline. Handle cases where articleAuthor might be null/undefined.
  const authorByline = articleAuthor
    ? `By ${articleAuthor}, a reporter with five years of experience covering consumer tech releases, EU tech policy, online platforms, and mechanical keyboards.`
    : "";

  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const response = await fetch(
        `http://192.168.0.106:8000/summary?link=${encodeURIComponent(
          articleLink
        )}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.summary) {
        navigation.navigate("ArticleSummary", { summary: data.summary }); // Now TypeScript knows the correct parameters
      } else {
        console.error("Summary not found in response:", data);
        alert("Could not generate summary.");
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
      alert("Failed to fetch summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.summaryButton}
          onPress={fetchSummary}
          disabled={loadingSummary}
        >
          {loadingSummary ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.summaryButtonText}>View Summary</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.publication}>BBC</Text>
        <Text style={styles.title}>{articleTitle}</Text>
        {/* <Text style={styles.author}>{authorByline}</Text> */}

        {articleImage && (
          <Image source={{ uri: articleImage }} style={styles.image} />
        )}

        <Text style={styles.bodyText}>{articleDescription}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark background
  },
  header: {
    flexDirection: "row", // Arrange items horizontally
    justifyContent: "space-between", // Space between the back button and summary button
    alignItems: "center", // Vertically center items
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.05,
    paddingBottom: height * 0.02,
  },
  backButton: {
    padding: 10,
    // Other styles
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: width * 0.045,
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
  summaryButton: {
    // marginTop: 20, // Removed marginTop
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    // alignSelf: "flex-start", // Removed alignSelf
  },
  summaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Article1;
