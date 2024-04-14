'use client'
import { ProvidersApiCall,  StreamingInfo, tmdbFetchOptions } from '@/lib/tmdb';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';


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
      <>
    <div className='w-full m-auto flex max-w-12 justify-center items-center z-10 '>
      {/* <h3 className='text-sm text-muted-foreground font-bold text-center mb-2 '>Streaming on</h3> */}
      <h2 className='text-center text-xs mb-1 mr-2  font-light bottom-0'>Streaming <br /> on</h2>
      <div className='flex gap-4 justify-center flex-wrap '>
        {loading ? (
          <div className='text-center'>Loading...</div>
        ) : (
          // @ts-ignore


          <div className='flex flex-wrap gap-2 min-w-36 w-4/5 items-center justify-center z-10 '>
            {/* @ts-ignore */}
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


        )
        }

      </div>
      
      
    </div>
      {/* <p className='font-extralight text-[10px] text-center text-muted z-10 '>

        Streaming results provided by <a className='' href="https://www.justwatch.com/">JustWatch</a>
      </p> */}
      </>
  )
}

export default ProvidersBlock;