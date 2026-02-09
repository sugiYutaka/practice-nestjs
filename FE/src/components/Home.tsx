import { useState } from "react";

type Product = {
  UUID: string;
  name: string;
  price: number;
  description: string;
};
type Cart = {
  product: Product;
  quantity: number;
};

function Home() {
  const [productData, setProductData] = useState<Product[]>();
  const [cartData, setCartData] = useState<Cart[]>();

  async function handleClick() {
    if (productData) {
      const body = [{ UUID: productData[0].UUID, quantity: 1 }];
      const response = await fetch("http://localhost:3000/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data: Cart[] = await response.json();
      setCartData(data);
    } else {
      const response = await fetch("http://localhost:3000/products");
      const data: Product[] = await response.json();
      setProductData(data);
    }
  }

  return (
    <>
      <h1>Home Page</h1>
      <button onClick={handleClick}>{"push"}</button>
      <div>{JSON.stringify(productData)}</div>
      <div>{JSON.stringify(cartData)}</div>
    </>
  );
}

export default Home;
