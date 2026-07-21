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
      <h1 className="font-display text-3xl text-ink mb-6">Editar aluno</h1>
      {aluno && <AlunoForm alunoId={id} inicial={aluno} />}
    </div>
  );
}
