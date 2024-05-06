from typing import List
from decouple import Config, RepositoryEnv
from icecream import ic

from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID

from plexapi.server import PlexServer


config = Config(RepositoryEnv('../../.env'))

# Plex Config
PLEX_TOKEN = config('PLEX_TOKEN')
PLEX_SERVER = config('PLEX_SERVER_BASE_URL')

plex = PlexServer(PLEX_SERVER, PLEX_TOKEN)

# Appwrite Config
APPWRITE_PROJECT_ID = config('NEXT_PUBLIC_APPWRITE_PROJECT_ID')
APPWRITE_PLEX_COLLECTION_ID = config('NEXT_PUBLIC_APPWRITE_PLEX_COLLECTION_ID')
APPWRITE_API_KEY = config('APPWRITE_API_KEY')
APPWRITE_URL_BASE = config('NEXT_PUBLIC_APPWRITE_ENDPOINT_URL')

appwrite_client = Client()
appwrite_client.set_endpoint(APPWRITE_URL_BASE)
appwrite_client.set_project(APPWRITE_PROJECT_ID)
appwrite_client.set_key(APPWRITE_API_KEY)

databases = Databases(appwrite_client)

sections = ['Movies', 'TV Shows', 'Music Videos']

content_section_translation = {
        'Movies': 'movie',
        'TV Shows': 'tv',
        'Music Videos': 'music',
    }

def update_plex_library(plex_library: List[str], section:str = 'Movies') -> None:
    
    

    for movie in plex.library.section(section).all():

        for guid in movie.guids:
                
            if 'tmdb' in str(guid):
                tmdb_id = str(guid).split('://')[1][:-1]
                

                if tmdb_id is None or any(
                item for item in plex_library
                if item['content_type'] == content_section_translation[section]
                and item['tmdb_id'] == tmdb_id
                ):
                    ic(tmdb_id)
                    continue
                
                add_obj = {
                    'title': movie.title,
                    'tmdb_id': tmdb_id,
                    'content_type': content_section_translation[section],
                    'date_added': movie.addedAt.strftime("%Y-%m-%d")
                }
                
                
                
            
                databases.create_document(
                    'watchlist', 
                    APPWRITE_PLEX_COLLECTION_ID, 
                    ID.unique(), 
                    add_obj,
                    ['read("any")']
                    )
                
                continue


if __name__ == '__main__':
    plex_library = databases.list_documents('watchlist', APPWRITE_PLEX_COLLECTION_ID, [Query.limit(600)])
    
    plex_library_tmdb_ids = [{'tmdb_id': document['tmdb_id'],'content_type': document['content_type']} for document in plex_library['documents']]
    ic(plex_library_tmdb_ids)
    # update_plex_library(plex_library, 'Movies')
    # update_plex_library(plex_library_tmdb_ids, 'TV Shows')
    # update_plex_library(plex_library, 'TV Shows')