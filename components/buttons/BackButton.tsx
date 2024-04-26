
'use client'
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({
  className = ""
}: {
  className?: string
}) => {
  const router = useRouter();

  return (
    <Button
      variant={"link"}
      onClick={() => router.back()}
      className={className}
      // className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
      >
    <ArrowLeft className="h-4 w-4 mr-2 text-primary" />
      Go Back
    </Button>
  );
};

export default BackButton;