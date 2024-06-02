import { account } from '@/lib/appwrite';

// Define the function to get the image URL
 export async function getUserProviderImage(): Promise<string | null> {
  // Helper function to get the session
  const getSession = async () => {
    try {
      const response = await account.getSession("current");
      return response;
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  };

  // Fetch the session and access token
  const session = await getSession();
  if (!session) {
    return null;
  }

  const providerAccessToken = session.providerAccessToken;

  // Helper function to get the image data
  const getImageData = async (token: string) => {
    // try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
      const imageData = await response.json();
      console.log(imageData)
      return imageData.picture;
    // } catch (error) {
    //   console.error('Error fetching image data:', error);
    //   return null;
    // }
  };

  const image = await getImageData(providerAccessToken);
  console.log(image)
  // Fetch and return the image URL
  return image
};
