import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, BookOpen, Award, Bookmark, Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Database } from "@/integrations/supabase/types";

type Journey = Database['public']['Tables']['journeys']['Row'];
type StudentJourney = Database['public']['Tables']['student_journeys']['Row'];
type Course = Database['public']['Tables']['courses']['Row'];
type StudentCourse = Database['public']['Tables']['student_courses']['Row'] & {
  courses: Course;
};

export default function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  // Statistics
  const [studyTime, setStudyTime] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [competenciesCount, setCompetenciesCount] = useState(0);
  
  // Journeys
  const [suggestedJourneys, setSuggestedJourneys] = useState<Journey[]>([]);
  const [studentJourneys, setStudentJourneys] = useState<StudentJourney[]>([]);
  const [showAllJourneys, setShowAllJourneys] = useState(false);
  
  // Courses
  const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);
  const [studentCourses, setStudentCourses] = useState<StudentCourse[]>([]);
  const [showAllCourses, setShowAllCourses] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Get student name
      const { data: student } = await supabase
        .from("students")
        .select("nome")
        .eq("id", session.user.id)
        .maybeSingle();

      if (student?.nome) {
        setUserName(student.nome);
      }

      // Get student courses for statistics and suggested courses
      const { data: studentCoursesData } = await supabase
        .from("student_courses")
        .select(`
          *,
          courses (*)
        `)
        .eq("aluno_id", session.user.id);

      if (studentCoursesData) {
        setStudentCourses(studentCoursesData as any);
        
        // Calculate statistics
        const totalTime = studentCoursesData.reduce((acc, sc) => acc + (sc.tempo_estudo || 0), 0);
        setStudyTime(totalTime);
        
        const inProgress = studentCoursesData.filter(sc => 
          sc.tempo_estudo > 0 && sc.progresso_aluno < 100
        ).length;
        setInProgressCount(inProgress);
        
        // Mock competencies count
        setCompetenciesCount(8);
      }

      // Get all active courses for suggestions
      const { data: allCourses } = await supabase
        .from("courses")
        .select("*")
        .eq("ativo", true)
        .limit(6);

      if (allCourses) {
        setSuggestedCourses(allCourses);
      }

      // Get student journeys
      const { data: studentJourneysData } = await supabase
        .from("student_journeys")
        .select("*")
        .eq("student_id", session.user.id)
        .limit(6);

      if (studentJourneysData) {
        setStudentJourneys(studentJourneysData as any);
      }

      // Get all active journeys for suggestions
      const { data: allJourneys } = await supabase
        .from("journeys")
        .select("*")
        .eq("active", true)
        .limit(6);

      if (allJourneys) {
        setSuggestedJourneys(allJourneys as any);
      }

      setLoading(false);
    };

    loadData();
  }, [navigate]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleJourneyClick = (journeyId: string, isStudentJourney: boolean) => {
    const type = isStudentJourney ? 'progress' : 'template';
    navigate(`/jornada?jornada=${journeyId}&type=${type}`);
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/curso?curso=${courseId}`);
  };

  const displayedJourneys = showAllJourneys 
    ? (studentJourneys.length > 0 ? studentJourneys : suggestedJourneys)
    : (studentJourneys.length > 0 ? studentJourneys.slice(0, 3) : suggestedJourneys.slice(0, 3));

  const displayedCourses = showAllCourses
    ? (studentCourses.length > 0 ? studentCourses : suggestedCourses)
    : (studentCourses.length > 0 ? studentCourses.slice(0, 3) : suggestedCourses.slice(0, 3));

  const hasMoreJourneys = (studentJourneys.length > 0 ? studentJourneys.length : suggestedJourneys.length) > 3;
  const hasMoreCourses = (studentCourses.length > 0 ? studentCourses.length : suggestedCourses.length) > 3;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Search and Notification */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar..."
                  className="pl-10 bg-background text-sm sm:text-base"
                />
              </div>
            </div>
            <Button variant="ghost" size="icon" className="relative shrink-0">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full"></span>
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Bem-vindo de volta, {userName}!</h1>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Tempo de estudo</p>
                  <p className="text-3xl font-bold mb-1">{formatTime(studyTime)}</p>
                  <p className="text-xs text-muted-foreground">Nos últimos 30 dias</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Cursos em andamento</p>
                  <p className="text-3xl font-bold mb-1">{inProgressCount}</p>
                  <p className="text-xs text-muted-foreground">cursos iniciados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Competências</p>
                  <p className="text-3xl font-bold mb-1">{competenciesCount}</p>
                  <p className="text-xs text-muted-foreground">Desenvolvidas até agora</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suggested Journeys Section */}
        {displayedJourneys.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Jornadas sugeridas</h2>
              {hasMoreJourneys && (
                <Button 
                  variant="ghost"
                  onClick={() => {
                    if (studentJourneys.length > 0) {
                      navigate('/jornadas');
                    } else {
                      setShowAllJourneys(!showAllJourneys);
                    }
                  }}
                >
                  Ver todas
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayedJourneys.map((journey) => {
                const isStudentJourney = 'current_step' in journey;
                const journeyData = isStudentJourney ? journey as StudentJourney : journey as Journey;
                
                return (
                  <Card key={journeyData.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48 bg-muted">
                      {journeyData.cover && (
                        <img 
                          src={journeyData.cover} 
                          alt={journeyData.title || 'Journey cover'}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-3">
                        {journeyData.title || 'Product Manager'}
                      </h3>
                      
                      <div className="flex gap-2 mb-4">
                        {journeyData.courses && Array.isArray(journeyData.courses) && journeyData.courses.length > 0 && (
                          <Badge variant="secondary">
                            {journeyData.courses.length} {journeyData.courses.length === 1 ? 'curso' : 'cursos'}
                          </Badge>
                        )}
                        {journeyData.journeys && Array.isArray(journeyData.journeys) && journeyData.journeys.length > 0 && (
                          <Badge variant="secondary">
                            {journeyData.journeys.length} {journeyData.journeys.length === 1 ? 'jornada' : 'jornadas'}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span>
                          {isStudentJourney 
                            ? `${(journeyData as StudentJourney).current_step}/${journeyData.number_steps} Passos Finalizados`
                            : `0/${journeyData.number_steps} Passos Finalizados`
                          }
                        </span>
                      </div>

                      <Button 
                        className="w-full"
                        onClick={() => handleJourneyClick(journeyData.id, isStudentJourney)}
                      >
                        Acessar jornada
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Suggested Courses Section */}
        {displayedCourses.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Cursos sugeridos</h2>
              {hasMoreCourses && (
                <Button 
                  variant="ghost"
                  onClick={() => {
                    if (studentCourses.length > 0) {
                      navigate('/cursos');
                    } else {
                      setShowAllCourses(!showAllCourses);
                    }
                  }}
                >
                  Ver todos
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayedCourses.map((course) => {
                const isStudentCourse = 'progresso_aluno' in course;
                const courseData = isStudentCourse ? (course as StudentCourse).courses : course as Course;
                const progress = isStudentCourse ? (course as StudentCourse).progresso_aluno : 0;
                
                return (
                  <Card key={courseData.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-semibold text-lg flex-1">
                          {courseData.nome}
                        </h3>
                        {isStudentCourse && (
                          <Button variant="ghost" size="icon">
                            <Bookmark className="h-4 w-4 fill-current" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-semibold">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        {courseData.primeira_aula && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Próxima aula: {courseData.primeira_aula}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Tempo restante: {formatTime(courseData.duration)}
                            </p>
                          </div>
                        )}

                        <Button 
                          className="w-full"
                          onClick={() => handleCourseClick(courseData.id)}
                        >
                          Acessar curso
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
