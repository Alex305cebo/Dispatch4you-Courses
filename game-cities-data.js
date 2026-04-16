// Координаты городов США для игры Dispatch Office
// Источник: OpenStreetMap / официальные данные Census Bureau
// Городов: 77
// Дата: 2026-04-16

const CITIES_DATA = {
  "Chicago": [
    -87.6298,
    41.8781
  ],
  "Houston": [
    -95.3698,
    29.7604
  ],
  "Dallas": [
    -96.797,
    32.7767
  ],
  "Atlanta": [
    -84.388,
    33.749
  ],
  "Los Angeles": [
    -118.2437,
    34.0522
  ],
  "New York": [
    -74.006,
    40.7128
  ],
  "Miami": [
    -80.1918,
    25.7617
  ],
  "Denver": [
    -104.9903,
    39.7392
  ],
  "Seattle": [
    -122.3321,
    47.6062
  ],
  "Phoenix": [
    -112.074,
    33.4484
  ],
  "Las Vegas": [
    -115.1398,
    36.1699
  ],
  "Salt Lake City": [
    -111.891,
    40.7608
  ],
  "Kansas City": [
    -94.5786,
    39.0997
  ],
  "Minneapolis": [
    -93.265,
    44.9778
  ],
  "Nashville": [
    -86.7816,
    36.1627
  ],
  "Memphis": [
    -90.049,
    35.1495
  ],
  "Charlotte": [
    -80.8431,
    35.2271
  ],
  "Indianapolis": [
    -86.1581,
    39.7684
  ],
  "Columbus": [
    -82.9988,
    39.9612
  ],
  "Detroit": [
    -83.0458,
    42.3314
  ],
  "Philadelphia": [
    -75.1652,
    39.9526
  ],
  "Boston": [
    -71.0589,
    42.3601
  ],
  "St. Louis": [
    -90.1994,
    38.627
  ],
  "New Orleans": [
    -90.0715,
    29.9511
  ],
  "San Francisco": [
    -122.4194,
    37.7749
  ],
  "Portland": [
    -122.675,
    45.5051
  ],
  "Jacksonville": [
    -81.6557,
    30.3322
  ],
  "Louisville": [
    -85.7585,
    38.2527
  ],
  "Cincinnati": [
    -84.512,
    39.1031
  ],
  "Pittsburgh": [
    -79.9959,
    40.4406
  ],
  "Baltimore": [
    -76.6122,
    39.2904
  ],
  "Albuquerque": [
    -106.6504,
    35.0844
  ],
  "El Paso": [
    -106.485,
    31.7619
  ],
  "San Antonio": [
    -98.4936,
    29.4241
  ],
  "Oklahoma City": [
    -97.5164,
    35.4676
  ],
  "Omaha": [
    -95.9345,
    41.2565
  ],
  "Tulsa": [
    -95.9928,
    36.154
  ],
  "Boise": [
    -116.2023,
    43.615
  ],
  "Spokane": [
    -117.426,
    47.6588
  ],
  "Savannah": [
    -81.0998,
    32.0835
  ],
  "Raleigh": [
    -78.6382,
    35.7796
  ],
  "Richmond": [
    -77.436,
    37.5407
  ],
  "Norfolk": [
    -76.2859,
    36.8508
  ],
  "Cleveland": [
    -81.6944,
    41.4993
  ],
  "Milwaukee": [
    -87.9065,
    43.0389
  ],
  "Des Moines": [
    -93.625,
    41.5868
  ],
  "Wichita": [
    -97.3301,
    37.6872
  ],
  "Lubbock": [
    -101.8552,
    33.5779
  ],
  "Amarillo": [
    -101.8313,
    35.222
  ],
  "Fresno": [
    -119.7871,
    36.7378
  ],
  "Sacramento": [
    -121.4944,
    38.5816
  ],
  "San Diego": [
    -117.1611,
    32.7157
  ],
  "Tucson": [
    -110.9747,
    32.2226
  ],
  "Colorado Springs": [
    -104.8214,
    38.8339
  ],
  "Billings": [
    -108.5007,
    45.7833
  ],
  "Fargo": [
    -96.7898,
    46.8772
  ],
  "Sioux Falls": [
    -96.7311,
    43.5446
  ],
  "Green Bay": [
    -88.0133,
    44.5133
  ],
  "Knoxville": [
    -83.9207,
    35.9606
  ],
  "Birmingham": [
    -86.8104,
    33.5186
  ],
  "Little Rock": [
    -92.2896,
    34.7465
  ],
  "Baton Rouge": [
    -91.1871,
    30.4515
  ],
  "Corpus Christi": [
    -97.3964,
    27.8006
  ],
  "Austin": [
    -97.7431,
    30.2672
  ],
  "Fort Worth": [
    -97.3308,
    32.7555
  ],
  "Laredo": [
    -99.4803,
    27.5306
  ],
  "Chattanooga": [
    -85.3097,
    35.0456
  ],
  "Madison": [
    -89.4012,
    43.0731
  ],
  "Reno": [
    -119.8138,
    39.5296
  ],
  "Shreveport": [
    -93.7502,
    32.5252
  ],
  "Jackson": [
    -90.1848,
    32.2988
  ],
  "Mobile": [
    -88.0399,
    30.6954
  ],
  "Montgomery": [
    -86.3,
    32.3668
  ],
  "Buffalo": [
    -78.8784,
    42.8864
  ],
  "Rochester": [
    -77.6088,
    43.1566
  ],
  "Hartford": [
    -72.6851,
    41.7658
  ],
  "Providence": [
    -71.4128,
    41.824
  ]
};

const CITY_STATE_DATA = {
  "Chicago": "IL",
  "Houston": "TX",
  "Dallas": "TX",
  "Atlanta": "GA",
  "Los Angeles": "CA",
  "New York": "NY",
  "Miami": "FL",
  "Denver": "CO",
  "Seattle": "WA",
  "Phoenix": "AZ",
  "Las Vegas": "NV",
  "Salt Lake City": "UT",
  "Kansas City": "MO",
  "Minneapolis": "MN",
  "Nashville": "TN",
  "Memphis": "TN",
  "Charlotte": "NC",
  "Indianapolis": "IN",
  "Columbus": "OH",
  "Detroit": "MI",
  "Philadelphia": "PA",
  "Boston": "MA",
  "St. Louis": "MO",
  "New Orleans": "LA",
  "San Francisco": "CA",
  "Portland": "OR",
  "Jacksonville": "FL",
  "Louisville": "KY",
  "Cincinnati": "OH",
  "Pittsburgh": "PA",
  "Baltimore": "MD",
  "Albuquerque": "NM",
  "El Paso": "TX",
  "San Antonio": "TX",
  "Oklahoma City": "OK",
  "Omaha": "NE",
  "Tulsa": "OK",
  "Boise": "ID",
  "Spokane": "WA",
  "Savannah": "GA",
  "Raleigh": "NC",
  "Richmond": "VA",
  "Norfolk": "VA",
  "Cleveland": "OH",
  "Milwaukee": "WI",
  "Des Moines": "IA",
  "Wichita": "KS",
  "Lubbock": "TX",
  "Amarillo": "TX",
  "Fresno": "CA",
  "Sacramento": "CA",
  "San Diego": "CA",
  "Tucson": "AZ",
  "Colorado Springs": "CO",
  "Billings": "MT",
  "Fargo": "ND",
  "Sioux Falls": "SD",
  "Green Bay": "WI",
  "Knoxville": "TN",
  "Birmingham": "AL",
  "Little Rock": "AR",
  "Baton Rouge": "LA",
  "Corpus Christi": "TX",
  "Austin": "TX",
  "Fort Worth": "TX",
  "Laredo": "TX",
  "Chattanooga": "TN",
  "Madison": "WI",
  "Reno": "NV",
  "Shreveport": "LA",
  "Jackson": "MS",
  "Mobile": "AL",
  "Montgomery": "AL",
  "Buffalo": "NY",
  "Rochester": "NY",
  "Hartford": "CT",
  "Providence": "RI"
};

if (typeof window !== 'undefined') {
  window.CITIES_DATA = CITIES_DATA;
  window.CITY_STATE_DATA = CITY_STATE_DATA;
}
