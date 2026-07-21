"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function GraficoAdimplencia({
  adimplentes,
  inadimplentes,
}: {
  adimplentes: number;
  inadimplentes: number;
}) {
  const dados = [
    { nome: "Adimplentes", valor: adimplentes || 0.0001 },
    { nome: "Inadimplentes", valor: inadimplentes },
  ];

  return (
    <div className="h-52 w-full min-w-0 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={dados} dataKey="valor" nameKey="nome" innerRadius={40} outerRadius={65}>
            <Cell fill="#3F5A45" />
            <Cell fill="#C7703A" />
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
