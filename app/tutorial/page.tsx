'use client'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/hooks/User'
import { FormEventHandler, useState } from 'react'



export default function TutorialPage() {
    const user = useUser()
    // console.log(user)
    return (
        <div className='flex flex-col items-center justify-center '>
            <h1 className='text-4xl font-bold text-center mb-10'>Tutorial</h1>
            <div className="mb-10">
                <Login />
            </div>
            <div className="mb-10">

                <Signup />
            </div>
            <div className="mb-10">
                <Logout />
            </div>

        </div>
    )

}

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { login } = useUser()

    const handleLogin = async (e:any) => {
        e.preventDefault();
        await login(email, password)
    };

    return (
        <>
            <h2 className="text-2xl font-bold text-center mb-5">Login</h2><form onSubmit={handleLogin} className="w-60">
                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} />
                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} />
                <Button type="submit" className="mt-5">Login</Button>
            </form>
        </>
    )
};

const Logout = () => {
    const { logout } = useUser()

    const handleLogout = async () => {
        await logout()
    };

    return (
        <Button onClick={handleLogout}>Logout</Button>
    )
};

const GoogleLogin = () =>{
    const  { loginWithGoogle } = useUser()

    const handleLoginWithGoogle = async () => {
        await loginWithGoogle()
    };

    return (
        <Button onClick={handleLoginWithGoogle}>Login with Google</Button>
    )
}

const Signup = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')

    const { signup } = useUser()

    const handleSignup = async (e:any) => {
        e.preventDefault();
        await signup(email, password, name)
    };

    return (
        <> 
            <h2 className="text-2xl font-bold text-center mb-5">Signup</h2>
        <form onSubmit={handleSignup} className="w-60">
            <Input
                type="name"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" className='mt-5'>Login</Button>
        </form>
        </>
    )
}