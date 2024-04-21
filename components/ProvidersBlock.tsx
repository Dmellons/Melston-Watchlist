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


const ProvidersBlock = (
  {
    tmdbId,
    tmdbType,

    country = 'US',
    userProviders,
    maxWidth = 'max-w-36',
    iconSize = 22
    // setHasProviders
  }: {
    tmdbId: number
    tmdbType: string
    country?: string,
    userProviders?: number[] | boolean, 
    maxWidth?: string
    iconSize?: number
    // setHasProviders?: (hasProviders: boolean) => void
  }
) => {
  const [data, setData] = useState<ProvidersApiCall | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  
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

  if (userProviders) {

    const canStream = data?.results[country]?.flatrate?.filter((provider: StreamingInfo) =>
      userProviders?.includes(provider.provider_id)
    )

    console.log({ canStream })

    return (

        <Popover>
          <PopoverTrigger 
            asChild
            className=''
            >
  
  
            <div className={`w-full m-auto flex-col flex justify-center items-center z-10 ${maxWidth}`}>
              <div className='flex hover:cursor-pointer gap-4 justify-center flex-wrap  '>
                {loading ? (
                  <div className='text-center'>Loading...</div>
                ) : (
                  
                  // @ts-ignore
                  <div className='flex flex-wrap gap-2 min-w-48 w-4/5 items-center justify-center z-10 bg-card/50 p-2 rounded-lg border border-primary'>
                    {/* @ts-ignore */}
                    {canStream
                      .slice(0, 5)
                      .map((provider: StreamingInfo, key: number) => (
                      
                      <Image
                        key={key}
                        src={`https://image.tmdb.org/t/p/w500${provider.logo_path}`}
                        alt={provider.provider_name}
                        width={iconSize}
                        height={iconSize}
                        className='rounded '
                      />
                    ))}
                    
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
  
          </PopoverContent>
        </Popover>
 
  
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>


          <div className={`w-full m-auto flex-col flex justify-center items-center z-10 ${maxWidth}`}>
            <div className='flex gap-4 justify-center flex-wrap  '>
              {loading ? (
                <div className='text-center'>Loading...</div>
              ) : (
                
                // @ts-ignore
                <div className='flex flex-wrap gap-2 min-w-48 w-4/5 items-center justify-center z-10 bg-card/50 p-2 rounded-lg border border-primary'>
                  {/* @ts-ignore */}
                  {data?.results[country]?.flatrate?.slice(0, 5).map((provider: StreamingInfo, key: number) => (
                    
                    <Image
                      key={key}
                      src={`https://image.tmdb.org/t/p/w500${provider.logo_path}`}
                      alt={provider.provider_name}
                      width={iconSize}
                      height={iconSize}
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
        <TooltipContent className='max-w-52 shadow-md  border border-primary'>

          <h4 className='text-center text-xs mb-1 mr-2 font-bold '>
            Available to stream on these platforms
          </h4>
          <div className="div flex flex-wrap gap-2 justify-center my-2">

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