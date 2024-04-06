export const tmdbFetchOptions = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_READ_ACCESS_TOKEN}`, 
    }
  };

  export type StreamingInfo = {
    logo_path: string;
    provider_id: number;
    provider_name: string;
    display_priority: number;
  }
  
  export type CountryInfo = {
    link: string;
    flatrate?: StreamingInfo[];
    buy?: StreamingInfo[];
    ads?: StreamingInfo[];
    free?: StreamingInfo[];
    // Add additional arrays as needed based on data inspection
  }
  
  export type Results = {
    [key: string]: CountryInfo[];
  }
  
  export type ProvidersApiCall = {
    id: number;
    results: Results;
  }
  

  const data = {
        "id": 75219,
        "results": {
            "AD": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=AD",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 7
                    }
                ]
            },
            "AL": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=AL",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 7
                    }
                ]
            },
            "AR": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=AR",
                "flatrate": [
                    {
                        "logo_path": "/cv5S44vHpNoGj7wby6390AyhEkH.jpg",
                        "provider_id": 619,
                        "provider_name": "Star Plus",
                        "display_priority": 4
                    }
                ]
            },
            "AT": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=AT",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 2
                    }
                ],
                "buy": [
                    {
                        "logo_path": "/seGSXajazLMCKGB5hnRCidtjay1.jpg",
                        "provider_id": 10,
                        "provider_name": "Amazon Video",
                        "display_priority": 3
                    },
                    {
                        "logo_path": "/8z7rC8uIDaTM91X0ZfkRf04ydj2.jpg",
                        "provider_id": 3,
                        "provider_name": "Google Play Movies",
                        "display_priority": 7
                    },
                    {
                        "logo_path": "/9lFSDdj10l7QAXyTZPDWuwkKJT3.jpg",
                        "provider_id": 20,
                        "provider_name": "maxdome Store",
                        "display_priority": 14
                    }
                ]
            },
            "AU": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=AU",
                "ads": [
                    {
                        "logo_path": "/uU4gqmoX0koF8L5yJSlfaaFd9Tz.jpg",
                        "provider_id": 246,
                        "provider_name": "7plus",
                        "display_priority": 19
                    }
                ],
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 0
                    }
                ],
                "buy": [
                    {
                        "logo_path": "/9ghgSC0MA082EL6HLCW3GalykFD.jpg",
                        "provider_id": 2,
                        "provider_name": "Apple TV",
                        "display_priority": 10
                    },
                    {
                        "logo_path": "/5vfrJQgNe9UnHVgVNAwZTy0Jo9o.jpg",
                        "provider_id": 68,
                        "provider_name": "Microsoft Store",
                        "display_priority": 18
                    },
                    {
                        "logo_path": "/9B7l9ZSos54kFrZbliVExt2z9C9.jpg",
                        "provider_id": 436,
                        "provider_name": "Fetch TV",
                        "display_priority": 34
                    }
                ]
            },
            "BA": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=BA",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 7
                    }
                ]
            },
            "BE": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=BE",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 0
                    }
                ]
            },
            "BG": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=BG",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 18
                    }
                ]
            },
            "BO": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=BO",
                "flatrate": [
                    {
                        "logo_path": "/cv5S44vHpNoGj7wby6390AyhEkH.jpg",
                        "provider_id": 619,
                        "provider_name": "Star Plus",
                        "display_priority": 4
                    }
                ]
            },
            "BR": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=BR",
                "flatrate": [
                    {
                        "logo_path": "/cv5S44vHpNoGj7wby6390AyhEkH.jpg",
                        "provider_id": 619,
                        "provider_name": "Star Plus",
                        "display_priority": 3
                    }
                ]
            },
            "CA": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=CA",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 1
                    },
                    {
                        "logo_path": "/djTJ7pAkIhmPaN3eTA6wTUrphNG.jpg",
                        "provider_id": 606,
                        "provider_name": "StackTV Amazon Channel",
                        "display_priority": 79
                    },
                    {
                        "logo_path": "/rugttVJKzDAwVbM99gAV6i3g59Q.jpg",
                        "provider_id": 257,
                        "provider_name": "fuboTV",
                        "display_priority": 97
                    }
                ],
                "ads": [
                    {
                        "logo_path": "/o2qiZykonJuLglxwBbtUbHu4wIO.jpg",
                        "provider_id": 449,
                        "provider_name": "Global TV",
                        "display_priority": 46
                    }
                ],
                "buy": [
                    {
                        "logo_path": "/9ghgSC0MA082EL6HLCW3GalykFD.jpg",
                        "provider_id": 2,
                        "provider_name": "Apple TV",
                        "display_priority": 6
                    }
                ]
            },
            "CH": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=CH",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 2
                    }
                ],
                "buy": [
                    {
                        "logo_path": "/8z7rC8uIDaTM91X0ZfkRf04ydj2.jpg",
                        "provider_id": 3,
                        "provider_name": "Google Play Movies",
                        "display_priority": 5
                    }
                ]
            },
            "CL": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=CL",
                "flatrate": [
                    {
                        "logo_path": "/cv5S44vHpNoGj7wby6390AyhEkH.jpg",
                        "provider_id": 619,
                        "provider_name": "Star Plus",
                        "display_priority": 9
                    }
                ]
            },
            "CO": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=CO",
                "flatrate": [
                    {
                        "logo_path": "/cv5S44vHpNoGj7wby6390AyhEkH.jpg",
                        "provider_id": 619,
                        "provider_name": "Star Plus",
                        "display_priority": 8
                    }
                ]
            },
            "CR": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=CR",
                "flatrate": [
                    {
                        "logo_path": "/cv5S44vHpNoGj7wby6390AyhEkH.jpg",
                        "provider_id": 619,
                        "provider_name": "Star Plus",
                        "display_priority": 7
                    }
                ]
            },
            "CZ": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=CZ",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 0
                    }
                ]
            },
            "DE": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=DE",
                "buy": [
                    {
                        "logo_path": "/9ghgSC0MA082EL6HLCW3GalykFD.jpg",
                        "provider_id": 2,
                        "provider_name": "Apple TV",
                        "display_priority": 4
                    },
                    {
                        "logo_path": "/seGSXajazLMCKGB5hnRCidtjay1.jpg",
                        "provider_id": 10,
                        "provider_name": "Amazon Video",
                        "display_priority": 8
                    },
                    {
                        "logo_path": "/9lFSDdj10l7QAXyTZPDWuwkKJT3.jpg",
                        "provider_id": 20,
                        "provider_name": "maxdome Store",
                        "display_priority": 18
                    },
                    {
                        "logo_path": "/lrEigPPAhggq02q53uM8vdWAIUX.jpg",
                        "provider_id": 178,
                        "provider_name": "MagentaTV",
                        "display_priority": 25
                    },
                    {
                        "logo_path": "/5vfrJQgNe9UnHVgVNAwZTy0Jo9o.jpg",
                        "provider_id": 68,
                        "provider_name": "Microsoft Store",
                        "display_priority": 32
                    },
                    {
                        "logo_path": "/dKh2TJ9lTWV0UIcDQGMnMyQ8AIN.jpg",
                        "provider_id": 1993,
                        "provider_name": "Videoload",
                        "display_priority": 156
                    }
                ],
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 2
                    }
                ]
            },
            "DK": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=DK",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 0
                    }
                ]
            },
            "DO": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=DO",
                "flatrate": [
                    {
                        "logo_path": "/cv5S44vHpNoGj7wby6390AyhEkH.jpg",
                        "provider_id": 619,
                        "provider_name": "Star Plus",
                        "display_priority": 30
                    }
                ]
            },
            "EC": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=EC",
                "flatrate": [
                    {
                        "logo_path": "/cv5S44vHpNoGj7wby6390AyhEkH.jpg",
                        "provider_id": 619,
                        "provider_name": "Star Plus",
                        "display_priority": 7
                    }
                ]
            },
            "EE": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=EE",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 23
                    }
                ]
            },
            "EG": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=EG",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 49
                    }
                ]
            },
            "ES": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=ES",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 0
                    },
                    {
                        "logo_path": "/7K6rVbpWXB6ByDI0PRzGGRXRBSY.jpg",
                        "provider_id": 149,
                        "provider_name": "Movistar Plus",
                        "display_priority": 12
                    }
                ]
            },
            "FI": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=FI",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 0
                    }
                ]
            },
            "FR": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=FR",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 0
                    }
                ],
                "buy": [
                    {
                        "logo_path": "/9ghgSC0MA082EL6HLCW3GalykFD.jpg",
                        "provider_id": 2,
                        "provider_name": "Apple TV",
                        "display_priority": 4
                    },
                    {
                        "logo_path": "/5vfrJQgNe9UnHVgVNAwZTy0Jo9o.jpg",
                        "provider_id": 68,
                        "provider_name": "Microsoft Store",
                        "display_priority": 15
                    }
                ]
            },
            "GB": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=GB",
                "buy": [
                    {
                        "logo_path": "/9ghgSC0MA082EL6HLCW3GalykFD.jpg",
                        "provider_id": 2,
                        "provider_name": "Apple TV",
                        "display_priority": 4
                    },
                    {
                        "logo_path": "/seGSXajazLMCKGB5hnRCidtjay1.jpg",
                        "provider_id": 10,
                        "provider_name": "Amazon Video",
                        "display_priority": 6
                    },
                    {
                        "logo_path": "/6AKbY2ayaEuH4zKg2prqoVQ9iaY.jpg",
                        "provider_id": 130,
                        "provider_name": "Sky Store",
                        "display_priority": 16
                    },
                    {
                        "logo_path": "/5vfrJQgNe9UnHVgVNAwZTy0Jo9o.jpg",
                        "provider_id": 68,
                        "provider_name": "Microsoft Store",
                        "display_priority": 17
                    }
                ],
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 1
                    }
                ]
            },
            "GR": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=GR",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 20
                    }
                ]
            },
            "GT": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=GT",
                "flatrate": [
                    {
                        "logo_path": "/cv5S44vHpNoGj7wby6390AyhEkH.jpg",
                        "provider_id": 619,
                        "provider_name": "Star Plus",
                        "display_priority": 6
                    }
                ]
            },
            "HK": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=HK",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 36
                    }
                ]
            },
            "HN": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=HN",
                "flatrate": [
                    {
                        "logo_path": "/cv5S44vHpNoGj7wby6390AyhEkH.jpg",
                        "provider_id": 619,
                        "provider_name": "Star Plus",
                        "display_priority": 5
                    }
                ]
            },
            "HR": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=HR",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 37
                    }
                ]
            },
            "HU": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=HU",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 0
                    }
                ]
            },
            "ID": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=ID",
                "flatrate": [
                    {
                        "logo_path": "/zdTSUEVZFXp3E0EkOMGN99QPVJp.jpg",
                        "provider_id": 122,
                        "provider_name": "Hotstar",
                        "display_priority": 2
                    }
                ]
            },
            "IE": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=IE",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 2
                    }
                ],
                "buy": [
                    {
                        "logo_path": "/6AKbY2ayaEuH4zKg2prqoVQ9iaY.jpg",
                        "provider_id": 130,
                        "provider_name": "Sky Store",
                        "display_priority": 9
                    }
                ]
            },
            "IN": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=IN",
                "flatrate": [
                    {
                        "logo_path": "/zdTSUEVZFXp3E0EkOMGN99QPVJp.jpg",
                        "provider_id": 122,
                        "provider_name": "Hotstar",
                        "display_priority": 5
                    }
                ]
            },
            "IS": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=IS",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 1
                    }
                ]
            },
            "IT": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=IT",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 0
                    }
                ]
            },
            "JP": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=JP",
                "rent": [
                    {
                        "logo_path": "/seGSXajazLMCKGB5hnRCidtjay1.jpg",
                        "provider_id": 10,
                        "provider_name": "Amazon Video",
                        "display_priority": 5
                    }
                ],
                "buy": [
                    {
                        "logo_path": "/seGSXajazLMCKGB5hnRCidtjay1.jpg",
                        "provider_id": 10,
                        "provider_name": "Amazon Video",
                        "display_priority": 5
                    },
                    {
                        "logo_path": "/8z7rC8uIDaTM91X0ZfkRf04ydj2.jpg",
                        "provider_id": 3,
                        "provider_name": "Google Play Movies",
                        "display_priority": 8
                    }
                ],
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 2
                    }
                ]
            },
            "KR": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=KR",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 2
                    }
                ]
            },
            "LI": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=LI",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 29
                    }
                ]
            },
            "LT": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=LT",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 24
                    }
                ]
            },
            "LU": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=LU",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 3
                    }
                ]
            },
            "LV": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=LV",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 23
                    }
                ]
            },
            "ME": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=ME",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 1
                    }
                ]
            },
            "MK": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=MK",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 7
                    }
                ]
            },
            "MT": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=MT",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 7
                    }
                ]
            },
            "MX": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=MX",
                "flatrate": [
                    {
                        "logo_path": "/cv5S44vHpNoGj7wby6390AyhEkH.jpg",
                        "provider_id": 619,
                        "provider_name": "Star Plus",
                        "display_priority": 3
                    },
                    {
                        "logo_path": "/tRNA2CRgA4XHvd7Mx9dH3sFtDVb.jpg",
                        "provider_id": 339,
                        "provider_name": "MovistarTV",
                        "display_priority": 22
                    }
                ]
            },
            "MY": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=MY",
                "flatrate": [
                    {
                        "logo_path": "/zdTSUEVZFXp3E0EkOMGN99QPVJp.jpg",
                        "provider_id": 122,
                        "provider_name": "Hotstar",
                        "display_priority": 0
                    }
                ]
            },
            "NI": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=NI",
                "flatrate": [
                    {
                        "logo_path": "/cv5S44vHpNoGj7wby6390AyhEkH.jpg",
                        "provider_id": 619,
                        "provider_name": "Star Plus",
                        "display_priority": 15
                    }
                ]
            },
            "NL": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=NL",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 2
                    }
                ]
            },
            "NO": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=NO",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 0
                    }
                ]
            },
            "NZ": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=NZ",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 0
                    }
                ],
                "ads": [
                    {
                        "logo_path": "/vcsLhyNRm528LzfVqQJDddusP27.jpg",
                        "provider_id": 440,
                        "provider_name": "ThreeNow",
                        "display_priority": 19
                    }
                ]
            },
            "PA": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=PA",
                "flatrate": [
                    {
                        "logo_path": "/cv5S44vHpNoGj7wby6390AyhEkH.jpg",
                        "provider_id": 619,
                        "provider_name": "Star Plus",
                        "display_priority": 34
                    }
                ]
            },
            "PE": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=PE",
                "flatrate": [
                    {
                        "logo_path": "/cv5S44vHpNoGj7wby6390AyhEkH.jpg",
                        "provider_id": 619,
                        "provider_name": "Star Plus",
                        "display_priority": 4
                    }
                ]
            },
            "PH": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=PH",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 31
                    }
                ]
            },
            "PL": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=PL",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 0
                    }
                ]
            },
            "PT": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=PT",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 0
                    }
                ]
            },
            "PY": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=PY",
                "flatrate": [
                    {
                        "logo_path": "/cv5S44vHpNoGj7wby6390AyhEkH.jpg",
                        "provider_id": 619,
                        "provider_name": "Star Plus",
                        "display_priority": 5
                    }
                ]
            },
            "RO": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=RO",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 0
                    }
                ]
            },
            "RS": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=RS",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 7
                    }
                ]
            },
            "SE": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=SE",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 0
                    },
                    {
                        "logo_path": "/jy4yvY3szonb0p6rtMXvF5stuX9.jpg",
                        "provider_id": 497,
                        "provider_name": "Tele2 Play",
                        "display_priority": 25
                    }
                ]
            },
            "SG": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=SG",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 2
                    }
                ]
            },
            "SI": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=SI",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 7
                    }
                ]
            },
            "SK": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=SK",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 0
                    }
                ]
            },
            "SM": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=SM",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 29
                    }
                ]
            },
            "SV": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=SV",
                "flatrate": [
                    {
                        "logo_path": "/cv5S44vHpNoGj7wby6390AyhEkH.jpg",
                        "provider_id": 619,
                        "provider_name": "Star Plus",
                        "display_priority": 32
                    }
                ]
            },
            "TH": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=TH",
                "flatrate": [
                    {
                        "logo_path": "/zdTSUEVZFXp3E0EkOMGN99QPVJp.jpg",
                        "provider_id": 122,
                        "provider_name": "Hotstar",
                        "display_priority": 0
                    }
                ]
            },
            "TR": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=TR",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 9
                    }
                ]
            },
            "TW": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=TW",
                "flatrate": [
                    {
                        "logo_path": "/97yvRBw1GzX7fXprcF80er19ot.jpg",
                        "provider_id": 337,
                        "provider_name": "Disney Plus",
                        "display_priority": 2
                    }
                ]
            },
            "US": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=US",
                "free": [
                    {
                        "logo_path": "/aAb9CUHjFe9Y3O57qnrJH0KOF1B.jpg",
                        "provider_id": 486,
                        "provider_name": "Spectrum On Demand",
                        "display_priority": 159
                    }
                ],
                "buy": [
                    {
                        "logo_path": "/9ghgSC0MA082EL6HLCW3GalykFD.jpg",
                        "provider_id": 2,
                        "provider_name": "Apple TV",
                        "display_priority": 4
                    },
                    {
                        "logo_path": "/seGSXajazLMCKGB5hnRCidtjay1.jpg",
                        "provider_id": 10,
                        "provider_name": "Amazon Video",
                        "display_priority": 16
                    },
                    {
                        "logo_path": "/nVzxU8EPk0aXqQkBZniVA2kat1I.jpg",
                        "provider_id": 7,
                        "provider_name": "Vudu",
                        "display_priority": 43
                    }
                ],
                "flatrate": [
                    {
                        "logo_path": "/bxBlRPEPpMVDc4jMhSrTf2339DW.jpg",
                        "provider_id": 15,
                        "provider_name": "Hulu",
                        "display_priority": 6
                    },
                    {
                        "logo_path": "/rugttVJKzDAwVbM99gAV6i3g59Q.jpg",
                        "provider_id": 257,
                        "provider_name": "fuboTV",
                        "display_priority": 8
                    },
                    {
                        "logo_path": "/6hFf3sIdmXSAczy3i6tLSmy6gwK.jpg",
                        "provider_id": 79,
                        "provider_name": "NBC",
                        "display_priority": 62
                    },
                    {
                        "logo_path": "/A95qgiMz6ulV2SxeKcJ5Gc9pqGS.jpg",
                        "provider_id": 322,
                        "provider_name": "USA Network",
                        "display_priority": 120
                    }
                ]
            },
            "UY": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=UY",
                "flatrate": [
                    {
                        "logo_path": "/cv5S44vHpNoGj7wby6390AyhEkH.jpg",
                        "provider_id": 619,
                        "provider_name": "Star Plus",
                        "display_priority": 2
                    }
                ]
            },
            "VE": {
                "link": "https://www.themoviedb.org/tv/75219-9-1-1/watch?locale=VE",
                "flatrate": [
                    {
                        "logo_path": "/cv5S44vHpNoGj7wby6390AyhEkH.jpg",
                        "provider_id": 619,
                        "provider_name": "Star Plus",
                        "display_priority": 6
                    }
                ]
            }
        }
    }

function main() {
    console.log(JSON.stringify(data.results.US, null, 2))
}
main()