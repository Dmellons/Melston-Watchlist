'use client'
import PlexRequestsBlock from "@/components/PlexRequestsBlock";
import ProvidersBlock from "@/components/ProvidersBlock";
import ProvidersSelect from "@/components/ProvidersSelect";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/hooks/User";
import Image from "next/image";
import { useEffect, useState } from "react";

const ProfilePage = () => {
  const { user } = useUser();
  const [isTester, setIsTester] = useState(undefined);

  const handleToggleTester = () => {
    setIsTester(!isTester);
  };

  useEffect(() => {
    if (user) {
      const labels = user.labels || [];
      if (labels.includes('tester')) {
        setIsTester(true);
      } else {
        setIsTester(false);
      }
      console.log(labels.includes('tester'));
      
    }
  }, [user]);


  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
      {user && (
        <div>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Admin: {user.admin ? "Yes" : "No"}</p>
          <ProvidersSelect />
          <div className="flex items-center space-x-2">

          <Label htmlFor="tester">Tester: </Label>
          <Switch id="tester" value={isTester}/>
          </div>
          <h2 className="text-md">Labels:</h2>
          <div className="border flex  gap-2 p-2 border-gray-200 rounded-lg">
            {user.labels?.map(label => (
              <Badge key={label}>{label}</Badge>
            ))}
          </div>
          {
            user.image && (
              <Image className="rounded-full" src={user.image} alt={user.name} width="100" height="100" />
            )
          }
        </div>
      )} {!user && <p>No user found</p>}

      {user && user.admin && (
        <PlexRequestsBlock />
      )}
    </div>
  );
};

export default ProfilePage;
