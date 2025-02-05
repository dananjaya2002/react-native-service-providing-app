// addDataToFirebase.js

import { db } from "../..//FirebaseConfig"; // Import the Firestore instance
import { collection, addDoc } from "firebase/firestore";

const serviceCollection = collection(db, "Service");

const addServices = async () => {
  const services = [];

  // Create an array of service objects
  for (let i = 1; i <= 10; i++) {
    services.push({
      ImageURL: "https://picsum.photos/200", // Example image URL
      Title: `Service Provider ${i}`, // Title incremented for each service
    });
  }

  // Add each service to the 'Service' collection
  for (const service of services) {
    try {
      await addDoc(serviceCollection, service);
      console.log(`Service ${service.Title} added successfully`);
    } catch (error) {
      console.error("Error adding service: ", error);
    }
  }
};

// Call the function to add services to the collection
addServices();
