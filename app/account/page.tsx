import { redirect } from "next/navigation";

// Account settings live on the profile page; keep a single source of truth.
export default function AccountPage() {
    redirect('/profile');
}
