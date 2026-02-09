function Home() {
  function handleClick() {
    console.log("Button clicked");
  }
  return (
    <>
      <h1>Home Page</h1>
      <button onClick={handleClick}>push</button>
    </>
  );
}

export default Home;
