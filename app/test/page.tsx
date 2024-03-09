async function TestPage() {

    const url = await process.env.APPWRITE_ENDPOINT_URL
    const projectId = await process.env.APPWRITE_PROJECT_ID
    return (
        <div>
            <h1>This is a test page</h1>
            <span>URL: 
                {url}
                </span>
            <p>This is the ID:
                {projectId}
            </p>
        </div>
    )
}

export default TestPage