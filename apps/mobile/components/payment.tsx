import { useAuth } from "@clerk/clerk-expo";
import { PaymentMethod, useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";
import CustomButton from "@/components/customButton";
import { images } from "@/constants";
import { useLocationStore } from "@/store";
import { PaymentProps } from "@/types/type";
import Stripe from "stripe";


const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}: PaymentProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude,
  } = useLocationStore();

  const { userId } = useAuth();
  const [success, setSuccess] = useState<boolean>(false);

  const createRide = async () => {
    try {
      const response = await fetch("/(api)/ride/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_address: userAddress,
          destination_address: destinationAddress,
          origin_latitude: userLatitude,
          origin_longitude: userLongitude,
          destination_latitude: destinationLatitude,
          destination_longitude: destinationLongitude,
          ride_time: rideTime.toFixed(0),
          fare_price: parseInt(amount) * 100,
          payment_status: "pending",
          driver_id: driverId,
          user_id: userId,
        }),
      });
  
      if (!response.ok) throw new Error("Failed to create ride");
  
      return await response.json();
    } catch (error) {
      console.error("❌ Ride Creation Error:", error);
      throw error;
    }
  };
  
  const createPaymentIntent = async () => {
    try {
      const response = await fetch("/(api)/(stripe)/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName || email.split("@")[0],
          email: email,
          amount: amount,
        }),
      });
  
      if (!response.ok) throw new Error("Failed to create payment intent");
  
      return await response.json();
    } catch (error) {
      console.error("❌ Payment Intent Error:", error);
      throw error;
    }
  };

  const confirmPaymentAndUpdateRide = async (
    paymentIntent: Stripe.Response<Stripe.PaymentIntent> , 
    customer: string, 
  ) => {
    try {
      // Confirm the payment
      const confirmResponse = await fetch("/(api)/(stripe)/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_intent_id: paymentIntent.id,
          customer_id: customer,
          client_secret: paymentIntent.client_secret,
        }),
      });
  
      if (!confirmResponse.ok) throw new Error("Failed to confirm payment");
  
      console.log("✅ Payment Confirmed!");
  
      // Update ride status
      // const updateRideResponse = await fetch("/(api)/ride/update", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     ride_id: rideId,
      //     payment_status: "paid",
      //   }),
      // });
  
      // if (!updateRideResponse.ok) throw new Error("Failed to update ride status");
  
      //console.log("✅ Ride status updated to paid!");
    } catch (error) {
      console.error("❌ Payment Confirmation Error:", error);
      throw error;
    }
  };

  const handlePayment = async () => {
    try {
      // Step 1: Create Ride
      const rideData = await createRide();
      console.log("✅ Ride created:", rideData);
  
      // Step 2: Create Payment Intent
      const { paymentIntent, customer } = await createPaymentIntent();
      console.log("✅ Payment Intent Created:", paymentIntent);
  
      // Step 3: Initialize Payment Sheet
      const { error } = await initPaymentSheet({
        merchantDisplayName: "Daily, Inc.",
        paymentIntentClientSecret: paymentIntent.client_secret,
        returnURL: "estate://book-ride",
      });
  
      if (error) throw new Error(`Payment Sheet Init Error: ${error.message}`);
  
      // Step 4: Open Payment Sheet
      const { error: paymentError } = await presentPaymentSheet();
  
      if (paymentError) {
        Alert.alert(`Error: ${paymentError.code}`, paymentError.message);
        return;
      }
  
      // Step 5: Confirm Payment
      await confirmPaymentAndUpdateRide(paymentIntent, customer);
  
      // Step 6: Set Success State
      setSuccess(true);
    } catch (error) {
      console.error("❌ Payment Process Error:", error);
    }
  };

  return (
    <>
      <CustomButton
        title="Confirm Ride"
        className="my-10"
        onPress={handlePayment}
      />

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Booking placed successfully
          </Text>

          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Thank you for your booking. Your reservation has been successfully
            placed. Please proceed with your trip.
          </Text>

          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/home");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;