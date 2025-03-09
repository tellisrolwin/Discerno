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
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App"; // Import the types from App.tsx
import { logout } from "../services/AuthService";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

interface CategorizedHeadlines {
  [category: string]: Headline[];
}

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

const Home1 = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [newsData, setNewsData] = useState<CategorizedHeadlines>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("User");
  const [userId, setUserId] = useState<number | null>(null); // Add state for user ID

  const YOUR_COMPUTER_IP = "192.168.0.106";
  const EXPRESS_PORT = 8080; // Express server port
  const PYTHON_PORT = 8000; // Python server port

  useEffect(() => {
    // Get current user info
    const getUserData = async () => {
      try {
        // Try to get user from AsyncStorage
        const userJSON = await AsyncStorage.getItem("currentUser");
        console.log("Retrieved from AsyncStorage:", userJSON);
        
        if (userJSON) {
          const user = JSON.parse(userJSON);
          setUsername(user.name || "User");
          setUserId(user.id); // Store the user ID
          console.log("User loaded:", user.name, "ID:", user.id);
        } else {
          console.warn("No user found in AsyncStorage");
          
          // Attempt to manually check if there's a logged in user via the server
          try {
            const response = await fetch(`http://${YOUR_COMPUTER_IP}:${EXPRESS_PORT}/check-session`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const userData = await response.json();
              if (userData.user) {
                console.log("Retrieved user from server:", userData.user);
                await AsyncStorage.setItem("currentUser", JSON.stringify(userData.user));
                setUsername(userData.user.name || "User");
                setUserId(userData.user.id);
              } else {
                console.warn("No active user session found");
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              }
            }
          } catch (sessionError) {
            console.error("Error checking for active session:", sessionError);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    getUserData();

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
        const response = await fetch(`http://${YOUR_COMPUTER_IP}:${PYTHON_PORT}/news`); // Fetch from Python server
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: CategorizedHeadlines = await response.json();

        // --- THIS IS THE "SECOND CHANGE" --- Start
        // Add category to each headline object
        const categorizedData: CategorizedHeadlines = {};
        for (const category in data) {
          categorizedData[category] = data[category].map((item) => ({
            ...item,  // Spread the existing item properties
            category: category, // Add the category here
          }));
        }
        setNewsData(categorizedData);
        // --- "SECOND CHANGE" --- End


      } catch (error: any) {
        console.error("Could not fetch news:", error);
        setError(error.message || "Failed to load news.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const fetchArticle = async (link: string, title: string, category: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://${YOUR_COMPUTER_IP}:${PYTHON_PORT}/article?link=${encodeURIComponent(
          link
        )}`
      ); // Use Python server
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
      });
    } catch (error: any) {
      console.error("Could not fetch article:", error);
      setError(error.message || "Failed to load article.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            // Clear the current user from AsyncStorage
            await AsyncStorage.removeItem("currentUser");
            console.log("Cleared user data from AsyncStorage");
            
            // Attempt to logout from server
            await fetch(`http://${YOUR_COMPUTER_IP}:${EXPRESS_PORT}/logout`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            // Then call the logout function and navigate
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } catch (error) {
            console.error("Error during logout:", error);
            // Even if there's an error, try to navigate away
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          }
        },
      },
    ]);
  };

  const handleSparklePress = () => {
    // Navigate to the Aggregator screen with the userId
    if (userId) {
      navigation.navigate("Aggregator", {
        userId: userId
      });
    } else {
      Alert.alert("Error", "Please wait while we finish loading your profile");
    }
  };

  // --- Ellipsis Button Handlers ---
  const handleEllipsisPress = (category: string) => {
    if (!userId) {
      Alert.alert("Error", "Please wait while we finish loading your profile");
      return;
    }
  
    Alert.alert(
      "Article Interest", 
      "Are you interested in these types of articles?", 
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            console.log("User canceled");
          },
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              // Check if we have userId in state
              if (!userId) {
                // Try to get user ID from AsyncStorage again
                const userJSON = await AsyncStorage.getItem("currentUser");
                let id = null;
                
                if (userJSON) {
                  const user = JSON.parse(userJSON);
                  id = user.id;
                  setUserId(id); // Update state
                }
                
                if (!id) {
                  console.error("No user ID available");
                  Alert.alert("Error", "You need to be logged in to set preferences");
                  return;
                }
              }
              
              console.log(`Sending preference update for user ID: ${userId}, category: ${category}`);
  
              // Ensure userId is a number
              const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
              
              // Log the exact request you're sending
              const requestBody = JSON.stringify({
                userId: userIdNum,
                category: category
              });
              console.log("Request body:", requestBody);
              
              // Send preference to server
              const response = await fetch(`http://${YOUR_COMPUTER_IP}:${EXPRESS_PORT}/preferences`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json"
                },
                body: requestBody,
              });
              
              // Log the response status
              console.log("Response status:", response.status);
              console.log("Response headers:", JSON.stringify([...response.headers.entries()]));
              
              // Check the content type to determine how to parse the response
              const contentType = response.headers.get("content-type");
              
              if (contentType && contentType.includes("application/json")) {
                // Parse as JSON if the content type is application/json
                const data = await response.json();
                
                if (!response.ok) {
                  throw new Error(data.message || "Failed to update preferences");
                }
                
                console.log(`Added ${category} to user preferences`);
                Alert.alert("Success", `Added ${category} to your interests!`);
              } else {
                // Parse as text for non-JSON responses
                const text = await response.text();
                console.log("Response body (text):", text);
                
                if (response.ok) {
                  // If the status was OK despite not being JSON, still treat as success
                  console.log(`Added ${category} to user preferences (with text response)`);
                  Alert.alert("Success", `Added ${category} to your interests!`);
                } else {
                  throw new Error("Server returned an invalid response format");
                }
              }
            } catch (error: any) {
              console.error("Error updating preferences:", error);
              Alert.alert("Error", error.message || "Failed to update your preferences");
            }
          },
        },
        {
          text: "No",
          onPress: () => {
            console.log("User is not interested in:", category);
          },
        },
      ],
      { cancelable: true }
    );
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
            <Text style={styles.username}>{username}</Text>
          </View>
          <View style={styles.sparkleContainer}>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButtonContainer}
            >
              <Text style={styles.logoutButton}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSparklePress}
              style={styles.sparkleButtonContainer}
            >
              <Text style={styles.sparkleButton}>✨</Text>
            </TouchableOpacity>
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
              selectedFilter === "All" ||
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
                        fetchArticle(item.link, item.title, item.category);
                      }}
                    >
                      <Text style={styles.newsTitle}>{item.title}</Text>
                    </TouchableOpacity>
                    <View style={styles.newsSource}>
                      {/* No source logo for now */}
                      <Text style={styles.newsSourceName}>{item.source}</Text>
                      {/*  <Text style={styles.newsTime}>• {item.time}</Text> */}
                    </View>
                  </View>
                  
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: vw(4),
    paddingTop: vh(3),
    paddingBottom: 0,
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
  username: {
    fontSize: vw(3.5),
    color: "#007AFF",
    marginTop: vh(0.5),
  },
  sparkleContainer: {
    flexDirection: "column", // Stack buttons vertically
    alignItems: "flex-end", // Align to the right
    //padding: vw(2),
  },
  logoutButtonContainer: {
    marginBottom: vh(1), // Add some space between buttons
  },
  logoutButton: {
    backgroundColor: "#292d39",
    color: "#fff",
    padding: vw(2),
    borderRadius: 8,
    overflow: "hidden",
    fontSize: vw(3),
  },
  sparkleButton: {
    fontSize: vw(6),
    paddingHorizontal: vw(2),
    paddingTop: vh(1),
  },
  sparkleButtonContainer: {
    // Add styles as needed
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
    lineHeight: vw(4.5),
    color: "#fff",
  },
  newsSource: {
    flexDirection: "row",
    alignItems: "center",
  },
  newsSourceLogo: {
    width: vw(3),
    height: vw(3),
    borderRadius: vw(1.5),
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
    fontSize: vw(5),
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