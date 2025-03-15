import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-expo'
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import RideCard from '@/components/rideCard';
import { icons, images } from '@/constants';
import { ActivityIndicator } from 'react-native';
//import { useLocationStore } from '@/store'
import GoogleTextInput from '@/components/googleTextInput';
import Map from '@/components/map'
import { useLocationStore } from '@/store';
import * as Location from 'expo-location';
import { useFetch } from '@/lib/fetch';
import { Ride } from '@/types/type';



const Home = () => {

    const { user } = useUser();
    
    const { signOut } = useAuth();
    const { data: recentRides, loading, error } = useFetch<Ride[]>(`/(api)/ride/${user?.id}`)

    const { setUserLocation, setDestinationLocation } = useLocationStore();
    const [hasPermissions, setHasPermissions] = useState(false);

    const handleSignOut = () => {
      signOut();
      router.replace("/(auth)/sign-in");
    };

    const handleDestinationPress = (location: {
      latitude: number;
      longitude: number;
      address: string;
    }) => {
      setDestinationLocation(location);
  
      router.push("/(root)/find-ride");
    };

    useEffect(() => {
      const requestLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setHasPermissions(false);
          return;
        }
        let location = await Location.getCurrentPositionAsync();
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords?.latitude,
          longitude: location.coords?.longitude,
        });
        setUserLocation({
          latitude: location.coords?.latitude,
          longitude: location.coords?.longitude,
          address: `${address[0].name}, ${address[0].region}`,
        });
      };
      
      requestLocation();
    },[])

  return (
    <SafeAreaView className='bg-general-500'>
      <FlatList 
        data={recentRides?.slice(0,5)}
        keyExtractor={(item,index) => index.toString() ?? `ride-${index}`}
        renderItem={({item}) => <RideCard ride={item}/>}
        className='px-5'
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100}}
        ListEmptyComponent={() => (
          <View className='flex-col items-center justify-center'>
            {!loading ? (
              <>
                <Image 
                  source={images.noResult}
                  className='size-40'
                  alt="No recent rides found"
                  resizeMode='contain' 
                />
                <Text className='text-sm'>No recent rides found</Text>
              </>
              
            ) : (
              <ActivityIndicator size="small" color="#000"  />
            )}
          </View>
        )}
        ListHeaderComponent={() => (
          <>
            <View className='flex-row items-center justify-between my-5'>
              <Text>
                Welcome {user?.firstName || user?.emailAddresses[0].emailAddress} 👋🏻
              </Text>
              <TouchableOpacity 
                onPress={handleSignOut}
                className='justify-center items-center w-10 h-10 
                rounded-full bg-white'
              >
                <Image 
                  source={icons.out}
                  className='size-4'
                />
              </TouchableOpacity>
            </View>
            <GoogleTextInput
              icon={icons.search}
              containerStyle="bg-white shadow-md shadow-neutral-300"
              handlePress={handleDestinationPress}
            />
            <>
              <Text className="text-xl font-JakartaBold mt-5 mb-3">
                Your current location
              </Text>
              <View className="flex flex-row items-center bg-transparent h-[300px]">
                <Map />
              </View>
            </>
            <Text className="text-xl font-JakartaBold mt-5 mb-3">
              Recent Rides
            </Text>
          </>
        )}
      />
    </SafeAreaView>
  )
}

export default Home