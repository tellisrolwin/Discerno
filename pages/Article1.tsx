import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import {
  RouteProp,
  useRoute,
  useNavigation,
  NavigationProp,
} from "@react-navigation/native";
import { RootStackParamList } from "../App";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    articleCategory, // Ensure this is being passed
  } = route.params;

  const [loadingSummary, setLoadingSummary] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [savingPreference, setSavingPreference] = useState(false);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        console.log("Retrieved storedUserId:", storedUserId); // Log retrieved value
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
          console.log(`User ID set: ${parseInt(storedUserId, 10)}`);
        } else {
          console.log("No user ID found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error retrieving user ID:", error);
      }
    };

    getUserId();
  }, []);

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
    setModalVisible(true);
  };

  const handleModalResponse = async (response: string) => {
    setModalVisible(false);
    console.log(`User response: ${response}`);
    console.log(`Current userId: ${userId}, articleCategory: ${articleCategory}`); // Log before API call

    if (response === "yes" && userId && articleCategory) {
      try {
        setSavingPreference(true);
        console.log(`Saving preference: User ID=${userId}, Category=${articleCategory}`);

        const saveResponse = await fetch("http://192.168.0.106:8000/preferences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            category: articleCategory,
          }),
        });

        console.log(`Server response status: ${saveResponse.status}`);

        if (!saveResponse.ok) {
          const errorText = await saveResponse.text();
          console.error(`HTTP error with status ${saveResponse.status}: ${errorText}`);
          throw new Error(`HTTP error! Status: ${saveResponse.status}, Details: ${errorText}`);
        }

        const result = await saveResponse.json();
        console.log("Preference saved successfully:", result);

        Alert.alert(
          "Preference Saved",
          `We'll show you more ${articleCategory} articles!`,
          [{ text: "OK" }]
        );
      } catch (error) {
        console.error("Error saving preference:", error);
        Alert.alert(
          "Error",
          "Failed to save your preference. Please try again.",
          [{ text: "OK" }]
        );
      } finally {
        setSavingPreference(false);
      }
    } else if (response === "yes") {
      console.error(`Missing data - User ID: ${userId}, Category: ${articleCategory}`);
      Alert.alert(
        "Error",
        "Missing user ID or article category. Please try again later.",
        [{ text: "OK" }]
      );
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
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Are you interested in {articleCategory ? articleCategory : "these types of"} articles?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => handleModalResponse("cancel")}
                disabled={savingPreference}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonYes]}
                onPress={() => handleModalResponse("yes")}
                disabled={savingPreference}
              >
                {savingPreference ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.textStyle}>Yes</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonNo]}
                onPress={() => handleModalResponse("no")}
                disabled={savingPreference}
              >
                <Text style={styles.textStyle}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.content}>
        {articleCategory && (
          <Text style={styles.category}>{articleCategory}</Text>
        )}
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
  category: {
    color: "#4CAF50",
    fontSize: width * 0.04,
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
    alignItems: "flex-end",
  },
  summaryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 5,
  },
  summaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  ellipsisButton: {
    padding: 10,
  },
  ellipsisButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    justifyContent: "space-around",
    marginTop: 20,
    width: "100%",
  },
  button: {
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2,
    marginHorizontal: 5,
  },
  buttonCancel: {
    backgroundColor: "#8E8E93",
  },
  buttonYes: {
    backgroundColor: "#007AFF",
  },
  buttonNo: {
    backgroundColor: "#FF3B30",
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