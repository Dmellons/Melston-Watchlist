import { Client, Account } from 'appwrite';

export const client = new Client();

// client
//     .setEndpoint('https://data.davidmellons.com/v1')
//     .setProject('65e64772e9ce2110c6ee');

const endpoint: string = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL as string
const projectId: string = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string
client
    .setEndpoint(endpoint)
    .setProject(projectId);
// client
//     .setEndpoint(process.env.APPWRITE_ENDPOINT_URL as string)
//     .setProject(process.env.APPWRITE_PROJECT_ID as string);

export const account = new Account(client);
export { ID } from 'appwrite';
