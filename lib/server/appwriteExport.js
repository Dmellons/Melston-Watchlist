const { Client, Databases } = require('node-appwrite'); // Use node-appwrite for server-side
const fs = require('fs').promises;

// Load environment variables from .env file at relative path
require('dotenv').config({ path: '../../.env' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY); // This should work with node-appwrite

const databases = new Databases(client);

async function exportSchema() {
    // Add debugging to verify env vars are loaded
    console.log('Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL);
    console.log('Project ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    console.log('API Key exists:', !!process.env.APPWRITE_API_KEY);

    try {
        const schemaExport = {
            timestamp: new Date().toISOString(),
            databases: []
        };

        const databasesList = await databases.list();

        for (const database of databasesList.databases) {
            const dbSchema = {
                id: database.$id,
                name: database.name,
                collections: []
            };

            const collections = await databases.listCollections(database.$id);
            
            for (const collection of collections.collections) {
                const attributes = await databases.listAttributes(database.$id, collection.$id);
                const indexes = await databases.listIndexes(database.$id, collection.$id);
                
                dbSchema.collections.push({
                    id: collection.$id,
                    name: collection.name,
                    attributes: attributes.attributes,
                    indexes: indexes.indexes,
                    documentSecurity: collection.documentSecurity,
                    enabled: collection.enabled
                });
            }

            schemaExport.databases.push(dbSchema);
        }

        // Save to file
        await fs.writeFile('appwrite-schema.json', JSON.stringify(schemaExport, null, 2));
        console.log('Schema exported to appwrite-schema.json');

    } catch (error) {
        console.error('Error exporting schema:', error);
    }
}

exportSchema();