'use client'
import { ProvidersApiCall, Results, tmdbFetchOptions } from '@/lib/tmdb';
import { Lightbulb } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

const ProvidersBlock = (
  {
    tmdbId,
    tmdbType,
    country = 'US',
    userProviders
  }: {
    tmdbId: number
    tmdbType: string
    country?: string,
    userProviders?: string[]
  }
) => {
  const [data, setData] = useState<ProvidersApiCall | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `https://api.themoviedb.org/3/${tmdbType}/${tmdbId.toString()}/watch/providers`;
        console.log(url)
        const response = await fetch(url, tmdbFetchOptions);
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error({ error })
      }
    };

    fetchData();
  }, []);

  return (
    <div className='w-full'>
      <h3>Providers Block</h3>
      <div className='flex flex-col gap-2'>
        {loading ? (
          <div className='text-center'>Loading...</div>
        ) : (


          data?.results[country]?.flatrate?.map((provider, key) => (
            <div key={key} className='flex  gap-2 items-center'>
              {/* <p>{provider.provider_name}</p> */}
              <Image 
                src={`https://image.tmdb.org/t/p/w500${provider.logo_path}`} 
                alt={provider.provider_name} 
                width={28} 
                height={28} 
                />
            </div>
          ))

        )
        }
      </div>
      <div className='font-extralight text-[10px] text-muted '>Streaming results provided by JustWatch</div>
    </div>
  )
}

export default ProvidersBlock;