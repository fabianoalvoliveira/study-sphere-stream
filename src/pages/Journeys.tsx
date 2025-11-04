import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JourneyCard } from "@/components/journeys/JourneyCard";
import { toast } from "sonner";

interface Journey {
  id: string;
  title: string;
  description: string | null;
  cover: string | null;
  duration: number;
  number_steps: number;
  courses: any;
  journeys: any;
  active: boolean;
}

interface StudentJourney {
  id: string;
  student_id: string;
  journey_id: string;
  title: string | null;
  description: string | null;
  cover: string | null;
  current_step: number;
  number_steps: number;
  courses: any;
  journeys: any;
  saved_created: boolean;
}

export default function Journeys() {
  const [session, setSession] = useState<Session | null>(null);
  const [allJourneys, setAllJourneys] = useState<Journey[]>([]);
  const [studentJourneys, setStudentJourneys] = useState<StudentJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("descobrir");
  const navigate = useNavigate();
  const tabsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        }
      }
    );

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
      fetchJourneys();
      fetchStudentJourneys();
    }
  }, [session]);

  const fetchJourneys = async () => {
    try {
      const { data, error } = await supabase
        .from("journeys")
        .select("*")
        .eq("active", true)
        .order("title");

      if (error) throw error;
      setAllJourneys(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar jornadas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentJourneys = async () => {
    try {
      const { data, error } = await supabase
        .from("student_journeys")
        .select("*")
        .eq("student_id", session?.user.id);

      if (error) throw error;
      setStudentJourneys(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar suas jornadas");
      console.error(error);
    }
  };

  const handleSaveJourney = async (journeyId: string, journeyTitle: string, journeyData: Journey) => {
    if (!session?.user.id) return;

    try {
      const existing = studentJourneys.find(sj => sj.journey_id === journeyId);
      
      if (existing) {
        toast.info("Você já salvou esta jornada!");
        return;
      }

      const { error } = await supabase
        .from("student_journeys")
        .insert({
          student_id: session.user.id,
          journey_id: journeyId,
          title: journeyTitle,
          description: journeyData.description,
          cover: journeyData.cover,
          current_step: 0,
          number_steps: journeyData.number_steps,
          courses: journeyData.courses,
          journeys: journeyData.journeys,
          saved_created: true,
        });

      if (error) throw error;
      
      toast.success("Jornada salva com sucesso!");
      fetchStudentJourneys();
    } catch (error: any) {
      toast.error("Erro ao salvar jornada");
      console.error(error);
    }
  };

  const handleToggleBookmark = async (studentJourneyId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("student_journeys")
        .update({ saved_created: !currentValue })
        .eq("id", studentJourneyId);

      if (error) throw error;
      
      toast.success(currentValue ? "Removido dos favoritos" : "Adicionado aos favoritos");
      fetchStudentJourneys();
    } catch (error: any) {
      toast.error("Erro ao atualizar favorito");
      console.error(error);
    }
  };

  const getCoursesCount = (courses: any) => {
    if (!courses) return 0;
    if (Array.isArray(courses)) return courses.length;
    return 0;
  };

  const getJourneysCount = (journeys: any) => {
    if (!journeys) return 0;
    if (Array.isArray(journeys)) return journeys.length;
    return 0;
  };

  const savedJourneys = studentJourneys.filter(sj => sj.saved_created);
  const inProgressJourneys = studentJourneys.filter(sj => sj.current_step > 0 && sj.current_step < sj.number_steps);
  const completedJourneys = studentJourneys.filter(sj => sj.current_step === sj.number_steps && sj.number_steps > 0);

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
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Jornadas</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Explore jornadas de aprendizado completas
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
            {allJourneys.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Nenhuma jornada disponível no momento
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {allJourneys.map((journey) => {
                  const savedJourney = studentJourneys.find(sj => sj.journey_id === journey.id);
                  return (
                    <JourneyCard
                      key={journey.id}
                      id={journey.id}
                      title={journey.title}
                      description={journey.description || undefined}
                      cover={journey.cover || undefined}
                      coursesCount={getCoursesCount(journey.courses)}
                      journeysCount={getJourneysCount(journey.journeys)}
                      totalSteps={journey.number_steps}
                      onAccessJourney={() => navigate(`/jornadas/${journey.id}`)}
                      onToggleBookmark={savedJourney 
                        ? () => handleToggleBookmark(savedJourney.id, savedJourney.saved_created)
                        : () => handleSaveJourney(journey.id, journey.title, journey)
                      }
                      isBookmarked={!!savedJourney}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="salvos" className="space-y-6 mt-0">
            {savedJourneys.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Você ainda não salvou nenhuma jornada
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {savedJourneys.map((sj) => (
                  <JourneyCard
                    key={sj.id}
                    id={sj.id}
                    title={sj.title || "Jornada"}
                    description={sj.description || undefined}
                    cover={sj.cover || undefined}
                    coursesCount={getCoursesCount(sj.courses)}
                    journeysCount={getJourneysCount(sj.journeys)}
                    currentStep={sj.current_step}
                    totalSteps={sj.number_steps}
                    showProgress
                    onAccessJourney={() => navigate(`/jornadas/${sj.id}`)}
                    onToggleBookmark={() => handleToggleBookmark(sj.id, sj.saved_created)}
                    isBookmarked={sj.saved_created}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="andamento" className="space-y-6 mt-0">
            {inProgressJourneys.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Nenhuma jornada em andamento
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {inProgressJourneys.map((sj) => (
                  <JourneyCard
                    key={sj.id}
                    id={sj.id}
                    title={sj.title || "Jornada"}
                    description={sj.description || undefined}
                    cover={sj.cover || undefined}
                    coursesCount={getCoursesCount(sj.courses)}
                    journeysCount={getJourneysCount(sj.journeys)}
                    currentStep={sj.current_step}
                    totalSteps={sj.number_steps}
                    showProgress
                    onAccessJourney={() => navigate(`/jornadas/${sj.id}`)}
                    onToggleBookmark={() => handleToggleBookmark(sj.id, sj.saved_created)}
                    isBookmarked={sj.saved_created}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="concluidos" className="space-y-6 mt-0">
            {completedJourneys.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Nenhuma jornada concluída
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {completedJourneys.map((sj) => (
                  <JourneyCard
                    key={sj.id}
                    id={sj.id}
                    title={sj.title || "Jornada"}
                    description={sj.description || undefined}
                    cover={sj.cover || undefined}
                    coursesCount={getCoursesCount(sj.courses)}
                    journeysCount={getJourneysCount(sj.journeys)}
                    currentStep={sj.current_step}
                    totalSteps={sj.number_steps}
                    showProgress
                    onAccessJourney={() => navigate(`/jornadas/${sj.id}`)}
                    onToggleBookmark={() => handleToggleBookmark(sj.id, sj.saved_created)}
                    isBookmarked={sj.saved_created}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
