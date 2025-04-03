import { Text, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";
import {useAuthStore} from "../store/authStore.js"
import { useEffect } from "react";
export default function Index() {

  const {user, token, checkAuth, logout} = useAuthStore()

  

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Hello {user?.username}</Text>
      <Text>Token: {token}</Text>
      
      <TouchableOpacity onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>

      <Link href="/(auth)">Login screen</Link>
      <Link href="/(auth)/signup">Signup screen</Link>
    
    </View>
  );
}
