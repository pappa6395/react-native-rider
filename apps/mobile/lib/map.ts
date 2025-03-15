import {Driver, MarkerData} from "@/types/type";

const directionsAPI = process.env.EXPO_PUBLIC_GOOGLE_API_KEY!;

export const generateMarkersFromData = ({
    data,
    userLatitude,
    userLongitude,
}: {
    data: Driver[];
    userLatitude: number;
    userLongitude: number;
}): MarkerData[] => {
    return data.map((driver) => {
        const latOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005
        const lngOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005

        return {
            latitude: userLatitude + latOffset,
            longitude: userLongitude + lngOffset,
            id: driver.driver_id,
            title: `${driver.first_name} ${driver.last_name}`,
            ...driver,
        };
    });
};

export const calculateRegion = ({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
}: {
    userLatitude: number | null;
    userLongitude: number | null;
    destinationLatitude?: number | null;
    destinationLongitude?: number | null;
}) => {
    if (!userLatitude || !userLongitude) {
        return {
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        };
    }

    if (!destinationLatitude || !destinationLongitude) {
        return {
            latitude: userLatitude,
            longitude: userLongitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        };
    }

    const minLat = Math.min(userLatitude, destinationLatitude);
    const maxLat = Math.max(userLatitude, destinationLatitude);
    const minLng = Math.min(userLongitude, destinationLongitude);
    const maxLng = Math.max(userLongitude, destinationLongitude);

    const latitudeDelta = (maxLat - minLat) * 1.3; // Adding some padding
    const longitudeDelta = (maxLng - minLng) * 1.3; // Adding some padding

    const latitude = (userLatitude + destinationLatitude) / 2;
    const longitude = (userLongitude + destinationLongitude) / 2;

    return {
        latitude,
        longitude,
        latitudeDelta,
        longitudeDelta,
    };
};

export const calculateDriverTimes = async (
    {
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
    }: {
    markers: MarkerData[];
    userLatitude: number | null;
    userLongitude: number | null;
    destinationLatitude: number | null;
    destinationLongitude: number | null;
}) => {
    if (
        !userLatitude ||
        !userLongitude ||
        !destinationLatitude ||
        !destinationLongitude
    )
        return;

    try {
        const timesPromises = markers.map(async (marker) => {
            const responseToUser = await fetch(
             "https://routes.googleapis.com/directions/v2:computeRoutes",
             {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Goog-Api-Key": directionsAPI, // Use 'X-Goog-Api-Key' instead of '?key='
                  "X-Goog-FieldMask": "routes.duration" // Limits the response fields
                },
                body: JSON.stringify({
                  origin: { location: { latLng: { latitude: marker.latitude, longitude: marker.longitude } } },
                  destination: { location: { latLng: { latitude: userLatitude, longitude: userLongitude } } },
                  travelMode: "DRIVE"
                })
              }
            );
            const dataToUser = await responseToUser.json();
            //console.log("API Response (User):", JSON.stringify(dataToUser, null, 2));
            const timeToUser = parseInt(dataToUser.routes?.[0]?.duration?.replace("s", "") ?? "0"); // Time in seconds

            const responseToDestination = await fetch(
                "https://routes.googleapis.com/directions/v2:computeRoutes",
                {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "X-Goog-Api-Key": directionsAPI, // Use 'X-Goog-Api-Key' instead of '?key='
                      "X-Goog-FieldMask": "routes.duration" // Limits the response fields
                    },
                    body: JSON.stringify({
                      origin: { location: { latLng: { latitude: userLatitude, longitude: userLongitude } } },
                      destination: { location: { latLng: { latitude: destinationLatitude, longitude: destinationLongitude } } },
                      travelMode: "DRIVE"
                    })
                  }
            );
            const dataToDestination = await responseToDestination.json();
            //console.log("API Response (Destination):", JSON.stringify(dataToDestination, null, 2));
            const timeToDestination = 
                parseInt(dataToDestination.routes?.[0]?.duration?.replace("s", "") ?? "0"); // Time in seconds

            const totalTime = (timeToUser + timeToDestination) / 60; // Total time in minutes
            const price = (totalTime * 0.2 * 33).toFixed(2); // Calculate price based on time
            
            //console.log(`Driver ${marker.id} → Total Time: ${totalTime} min, Price: ฿${price}`);

            return {...marker, time: totalTime, price};
        });

        return await Promise.all(timesPromises);
    } catch (error) {
        console.error("Error calculating driver times:", error);
    }
};