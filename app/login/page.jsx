"use client";
import { useState } from "react";
import { account, ID } from "@/lib/appwrite";
import { useUser } from "@/hooks/User"
import {OAuthProvider} from 'appwrite'
import { Button } from "@/components/ui/button";


const LoginPage = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const {login, logout, signup} = useUser




  // const login = async (email, password) => {
  //   // const session = await account.createEmailPasswordSession(email, password);
  //   const session = await account.createSession(email, password);
  //   setLoggedInUser(await account.get());
  // };
  
  // const logout = async () => {
  //   await account.deleteSession("current");
  //   setLoggedInUser(null);
  // };
  // const signup = async () => {
  //   await account.create(ID.unique(), email, password, name);
  //   login(email, password);
  // };

  const googleLogin = async () => {
    const session = await account.createOAuth2Session(OAuthProvider.Google,"http://localhost:3000/login", 'http://www.google.com')
    console.log('Session: ', session)
    setLoggedInUser(await account.get())
  }


  if (loggedInUser) {
    return (
      <div>
        <p>Logged in as {loggedInUser.name}</p>
        <button type="button" onClick={logout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-items-center m-10">
      <p>Not logged in</p>
      <form>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {/* <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        /> */}
        <button type="button" onClick={() => login(email, password)}>
          Login
        </button>
        <button type="button" onClick={signup}>
          Register
        </button>
        <Button
          type="button"
          onClick={googleLogin}
          >Login with Google</Button>
      </form>
    </div>
  );
};

export default LoginPage;
