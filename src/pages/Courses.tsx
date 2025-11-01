import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseCard } from "@/components/courses/CourseCard";
import { toast } from "sonner";

interface Course {
  id: string;
  nome: string;
  descricao: string | null;
  nivel: string | null;
  duration: number;
  primeira_aula: string | null;
  cover: string | null;
  logo_empresa: string | null;
  ativo: boolean;
}

interface StudentCourse {
  id: string;
  aluno_id: string;
  curso_id: string;
  title: string | null;
  progresso_aluno: number;
  tempo_estudo: number;
  salvar_favorito: boolean;
  courses: Course;
}

const Courses = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [studentCourses, setStudentCourses] = useState<StudentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("descobrir");
  const navigate = useNavigate();
  const tabsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session) {
      fetchCourses();
      fetchStudentCourses();
    }
  }, [session]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("ativo", true)
        .order("nome");

      if (error) throw error;
      setAllCourses(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar cursos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("student_courses")
        .select(`
          *,
          courses (*)
        `)
        .eq("aluno_id", session?.user.id);

      if (error) throw error;
      setStudentCourses(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar seus cursos");
      console.error(error);
    }
  };

  const handleSaveCourse = async (courseId: string, courseName: string) => {
    if (!session?.user.id) return;

    try {
      // Check if already saved
      const existing = studentCourses.find(sc => sc.curso_id === courseId);
      
      if (existing) {
        toast.info("Você já salvou este curso!");
        return;
      }

      const { error } = await supabase
        .from("student_courses")
        .insert({
          aluno_id: session.user.id,
          curso_id: courseId,
          title: courseName,
          progresso_aluno: 0,
          tempo_estudo: 0,
          salvar_favorito: true,
        });

      if (error) throw error;
      
      toast.success("Curso salvo com sucesso!");
      fetchStudentCourses();
    } catch (error: any) {
      toast.error("Erro ao salvar curso");
      console.error(error);
    }
  };

  const handleToggleBookmark = async (studentCourseId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("student_courses")
        .update({ salvar_favorito: !currentValue })
        .eq("id", studentCourseId);

      if (error) throw error;
      
      toast.success(currentValue ? "Removido dos favoritos" : "Adicionado aos favoritos");
      fetchStudentCourses();
    } catch (error: any) {
      toast.error("Erro ao atualizar favorito");
      console.error(error);
    }
  };

  const savedCourses = studentCourses.filter(sc => sc.salvar_favorito);
  const inProgressCourses = studentCourses.filter(sc => sc.tempo_estudo > 0 && sc.progresso_aluno < 100);
  const completedCourses = studentCourses.filter(sc => sc.progresso_aluno === 100);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Cursos</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Explore cursos para desenvolver competências específicas
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative mb-6 sm:mb-8 -mx-4 sm:mx-0">
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide px-4 sm:px-0" ref={tabsListRef}>
              <TabsList className="inline-flex w-max sm:w-full sm:grid sm:grid-cols-4 gap-1">
                <TabsTrigger value="descobrir" className="whitespace-nowrap">
                  Descobrir
                </TabsTrigger>
                <TabsTrigger value="salvos" className="whitespace-nowrap">
                  Salvos
                </TabsTrigger>
                <TabsTrigger value="andamento" className="whitespace-nowrap">
                  Em andamento
                </TabsTrigger>
                <TabsTrigger value="concluidos" className="whitespace-nowrap">
                  Concluídos
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="descobrir" className="space-y-6 mt-0">
            {allCourses.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Nenhum curso disponível no momento
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {allCourses.map((course) => {
                  const savedCourse = studentCourses.find(sc => sc.curso_id === course.id);
                  return (
                    <CourseCard
                      key={course.id}
                      id={course.id}
                      nome={course.nome}
                      primeiraAula={course.primeira_aula || undefined}
                      cover={course.cover || undefined}
                      onAccessCourse={() => toast.info("Abrindo curso...")}
                      onToggleBookmark={savedCourse 
                        ? () => handleToggleBookmark(savedCourse.id, savedCourse.salvar_favorito)
                        : () => handleSaveCourse(course.id, course.nome)
                      }
                      isBookmarked={!!savedCourse}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="salvos" className="space-y-6 mt-0">
            {savedCourses.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Você ainda não salvou nenhum curso
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {savedCourses.map((sc) => (
                  <CourseCard
                    key={sc.id}
                    id={sc.id}
                    nome={sc.courses.nome}
                    primeiraAula={sc.courses.primeira_aula || undefined}
                    tempoRestante="2h 15min"
                    progresso={sc.progresso_aluno}
                    cover={sc.courses.cover || undefined}
                    showProgress
                    onAccessCourse={() => toast.info("Abrindo curso...")}
                    onToggleBookmark={() => handleToggleBookmark(sc.id, sc.salvar_favorito)}
                    isBookmarked={sc.salvar_favorito}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="andamento" className="space-y-6 mt-0">
            {inProgressCourses.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Nenhum curso em andamento
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {inProgressCourses.map((sc) => (
                  <CourseCard
                    key={sc.id}
                    id={sc.id}
                    nome={sc.courses.nome}
                    primeiraAula={sc.courses.primeira_aula || undefined}
                    progresso={sc.progresso_aluno}
                    cover={sc.courses.cover || undefined}
                    showProgress
                    onAccessCourse={() => toast.info("Abrindo curso...")}
                    onToggleBookmark={() => handleToggleBookmark(sc.id, sc.salvar_favorito)}
                    isBookmarked={sc.salvar_favorito}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="concluidos" className="space-y-6 mt-0">
            {completedCourses.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Nenhum curso concluído
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {completedCourses.map((sc) => (
                  <CourseCard
                    key={sc.id}
                    id={sc.id}
                    nome={sc.courses.nome}
                    primeiraAula={sc.courses.primeira_aula || undefined}
                    progresso={sc.progresso_aluno}
                    cover={sc.courses.cover || undefined}
                    showProgress
                    onAccessCourse={() => toast.info("Abrindo curso...")}
                    onToggleBookmark={() => handleToggleBookmark(sc.id, sc.salvar_favorito)}
                    isBookmarked={sc.salvar_favorito}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Courses;
