import { router } from "expo-router";
import { Text, View } from "react-native";

import CustomButton from "@/components/customButton";
import GoogleTextInput from "@/components/googleTextInput";
import RideLayout from "@/components/rideLayout";
import { icons } from "@/constants";
import { useLocationStore } from "@/store";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";


const FindRide = () => {
  const {
    userAddress,
    destinationAddress,
    setDestinationLocation,
    setUserLocation,
  } = useLocationStore();

  return (
    <RideLayout title="Ride">
      <View className="my-2">
        <Text className="text-lg font-JakartaSemiBold mb-3">From</Text>
          <GoogleTextInput
            icon={icons.target}
            initialLocation={userAddress!}
            containerStyle="bg-neutral-100"
            textInputBackgroundColor="#f5f5f5"
            handlePress={(location) => setUserLocation(location)}
          />
      </View>

      <View className="my-3">
        <Text className="text-lg font-JakartaSemiBold mb-3">To</Text>

        <GoogleTextInput
          icon={icons.map}
          initialLocation={destinationAddress!}
          containerStyle="bg-neutral-100 h-16"
          textInputBackgroundColor="transparent"
          handlePress={(location) => setDestinationLocation(location)}
        />
      </View>

      <CustomButton
        title="Find Now"
        onPress={() => router.push(`/(root)/confirm-ride`)}
        className=""
      />
    </RideLayout>
  );
};

export default FindRide;