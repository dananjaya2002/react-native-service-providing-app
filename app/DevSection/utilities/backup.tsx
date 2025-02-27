// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   ImageBackground,
//   Image,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
// import FontAwesome from "@expo/vector-icons/FontAwesome";
// import { getSingleServiceProviderData } from "../../Utility/U_getFirebaseData";

// import StatusCard from "../../components/section2/dashboardTextInfoStyle1";
// import HorizontalScrollView from "../../components/section2/horizontalScrollView";
// import UserComments from "@/components/section2/userComment";
// import FloatingButtonBar from "@/components/section2/FloatingButtonBar";

// import { useShop } from "../../context/ShopContext";
// import { useRouter } from "expo-router";
// import UpdateSheet, { UpdateSheetRef } from "../../components/section2/slideUpFormPage";

// type SubServiceData = {
//   id: string;
//   title: string;
//   imageUrl: string;
//   description: string;
// };

// interface UserComment {
//   profileUrl: string;
//   name: string;
//   date: string;
//   ratings: number;
//   comment: string;
// }

// const Shop = () => {
//   const sheetRef = useRef<UpdateSheetRef>(null);
//   // Shared value to control the FloatingButtonBar's vertical position.
//   const floatingBarY = useSharedValue(0);
//   const floatingBarAnimatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: floatingBarY.value }],
//   }));

//   const { shop, setShop } = useShop();
//   const router = useRouter();

//   const [data, setData] = useState<any>(null);
//   const hasFetchedData = useRef(false);

//   // Fetch data when the component mounts.
//   useEffect(() => {
//     if (hasFetchedData.current) {
//       console.log("🟡 Data already fetched 🟡");
//       return;
//     }
//     hasFetchedData.current = true;
//     const fetchData = async () => {
//       const fetchedData = await getSingleServiceProviderData();
//       setData(fetchedData);
//     };
//     fetchData();
//   }, []);

//   if (!data) {
//     const jsonData = require("../DevSection/utilities/shopDoc.json");
//     setData(jsonData);
//     return (
//       <View className="flex-1 justify-center items-center bg-white">
//         <ActivityIndicator size="large" color="#007bff" />
//         <Text className="mt-4 text-lg font-semibold text-gray-600">Loading, please wait...</Text>
//       </View>
//     );
//   }

//   const itemList = data.ItemList ? Object.values(data.ItemList) : [];
//   const userCommentList = data.CommentOverview ? Object.values(data.CommentOverview) : [];

//   const handleLeftPress = () => {
//     console.log("Left button triggered in MainScreen");
//     sheetRef.current?.open();
//   };

//   const handleRightPress = () => {
//     console.log("Right button triggered in MainScreen");
//     setShop(itemList as SubServiceData[]);
//     router.push("/");
//   };

//   // Receive updated data from UpdateSheet.
//   const handleUpdate = (data: {
//     title: string;
//     description: string;
//     phoneNumber: string;
//     category: string;
//   }) => {
//     console.log("Received updated values:", data);
//     // Handle the updated data (e.g., update state or call an API)
//   };

//   return (
//     <>
//       <ScrollView>
//         <View className="flex-col bg-white">
//           <View className="flex-row items-center py-2 bg-primary">
//             <View className="w-10" />
//             <Text className="text-2xl font-bold flex-1 text-center">Explore Services</Text>
//             <View className="px-3">
//               <FontAwesome name="user-circle" size={24} color="black" />
//             </View>
//           </View>

//           <View className="relative w-full h-[200px] items-center justify-center">
//             <ImageBackground
//               source={{ uri: data.ShopPageImageUrl }}
//               blurRadius={15}
//               className="absolute w-full h-full"
//             >
//               <View className="flex-1" />
//             </ImageBackground>
//             <Image
//               source={{ uri: data.ShopPageImageUrl }}
//               resizeMode="center"
//               className="h-full w-full"
//             />
//           </View>

//           <View className="h-auto px-4 py-2 bg-white shadow-xl">
//             <Text className="text-2xl text-start font-semibold flex-1">{data.ShopName}</Text>
//             <Text className="text-md text-start font-normal">{data.ShopDescription}</Text>
//           </View>

//           <View className="h-auto mx-6 my-4 flex-row flex-wrap justify-evenly p-2 rounded-2xl bg-primary shadow-lg">
//             <View className="w-full h-auto">
//               <Text className="text-lg text-center font-semibold">Store Overview</Text>
//             </View>
//             <StatusCard status="Waiting" count={data.DashboardInfo.waitings} />
//             <StatusCard status="Completed" count={data.DashboardInfo.completed} />
//             <StatusCard status="Items" count={data.DashboardInfo.items} />
//             <StatusCard status="Agreements" count={data.DashboardInfo.agreements} />
//             <StatusCard status="Avg Ratings" count={data.DashboardInfo.avgRatings} />
//             <StatusCard status="Messages" count={data.DashboardInfo.messages} />
//           </View>

//           <View className="h-auto px-4 my-5">
//             <Text className="text-sm text-left px-3">
//               {data.ShopServiceInfo.replace(/\\n/g, "\n")}
//             </Text>
//           </View>

//           <View className="h-auto bg-primary py-3">
//             <HorizontalScrollView items={itemList as SubServiceData[]} />
//           </View>

//           <View className="flex-1 justify-center bg-primary ">
//             <Text className="font-semibold mx-4 my-2 text-lg">Comments</Text>
//             {userCommentList.map((userComment, index) => {
//               const comment = userComment as UserComment;
//               return (
//                 <UserComments
//                   key={index}
//                   profileImage={comment.profileUrl}
//                   customerName={comment.name}
//                   date={comment.date}
//                   rating={comment.ratings}
//                   comment={comment.comment}
//                 />
//               );
//             })}
//           </View>
//         </View>
//         <View className="h-20 bg-primary" />
//       </ScrollView>

//       {/* Pass the onOpen and onClose callbacks to UpdateSheet */}
//       <UpdateSheet
//         ref={sheetRef}
//         title={data.ShopName}
//         description={data.ShopDescription}
//         phoneNumber={data.PhoneNumber}
//         category={data.Category}
//         onUpdate={handleUpdate}
//         onOpen={() => {
//           // Slide the FloatingButtonBar down (off-screen).
//           // Adjust the value (e.g., 60) to match your bar’s height.
//           floatingBarY.value = withTiming(80, { duration: 300 });
//         }}
//         onClose={() => {
//           // Slide the FloatingButtonBar back up.
//           floatingBarY.value = withTiming(0, { duration: 300 });
//         }}
//       />

//       {/* Wrap the FloatingButtonBar in an Animated.View */}
//       <Animated.View
//         style={[
//           floatingBarAnimatedStyle,
//           {
//             position: "absolute",
//             left: 0,
//             right: 0,
//             bottom: 0,
//           },
//         ]}
//       >
//         <FloatingButtonBar
//           leftButtonName="Edit Page"
//           rightButtonName="Edit Items"
//           onLeftPress={handleLeftPress}
//           onRightPress={handleRightPress}
//         />
//       </Animated.View>
//     </>
//   );
// };

// export default Shop;
