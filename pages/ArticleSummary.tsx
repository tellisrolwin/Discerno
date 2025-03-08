// ArticleSummary.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../App"; // Import your RootStackParamList

const { width, height } = Dimensions.get("window");

// Define the route prop type
type ArticleSummaryScreenRouteProp = RouteProp<
  RootStackParamList,
  "ArticleSummary"
>;

const ArticleSummary = () => {
  const route = useRoute<ArticleSummaryScreenRouteProp>();
  const navigation = useNavigation();
  const { summary } = route.params;

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
        <Text style={styles.summaryTitle}>Summary</Text>
        <Text style={styles.summaryText}>{summary}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
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
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.05,
  },
  summaryTitle: {
    color: "white",
    fontSize: width * 0.07,
    fontWeight: "bold",
    marginBottom: height * 0.02,
  },
  summaryText: {
    color: "white",
    fontSize: width * 0.045,
    lineHeight: height * 0.03,
  },
});

export default ArticleSummary;
