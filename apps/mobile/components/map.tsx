import { View, Text, ActivityIndicator, Alert } from 'react-native'
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import React, { useEffect, useState } from 'react'
import { useDriverStore, useLocationStore } from '@/store';
import { calculateDriverTimes, calculateRegion, generateMarkersFromData } from '@/lib/map';
import { Driver, MarkerData } from '@/types/type';
import { icons } from '@/constants';
import { useFetch } from '@/lib/fetch';
import { MapViewRoute } from 'react-native-maps-routes';

// const mockDrivers = [
//     {
//         "driver_id": 1,
//         "first_name": "James",
//         "last_name": "Wilson",
//         "profile_image_url": "https://ucarecdn.com/dae59f69-2c1f-48c3-a883-017bcf0f9950/-/preview/1000x666/",
//         "car_image_url": "https://ucarecdn.com/a2dc52b2-8bf7-4e49-9a36-3ffb5229ed02/-/preview/465x466/",
//         "car_seats": 4,
//         "rating": 4.80
//     },
//     {
//         "driver_id": 2,
//         "first_name": "David",
//         "last_name": "Brown",
//         "profile_image_url": "https://ucarecdn.com/6ea6d83d-ef1a-483f-9106-837a3a5b3f67/-/preview/1000x666/",
//         "car_image_url": "https://ucarecdn.com/a3872f80-c094-409c-82f8-c9ff38429327/-/preview/930x932/",
//         "car_seats": 5,
//         "rating": 4.60
//     },
//     {
//         "driver_id": 3,
//         "first_name": "Michael",
//         "last_name": "Johnson",
//         "profile_image_url": "https://ucarecdn.com/0330d85c-232e-4c30-bd04-e5e4d0e3d688/-/preview/826x822/",
//         "car_image_url": "https://ucarecdn.com/289764fb-55b6-4427-b1d1-f655987b4a14/-/preview/930x932/",
//         "car_seats": 4,
//         "rating": 4.70
//     },
//     {
//         "driver_id": 4,
//         "first_name": "Robert",
//         "last_name": "Green",
//         "profile_image_url": "https://ucarecdn.com/fdfc54df-9d24-40f7-b7d3-6f391561c0db/-/preview/626x417/",
//         "car_image_url": "https://ucarecdn.com/b6fb3b55-7676-4ff3-8484-fb115e268d32/-/preview/930x932/",
//         "car_seats": 4,
//         "rating": 4.90
//     }
// ]

const Map = () => {

    const { data: drivers, loading, error } = useFetch<Driver[]>("/(api)/driver")
    
    const {
        userLongitude,
        userLatitude,
        destinationLatitude,
        destinationLongitude,
    } = useLocationStore();

    const {selectedDriver, setDrivers} = useDriverStore();
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    
    useEffect(() => {
        
        if (Array.isArray(drivers)) {
            if (!userLatitude || !userLongitude) return;

            const newMarkers = generateMarkersFromData(
                {
                    data: drivers,
                    userLatitude,
                    userLongitude,
                }
            );
            setMarkers(newMarkers)
           
           
        }
    },[drivers, userLatitude, userLongitude]);

    useEffect(() => {
        if (markers.length > 0 
            && destinationLatitude !== undefined 
            && destinationLongitude !== undefined
        ) {
            calculateDriverTimes({
                markers,
                userLatitude,
                userLongitude,
                destinationLatitude,
                destinationLongitude,
            }).then((drivers) => {
                setDrivers(drivers as MarkerData[]);
            })
        }
    }, [markers, destinationLatitude, destinationLongitude])

    const region = calculateRegion({
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
    });

    if (loading || (!userLatitude || !userLongitude)) {
        return (
            <View className="flex justify-between items-center w-full">
                <ActivityIndicator size="small" color="#000" />
            </View>
        );
    }

    if (error) {
        Alert.alert('Error', 'Failed to fetch drivers');
        return (
            <View className="flex justify-between items-center w-full">
              <Text>Error: {error}</Text>
            </View>
        );
    }


  return (
    <View className='flex-1'>
        <MapView
            provider={PROVIDER_DEFAULT}
            style={{ width: '100%', height: '100%', borderRadius: 15 }}
            tintColor='black'
            mapType="standard"
            initialRegion={region}
            showsUserLocation={true}
            userInterfaceStyle='light'
        >   
            {markers.map((marker, index) => (
                <Marker
                    key={marker.id}
                    coordinate={{
                        latitude: marker.latitude,
                        longitude: marker.longitude,
                    }}
                    title={marker.title}
                    image={
                        selectedDriver === +marker.id ? icons.selectedMarker : icons.marker
                    }
                />
            ))}
            {destinationLatitude && destinationLongitude && (
                <>
                    <Marker
                        key="destination"
                        coordinate={{
                            latitude: destinationLatitude,
                            longitude: destinationLongitude,
                        }}
                        title='Destination'
                        image={icons.pin}
                    />
                    <MapViewRoute
                        origin={{
                            latitude: userLatitude,
                            longitude: userLongitude,
                        }}
                        destination={{
                            latitude: destinationLatitude,
                            longitude: destinationLongitude,
                        }}
                        apiKey={process.env.EXPO_PUBLIC_GOOGLE_API_KEY!}
                        strokeColor='#0286ff'
                        strokeWidth={2}
                    />

                </>
            )}
        </MapView>
    </View>
    
      
  )
}

export default Map