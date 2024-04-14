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


const ProvidersBlock = (
  {
    tmdbId,
    tmdbType,
    country = 'US',
    userProviders,
    // setHasProviders
  }: {
    tmdbId: number
    tmdbType: string
    country?: string,
    userProviders?: string[],
    // setHasProviders?: (hasProviders: boolean) => void
  }
) => {
  const [data, setData] = useState<ProvidersApiCall | undefined>(undefined);
  const [loading, setLoading] = useState(true);

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
        // if(setHasProviders){}
        // setHasProviders(true); 
        setLoading(false);
      } catch (error) {
        console.error({ error })
      }
    };

    fetchData();
  }, [tmdbId, tmdbType]);
  if (!data) {
    return null;
  }
  else if (data?.results[country] === undefined) {
    return null;
  }
  // @ts-ignore
  else if (!data.results[country]?.flatrate) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>


          <div className='w-full m-auto flex-col flex max-w-36 justify-center items-center z-10 '>
            {/* <h3 className='text-sm text-muted-foreground font-bold text-center mb-2 '>Streaming on</h3> */}
            {/* <h2 className='text-center text-xs mb-1 mr-2 font-bold  bottom-0 text-card-foreground opacity-0 group-hover:opacity-100 transition-all hover:duration-500'>Streaming on</h2> */}
            <div className='flex gap-4 justify-center flex-wrap  '>
              {loading ? (
                <div className='text-center'>Loading...</div>
              ) : (
                // @ts-ignore


                <div className='flex flex-wrap gap-2 min-w-36 w-4/5 items-center justify-center z-10 bg-card/50 p-2 rounded-lg border border-primary'>
                  {/* @ts-ignore */}
                  {data?.results[country]?.flatrate?.slice(0, 5).map((provider: StreamingInfo, key: number) => (
                    <Image
                      key={key}
                      src={`https://image.tmdb.org/t/p/w500${provider.logo_path}`}
                      alt={provider.provider_name}
                      width={30}
                      height={30}
                      className='rounded '
                    />
                  ))}
                  {data?.results[country]?.flatrate?.length > 5 ? (
                    <div className='text-center'>+{data?.results[country]?.flatrate?.length - 5}</div>
                  ) : null}

                </div>


              )
              }

            </div>


          </div >
        </TooltipTrigger>
        <TooltipContent className='max-w-52'>
  
          <h4 className='text-center text-xs mb-1 mr-2 font-bold '>Available to stream on these platforms</h4>
          <p className='font-foreground/50 text-[10px] text-center  z-10 '>

        Streaming results provided by <a className='' href="https://www.justwatch.com/">JustWatch</a>
      </p>

        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

  
  )
}

export default ProvidersBlock;