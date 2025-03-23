// Aggregator.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App";
import AsyncStorage from "@react-native-async-storage/async-storage";

const YOUR_COMPUTER_IP = "192.168.0.104";
const EXPRESS_PORT = 8080; 
const PYTHON_PORT = 8000; 


const { width: screenWidth } = Dimensions.get("window");

const vw = (percentageWidth: number) => screenWidth * (percentageWidth / 100);
const vh = (percentageHeight: number) =>
  Dimensions.get("window").height * (percentageHeight / 100);

interface Headline {
  title: string;
  link: string;
  summary: string;
  source: string;
  category: string;
}

interface UserPreferencesResponse { //for typing data
  categories: string[];
}

type AggregatorScreenNavigationProp = StackNavigationProp<RootStackParamList, "Aggregator">;
type AggregatorScreenRouteProp = RouteProp<RootStackParamList, "Aggregator">;

const Aggregator = () => {
  const navigation = useNavigation<AggregatorScreenNavigationProp>();
  const route = useRoute<AggregatorScreenRouteProp>();
  const userId = route.params.userId; // No more optional chaining needed

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferredArticles, setPreferredArticles] = useState<Headline[]>([]);
  const [userPreferences, setUserPreferences] = useState<string[]>([]);


  useEffect(() => {
    const fetchPreferences = async () => {
      if (!userId) {
        setError("User ID not found");
        setLoading(false);
        return;
      }

      try {
        // Fetch user preferences from server
        const response = await fetch(`http://${YOUR_COMPUTER_IP}:${EXPRESS_PORT}/user-preferences?userId=${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("User preferences not found."); // More specific
          } else if (response.status === 500) {
            throw new Error("Server error. Please try again later.");
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }

        const data: UserPreferencesResponse = await response.json(); //use typing

        if (data.categories && Array.isArray(data.categories)) {
          setUserPreferences(data.categories);

          // Fetch news after getting preferences
          await fetchNewsByPreferences(data.categories);
        } else {
          setUserPreferences([]);
          setError("No preferences found for this user");
          setLoading(false);
        }
      } catch (error: any) {
        console.error("Error fetching preferences:", error);
        setError(error.message || "Failed to load preferences");
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [userId]);

  const fetchNewsByPreferences = async (categories: string[]) => {
    try {
      const response = await fetch(`http://${YOUR_COMPUTER_IP}:${PYTHON_PORT}/news`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const allNews = await response.json();

        // Filter and add category in one step
        const filteredArticles: Headline[] = Object.entries(allNews)
          .filter(([category]) => categories.includes(category))
          .flatMap(([category, articles]) =>
            (articles as any[]).map((item) => ({ ...item, category }))
          );

          filteredArticles.sort(() => Math.random() - 0.5); //randomizes

      setPreferredArticles(filteredArticles);
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching news by preferences:", error);
      setError(error.message || "Failed to load preferred news");
      setLoading(false);
    }
  };

  const fetchArticle = async (link: string, title: string, category: string) => {
    setLoading(true); // Set loading to true at the start
    try {
      const response = await fetch(
        `http://${YOUR_COMPUTER_IP}:${PYTHON_PORT}/article?link=${encodeURIComponent(link)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: { article: string } = await response.json();

      // Navigate to the Article screen with the article data
      navigation.navigate("Article", {
        articleLink: link,
        articleTitle: title,
        articleDescription: data.article,
        articleCategory: category,
        selectedFilter: "Aggregator",
      });
    } catch (error: any) {
      console.error("Could not fetch article:", error);
      Alert.alert("Error", error.message || "Failed to load article");
    } finally {
      setLoading(false); // Ensure loading is always set to false
    }
  };

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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Preferred Articles</Text>
        </View>

        <View style={styles.preferencesContainer}>
          <Text style={styles.preferencesTitle}>Based on your interests:</Text>
          <View style={styles.tagContainer}>
            {userPreferences.map((category, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{category}</Text>
              </View>
            ))}
          </View>
        </View>

        {preferredArticles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No articles found based on your preferences.</Text>
            <Text style={styles.emptySubText}>Try adding more categories from the home page.</Text>
          </View>
        ) : (
          preferredArticles.map((item: Headline, index: number) => (
            <View key={index} style={styles.newsItem}>
              <View style={styles.newsContent}>
                <TouchableOpacity
                  onPress={() => {
                    fetchArticle(item.link, item.title, item.category);
                  }}
                >
                  <Text style={styles.newsTitle}>{item.title}</Text>
                </TouchableOpacity>
                <View style={styles.newsSourceContainer}>
                  <Text style={styles.newsSourceName}>{item.source}</Text>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
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
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: vw(4),
    paddingTop: vh(2),
    paddingBottom: vh(2),
    borderBottomWidth: 1,
    borderBottomColor: "#292d39",
  },
  backButton: {
    paddingRight: vw(3),
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: vw(4),
  },
  headerTitle: {
    fontSize: vw(5),
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginRight: vw(7), // Balance the back button
  },
  preferencesContainer: {
    paddingHorizontal: vw(4),
    paddingVertical: vh(2),
    borderBottomWidth: 1,
    borderBottomColor: "#292d39",
  },
  preferencesTitle: {
    fontSize: vw(3.5),
    color: "#fff",
    marginBottom: vh(1),
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#292d39",
    borderRadius: 15,
    paddingHorizontal: vw(3),
    paddingVertical: vh(0.5),
    marginRight: vw(2),
    marginBottom: vh(1),
  },
  tagText: {
    color: "#007AFF",
    fontSize: vw(3),
  },
  newsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: vh(2),
    paddingHorizontal: vw(4),
    borderBottomWidth: 1,
    borderBottomColor: "#292d39",
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    fontSize: vw(4),
    fontWeight: "bold",
    color: "#fff",
    marginBottom: vh(1),
    lineHeight: vh(3),
  },
  newsSourceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  newsSourceName: {
    fontSize: vw(3),
    color: "#9da5b4",
  },
  categoryTag: {
    backgroundColor: "#292d39",
    borderRadius: 15,
    paddingHorizontal: vw(2),
    paddingVertical: vh(0.3),
  },
  categoryText: {
    color: "#007AFF",
    fontSize: vw(2.8),
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
    paddingHorizontal: vw(4),
  },
  errorText: {
    fontSize: vw(4),
    color: "#ff3b30",
    textAlign: "center",
  },
  emptyContainer: {
    paddingVertical: vh(10),
    paddingHorizontal: vw(4),
    alignItems: "center",
  },
  emptyText: {
    fontSize: vw(4),
    color: "#fff",
    textAlign: "center",
    marginBottom: vh(1),
  },
  emptySubText: {
    fontSize: vw(3.5),
    color: "#9da5b4",
    textAlign: "center",
  }
});

export default Aggregator;