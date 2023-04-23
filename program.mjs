import fetch from 'node-fetch';

// Fetch users data
const usersUrl = 'https://fakestoreapi.com/users';
const usersPromise = fetch(usersUrl).then(response => response.json());

// Fetch products data
const productsUrl = 'https://fakestoreapi.com/products';
const productsPromise = fetch(productsUrl).then(response => response.json());

// Fetch carts data
const cartsUrl = 'https://fakestoreapi.com/carts';
const cartsPromise = fetch(cartsUrl).then(response => response.json());

// Distance between two users
const radius = 6371;
const distancePromise = usersPromise.then(data => {
  let maxDistance = 0;
  let user1, user2;

  for (let i = 0; i < data.length - 1; i++) {
    for (let j = i + 1; j < data.length; j++) {
      const lat1 = parseFloat(data[i].address.geolocation.lat);
      const long1 = parseFloat(data[i].address.geolocation.long);
      const lat2 = parseFloat(data[j].address.geolocation.lat);
      const long2 = parseFloat(data[j].address.geolocation.long);
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLong = (long2 - long1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = radius * c;

      if (distance > maxDistance) {
        maxDistance = distance;
        user1 = data[i];
        user2 = data[j];
      }
    }
  }


  return { user1, user2, maxDistance };
});

Promise.all([distancePromise, Promise.all([usersPromise, productsPromise]), cartsPromise])
  .then(results => {
    console.log('Distance between users:', results[0]);

    const [usersData, productsData] = results[1];

    const mergedData = productsData.map(product => {
      const user = usersData.find(user => user.id === product.id % 10);
      return { ...product, ...user };
    });

    // values by category
    const categories = {};
    mergedData.forEach(product => {
      const category = product.category;
      const price = product.price;
      categories[category] = categories[category] ? categories[category] + price : price;
    });

    console.log('Total values by category:', categories);

    function getCartValue(cart, products) {
      let value = 0;
      for (const item of cart.products) {
        const product = getProductById(products, item.productId);
        value += product.price * item.quantity;
      }
      return value;
    }

    // function to get the full name of a user
    function getFullName(user) {
      return user.name.firstname + ' ' + user.name.lastname;
    }

    // function to get a product by its ID
    function getProductById(products, productId) {
      return products.find(product => product.id === productId);
    }


    let highestValue = 0;
    let highestValueCart = null;
    let highestValueCartOwner = '';

   
    for (const cart of results[2]) {
      const value = getCartValue(cart, productsData);
      if (value > highestValue) {
        highestValue = value;
        highestValueCart = cart;
      }
    }

    if (highestValueCart) {
      const owner = usersData.find(user => user.id === highestValueCart.userId);
      highestValueCartOwner = getFullName(owner);
    }

    console.log('The cart with the highest value is owned by ' + highestValueCartOwner + ' and has a value of ' + highestValue);
  })
  .catch(error => {
    console.error('An error occurred:', error);
  });
