import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../App"; // Import the types from App.tsx

const { width, height } = Dimensions.get("window");

type ArticleScreenRouteProp = RouteProp<RootStackParamList, "Article">;

const Article1 = () => {
  const route = useRoute<ArticleScreenRouteProp>();
  const navigation = useNavigation();
  const {
    articleLink,
    articleTitle,
    articleImage,
    articleAuthor,
    articleDescription,
  } = route.params;

  // Construct the author byline. Handle cases where articleAuthor might be null/undefined.
  const authorByline = articleAuthor
    ? `By ${articleAuthor}, a reporter with five years of experience covering consumer tech releases, EU tech policy, online platforms, and mechanical keyboards.`
    : "";

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.publication}>The Verge</Text>
        <Text style={styles.title}>{articleTitle}</Text>
        <Text style={styles.author}>{authorByline}</Text>

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
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.05,
    paddingBottom: height * 0.02,
  },
  backButton: {
    padding: 10,
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
});

export default Article1;
