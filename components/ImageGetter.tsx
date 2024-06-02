'use client'
import { account } from '@/lib/appwrite';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const ImageGetter = ({
    accessToken
}: {
    accessToken?: string
}) => {
    const [providerAccessToken, setProviderAccessToken] = useState('');
    const [imageUrl, setImageUrl] = useState('');


    useEffect(() => {
        async function getSession() {
            try {
                const response = await account.getSession("current");
                return response;
            } catch (error) {
                console.error('Error fetching session:', error);
                return null;
            }
        }

        async function fetchData() {
            const session = await getSession();
            console.log(session);
            if (session) {
                console.log({session})
                setProviderAccessToken(session.providerAccessToken);
            }
        }

        fetchData();
    }, []); // Empty dependency array to run once on mount

    useEffect(() => {

        async function getImageData() {
            try {
                const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${providerAccessToken}`);
                const imageData = await response.json();
                console.log(imageData.picture)
                setImageUrl(imageData.picture);

            } catch (error) {
                console.error('Error fetching image data:', error);
            }
        }

        getImageData();

    }, [providerAccessToken]);

    useEffect(() => {

        async function updateProfileImage() {
            if (imageUrl === '') { return }
            try {
                const prefs = await account.getPrefs();
                console.log({ prefs })
                type UserPerfs = {
                    providers?: number[] | string,
                    profileImage?: string,
                    
                }
                const newPrefs:UserPerfs = {
                    profileImage: imageUrl,
                    ...prefs,
                };
                console.log(newPrefs)
               
                const test = await account.updatePrefs({
                    profileImage:newPrefs.profileImage,
                    ...prefs
                }); //account.updatePrefs(newPrefs);
                console.log(test)
                setImageUrl(imageUrl)
            } catch (error) {
                console.error('Error fetching image data:', error);
            }
        }

        updateProfileImage();
    }, [imageUrl])

    console.log(imageUrl);

    return (
        <>
            {/* {imageUrl ? (
                <>
                    {console.log(imageUrl)}
                    <Image src={imageUrl} alt="User" width={32} height={32} />
                </>
            ) : (
                <></>
            )} */}
        </>
    );
};

export default ImageGetter;
