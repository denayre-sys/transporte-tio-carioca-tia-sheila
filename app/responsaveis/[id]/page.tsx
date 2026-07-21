"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ResponsavelForm from "@/components/ResponsavelForm";

export default function EditarResponsavelPage() {
  const { id } = useParams<{ id: string }>();
  const [responsavel, setResponsavel] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/responsaveis/${id}`)
      .then((r) => r.json())
      .then(setResponsavel);
  }, [id]);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-6">Editar responsável</h1>
      {responsavel && <ResponsavelForm id={id} inicial={responsavel} />}
    </div>
  );
}
