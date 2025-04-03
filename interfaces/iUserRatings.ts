import { FieldValue, Timestamp } from "firebase/firestore";

export interface IUserRatingsFirebaseDocument {
  customerId: string;
  comment: string;
  name: string;
  profileImageUrl: string;
  ratings: number;
  uploadedDate: Timestamp | FieldValue;
}

export interface IUserRatingUploadParams {
  serviceProviderID: string;
  avgRatings: number;
  totalRatings: number;
  comment: string;
  newRating: number;
}
