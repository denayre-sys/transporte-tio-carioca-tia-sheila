"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AlunoForm from "@/components/AlunoForm";

export default function EditarAlunoPage() {
  const { id } = useParams<{ id: string }>();
  const [aluno, setAluno] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/alunos/${id}`)
      .then((r) => r.json())
      .then(setAluno);
  }, [id]);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="font-display text-3xl text-ink">Editar aluno</h1>
        <a
          href={`/alunos/${id}/contrato`}
          className="px-4 py-2 text-sm border border-line rounded-lg bg-white hover:bg-mist"
        >
          Gerar contrato
        </a>
      </div>
      {aluno && <AlunoForm alunoId={id} inicial={aluno} />}
    </div>
  );
}
