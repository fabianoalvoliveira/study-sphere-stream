import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: student } = await supabase
        .from("students")
        .select("nome")
        .eq("id", session.user.id)
        .single();

      if (student?.nome) {
        setUserName(student.nome);
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Bem-vindo, {userName}!</h2>
        <p className="text-muted-foreground">Escolha por onde começar</p>
      </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 border rounded-lg bg-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/jornadas")}>
            <h2 className="text-xl font-semibold mb-2">Jornadas</h2>
            <p className="text-muted-foreground">Explore suas jornadas de aprendizado</p>
          </div>

          <div className="p-6 border rounded-lg bg-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/cursos")}>
            <h2 className="text-xl font-semibold mb-2">Cursos</h2>
            <p className="text-muted-foreground">Acesse seus cursos disponíveis</p>
          </div>

          <div className="p-6 border rounded-lg bg-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/provas")}>
            <h2 className="text-xl font-semibold mb-2">Provas</h2>
            <p className="text-muted-foreground">Faça avaliações e testes</p>
          </div>

          <div className="p-6 border rounded-lg bg-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/competencias")}>
            <h2 className="text-xl font-semibold mb-2">Competências</h2>
            <p className="text-muted-foreground">Desenvolva suas competências</p>
          </div>
      </div>
    </div>
  );
}
