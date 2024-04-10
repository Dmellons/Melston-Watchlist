'use client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image";
import Link from "next/link"
import ProvidersBlock from "@/components/ProvidersBlock";

const NewSearchCard = ({
    title = "No Title",
    year = "No Year",
    image: imageUrl = "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg"
}: {
    title: string;
    image: string;
    year: string;
}) => {
    imageUrl = 'https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg'
    console.log(imageUrl)

    return (

        <>

            <Card
                key={title}
                className="w-64 rounded-xl bg-black h-96 overflow-hidden border border-primary z-1 relative"

            >
                <CardHeader
                    className="h-32 bg-gradient-to-b from-black  z-10"
                >
                    <CardTitle
                        className="text-white z-10"
                    >
                        {title}
                    </CardTitle>
                    <CardDescription className=" text-center z-10">
                        {year}
                    </CardDescription>

                </CardHeader>
                <CardContent className="z-20">
                </CardContent>
                <CardFooter className="z-20 absolute bottom-0">
                </CardFooter>
                <Image
                    src={imageUrl}
                    alt={title}
                    width={500}
                    height={500}
                    className="w-full h-full z-0 absolute top-0 left-0 opacity-75 hover:opacity-40 object-cover hover:scale-105 hover:ease-in-out hover:duration-500"
                />


            </Card>

        <ProvidersBlock tmdbId={19995} tmdbType="movie"/>
        </>

    )
}

export default NewSearchCard