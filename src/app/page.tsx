"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState } from "react";

export default function Home() {
  const genAI = new GoogleGenerativeAI("AIzaSyBLw9MApnkP7toZDg90OhEEIKUjU_wBOys");
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const [search, setSearch] = useState('');
  const [response, setResponse] = useState('');
  
  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
  }

  async function aiRun() {
    const prompt = `${search}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    setResponse(text);
  }
  
  // button event trigger to consume gemini Api
  
  const handleClick = () => {
    aiRun();
  }

  return (
    <div>
      <input placeholder='Search using Generative AI' onChange={(e) => handleChangeSearch(e)} />
      <button style={{ marginLeft: '20px' }} onClick={() => handleClick()}>Search</button>
    <p>{response}</p>
    </div>
  );
}
