// artistsData.ts

export interface SpotifyTrack {
  id: string;
  name: string;
  preview_url: string | null;
  external_urls: { spotify: string };
  artists: {
    name: string;
    external_urls?: { spotify?: string };
  }[];
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  release_date: string;
  images: { url: string }[];
  external_urls: { spotify: string };
  tracks: SpotifyTrack[];
}

export const hardcodedAlbums: { [albumId: string]: SpotifyAlbum } = {
  "6PBCQ44h15c7VN35lAzu3M": {
    id: "6PBCQ44h15c7VN35lAzu3M",
    name: "jordanyear",
    release_date: "",
    images: [
      {
        url: "https://open.spotify.com/album/6PBCQ44h15c7VN35lAzu3M?si=Z1o2f-h1RxqN28fnWK_WNQ",
      },
    ],
    external_urls: {
      spotify:
        "https://open.spotify.com/album/6PBCQ44h15c7VN35lAzu3M?si=Z1o2f-h1RxqN28fnWK_WNQ",
    },
    tracks: [
      {
        id: "jt1",
        name: "neptune sent it",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/3o0u5qXdV9Ns1Xvt4fWEcM?si=f1119c538b5e49cb",
        },
        artists: [
          { name: "Xae Neptune" },
          { name: "Ahmad" },
          { name: "Macc Mota" },
        ],
      },
      {
        id: "jt2",
        name: "moonwalk",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/0ba3l20L7lOjpDzStvLebV?si=c262a0227f604eb6",
        },
        artists: [{ name: "Xae Neptune" }, { name: "iann tyler" }],
      },
      {
        id: "jt3",
        name: "son son",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/4KFwCATEivOvlDoyZ0Q89U?si=650cceee570e4bb3",
        },
        artists: [{ name: "Xae Neptune" }, { name: "Kyistt" }],
      },
      {
        id: "jt4",
        name: "infinite shots",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/26HZfrLc2ulHNE93iODXUP?si=8ad19c57d6354e50",
        },
        artists: [{ name: "Xae Neptune" }, { name: "iann tyler" }],
      },
      {
        id: "jt5",
        name: "i know",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/6oBbTgnBevnAB9mNCdjk3W?si=3dc9dd9f6ca64d3d",
        },
        artists: [{ name: "Xae Neptune" }, { name: "KING AKH" }],
      },
      {
        id: "jt6",
        name: "506am",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/0ToA0a3uAsX3HyiSKxXMVv?si=a29b71e71ee543e6",
        },
        artists: [{ name: "Xae Neptune" }],
      },
    ],
  },
  "6EnSlqoBvriUMCmfGzWY9E": {
    id: "6EnSlqoBvriUMCmfGzWY9E",
    name: "moonwalk",
    release_date: "",
    images: [
      {
        url: "https://open.spotify.com/album/6EnSlqoBvriUMCmfGzWY9E?si=qnn4yLGxR3yYHHPvraZhsQ",
      },
    ],
    external_urls: {
      spotify:
        "https://open.spotify.com/album/6EnSlqoBvriUMCmfGzWY9E?si=qnn4yLGxR3yYHHPvraZhsQ",
    },
    tracks: [
      {
        id: "mt1",
        name: "moonwalk",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/1IUGKM3Yy7zbG0BkkkDV0f?si=12e2b49f85904f3c",
        },
        artists: [{ name: "Xae Neptune" }, { name: "iann tyler" }],
      },
    ],
  },
  "55Xr7mE7Zya6ccCViy7yyh": {
    id: "55Xr7mE7Zya6ccCViy7yyh",
    name: "Social Networks",
    release_date: "",
    images: [
      {
        url: "https://open.spotify.com/album/55Xr7mE7Zya6ccCViy7yyh?si=ofibyZZPS5qa_QzDhBDvGA",
      },
    ],
    external_urls: {
      spotify:
        "https://open.spotify.com/album/55Xr7mE7Zya6ccCViy7yyh?si=ofibyZZPS5qa_QzDhBDvGA",
    },
    tracks: [
      {
        id: "sn1",
        name: "UGH!",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/6W0QKMHKMDBBstJqHmvaVM?si=933540e924f145f6",
        },
        artists: [
          { name: "Xae Neptune" },
          { name: "Connect Zero" },
          { name: "Ta3 Denzel" },
          { name: "Statik" },
        ],
      },
      {
        id: "sn2",
        name: "WHO DAT",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/3qs2LGakN3DlCUMvpsgJub?si=97b90cea43e64cf9",
        },
        artists: [
          { name: "Xae Neptune" },
          { name: "Macc Mota" },
          { name: "Djon3way" },
        ],
      },
      {
        id: "sn3",
        name: "HELLCATS TO IMPALAS",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/2vimZX5PNAEuSt0Yu2Fq5f?si=7c4bd3aefcee4a78",
        },
        artists: [{ name: "Xae Neptune" }, { name: "Meezy Trust No One" }],
      },
      {
        id: "sn4",
        name: "CORRESPONDENCE",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/4iQuO79zdSBQH1RLMBWL1J?si=807f9a02a50c4e20",
        },
        artists: [{ name: "Xae Neptune" }, { name: "Macc Mota" }],
      },
      {
        id: "sn5",
        name: "FIND YOUR LOVE",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/02BJ0Au7DbawtnCVHqVhaX?si=44666e0337464234",
        },
        artists: [{ name: "Xae Neptune" }, { name: "Ahmad" }],
      },
      {
        id: "sn6",
        name: "TOE TAG",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/6uq9XAMS27khSQHTP8p9Zi?si=49881086ee9041b6",
        },
        artists: [{ name: "Xae Neptune" }, { name: "Connect Zero" }],
      },
      {
        id: "sn7",
        name: "HOE SHIT",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/6VcHFw5Rdi9ixgbupnWIVy?si=9ef677adc59b442a",
        },
        artists: [
          { name: "Xae Neptune" },
          { name: "Meezy Trust No One" },
          { name: "Dinero Tarantino" },
        ],
      },
      {
        id: "sn8",
        name: "LOSING MY RELIGION",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/0FJLdB5QBCtgH0Xn1mliFK?si=08cd6fef1cdd4191",
        },
        artists: [{ name: "Xae Neptune" }, { name: "Connect Zero" }],
      },
      {
        id: "sn9",
        name: "STICKS & STONES",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/49CNToACIMLecw5FXE5MyH?si=f60a0630d55c451a",
        },
        artists: [
          { name: "Xae Neptune" },
          { name: "Macc Mota" },
          { name: "Djon3way" },
        ],
      },
      {
        id: "sn10",
        name: "3AM (PEACE)",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/1AnxYTrea6K3Jd8LDF9p2X?si=9e20b2f7453c45d6",
        },
        artists: [{ name: "Xae Neptune" }, { name: "Noughtie Dee" }],
      },
      {
        id: "sn11",
        name: "RECKLESS",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/4slRDMf4sNL25xBF3yvLcg?si=fff1667da2644e17",
        },
        artists: [{ name: "Xae Neptune" }, { name: "Macc Mota" }],
      },
    ],
  },
  "55fVXTVoMFsvqA0z5pVqX4": {
    id: "55fVXTVoMFsvqA0z5pVqX4",
    name: "Hoe Shit",
    release_date: "",
    images: [
      {
        url: "https://open.spotify.com/album/55fVXTVoMFsvqA0z5pVqX4?si=x2B_99IKQ_u6A7zbEI27OA",
      },
    ],
    external_urls: {
      spotify:
        "https://open.spotify.com/album/55fVXTVoMFsvqA0z5pVqX4?si=x2B_99IKQ_u6A7zbEI27OA",
    },
    tracks: [
      {
        id: "hs1",
        name: "HOE SHIT",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/1CyphlBjHsiWpLQ8enfT0t?si=d86e2a39b44b47f3",
        },
        artists: [
          { name: "Xae Neptune" },
          { name: "Meezy Trust No One" },
          { name: "Dinero Tarantino" },
        ],
      },
    ],
  },
  "3eTOv3NMyk6KfAjCIH2ZGj": {
    id: "3eTOv3NMyk6KfAjCIH2ZGj",
    name: "Sticks & Stones",
    release_date: "",
    images: [
      {
        url: "https://open.spotify.com/album/3eTOv3NMyk6KfAjCIH2ZGj?si=WYGuhqbbQaeDc1lQbHBkcg",
      },
    ],
    external_urls: {
      spotify:
        "https://open.spotify.com/album/3eTOv3NMyk6KfAjCIH2ZGj?si=WYGuhqbbQaeDc1lQbHBkcg",
    },
    tracks: [
      {
        id: "ss1",
        name: "STICKS & STONES",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/1CyphlBjHsiWpLQ8enfT0t?si=d143c2477b1f494b",
        },
        artists: [
          { name: "Xae Neptune" },
          { name: "Macc Mota" },
          { name: "Djon3way" },
        ],
      },
    ],
  },
  "4GEJsstPLNZ6fSLV91cOOo": {
    id: "4GEJsstPLNZ6fSLV91cOOo",
    name: "Losing my Religion",
    release_date: "",
    images: [
      {
        url: "https://open.spotify.com/album/4GEJsstPLNZ6fSLV91cOOo?si=jTMNodUESa-hZjNASYyy7g",
      },
    ],
    external_urls: {
      spotify:
        "https://open.spotify.com/album/4GEJsstPLNZ6fSLV91cOOo?si=jTMNodUESa-hZjNASYyy7g",
    },
    tracks: [
      {
        id: "lr1",
        name: "LOSING MY RELIGION",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/5t4oa0XNO7DDYifb3SGibS?si=abd8826dcec64071",
        },
        artists: [{ name: "Xae Neptune" }, { name: "Connect Zero" }],
      },
    ],
  },
  "0GQnthVh6eB63pvMRMdvbq": {
    id: "0GQnthVh6eB63pvMRMdvbq",
    name: "Find your Love",
    release_date: "",
    images: [
      {
        url: "https://open.spotify.com/album/0GQnthVh6eB63pvMRMdvbq?si=k6OfXV_oQ_qszhLrFBBFpg",
      },
    ],
    external_urls: {
      spotify:
        "https://open.spotify.com/album/0GQnthVh6eB63pvMRMdvbq?si=k6OfXV_oQ_qszhLrFBBFpg",
    },
    tracks: [
      {
        id: "fyl1",
        name: "FIND YOUR LOVE",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/2z0HM0M8LBmZCyiCdQphKW?si=357947203a05494a",
        },
        artists: [{ name: "Xae Neptune" }, { name: "Ahmad" }],
      },
    ],
  },
  "5uLRSI4k2mglRv53j26VpT": {
    id: "5uLRSI4k2mglRv53j26VpT",
    name: "Exotic Luv",
    release_date: "",
    images: [
      {
        url: "https://open.spotify.com/album/5uLRSI4k2mglRv53j26VpT?si=SV_Koct2QO2UA8I9UQ9qTQ",
      },
    ],
    external_urls: {
      spotify:
        "https://open.spotify.com/album/5uLRSI4k2mglRv53j26VpT?si=SV_Koct2QO2UA8I9UQ9qTQ",
    },
    tracks: [
      {
        id: "jy1",
        name: "Numb",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/1RQ3QRNsSFnylbpV2olVQK",
        },
        artists: [
          {
            name: "Jyse",
            external_urls: {
              spotify:
                "https://open.spotify.com/artist/4ihlULofncvxd3Cz7ewTNV?si=Cpwu9ihERvmYqTSYNFkftw",
            },
          },
        ],
      },
    ],
  },
  "56d63lOnDLJl2HDrbrdG3U": {
    id: "56d63lOnDLJl2HDrbrdG3U",
    name: "I Don't Mind",
    release_date: "",
    images: [
      {
        url: "https://open.spotify.com/album/56d63lOnDLJl2HDrbrdG3U?si=Pn40kpqpSlK8vimJmu_Eow",
      },
    ],
    external_urls: {
      spotify:
        "https://open.spotify.com/album/56d63lOnDLJl2HDrbrdG3U?si=Pn40kpqpSlK8vimJmu_Eow",
    },
    tracks: [
      {
        id: "kt1",
        name: "I Don't Mind",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/7uTD9STWDILHjdrhtdTOaI?si=964de60856624cf2",
        },
        artists: [
          {
            name: "Kartier",
            external_urls: {
              spotify:
                "https://open.spotify.com/artist/3uwUJ78bwdDBLo3O04xlnL?si=qfSyAQ6lTziYvwKV3fQHMw",
            },
          },
        ],
      },
    ],
  },
  "04RJRrnRBkjfZyT36dAeS5": {
    id: "04RJRrnRBkjfZyT36dAeS5",
    name: "#GodSpeed",
    release_date: "",
    images: [
      {
        url: "https://open.spotify.com/album/04RJRrnRBkjfZyT36dAeS5?si=xAGpzwk3TxSwPulAVC5sNQ",
      },
    ],
    external_urls: {
      spotify:
        "https://open.spotify.com/album/04RJRrnRBkjfZyT36dAeS5?si=xAGpzwk3TxSwPulAVC5sNQ",
    },
    tracks: [
      {
        id: "kt2",
        name: "#GodSpeed Intro",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/28BgVBZO7YeahVdlu5NCgS?si=924efee009c64826",
        },
        artists: [
          {
            name: "Kartier",
            external_urls: {
              spotify:
                "https://open.spotify.com/artist/3uwUJ78bwdDBLo3O04xlnL?si=qfSyAQ6lTziYvwKV3fQHMw",
            },
          },
        ],
      },
    ],
  },
  "257teVy7xAOfpN9OzY85Lo": {
    id: "257teVy7xAOfpN9OzY85Lo",
    name: "Pre Rolls 2",
    release_date: "",
    images: [
      {
        url: "https://open.spotify.com/album/257teVy7xAOfpN9OzY85Lo?si=Rc9YctrkTsy_IF3aPOx7PA",
      },
    ],
    external_urls: {
      spotify:
        "https://open.spotify.com/album/257teVy7xAOfpN9OzY85Lo?si=Rc9YctrkTsy_IF3aPOx7PA",
    },
    tracks: [
      {
        id: "mm1",
        name: "Reckless",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/1Lz0ojEDlA5nk61Iu8iTBk?si=4ccbaa2c8ccb4a26",
        },
        artists: [
          {
            name: "Maac Mota",
            external_urls: {
              spotify:
                "https://open.spotify.com/artist/6cPZNDrHphEZ3ok4t8K7ZT?si=vXYPCr2-QCyE2SLa5NQ3ow",
            },
          },
          {
            name: "Djon3way",
            external_urls: {
              spotify:
                "https://open.spotify.com/artist/2pZnyv4zLqnSDktBqXQlZz?si=ezCFkOoRRdmKd2k6QXHJmw",
            },
          },
          {
            name: "Macc Mota",
            external_urls: {
              spotify:
                "https://open.spotify.com/artist/6cPZNDrHphEZ3ok4t8K7ZT?si=vXYPCr2-QCyE2SLa5NQ3ow",
            },
          },
        ],
      },
      {
        id: "mm2",
        name: "Who Dat",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/49GAHUb6HJy05lBwEraFkQ?si=872fe3e1b5b74f24",
        },
        artists: [
          {
            name: "Macc Mota",
            external_urls: {
              spotify:
                "https://open.spotify.com/artist/6cPZNDrHphEZ3ok4t8K7ZT?si=vXYPCr2-QCyE2SLa5NQ3ow",
            },
          },
          {
            name: "Djon3way",
            external_urls: {
              spotify:
                "https://open.spotify.com/artist/2pZnyv4zLqnSDktBqXQlZz?si=ezCFkOoRRdmKd2k6QXHJmw",
            },
          },
        ],
      },
    ],
  },
  "0djUyeQEWuCWhz1VWRLkFe": {
    id: "0djUyeQEWuCWhz1VWRLkFe",
    name: "Where The Sidewalk Ends...",
    release_date: "",
    images: [
      {
        url: "https://open.spotify.com/album/0djUyeQEWuCWhz1VWRLkFe?si=TDVOOiSCQRKw59lm1EQaxw",
      },
    ],
    external_urls: {
      spotify:
        "https://open.spotify.com/album/0djUyeQEWuCWhz1VWRLkFe?si=TDVOOiSCQRKw59lm1EQaxw",
    },
    tracks: [
      {
        id: "cz1",
        name: "Couch",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/5AnA35tPJABP1nOwfgFpRa?si=c19ebbab6c5a4031",
        },
        artists: [{ name: "Connect Zero" }, { name: "Siméon" }],
      },
      {
        id: "cz2",
        name: "Wanna Go?",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/07VTkzWhlDWsez5v0P2XOu?si=7514579587d649eb",
        },
        artists: [{ name: "Connect Zero" }, { name: "Siméon" }],
      },
      {
        id: "cz3",
        name: "Weight Lifts",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/3kTnKR1n37eEIT98Gi6HIv?si=e3836dfdc45b4298",
        },
        artists: [{ name: "Connect Zero" }, { name: "Siméon" }],
      },
      {
        id: "cz4",
        name: "A Place With No Name",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/59Wka7E62XfDvyaCFbo0sF?si=5f3a536348f444ff",
        },
        artists: [{ name: "Connect Zero" }, { name: "Siméon" }],
      },
      {
        id: "cz5",
        name: "Right Now",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/4sBl7ujYc8khlhLMuiYlHc?si=5906c2b6ab4241f6",
        },
        artists: [{ name: "Connect Zero" }, { name: "Siméon" }],
      },
      {
        id: "cz6",
        name: "Unicorn",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/1PpwpItwkfdtJuudffkYdH?si=33188d54470c42d3",
        },
        artists: [{ name: "Connect Zero" }, { name: "Siméon" }],
      },
      {
        id: "cz7",
        name: "No.1",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/3403QceK9ZgdybYneBJMBz?si=d0dfe0d2ae714f81",
        },
        artists: [{ name: "Connect Zero" }, { name: "Siméon" }],
      },
      {
        id: "cz8",
        name: "Body I Occupy",
        preview_url: null,
        external_urls: {
          spotify:
            "https://open.spotify.com/track/3MxAwuwgxDXHr7nji85tPi?si=b68d9efb774f44f3",
        },
        artists: [{ name: "Connect Zero" }, { name: "Siméon" }],
      },
    ],
  },
};
