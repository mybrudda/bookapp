import { View, Text } from "react-native";
import React from "react";
import { useAuthStore } from "../store/authStore";
import styles from "../assets/styles/profile.styles";
import { Image } from "expo-image";
import { formatMongoDate } from "../lib/utils";

export default function ProfileHeader() {
  const { user } = useAuthStore();

  // This check is added to prevent a crash when the logout button is pressed.
  // The app navigates to the auth screen,
  // but due to a delay in navigation,
  // the profile component still tries to access the profileImage of a null user, causing a crash.
  // This ensures that the app doesn't attempt to access user data after logout.
  if (!user) return null;

  return (
    <View style={styles.profileHeader}>
      <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
      <View style={styles.profileInfo}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.memberSince}>
          Joined {formatMongoDate(user.createdAt)}
        </Text>
      </View>
    </View>
  );
}
