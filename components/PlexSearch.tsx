interface PlexLibraryProps {

}

const PlexLibrary = ({
    tmdb_type
}: {
    tmdb_type?: string
}) => {

    const tmdbLibraryTranslation = {
        'movie': '1',
        'music': '2',
        'tv': '3',
    }

    const plex_library = tmdbLibraryTranslation.movie || '1'
    const data = fetch(`http://192.168.0.5:32400/library/sections/${plex_library}/`,{
    'Accept': 'application/json',   
    'X-Plex-Token':process.env.NEXT_PUBLIC_PLEX_TOKEN
    })
        .then(res =>res.text())
    console.log(data)
    return (
        <>
            <div>PlexLibrary</div>
            {data.map((item: any) => (
                <p key={item.key}>{item.title}</p>
            ))}
        </>
    );
}

export default PlexLibrary;