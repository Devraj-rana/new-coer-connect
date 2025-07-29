export interface PostData {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  content: string;
  description: string;
  imageUrl?: string;
  profilePhoto: string;
  createdAt: Date;
  likes: string[];
  comments: any[];
  user: {
    userId: string;
    firstName: string;
    lastName: string;
    profilePhoto: string;
  };
}
