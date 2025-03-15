import CustomButton from "@/components/customButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import { useAuth, useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { Alert, ScrollView, Text, View, Image, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignIn() {

  const { signIn, setActive, isLoaded } = useSignIn();
  const { signOut } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleLogout = async () => {
    try {
      await signOut();
      console.log("Logged out successfully!");
    } catch (error) {
      console.error("Logout error: ", error);
    }
  };

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else {
        // See https://clerk.com/docs/custom-flows/error-handling for more info on error handling
        console.log(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Error", "Log in failed. Please try again.");
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0].longMessage);
    } 
  },[isLoaded, form]);

  return (
    <ScrollView className="flex-1 bg-white">
    <View className="flex-1 bg-white">
      <View className="relative w-full h-[250px]">
        <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
        <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
          Welcome 👋
        </Text>
      </View>

      <View className="p-5">
        <InputField
          label="Email"
          placeholder="Enter email"
          icon={icons.email}
          textContentType="emailAddress"
          value={form.email}
          onChangeText={(value) => setForm({ ...form, email: value })}
        />

        <InputField
          label="Password"
          placeholder="Enter password"
          icon={icons.lock}
          secureTextEntry={true}
          textContentType="password"
          value={form.password}
          onChangeText={(value) => setForm({ ...form, password: value })}
        />

        <CustomButton
          title="Sign In"
          onPress={onSignInPress}
          className="mt-6"
        />

        <OAuth />

        <Link
          href="/sign-up"
          className="text-lg text-center text-general-200 mt-10"
        >
          Don't have an account?{" "}
          <Text className="text-primary-500">Sign Up</Text>
        </Link>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </View>
  </ScrollView>
  );
}
