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
  Modal, // Import Modal
  Alert,
} from "react-native";
import {
  RouteProp,
  useRoute,
  useNavigation,
  NavigationProp,
} from "@react-navigation/native";
import { RootStackParamList } from "../App";

const { width, height } = Dimensions.get("window");

type ArticleScreenRouteProp = RouteProp<RootStackParamList, "Article">;

type ArticleScreenNavigationProp = NavigationProp<
  RootStackParamList,
  "Article"
>;

const Article1 = () => {
  const route = useRoute<ArticleScreenRouteProp>();
  const navigation = useNavigation<ArticleScreenNavigationProp>();
  const {
    articleLink,
    articleTitle,
    articleImage,
    articleAuthor,
    articleDescription,
  } = route.params;

  const [loadingSummary, setLoadingSummary] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility

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
        navigation.navigate("ArticleSummary", { summary: data.summary });
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

  const handleEllipsisPress = () => {
    setModalVisible(true); // Show the modal
  };

  const handleModalResponse = (response: string) => {
    setModalVisible(false); // Hide the modal
    console.log(`User response: ${response}`); // Dummy logic
    // You can add more complex logic here, like sending the response to a server
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

        <View style={styles.topRightContainer}>
          <TouchableOpacity
            style={styles.ellipsisButton}
            onPress={handleEllipsisPress}
          >
            <Text style={styles.ellipsisButtonText}>...</Text>
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
      </View>

      <Modal
        animationType="fade" // Use fade for a simple appearance/disappearance
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Are you interested in these types of articles?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => handleModalResponse("cancel")}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonYes]}
                onPress={() => handleModalResponse("yes")}
              >
                <Text style={styles.textStyle}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonNo]}
                onPress={() => handleModalResponse("no")}
              >
                <Text style={styles.textStyle}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.content}>
        <Text style={styles.publication}>The Hindu</Text>
        <Text style={styles.title}>{articleTitle}</Text>
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
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  publication: {
    color: "white",
    fontSize: width * 0.045,
    fontWeight: "bold",
    marginBottom: height * 0.01,
  },
  title: {
    color: "white",
    fontSize: width * 0.08,
    fontWeight: "bold",
    marginBottom: height * 0.02,
  },
  author: {
    color: "#AAAAAA",
    fontSize: width * 0.04,
    marginBottom: height * 0.03,
  },
  image: {
    width: "100%",
    height: height * 0.3,
    resizeMode: "cover",
    marginBottom: height * 0.02,
  },
  bodyText: {
    color: "white",
    fontSize: width * 0.045,
    lineHeight: height * 0.03,
  },
  topRightContainer: {
    alignItems: "flex-end", // Align children to the end (right)
  },
  summaryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 5, // Add some space between ellipsis and summary button
  },
  summaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  ellipsisButton: {
    padding: 10,
    // Other styles
  },
  ellipsisButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },

  // Modal Styles
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around", // Distribute buttons evenly
    marginTop: 20,
    width: "100%",
  },
  button: {
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2,
    marginHorizontal: 5, // Add horizontal margin for spacing
  },
  buttonCancel: {
    backgroundColor: "#8E8E93", // Gray color for cancel
  },
  buttonYes: {
    backgroundColor: "#007AFF", // Blue color for yes
  },
  buttonNo: {
    backgroundColor: "#FF3B30", // Red color for no
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    color: "#000",
    fontSize: width * 0.05,
  },
});

export default Article1;