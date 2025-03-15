import {useUser} from "@clerk/clerk-expo";
import {Image, Text, View} from "react-native";
import { StripeProvider } from '@stripe/stripe-react-native';
import RideLayout from "@/components/rideLayout";
import {icons} from "@/constants";
import {formatTime} from "@/lib/utils";
import {useDriverStore, useLocationStore} from "@/store";
import Payment from "@/components/payment";


// const mockDrivers = [
//   {
//       "id": 1,
//       "first_name": "James",
//       "last_name": "Wilson",
//       "profile_image_url": "https://ucarecdn.com/dae59f69-2c1f-48c3-a883-017bcf0f9950/-/preview/1000x666/",
//       "car_image_url": "https://ucarecdn.com/a2dc52b2-8bf7-4e49-9a36-3ffb5229ed02/-/preview/465x466/",
//       "car_seats": 4,
//       "rating": 4.80
//   },
//   {
//       "id": 2,
//       "first_name": "David",
//       "last_name": "Brown",
//       "profile_image_url": "https://ucarecdn.com/6ea6d83d-ef1a-483f-9106-837a3a5b3f67/-/preview/1000x666/",
//       "car_image_url": "https://ucarecdn.com/a3872f80-c094-409c-82f8-c9ff38429327/-/preview/930x932/",
//       "car_seats": 5,
//       "rating": 4.60
//   },
//   {
//       "id": 3,
//       "first_name": "Michael",
//       "last_name": "Johnson",
//       "profile_image_url": "https://ucarecdn.com/0330d85c-232e-4c30-bd04-e5e4d0e3d688/-/preview/826x822/",
//       "car_image_url": "https://ucarecdn.com/289764fb-55b6-4427-b1d1-f655987b4a14/-/preview/930x932/",
//       "car_seats": 4,
//       "rating": 4.70
//   },
//   {
//       "id": 4,
//       "first_name": "Robert",
//       "last_name": "Green",
//       "profile_image_url": "https://ucarecdn.com/fdfc54df-9d24-40f7-b7d3-6f391561c0db/-/preview/626x417/",
//       "car_image_url": "https://ucarecdn.com/b6fb3b55-7676-4ff3-8484-fb115e268d32/-/preview/930x932/",
//       "car_seats": 4,
//       "rating": 4.90
//   }
// ]

const BookRide = () => {

    const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!

    const {user} = useUser();
    const {userAddress, destinationAddress} = useLocationStore();
    const {drivers, selectedDriver} = useDriverStore();
    
    const driverDetails = drivers?.filter(
        (driver) => +driver.id === selectedDriver,
    )[0];

    return (
      <StripeProvider
        publishableKey={publishableKey}
        merchantIdentifier="merchant.daily.dev" // required for Apple Pay
        urlScheme="bestate" // required for 3D Secure and bank redirects
      >
        <RideLayout title="Book Ride" snapPoints={["40%", "80%"]}>
            <>
                <Text className="text-xl font-JakartaSemiBold mb-3">
                    Ride Information
                </Text>

                <View className="flex flex-col w-full items-center justify-center mt-10">
                    <Image
                        source={{uri: driverDetails?.profile_image_url}}
                        className="w-28 h-28 rounded-full"
                    />

                    <View className="flex flex-row items-center justify-center mt-5 space-x-2">
                        <Text className="text-lg font-JakartaSemiBold">
                            {driverDetails?.title}
                        </Text>

                        <View className="flex flex-row items-center space-x-0.5">
                            <Image
                                source={icons.star}
                                className="w-5 h-5"
                                resizeMode="contain"
                            />
                            <Text className="text-lg font-JakartaRegular">
                                {driverDetails?.rating}
                            </Text>
                        </View>
                    </View>
                </View>

                <View
                    className="flex flex-col w-full items-start justify-center py-3 px-5 rounded-3xl bg-general-600 mt-5">
                    <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
                        <Text className="text-lg font-JakartaRegular">Ride Price</Text>
                        <Text className="text-lg font-JakartaRegular text-[#0CC25F]">
                            ฿{driverDetails?.price}
                        </Text>
                    </View>

                    <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
                        <Text className="text-lg font-JakartaRegular">Pickup Time</Text>
                        <Text className="text-lg font-JakartaRegular">
                            {formatTime(driverDetails?.time!)}
                        </Text>
                    </View>

                    <View className="flex flex-row items-center justify-between w-full py-3">
                        <Text className="text-lg font-JakartaRegular">Car Seats</Text>
                        <Text className="text-lg font-JakartaRegular">
                            {driverDetails?.car_seats}
                        </Text>
                    </View>
                </View>

                <View className="flex flex-col w-full items-start justify-center mt-5">
                    <View
                        className="flex flex-row items-center justify-start mt-3 border-t border-b border-general-700 w-full py-3">
                        <Image source={icons.to} className="w-6 h-6"/>
                        <Text className="text-lg font-JakartaRegular ml-2">
                            {userAddress}
                        </Text>
                    </View>

                    <View className="flex flex-row items-center justify-start border-b border-general-700 w-full py-3">
                        <Image source={icons.point} className="w-6 h-6"/>
                        <Text className="text-lg mx-3 font-JakartaRegular ml-2">
                            {destinationAddress}
                        </Text>
                    </View>
                </View>
                <Payment 
                  fullName={user?.fullName!}
                  email={user?.emailAddresses[0].emailAddress!}
                  amount={driverDetails?.price!}
                  driverId={driverDetails?.id}
                  rideTime={driverDetails?.time!}
                />
            </>
        </RideLayout>
      </StripeProvider>
    );
};

export default BookRide;