import { type CastMember } from "@/types/tmdbApi"
import Image from "next/image"
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Link from "next/link"

const CastAndCrew = ({
    cast,
    crew,
    type,
}: {
    cast?: CastMember[]
    type: "cast" | "crew" | "both",
    crew?: CastMember[]

}) => {
    if (!cast && !crew) {
        return <h3>No cast data available.</h3>
    }
    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-4 text-center capitalize">{type}</h2>
            <Carousel className="w-4/5 mx-auto">
                <CarouselContent>


                    {cast?.map(member => (
                        <CarouselItem key={member.id} className="basis-1/2">
                            <Card key={member.id} className="w-full flex flex-col items-center">
                                <CardHeader>
                                    <Link 
                                        href={`https://www.google.com/search?q=${member.name}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >

                                    <Image
                                        src={`https://image.tmdb.org/t/p/w500${member.profile_path}`}
                                        alt={member.name}
                                        className="rounded-t-lg"
                                        width={125}
                                        height={250}
                                        />
                                        </Link>
                                </CardHeader>
                                <CardContent>
                                    <CardTitle className='text-lg'>{member.name}</CardTitle>
                                    <CardDescription className='text-sm text-gray-600'>{member.character}</CardDescription>
                                   
                                </CardContent>
                                <CardFooter>
                                </CardFooter>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
    )
}

export default CastAndCrew