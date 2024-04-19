import { account, } from "@/lib/appwrite";
import { tmdbFetchOptions } from "@/lib/tmdb";
import { useState, useEffect } from "react";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import Image from "next/image";

type Props = {
    currentProviders: number[];
};

type ProviderInfo = {
    display_priorities: {
        [key: string]: number;
    };
    display_priority: number;
    logo_path: string;
    provider_name: string;
    provider_id: number;
};

export default function ProvidersSelect() {

    // Base Providers = [8,15,9,337,1899,283]
    const [providers, setProviders] = useState<number[]>([]);
    const [search, setSearch] = useState<string>('');
    const [availableProviders, setAvailableProviders] = useState<ProviderInfo[] | null>(null);


    useEffect(() => {
        const fetchData = async () => {
            const prefs = await account.getPrefs();
            console.log({ prefs })
            if (prefs.providers && typeof prefs.providers === 'string') {
                const providersArray = prefs.providers.split(',').map(Number)
                console.log({ providersArray })
                setProviders(providersArray);
            } else {
                setProviders(prefs.providers);
            }




            const response = await fetch(`https://api.themoviedb.org/3/watch/providers/movie?language=en-US&watch_region=US&query=${search}`, tmdbFetchOptions);
            const data: { results: ProviderInfo[] } = await response.json();
            console.log({ data })
            setAvailableProviders(data.results);
            //   setProviders(prefs.providers || []);
        };
        fetchData();
    }, [search]);

    useEffect(() => {
        const handleSave = async () => {
            if (providers.length > 0) {
                await account.updatePrefs({ providers });
            }
        };
        handleSave();
    }, [providers]);

    const handleCheck = (provider: number) => {
        if (providers.includes(provider)) {
            setProviders(prevProviders =>
                prevProviders.filter(p => p !== provider)
            );
        } else {
            setProviders(prevProviders => [...prevProviders, provider]);
        }
    };
    console.log({ providers })
    return (
        <>
            <div className="gap-2 flex flex-col mt-4">
                <Label className="text-sm text-center">Your Providers</Label>
                <div className="flex flex-wrap">
                {providers.map((providerId) => {
                    const provider = availableProviders?.find((p) => p.provider_id === providerId);
                    return provider ? (

                            <div
                                key={provider.provider_id}
                                onClick={() => {
                                    const isChecked = providers.includes(provider.provider_id);
                                    if (isChecked) {
                                        setProviders(prevProviders =>
                                            prevProviders.filter(p => p !== provider.provider_id)
                                        );
                                    } else {
                                        setProviders(prevProviders => [...prevProviders, provider.provider_id]);
                                    }
                                }}
                                className="flex flex-col items-center cursor-pointer mt-4"
                            >
                                <Image
                                    src={`https://image.tmdb.org/t/p/h632/${provider.logo_path}`}
                                    alt={provider.provider_name}
                                    width={50}
                                    height={50}
                                    className={`mr-2 ${providers.includes(provider.provider_id) ? '' : ''}`}
                                />
                                <span
                                    className="text-xs text-center"
                                >

                                    {provider.provider_name}
                                </span>
                            </div>
                    ) : null;
                })}
                </div>
            </div>
            <Label className="my-4">Provider Search</Label>
            <Input
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="max-w-lg"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-colssm:grid-cols-3 gap-4 mt-8">
                {availableProviders &&
                    availableProviders
                        .filter((provider) =>
                            provider.provider_name.toLowerCase().includes(search.toLowerCase())
                        )
                        .sort((a, b) => a.provider_name.localeCompare(b.provider_name))
                        .map((provider) => (
                            <div
                                key={provider.provider_id}
                                onClick={() => {
                                    const isChecked = providers.includes(provider.provider_id);
                                    if (isChecked) {
                                        setProviders(prevProviders =>
                                            prevProviders.filter(p => p !== provider.provider_id)
                                        );
                                    } else {
                                        setProviders(prevProviders => [...prevProviders, provider.provider_id]);
                                    }
                                }}
                                className="flex flex-col items-center cursor-pointer mt-4"
                            >
                                <Image
                                    src={`https://image.tmdb.org/t/p/h632/${provider.logo_path}`}
                                    alt={provider.provider_name}
                                    width={50}
                                    height={50}
                                    className={`mr-2 ${providers.includes(provider.provider_id) ? 'border-2 border-primary' : ''}`}
                                />
                                <span
                                    className="text-xs text-center"
                                >

                                    {provider.provider_name}
                                </span>
                            </div>
                        ))
                }

            </div>
        </>
    );
}



