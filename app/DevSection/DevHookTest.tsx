// import React, { useEffect } from "react";
// import useChat from "../../hooks/useChatMessages"; // Your hook
// import { Text, View, Button } from "react-native";

// const TestChatHook = () => {
//   const { messages, fetchMoreMessages } = useChatMessages("testChatRoomId");

//   useEffect(() => {
//     console.log(`[${new Date().toISOString()}] Messages Updated:`, messages);
//   }, [messages]);

//   return (
//     <View>
//       <Text>Chat Messages Count: {messages.length}</Text>
//       <Button title="Load More" onPress={fetchMoreMessages} />
//     </View>
//   );
// };

// export default TestChatHook;
