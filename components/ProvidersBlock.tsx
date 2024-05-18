'use client'
import { ProvidersApiCall, StreamingInfo, tmdbFetchOptions } from '@/lib/tmdb';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUser } from '@/hooks/User';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { database } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Asterisk, OctagonX } from 'lucide-react';


const ProvidersBlock = (
  {
    tmdbId,
    tmdbType,

    country = 'US',
    userProviders,
    maxWidth = 'w-full max-w-36',
    iconSize = 22, 
    notStreamingValue = 'N / A'
    // setHasProviders
  }: {
    tmdbId: number
    tmdbType: string
    country?: string,
    userProviders?: number[] | boolean,
    maxWidth?: string
    iconSize?: number
    notStreamingValue?: string
    // setHasProviders?: (hasProviders: boolean) => void
  }
) => {
  const [data, setData] = useState<ProvidersApiCall | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [inPlex, setInPlex] = useState(false)

  const { user } = useUser()


  if (userProviders === true) {
    userProviders = user?.providers || [];
  }


  useEffect(() => {
    const fetchData = async () => {

      try {
        /*
        / Streaming results provided by JustWatch - https://www.justwatch.com/
        */
        const url = `https://api.themoviedb.org/3/${tmdbType}/${tmdbId.toString()}/watch/providers`;

        const response = await fetch(url, tmdbFetchOptions);
        const result = await response.json();
        setData(result);
        const plex_collection_id = process.env.NEXT_PUBLIC_APPWRITE_PLEX_COLLECTION_ID

        if (user?.labels?.includes('plex')) {

          const plex_db = await database.listDocuments('watchlist', plex_collection_id, [
            Query.equal('tmdb_id', tmdbId.toString())
          ])

          const plex_ids = plex_db.documents.map(doc => doc.tmdb_id)

          if (plex_ids.includes(tmdbId.toString())) {
            setInPlex(true)
          }
        }


        // if(setHasProviders){}
        // setHasProviders(true); 
        setLoading(false);
      } catch (error) {
        console.error({ error })
      }
    };

    fetchData();
  }, [tmdbId, tmdbType]);

  const notStreaming = () => {
    return (
      <div className="grid items-center h-10 w-full text-foreground/60 ml-2">
          {notStreamingValue}  
      </div>
    );
  };

  if (!data && !inPlex) {
    return notStreaming()
  }
  else if (data?.results[country] === undefined && !inPlex) {
    return notStreaming()
  }
  // @ts-ignore
  else if (!data.results[country]?.flatrate && !inPlex) {
    return notStreaming()
  }

  if (userProviders && userProviders.length > 0) {


    let canStream: StreamingInfo[] = data?.results[country]?.flatrate?.filter((provider: StreamingInfo) =>
      userProviders?.includes(provider.provider_id)
    )

    if (!canStream) {
      canStream = []
    }




    // if (user?.labels?.includes('plex') && inPlex) {
    if (inPlex) {

      // if (canStream && canStream.length === 0) {

      // }

      canStream = [{
        logo_path: '/logos/plex-logo.svg',
        provider_id: 999,
        provider_name: 'Plex',
        display_priority: 1
      }, ...canStream]

    }



    return (

      <Popover>
        <PopoverTrigger
          asChild
          className=''
        >


          <div className={` m-auto flex-col flex justify-center items-center z-10 ${maxWidth}`}>
            <div className='flex hover:cursor-pointer gap-4 justify-center flex-wrap  '>
              {loading ? (
                <div className='text-center'>Loading...</div>
              ) : (

                // @ts-ignore
                <div className='flex flex-wrap gap-2 min-w-48 w-4/5 items-center justify-center z-10 bg-card/75 p-2 rounded-lg border border-primary'>
                  {/* @ts-ignore */}
                  {canStream
                    .slice(0, 5)
                    .map((provider: StreamingInfo, key: number) => {
                      const providerImgSrc = provider.provider_name === 'Plex' ? provider.logo_path : `https://image.tmdb.org/t/p/w500${provider.logo_path}`

                      const plexProviderClass = provider.provider_name === 'Plex' ? 'ring-1 ring-primary/30' : ''

                      return (
                        <Image
                          key={key}
                          src={providerImgSrc}
                          alt={provider.provider_name}
                          width={iconSize}
                          height={iconSize}
                          className={`${plexProviderClass} rounded `}
                        />

                      )
                    }
                    )}

                  {data?.results[country]?.flatrate?.length > canStream.length ? (
                    <div className='text-center'>+{data?.results[country]?.flatrate?.length - canStream.length}</div>
                  ) : null}

                </div>


              )
              }

            </div>


          </div >
        </PopoverTrigger>
        <PopoverContent
          side='top'
          sideOffset={10}
          hideWhenDetached
          className='max-w-52 shadow-md  border border-primary'
        >

          <h4 className='text-center text-xs mb-1 mr-2 font-bold '>
            Available to stream on these platforms
          </h4>
          <div className="div flex flex-wrap gap-2 justify-center my-2">

            {inPlex && (
              <Image
                src="/logos/plex-logo.svg"
                alt="Plex"
                width={60}
                height={60}
                className='rounded '
              />
            )}

            {data?.results[country]?.flatrate?.map((provider: StreamingInfo, key: number) => (
              <Image
                key={key}
                src={`https://image.tmdb.org/t/p/w500${provider.logo_path}`}
                alt={provider.provider_name}
                width={60}
                height={60}
                className='rounded '
              />
            ))}
          </div>
          <p className='font-foreground/10 text-[10px] text-center  z-10 font-thin'>

            Streaming results provided by <a className='' href="https://www.justwatch.com/">JustWatch</a>
          </p>

        </PopoverContent>
      </Popover>


    )
  }

  let canStream: StreamingInfo[] = data?.results[country]?.flatrate
  if (!canStream) {
    canStream = []
  }
  if (inPlex) {
    if (canStream.length === 0) {
      canStream = []
    }
    canStream = [{
      logo_path: '/logos/plex-logo.svg',
      provider_id: 999,
      provider_name: 'Plex',
      display_priority: 1
    }, ...canStream]

  }


  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>


          <div className={` m-auto flex-col flex justify-center items-center z-10 ${maxWidth}`}>
            <div className='flex gap-4 justify-center flex-wrap  '>
              {loading ? (
                <div className='text-center'>Loading...</div>
              ) : (

                // @ts-ignore
                <div className='flex flex-wrap gap-2  items-center justify-center z-10 bg-card/50 p-2 rounded-lg border border-primary'>
                  {/* @ts-ignore */}
                  {canStream.slice(0, 5).map((provider: StreamingInfo, key: number) => {
                    const plexProviderClass = provider.provider_name === 'Plex' ? 'ring-1 ring-primary/30' : ''
                    return (
                      <>
                        <Image
                          key={key}
                          src={provider.provider_name === 'Plex' ? provider.logo_path : `https://image.tmdb.org/t/p/w500${provider.logo_path}`}
                          alt={provider.provider_name}
                          width={iconSize}
                          height={iconSize}
                          className={`${plexProviderClass} rounded`}
                        />
                      </>
                    )

                  })}

                  {canStream.length > 5 ? (
                    <div className='text-center'>+{data?.results[country]?.flatrate?.length - 5}</div>
                  ) : null}

                </div>


              )
              }

            </div>


          </div >
        </TooltipTrigger>
        <TooltipContent className='max-w-52 shadow-md  border border-primary'>

          <h4 className='text-center text-xs mb-1 mr-2 font-bold '>
            Available to stream on these platforms
          </h4>
          <div className="div flex flex-wrap gap-2 justify-center my-2">

            {inPlex && (
              <Image
                src="/logos/plex-logo.svg"
                alt="Plex"
                width={30}
                height={30}
                className='rounded ring-1 ring-primary/30'
              />
            )}

            {data?.results[country]?.flatrate?.map((provider: StreamingInfo, key: number) => (
              <Image
                key={key}
                src={`https://image.tmdb.org/t/p/w500${provider.logo_path}`}
                alt={provider.provider_name}
                width={30}
                height={30}
                className='rounded '
              />
            ))}
          </div>
          <p className='font-foreground/10 text-[10px] text-center  z-10 font-thin'>

            Streaming results provided by <a className='' href="https://www.justwatch.com/">JustWatch</a>
          </p>

        </TooltipContent>
      </Tooltip>
    </TooltipProvider>


  )
}

export default ProvidersBlock;