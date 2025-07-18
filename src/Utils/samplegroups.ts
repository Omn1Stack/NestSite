import { photoType } from "@/types/photosType";

 export const groups = [
    {
        id: 1,
        name: "Beach Adventures",
        photoCount: 10,
        theme: "beach"
    },
    {
        id: 2,
        name: "Mountain Hiking",
        photoCount: 10,
        theme: "mountain"
    },
    {
        id: 3,
        name: "City Life",
        photoCount: 10,
        theme: "city"
    },
    {
        id: 4,
        name: "Forest Camping",
        photoCount: 10,
        theme: "forest"
    },
    {
        id: 5,
        name: "Desert Exploration",
        photoCount: 10,
        theme: "desert"
    }];

export const photos: photoType[] = [
  // Beach Adventures (Group 1)
  { id: "1-1", groupId: 1, Imageurl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop", alt: "Beach sunset" },
  { id: "1-2", groupId: 1, Imageurl: "https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=600&h=400&fit=crop", alt: "Ocean waves" },
  { id: "1-3", groupId: 1, Imageurl: "https://images.unsplash.com/photo-1516815231560-8f41ec531527?w=600&h=400&fit=crop", alt: "Palm trees" },
  { id: "1-4", groupId: 1, Imageurl: "https://images.unsplash.com/photo-1525183995014-bd94c0750cd5?w=600&h=400&fit=crop", alt: "Sand and shells" },
  { id: "1-5", groupId: 1, Imageurl: "https://images.unsplash.com/photo-1532635241-17e820acc59f?w=600&h=400&fit=crop", alt: "Sunbathing" },
  { id: "1-6", groupId: 1, Imageurl: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&h=400&fit=crop", alt: "Surfing" },
  { id: "1-7", groupId: 1, Imageurl: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&h=400&fit=crop", alt: "Tropical beach" },
  { id: "1-8", groupId: 1, Imageurl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop", alt: "Beach resort" },
  { id: "1-9", groupId: 1, Imageurl: "https://images.unsplash.com/photo-1577744486925-2c44aea382c4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c2Vhc2hlbGx8ZW58MHx8MHx8fDA%3D", alt: "Seashell" },
  { id: "1-10", groupId: 1, Imageurl: "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=600&h=400&fit=crop", alt: "Beach sunset" },

  // Mountain Hiking (Group 2)
  { id: "2-1", groupId: 2, Imageurl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop", alt: "Mountain" },
  { id: "2-2", groupId: 2, Imageurl: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop", alt: "Hiking" },
  { id: "2-3", groupId: 2, Imageurl: "https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=600&h=400&fit=crop", alt: "Alps" },
  { id: "2-4", groupId: 2, Imageurl: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=600&h=400&fit=crop", alt: "Camping" },
  { id: "2-5", groupId: 2, Imageurl: "https://images.unsplash.com/photo-1494472155656-f34e81b17ddc?q=80&w=1976&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Waterfall" },
  { id: "2-6", groupId: 2, Imageurl: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&h=400&fit=crop", alt: "Rock climbing" },
  { id: "2-7", groupId: 2, Imageurl: "https://images.unsplash.com/photo-1591687095105-571080d07dd6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8c25vdyUyMG1vdW50YWlufGVufDB8fDB8fHww", alt: "Snow mountain" },
  { id: "2-8", groupId: 2, Imageurl: "https://images.unsplash.com/photo-1536048810607-3dc7f86981cb?w=600&h=400&fit=crop", alt: "Valley" },
  { id: "2-9", groupId: 2, Imageurl: "https://images.unsplash.com/photo-1502472584811-0a2f2feb8968?w=600&h=400&fit=crop", alt: "Mountain lake" },
  { id: "2-10", groupId: 2, Imageurl: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=600&h=400&fit=crop", alt: "Summit" },

  // City Life (Group 3)
  { id: "3-1", groupId: 3, Imageurl: "https://images.unsplash.com/photo-1581441379020-247e49a30452?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Skyscraper" },
  { id: "3-2", groupId: 3, Imageurl: "https://images.unsplash.com/photo-1679212839469-fb16a48919ce?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Night city" },
  { id: "3-3", groupId: 3, Imageurl: "https://images.unsplash.com/photo-1556695736-d287caebc48e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Metro" },
  { id: "3-4", groupId: 3, Imageurl: "https://images.unsplash.com/photo-1568736333610-eae6e0ab9206?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Bridge" },
  { id: "3-5", groupId: 3, Imageurl: "https://images.unsplash.com/photo-1628947733273-cdae71c9bfd3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Taxi" },
  { id: "3-6", groupId: 3, Imageurl: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Neon" },
  { id: "3-7", groupId: 3, Imageurl: "https://images.unsplash.com/photo-1523395555535-a43123287dbc?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Subway" },
  { id: "3-8", groupId: 3, Imageurl: "https://images.unsplash.com/photo-1572402123736-c79526db405a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Market" },
  { id: "3-9", groupId: 3, Imageurl: "https://images.unsplash.com/photo-1527576539890-dfa815648363?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Architecture" },
  { id: "3-10", groupId: 3, Imageurl: "https://images.unsplash.com/photo-1556117153-018ccae45fbd?q=80&w=1970&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "City park" },

  // Forest Camping (Group 4)
  { id: "4-1", groupId: 4, Imageurl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=600&h=400&fit=crop", alt: "Forest" },
  { id: "4-2", groupId: 4, Imageurl: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?q=80&w=1905&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Campfire" },
  { id: "4-3", groupId: 4, Imageurl: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&h=400&fit=crop", alt: "Tent" },
  { id: "4-4", groupId: 4, Imageurl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&h=400&fit=crop", alt: "Wilderness" },
  { id: "4-5", groupId: 4, Imageurl: "https://images.unsplash.com/photo-1482189349482-3defd547e0e9?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "River" },
  { id: "4-6", groupId: 4, Imageurl: "https://images.unsplash.com/photo-1621960531176-9e4894d9adf8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aGlraW5nJTIwdHJhaWx8ZW58MHx8MHx8fDI%3D", alt: "Hiking trail" },
  { id: "4-7", groupId: 4, Imageurl: "https://images.unsplash.com/photo-1484406566174-9da000fda645?w=600&h=400&fit=crop", alt: "Wildlife" },
  { id: "4-8", groupId: 4, Imageurl: "https://images.unsplash.com/photo-1541233349642-6e425fe6190e?w=600&h=400&fit=crop", alt: "Foggy forest" },
  { id: "4-9", groupId: 4, Imageurl: "https://images.unsplash.com/photo-1630696867805-74d6880c5dec?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9zc3xlbnwwfHwwfHx8Mg%3D%3D", alt: "Moss" },
  { id: "4-10", groupId: 4, Imageurl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop", alt: "Forest path" },

  // Desert Exploration (Group 5)
  { id: "5-1", groupId: 5, Imageurl: "https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Desert" },
  { id: "5-2", groupId: 5, Imageurl: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&h=400&fit=crop", alt: "Sand dunes" },
  { id: "5-3", groupId: 5, Imageurl: "https://images.unsplash.com/photo-1512620230221-c041ac15d906?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Y2FjdHVzfGVufDB8fDB8fHwy", alt: "Cactus" },
  { id: "5-4", groupId: 5, Imageurl: "https://images.unsplash.com/photo-1527736848781-72dc3b2ee00f?q=80&w=2017&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Oasis" },
  { id: "5-5", groupId: 5, Imageurl: "https://images.unsplash.com/photo-1529111290557-82f6d5c6cf85?w=600&h=400&fit=crop", alt: "Camels" },
  { id: "5-6", groupId: 5, Imageurl: "https://images.unsplash.com/photo-1613574726650-d1ab2eea296a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", alt: "Mesa" },
  { id: "5-7", groupId: 5, Imageurl: "https://images.unsplash.com/photo-1645074902670-1bb62fd4519e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHNhbmQlMjBzdG9ybXxlbnwwfHwwfHx8Mg%3D%3D", alt: "Sandstorm" },
  { id: "5-8", groupId: 5, Imageurl: "https://images.unsplash.com/photo-1536746803623-cef87080bfc8?w=600&h=400&fit=crop", alt: "Star gazing" },
  { id: "5-9", groupId: 5, Imageurl: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=600&h=400&fit=crop", alt: "Canyon" },
  { id: "5-10", groupId: 5, Imageurl: "https://images.unsplash.com/photo-1534329539061-64caeb388c42?w=600&h=400&fit=crop", alt: "Desert sunset" }
];