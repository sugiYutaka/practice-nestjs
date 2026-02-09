import { useState } from "react";

type Product = {
  UUID: string;
  name: string;
  price: number;
  description: string;
};

function Home() {
  const [productData, setProductData] = useState<Product[]>();

  async function handleClick() {
    console.log("Button clicked");
    const response = await fetch("http://localhost:3000/products");
    const data: Product[] = await response.json();
    setProductData(data);
  }

  return (
    <>
      <h1>Home Page</h1>
      <button onClick={handleClick}>{"push"}</button>
      <div>{JSON.stringify(productData)}</div>
    </>
  );
}

export default Home;
