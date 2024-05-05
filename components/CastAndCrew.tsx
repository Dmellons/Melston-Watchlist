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
                <CarouselContent className="-ml-4">


                    {cast?.map(member => (
                        <CarouselItem key={member.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 pl-4">
                            <Link
                                href={`https://www.google.com/search?q=${member.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Card key={member.id} className="group w-full flex flex-col items-center h-80 group-hover:border group-hover:border-primary  group-hover:ease-in-out group-hover:duration-300">
                                    <CardHeader>

                                        <Image
                                            src={`https://image.tmdb.org/t/p/w500${member.profile_path}`}
                                            alt={member.name}
                                            className="rounded-lg "
                                            width={125}
                                            height={250}
                                        />
                                    </CardHeader>
                                    <CardContent className="min-h-96">
                                        <div className='font-bold text-center'>{member.name}</div>
                                        <CardDescription className='text-sm text-muted-foreground/80 text-center'>{member.character}</CardDescription>

                                    </CardContent>
                                    <CardFooter>
                                    </CardFooter>
                                </Card>
                            </Link>
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