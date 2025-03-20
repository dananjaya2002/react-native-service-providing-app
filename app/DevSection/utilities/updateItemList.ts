// updateItemList.ts
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../FirebaseConfig"; // your firebase config file
import { v4 as uuidv4 } from "uuid";

// Arrays of data
const descriptions = [
  "High-quality synthetic and mineral engine oil change.",
  "Computerized wheel alignment for better stability and tire life.",
  "Wide range of vehicle batteries with free installation.",
  "Comprehensive car AC servicing, repairs, and gas refilling.",
];
const imageUrls = [
  "https://res.cloudinary.com/dpjdmbozt/image/upload/v1739022204/pexels-photo-13065690_b6uhwg.jpg",
  "https://res.cloudinary.com/dpjdmbozt/image/upload/v1739022274/pexels-photo-3806280_h0563i.jpg",
  "https://res.cloudinary.com/dpjdmbozt/image/upload/v1739022331/pexels-photo-4374843_h6ehxm.jpg",
  "https://res.cloudinary.com/dpjdmbozt/image/upload/v1739022409/pexels-photo-6471913_lkwmrs.jpg",
];
const titles = [
  "Engine Oil Change",
  "Wheel Alignment & Balancing",
  "Battery Replacement",
  "AC Repair & Gas Refill",
];

export async function updateItemList(documentId: string) {
  // Create a new object to hold your items
  const itemList: { [key: string]: any } = {};

  for (let i = 0; i < titles.length; i++) {
    // Generate a unique ID for each item
    const uniqueId = uuidv4();
    const key = `item${i + 1}`; // e.g., "item1", "item2", etc.
    itemList[key] = {
      id: uniqueId,
      title: titles[i],
      description: descriptions[i],
      imageUrl: imageUrls[i],
    };
  }

  try {
    // Reference the document (for example, in the "shops" collection)
    const docRef = doc(db!, "shops", documentId);

    // Update the document with the new ItemList object
    await updateDoc(docRef, {
      ItemList: itemList,
    });
    console.log("Document updated with ItemList:", itemList);
  } catch (error) {
    console.error("Error updating document:", error);
  }
}
