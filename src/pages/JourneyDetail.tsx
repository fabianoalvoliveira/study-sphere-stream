import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, Clock, BookOpen, Map, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { InstructorCard } from "@/components/journeys/InstructorCard";
import { RelatedJourneyCard } from "@/components/journeys/RelatedJourneyCard";
import { JourneyStepItem } from "@/components/journeys/JourneyStepItem";

export default function JourneyDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [journey, setJourney] = useState<any>(null);
  const [studentJourney, setStudentJourney] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const standardImage = 'https://www.shutterstock.com/shutterstock/photos/2629945729/display_1500/stock-photo-uk-flag-with-pen-on-english-language-book-2629945729.jpg';

  useEffect(() => {
    if (id) {
      fetchJourneyData();
    }
  }, [id]);

  const fetchJourneyData = async () => {
    try {
      setLoading(true);
      
      // Check if it's a student journey (from saved/progress tabs) or main journey
      const { data: studentJourneyData, error: sjError } = await supabase
        .from("student_journeys")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (studentJourneyData) {
        setStudentJourney(studentJourneyData);
        setIsBookmarked(studentJourneyData.saved_created);
        
        // Also fetch the original journey data
        const { data: journeyData, error: jError } = await supabase
          .from("journeys")
          .select("*")
          .eq("id", studentJourneyData.journey_id)
          .single();

        if (jError) throw jError;
        setJourney(journeyData);
      } else {
        // It's a main journey ID
        const { data: journeyData, error: jError } = await supabase
          .from("journeys")
          .select("*")
          .eq("id", id)
          .single();

        if (jError) throw jError;
        setJourney(journeyData);
        
        // Check if user has saved this journey
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: savedJourney } = await supabase
            .from("student_journeys")
            .select("*")
            .eq("journey_id", id)
            .eq("student_id", session.user.id)
            .maybeSingle();

          if (savedJourney) {
            setStudentJourney(savedJourney);
            setIsBookmarked(savedJourney.saved_created);
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao carregar jornada");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Você precisa estar logado");
      return;
    }

    try {
      if (studentJourney) {
        // Update existing student journey
        const { error } = await supabase
          .from("student_journeys")
          .update({ saved_created: !isBookmarked })
          .eq("id", studentJourney.id);

        if (error) throw error;
        setIsBookmarked(!isBookmarked);
        toast.success(isBookmarked ? "Removido dos favoritos" : "Adicionado aos favoritos");
      } else if (journey) {
        // Create new student journey
        const { error } = await supabase
          .from("student_journeys")
          .insert({
            student_id: session.user.id,
            journey_id: journey.id,
            title: journey.title,
            description: journey.description,
            cover: journey.cover,
            current_step: 0,
            number_steps: journey.number_steps,
            courses: journey.courses,
            journeys: journey.journeys,
            saved_created: true,
          });

        if (error) throw error;
        setIsBookmarked(true);
        toast.success("Adicionado aos favoritos");
        fetchJourneyData();
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao atualizar favorito");
    }
  };

  const getCoursesArray = (courses: any) => {
    if (!courses) return [];
    if (Array.isArray(courses)) return courses;
    return [];
  };

  const getJourneysArray = (journeys: any) => {
    if (!journeys) return [];
    if (Array.isArray(journeys)) return journeys;
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Jornada não encontrada</p>
      </div>
    );
  }

  const coursesArray = getCoursesArray(journey.courses);
  const journeysArray = getJourneysArray(journey.journeys);
  const currentStep = studentJourney?.current_step || 0;
  const totalSteps = journey.number_steps || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/jornadas")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-semibold truncate">
              Jornada: {journey.title}
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleBookmark}
            className="shrink-0"
          >
            <Bookmark
              className={`h-5 w-5 ${isBookmarked ? "fill-primary text-primary" : ""}`}
            />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative w-full h-48 sm:h-64 overflow-hidden rounded-lg bg-muted">
              <img
                src={imageError ? standardImage : (journey.cover || standardImage)}
                alt={journey.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            </div>

            {/* Current Step Info */}
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                {journey.title}
              </h2>
              
              {journey.description && (
                <p className="text-sm sm:text-base text-muted-foreground">
                  {journey.description}
                </p>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {journey.duration > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{journey.duration}h</span>
                  </div>
                )}
                {coursesArray.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    <span>{coursesArray.length} {coursesArray.length === 1 ? 'Curso' : 'Cursos'}</span>
                  </div>
                )}
                {journeysArray.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Map className="h-4 w-4" />
                    <span>{journeysArray.length} {journeysArray.length === 1 ? 'Jornada' : 'Jornadas'}</span>
                  </div>
                )}
              </div>

              {/* Progress */}
              {studentJourney && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Passos Finalizados</span>
                    <span className="text-muted-foreground">
                      {currentStep}/{totalSteps}
                    </span>
                  </div>
                  <Progress 
                    value={totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              )}
            </div>

            {/* Journey Structure */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold">Estrutura da jornada</h3>
              
              {coursesArray.length === 0 && journeysArray.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Nenhum conteúdo disponível nesta jornada
                </p>
              ) : (
                <div className="space-y-3">
                  {coursesArray.map((course: any, index: number) => (
                    <JourneyStepItem 
                      key={`course-${index}`} 
                      step={{
                        id: course.id || `course-${index}`,
                        number: index + 1,
                        title: course.title || course.nome || "Curso sem título",
                        description: course.description || course.descricao || "",
                        type: "Curso",
                        lessons: 10,
                        duration: course.duration ? `${course.duration}min` : "30min",
                        progress: 0,
                      }} 
                    />
                  ))}
                  {journeysArray.map((subJourney: any, index: number) => (
                    <JourneyStepItem 
                      key={`journey-${index}`} 
                      step={{
                        id: subJourney.id || `journey-${index}`,
                        number: coursesArray.length + index + 1,
                        title: subJourney.title || "Jornada sem título",
                        description: subJourney.description || "",
                        type: "Jornada",
                        lessons: subJourney.number_steps || 5,
                        duration: subJourney.duration ? `${subJourney.duration}min` : "40min",
                        progress: 0,
                        stepsCompleted: 0,
                        totalSteps: subJourney.number_steps || 4,
                      }} 
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Instructor Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Instrutores</h3>
              <InstructorCard 
                instructor={{
                  name: "Ana Silva",
                  initials: "AS",
                  specialty: "Especialista em Comunicação",
                  bio: "Ana Silva é especialista em comunicação com mais de 10 anos de experiência treinando profissionais em empresas de diversos setores.",
                }} 
              />
            </div>

            {/* Related Journeys Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Jornadas Relacionadas</h3>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center py-4">
                  Em breve
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
