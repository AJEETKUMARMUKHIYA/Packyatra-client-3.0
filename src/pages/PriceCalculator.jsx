import React, { useState } from "react";
import AxiosClient from "../AxiosClient";
const PriceCalculator = () => {
  const [distance, setDistance] = useState("");
  const [cftIndex, setCftIndex] = useState("");
  const [price, setPrice] = useState(null);
 

  const getPrice = async () => {
    try {
      // const response = await fetch("http://localhost:5000/api/price/get-price", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ distance: Number(distance), cftIndex: Number(cftIndex) })
      // });

        const response = await AxiosClient.post("/price/get-price", {
       
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ distance: Number(distance), cftIndex: Number(cftIndex) })
      });
      const data = await response.json();
      if (response.ok) {
        setPrice(data.price);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error fetching price:", error);
    }
  };

  return (
    <div>
      <h2>Price Calculator</h2>
      <input type="number" placeholder="Distance" value={distance} onChange={(e) => setDistance(e.target.value)} />
      <input type="number" placeholder="CFT Index (1-17)" value={cftIndex} onChange={(e) => setCftIndex(e.target.value)} />
      <button onClick={getPrice}>Get Price</button>
      {price !== null && <h3>Price: {price}</h3>}
    </div>
  );
};

export default PriceCalculator;
