import { account,  } from "@/lib/appwrite";
import { tmdbFetchOptions } from "@/lib/tmdb";
import { useState, useEffect } from "react";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

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
      const response = await fetch(`https://api.themoviedb.org/3/watch/providers/movie?language=en-US&watch_region=US&query=${search}`, tmdbFetchOptions);
      const data: { results: ProviderInfo[] } = await response.json();
      console.log({data})
      setAvailableProviders(data.results);
      setProviders(prefs.providers || []);
    };
    fetchData();
  }, [search]);

  useEffect(() => {
    const handleSave = async () => {
      await account.updatePrefs({ providers });
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
  console.log({providers})
  return (
    <>
    <div>
      {providers.map((providerId) => {
        const provider = availableProviders?.find((p) => p.provider_id === providerId);
        return provider ? <div key={providerId}>{provider.provider_name}</div> : null;
      })}
      </div>
      <Input value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="flex flex-col gap-2">
      {availableProviders &&
        availableProviders
        .filter((provider) =>
            provider.provider_name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.provider_name.localeCompare(b.provider_name))
    .map((provider) => (
        <Label key={provider.provider_id}>
            {/* <Image
                src */}
              <Checkbox
                onCheckedChange={() => handleCheck(provider.provider_id)}
                checked={providers.includes(provider.provider_id)}
              />
              {provider.provider_name}
            </Label>
          ))}
      </div>
  
  </>
  );
}



