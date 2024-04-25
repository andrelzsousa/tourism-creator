"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState } from "react";
import { parse } from 'json2csv';

export default function Home() {
  const genAI = new GoogleGenerativeAI("AIzaSyBLw9MApnkP7toZDg90OhEEIKUjU_wBOys");
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const [search, setSearch] = useState('');
  const [response, setResponse] = useState('');
    const [places, setPlaces] = useState<any[]>([]);
  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
  }

  const [loading, setLoading] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [progress, setProgress] = useState(0);

  const downloadCsv = () => {
    const fields = ['nome', 'bairro', 'avaliacao', 'tipo', 'faixapreco'];
    const csv = parse(places, { fields });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'places.csv';
    a.click();
    URL.revokeObjectURL(url);
};

  async function aiRun() {
    setLoading(true);
    const repeat = "novamente, mas com outros locais e na mesma ordem (nome, bairro, avaliacao, tipo, faixapreco)"
    for (let i = 0; i < 10; i++) {
      const prompt = `Me indique locais de acordo
       para visitar em recife (restaurantes, bares, shoppings, casas de show, museus,
       entretenimento e qualquer outra opção de turismo (Nao precisa separar por categoria,
       pode enviar todos juntos)). Me retorne isso num formato csv (use apenas "," e "\n", nao use "|"), com as colunas: nome, bairro, avaliacao, tipo, faixapreco (opções: $, $$, $$$, $$$$, $$$$$)  ${i >=1 ? repeat : ""}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/[*]/g, "");
      const csv = text.split('\n');
      
      // console.log(csv)
      const array = csv.slice(1, csv.length-1).map((item) => {

        let separator = "";

        if (item.includes(',')) {
          separator = ',';
        } else if (item.includes(';')) {
          separator = ';';
        } else if (item.includes('-')) {
          separator = '-';
        } else if (item.includes('|')) {
          separator = '|';
        } else {
          console.error('Separator not found');
          return;
        }

        const [nome, bairro, avaliacao, tipo, faixapreco] = item.split(separator);
        return { nome, bairro, avaliacao, tipo, faixapreco };
      });


      setPlaces((prev) => [...prev, ...array]);
      setResponse((prev) => prev + text);
      setProgress((prev) => prev + 10);
    }
    setLoading(false);
    setCanDownload(true);
  }
  
  // button event trigger to consume gemini Api

  const width = `w-[${112/progress}px]`;
  console.log(width);

  const handleClick = () => {
    aiRun();
  }
  console.log(places);

  return (
    <div className="p-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-6">
          <button  className="bg-gray-200 border border-black px-2 py-1" onClick={() => handleClick()}>Buscar entreneimento</button>
          {loading && (
          <div>
            {/* <div className="w-28 h-5 border rounded-lg">
              <div className={`width w-fit bg-green-500 transition-all h-4`}></div>
            </div> */}
            <progress value={progress/100} />
          </div>
          )}
        </div>
        <div className="h-40 w-[600px] border p-2 overflow-y-auto break-all">
          <p>{response}</p>
        </div>
        <button onClick={downloadCsv} disabled={!canDownload} className="bg-gray-200 border px-2 py-1 border-black disabled:cursor-not-allowed disabled:opacity-50 w-fit">Baixar CSV</button>
      </div>
    </div>
  );
}
