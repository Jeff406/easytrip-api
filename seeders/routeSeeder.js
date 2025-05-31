const mongoose = require('mongoose');
const Route = require('../models/Route');

// Ho Chi Minh City locations with coordinates
const locations = {
  district1: {
    benThanhMarket: {
      address: "Ben Thanh Market, District 1",
      lat: 10.7720,
      lng: 106.6983
    },
    notredameCathedral: {
      address: "Notre Dame Cathedral, District 1",
      lat: 10.7797,
      lng: 106.6992
    },
    independencePalace: {
      address: "Independence Palace, District 1",
      lat: 10.7770,
      lng: 106.6954
    },
    saigonCentralPostOffice: {
      address: "Saigon Central Post Office, District 1",
      lat: 10.7799,
      lng: 106.6996
    },
    buiVienStreet: {
      address: "Bui Vien Street, District 1",
      lat: 10.7677,
      lng: 106.6934
    }
  },
  district2: {
    thaoDien: {
      address: "Thao Dien, District 2",
      lat: 10.8027,
      lng: 106.7344
    },
    crescentMall: {
      address: "Crescent Mall, District 2",
      lat: 10.7297,
      lng: 106.7179
    }
  },
  district3: {
    warRemnantsMuseum: {
      address: "War Remnants Museum, District 3",
      lat: 10.7793,
      lng: 106.6928
    },
    vinhNghiemPagoda: {
      address: "Vinh Nghiem Pagoda, District 3",
      lat: 10.7833,
      lng: 106.6889
    }
  },
  district4: {
    saigonPort: {
      address: "Saigon Port, District 4",
      lat: 10.7667,
      lng: 106.7056
    }
  },
  district5: {
    chinatown: {
      address: "Chinatown (Cho Lon), District 5",
      lat: 10.7520,
      lng: 106.6620
    },
    binhTayMarket: {
      address: "Binh Tay Market, District 5",
      lat: 10.7520,
      lng: 106.6620
    }
  },
  district7: {
    phuMyHung: {
      address: "Phu My Hung, District 7",
      lat: 10.7320,
      lng: 106.7210
    },
    scVivoCity: {
      address: "SC VivoCity, District 7",
      lat: 10.7297,
      lng: 106.7179
    }
  },
  district10: {
    hoaHungStation: {
      address: "Hoa Hung Station, District 10",
      lat: 10.7720,
      lng: 106.6680
    }
  },
  district11: {
    damSenPark: {
      address: "Dam Sen Park, District 11",
      lat: 10.7370,
      lng: 106.6420
    }
  },
  thuDuc: {
    landmark81: {
      address: "Landmark 81, Thu Duc City",
      lat: 10.7947,
      lng: 106.7219
    },
    vincomLandmark81: {
      address: "Vincom Landmark 81, Thu Duc City",
      lat: 10.7947,
      lng: 106.7219
    }
  }
};

// Helper function to create a route line between two points
const createRouteLine = (from, to) => {
  return {
    type: 'LineString',
    coordinates: [
      [from.lng, from.lat],
      [to.lng, to.lat]
    ]
  };
};

// Helper function to create a date with specific hour and minute
const createDate = (hour, minute) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
};

// Helper function to get random transport mode
const getRandomTransportMode = () => {
  return Math.random() > 0.5 ? 'car' : 'scooter';
};

const routes = [
  // Original 5 routes
  {
    driverId: 'driver1',
    from: locations.district1.benThanhMarket,
    to: locations.district2.thaoDien,
    routeLine: createRouteLine(locations.district1.benThanhMarket, locations.district2.thaoDien),
    departureTime: createDate(8, 0),
    transportMode: 'car'
  },
  {
    driverId: 'driver2',
    from: locations.district1.notredameCathedral,
    to: locations.district7.phuMyHung,
    routeLine: createRouteLine(locations.district1.notredameCathedral, locations.district7.phuMyHung),
    departureTime: createDate(9, 30),
    transportMode: 'car'
  },
  {
    driverId: 'driver3',
    from: locations.district1.independencePalace,
    to: locations.district3.warRemnantsMuseum,
    routeLine: createRouteLine(locations.district1.independencePalace, locations.district3.warRemnantsMuseum),
    departureTime: createDate(10, 15),
    transportMode: 'scooter'
  },
  {
    driverId: 'driver4',
    from: locations.district2.thaoDien,
    to: locations.district1.benThanhMarket,
    routeLine: createRouteLine(locations.district2.thaoDien, locations.district1.benThanhMarket),
    departureTime: createDate(11, 0),
    transportMode: 'scooter'
  },
  {
    driverId: 'driver5',
    from: locations.district7.phuMyHung,
    to: locations.district1.notredameCathedral,
    routeLine: createRouteLine(locations.district7.phuMyHung, locations.district1.notredameCathedral),
    departureTime: createDate(13, 30),
    transportMode: 'car'
  },
  // 20 new routes
  {
    driverId: 'driver6',
    from: locations.district1.saigonCentralPostOffice,
    to: locations.district5.chinatown,
    routeLine: createRouteLine(locations.district1.saigonCentralPostOffice, locations.district5.chinatown),
    departureTime: createDate(7, 30),
    transportMode: getRandomTransportMode()
  },
  {
    driverId: 'driver7',
    from: locations.district1.buiVienStreet,
    to: locations.district2.crescentMall,
    routeLine: createRouteLine(locations.district1.buiVienStreet, locations.district2.crescentMall),
    departureTime: createDate(8, 45),
    transportMode: getRandomTransportMode()
  },
  {
    driverId: 'driver8',
    from: locations.district3.vinhNghiemPagoda,
    to: locations.district7.scVivoCity,
    routeLine: createRouteLine(locations.district3.vinhNghiemPagoda, locations.district7.scVivoCity),
    departureTime: createDate(9, 15),
    transportMode: getRandomTransportMode()
  },
  {
    driverId: 'driver9',
    from: locations.district4.saigonPort,
    to: locations.district10.hoaHungStation,
    routeLine: createRouteLine(locations.district4.saigonPort, locations.district10.hoaHungStation),
    departureTime: createDate(10, 0),
    transportMode: getRandomTransportMode()
  },
  {
    driverId: 'driver10',
    from: locations.district5.binhTayMarket,
    to: locations.district11.damSenPark,
    routeLine: createRouteLine(locations.district5.binhTayMarket, locations.district11.damSenPark),
    departureTime: createDate(10, 45),
    transportMode: getRandomTransportMode()
  },
  {
    driverId: 'driver11',
    from: locations.thuDuc.landmark81,
    to: locations.district1.benThanhMarket,
    routeLine: createRouteLine(locations.thuDuc.landmark81, locations.district1.benThanhMarket),
    departureTime: createDate(11, 30),
    transportMode: getRandomTransportMode()
  },
  {
    driverId: 'driver12',
    from: locations.thuDuc.vincomLandmark81,
    to: locations.district2.thaoDien,
    routeLine: createRouteLine(locations.thuDuc.vincomLandmark81, locations.district2.thaoDien),
    departureTime: createDate(12, 15),
    transportMode: getRandomTransportMode()
  },
  {
    driverId: 'driver13',
    from: locations.district1.notredameCathedral,
    to: locations.district5.binhTayMarket,
    routeLine: createRouteLine(locations.district1.notredameCathedral, locations.district5.binhTayMarket),
    departureTime: createDate(13, 0),
    transportMode: getRandomTransportMode()
  },
  {
    driverId: 'driver14',
    from: locations.district2.crescentMall,
    to: locations.district7.phuMyHung,
    routeLine: createRouteLine(locations.district2.crescentMall, locations.district7.phuMyHung),
    departureTime: createDate(13, 45),
    transportMode: getRandomTransportMode()
  },
  {
    driverId: 'driver15',
    from: locations.district3.warRemnantsMuseum,
    to: locations.district10.hoaHungStation,
    routeLine: createRouteLine(locations.district3.warRemnantsMuseum, locations.district10.hoaHungStation),
    departureTime: createDate(14, 30),
    transportMode: getRandomTransportMode()
  },
  {
    driverId: 'driver16',
    from: locations.district4.saigonPort,
    to: locations.district11.damSenPark,
    routeLine: createRouteLine(locations.district4.saigonPort, locations.district11.damSenPark),
    departureTime: createDate(15, 15),
    transportMode: getRandomTransportMode()
  },
  {
    driverId: 'driver17',
    from: locations.district5.chinatown,
    to: locations.thuDuc.landmark81,
    routeLine: createRouteLine(locations.district5.chinatown, locations.thuDuc.landmark81),
    departureTime: createDate(16, 0),
    transportMode: getRandomTransportMode()
  },
  {
    driverId: 'driver18',
    from: locations.district7.scVivoCity,
    to: locations.district1.buiVienStreet,
    routeLine: createRouteLine(locations.district7.scVivoCity, locations.district1.buiVienStreet),
    departureTime: createDate(16, 45),
    transportMode: getRandomTransportMode()
  },
  {
    driverId: 'driver19',
    from: locations.district10.hoaHungStation,
    to: locations.district2.crescentMall,
    routeLine: createRouteLine(locations.district10.hoaHungStation, locations.district2.crescentMall),
    departureTime: createDate(17, 30),
    transportMode: getRandomTransportMode()
  },
  {
    driverId: 'driver20',
    from: locations.district11.damSenPark,
    to: locations.district3.vinhNghiemPagoda,
    routeLine: createRouteLine(locations.district11.damSenPark, locations.district3.vinhNghiemPagoda),
    departureTime: createDate(18, 15),
    transportMode: getRandomTransportMode()
  },
  {
    driverId: 'driver21',
    from: locations.thuDuc.vincomLandmark81,
    to: locations.district4.saigonPort,
    routeLine: createRouteLine(locations.thuDuc.vincomLandmark81, locations.district4.saigonPort),
    departureTime: createDate(19, 0),
    transportMode: getRandomTransportMode()
  },
  {
    driverId: 'driver22',
    from: locations.district1.saigonCentralPostOffice,
    to: locations.district7.scVivoCity,
    routeLine: createRouteLine(locations.district1.saigonCentralPostOffice, locations.district7.scVivoCity),
    departureTime: createDate(19, 45),
    transportMode: getRandomTransportMode()
  },
  {
    driverId: 'driver23',
    from: locations.district2.thaoDien,
    to: locations.district5.chinatown,
    routeLine: createRouteLine(locations.district2.thaoDien, locations.district5.chinatown),
    departureTime: createDate(20, 30),
    transportMode: getRandomTransportMode()
  },
  {
    driverId: 'driver24',
    from: locations.district3.warRemnantsMuseum,
    to: locations.thuDuc.landmark81,
    routeLine: createRouteLine(locations.district3.warRemnantsMuseum, locations.thuDuc.landmark81),
    departureTime: createDate(21, 15),
    transportMode: getRandomTransportMode()
  },
  {
    driverId: 'driver25',
    from: locations.district4.saigonPort,
    to: locations.district1.benThanhMarket,
    routeLine: createRouteLine(locations.district4.saigonPort, locations.district1.benThanhMarket),
    departureTime: createDate(22, 0),
    transportMode: getRandomTransportMode()
  }
];

const seedRoutes = async () => {
  try {
    // Clear existing routes
    await Route.deleteMany({});
    console.log('Cleared existing routes');

    // Insert new routes
    await Route.insertMany(routes);
    console.log('Successfully seeded routes');

    // Create indexes for geospatial queries
    await Route.collection.createIndex({ routeLine: '2dsphere' });
    console.log('Created geospatial index');

  } catch (error) {
    console.error('Error seeding routes:', error);
  }
};

module.exports = seedRoutes; 