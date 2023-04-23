const app = require('./program.mjs');

import { usersPromise, productsPromise, cartsPromise, getCartValue, getProductById } from './main-program.mjs';

describe('mergedData', () => {
  test('it should return the correct result', async () => {
    const expected = [
      { id: 1, title: 'Product 1', price: 10, category: 'Category 1', userId: 1, name: { firstname: 'John', lastname: 'Doe' } },
      { id: 2, title: 'Product 2', price: 20, category: 'Category 2', userId: 2, name: { firstname: 'Mary', lastname: 'Smith' } },
      { id: 3, title: 'Product 3', price: 30, category: 'Category 3', userId: 3, name: { firstname: 'Jane', lastname: 'Doe' } }
    ];

    const [usersData, productsData] = await Promise.all([usersPromise, productsPromise]);
    const actual = productsData.map(product => {
      const user = usersData.find(user => user.id === product.id % 10);
      return { ...product, ...user };
    });

    expect(actual).toEqual(expected);
  });
});

describe('Fetching products data', () => {
  it('should successfully fetch products data', async () => {
    const response = await fetch('https://fakestoreapi.com/products');
    const data = await response.json();
    expect(data).not.toBeNull();
  });
});

describe('Fetching users data', () => {
  it('should successfully fetch users data', async () => {
    const response = await fetch('https://fakestoreapi.com/users');
    const data = await response.json();
    expect(data).not.toBeNull();
  });
});

describe('Fetching carts data', () => {
  it('should successfully fetch carts data', async () => {
    const response = await fetch('https://fakestoreapi.com/carts');
    const data = await response.json();
    expect(data).not.toBeNull();
  });
});
