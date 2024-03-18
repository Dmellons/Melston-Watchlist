'use client'
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/User";
import Image from "next/image";

const ProfilePage = () => {
  const { user } = useUser();


  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
      {user && (
        <div>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Admin: {user.admin ? "Yes" : "No"}</p>
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
    </div>
  );
};

export default ProfilePage;
