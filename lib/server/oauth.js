// src/lib/server/oauth.js
"use server";

import { createAdminClient } from "@/lib/server/appwriteServer";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { OAuthProvider } from "node-appwrite";

export async function signInWithGoogle() {
	const { account } = await createAdminClient();

  const origin = headers().get("origin");
  console.log(origin)
  
	const redirectUrl = await account.createOAuth2Token(
		OAuthProvider.Google,
		`${origin}/api/oauth`,
		`${origin}/test`,
	);

	return redirect(redirectUrl);
};
