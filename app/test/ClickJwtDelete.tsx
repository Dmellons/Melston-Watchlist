'use client'

import { Button } from "@/components/ui/button"
import { account } from "@/lib/appwrite"
import { useState } from "react"

const ClickJwtDelete = ({
   
}: {
   
}) => {

    const [jwtState, setJwtState] = useState('')


    async function handleClick() {
        // e.preventDefault()
        const user = await account.get()
        console.log(user.$id)

        fetch(`http://localhost:3000/api/jwt/delete`, {
            method: 'POST',
            body: JSON.stringify(user.$id),
            headers: { 'Content-Type': 'application/json' }
        })
        
    }
    return (
        <div className="  ">

            <Button
                className="bg-red-500 hover:bg-red-600"
                onClick={() => handleClick()}
            >Delete Cookie</Button>
            <p>{jwtState}</p>
        </div>
    )
}



export default ClickJwtDelete