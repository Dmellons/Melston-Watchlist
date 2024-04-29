'use client'

import { Button } from "@/components/ui/button"
import { account } from "@/lib/appwrite"
import { useState } from "react"

const ClickJwt = ({
   
}: {
   
}) => {

    const [jwtState, setJwtState] = useState('')


    async function handleClick() {
        // e.preventDefault()
        const jwt = await account.createJWT()
        console.log(jwt)

        fetch(`http://localhost:3000/api/jwt/set`, {
            method: 'POST',
            body: JSON.stringify(jwt),
            headers: { 'Content-Type': 'application/json' }
        })
        setJwtState(jwt?.jwt)
        // .then(res => res.json())
        // .then(data => console.log(data))
    }

    return (
        <div className="  ">

            <Button
                className="bg-green-500 hover:bg-green-600"
                onClick={() => handleClick()}
            >Click to log</Button>
            <p>{jwtState}</p>
        </div>
    )
}



export default ClickJwt