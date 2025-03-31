import { Text, View } from "react-native";
import {Image} from "expo-image"
import { Link } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Hello</Text>

      <Link href="/(auth)">Login screen</Link>
      <Link href="/(auth)/signup">Signup screen</Link>
    
    </View>
  );
}
