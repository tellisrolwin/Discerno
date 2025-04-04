import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Dimensions,
	TouchableOpacity,
	Linking,
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
	const { summary, insights } = route.params;

	// Function to open WhatsApp with insights
	const shareToWhatsapp = () => {
		// Replace with your actual WhatsApp number
		const phoneNumber = "+918904196588"; 
		const message = encodeURIComponent(insights);
		const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;

		Linking.canOpenURL(whatsappUrl)
			.then((supported) => {
				if (supported) {
					return Linking.openURL(whatsappUrl);
				} else {
					console.log("WhatsApp is not installed on this device");
					// You could show an alert here
				}
			})
			.catch((err) => console.error("An error occurred", err));
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
			</View>
			<View style={styles.content}>
				<Text style={styles.summaryTitle}>Summary</Text>
				<Text style={styles.summaryText}>{summary}</Text>

				{insights && insights !== "No investment advice applicable." && (
					<View style={styles.insightsContainer}>
						<Text style={styles.insightsTitle}>Insights</Text>
						<Text style={styles.insightsText}>{insights}</Text>
						
						{/* WhatsApp button only appears if there is investment advice */}
						{insights.toLowerCase().includes("sectors") && (
							<TouchableOpacity
								style={styles.whatsappButton}
								onPress={shareToWhatsapp}
							>
								<Text style={styles.whatsappButtonText}>Share to WhatsApp</Text>
							</TouchableOpacity>
						)}
					</View>
				)}
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
	insightsContainer: {
		marginTop: height * 0.03,
	},
	insightsTitle: {
		color: "white",
		fontSize: width * 0.07,
		fontWeight: "bold",
		marginBottom: height * 0.02,
	},
	insightsText: {
		color: "white",
		fontSize: width * 0.045,
		lineHeight: height * 0.03,
		marginBottom: height * 0.02,
	},
	whatsappButton: {
		backgroundColor: "#25D366", // WhatsApp green
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 10,
	},
	whatsappButtonText: {
		color: "white",
		fontSize: width * 0.045,
		fontWeight: "bold",
	}
});

export default ArticleSummary;