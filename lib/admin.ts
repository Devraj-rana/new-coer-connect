// Admin configuration
export const ADMIN_USERNAMES = [
  "@sneaky", // Admin username with @ symbol
  // Add more admin usernames here as needed
  // "@johndoe",
  // "@admin123",
];

export const isUserAdmin = (username?: string): boolean => {
  if (!username) return false;
  // Handle usernames with or without @ symbol
  const normalizedUsername = username.startsWith('@') ? username : `@${username}`;
  return ADMIN_USERNAMES.includes(normalizedUsername.toLowerCase());
};

export const isUserIdAdmin = (userId?: string): boolean => {
  if (!userId) return false;
  // You can also specify specific Clerk user IDs here
  const ADMIN_USER_IDS: string[] = [
    // "user_2abc123def456ghi", // Add your actual Clerk user ID here
  ];
  return ADMIN_USER_IDS.includes(userId);
};
