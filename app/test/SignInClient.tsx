'use client'

import { Button } from "@/components/ui/button"
import { client, account } from "@/lib/appwrite"
import { Account } from "appwrite"


const handleSignin = async () => {
    console.log('Clicked')
    // const account = new Account(client)
    const session = await account.getSession('current')
    console.log({account})
    console.log({session})
}

const handleLog = async () => {
    console.log('Clicked')
    // const account = new Account(client)

    const jwt = await account.createJWT()
    console.log({jwt})
    const url = `http://localhost:3000/api/jwt?jwt=${jwt.jwt}`

    console.log({url})

    const rest = await fetch(url)

    console.log({rest})
    const session = await account.getSession('current')
    // console.log({account})
    console.log({session})
}

const SignInClient = () => {
    return (
        <div>
            <Button
                onClick={() => handleLog()}
                // onClick={() => handleSignin()}
            >Log me</Button>
        </div>
    )
}

export default SignInClient