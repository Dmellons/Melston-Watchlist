'use client'

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// import { useRouter } from 'next/router';

export default function BackButton() {


  return (
    <Button className="pl-0" asChild variant="link" type="button">
      <Link href={'/'} >
        <ArrowLeft className="h-4 w-4"/> Go Back
      </Link>
    </Button>
  );
}