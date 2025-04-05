import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { router, useRouter } from "expo-router";
import styles from "../../assets/styles/create.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system"
import { useAuthStore } from "../../store/authStore";
import {API_URL} from "../../constants/api"

export default function Create() {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  const {token} = useAuthStore()

  

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        //if base64 is provided, use it
        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64);
        } else {
          // Converting to base64 when its not provided
          const base64 = await FileSystem.readAsStringAsync(
            result.assets[0].uri,
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );
          setImageBase64(base64);
        }
      } else {
        console.log("Image picker was canceled");
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      Alert.alert("Error", "There was an error picking the image.");
    }
  };

  const handleSubmit = async () => {

    if(!title || !caption || !imageBase64 || !rating){
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    try {
      setLoading(true)

      // get file extension from URI or default to jpeg
      const uriParts = image.split(".")
      const fileType = uriParts[uriParts.length - 1]
      const imageType = fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg"

      const imageDataUrl = `data:${imageType};base64,${imageBase64}`

      const response = await fetch(`${API_URL}/api/books`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          caption,
          rating: rating.toString(),
          image: imageDataUrl,
        })
      })

      const data = await response.json()
      if(!response.ok) throw new Error(data.message || "Something went wrong while posting")

      Alert.alert("Success", "Your book recommendation has been posted!")

      // reset all values after posting
      setTitle("")
      setCaption("")
      setRating(3)
      setImage(null)
      setImageBase64(null)

      router.push("/")
      
    } catch (error) {
      console.log("Error creating post:", error)
      Alert.alert("Error", error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }

  };

  const renderRatingPicker = () => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          style={styles.scrollViewStyle}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Add Book Recommendation</Text>
              <Text style={styles.subtitle}>
                Share your favorite reads with others
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Book Title</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="book-outline"
                    size={20}
                    color={COLORS.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter book title"
                    placeholderTextColor={COLORS.placeholderText}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Your Rating</Text>
                {renderRatingPicker()}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Book Image</Text>
                <TouchableOpacity
                  style={styles.imagePicker}
                  onPress={pickImage}
                >
                  {image ? (
                    <Image
                      source={{ uri: image }}
                      style={styles.previewImage}
                    />
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Ionicons
                        name="image-outline"
                        size={40}
                        color={COLORS.textSecondary}
                      />
                      <Text style={styles.placeholderText}>
                        Tap to select image
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Caption</Text>
                <TextInput 
                  style={styles.textArea}
                  placeholder="Write your review about this book..."
                  placeholderTextColor={COLORS.placeholderText}
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                  {
                    loading ? (
                      <ActivityIndicator color={COLORS.white}/>
                    ) : (
                      <View>
                    
                        <Text style={styles.buttonText}>Share</Text>
                      </View>
                    )
                  }
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
