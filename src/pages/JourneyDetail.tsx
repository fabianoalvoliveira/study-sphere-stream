import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bookmark, Clock, BookOpen, Map, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { InstructorCard } from "@/components/journeys/InstructorCard";
import { RelatedJourneyCard } from "@/components/journeys/RelatedJourneyCard";
import { JourneyStepItem } from "@/components/journeys/JourneyStepItem";

// Mock data
const journeyData = {
  id: "1",
  title: "Product Manager",
  cover: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
  currentStep: {
    title: "Fundamentos de UX Design",
    description: "Aprenda técnicas para melhorar sua comunicação verbal e não verbal em ambientes profissionais. Este curso aborda desde os fundamentos da comunicação até técnicas avançadas para apresentações e negociações.",
    duration: "8h",
    coursesCount: 2,
    journeysCount: 1,
    totalSteps: 10,
    completedSteps: 0,
  },
  steps: [
    {
      id: "1",
      number: 1,
      title: "Fundamentos de UX Design",
      description: "Fundamentos e importância da comunicação no ambiente profissional",
      type: "Curso",
      lessons: 10,
      duration: "30min",
      progress: 10,
    },
    {
      id: "2",
      number: 2,
      title: "Comunicação Verbal",
      description: "Técnicas para melhorar sua expressão verbal",
      type: "Curso",
      lessons: 10,
      duration: "45min",
      progress: 0,
    },
    {
      id: "3",
      number: 3,
      title: "Comunicação Não Verbal",
      description: "A importância da linguagem corporal e expressões faciais",
      type: "Jornada",
      lessons: 10,
      duration: "40min",
      progress: 0,
      stepsCompleted: 0,
      totalSteps: 4,
    },
  ],
  instructor: {
    name: "Ana Silva",
    initials: "AS",
    specialty: "Especialista em Comunicação",
    bio: "Ana Silva é especialista em comunicação com mais de 10 anos de experiência treinando profissionais em empresas de diversos setores.",
  },
  relatedJourneys: [
    {
      id: "2",
      title: "Product Designer",
      completedSteps: 0,
      totalSteps: 10,
    },
    {
      id: "3",
      title: "Product Owner",
      completedSteps: 0,
      totalSteps: 10,
    },
  ],
};

export default function JourneyDetail() {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const standardImage = 'https://www.shutterstock.com/shutterstock/photos/2629945729/display_1500/stock-photo-uk-flag-with-pen-on-english-language-book-2629945729.jpg';

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
              Jornada: {journeyData.title}
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsBookmarked(!isBookmarked)}
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
                src={imageError ? standardImage : journeyData.cover}
                alt={journeyData.currentStep.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            </div>

            {/* Current Step Info */}
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                {journeyData.currentStep.title}
              </h2>
              
              <p className="text-sm sm:text-base text-muted-foreground">
                {journeyData.currentStep.description}
              </p>

              {/* Metadata */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{journeyData.currentStep.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span>{journeyData.currentStep.coursesCount} Cursos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Map className="h-4 w-4" />
                  <span>{journeyData.currentStep.journeysCount} Jornada</span>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Passos Finalizados</span>
                  <span className="text-muted-foreground">
                    {journeyData.currentStep.completedSteps}/{journeyData.currentStep.totalSteps}
                  </span>
                </div>
                <Progress 
                  value={(journeyData.currentStep.completedSteps / journeyData.currentStep.totalSteps) * 100} 
                  className="h-2"
                />
              </div>
            </div>

            {/* Journey Structure */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold">Estrutura da jornada</h3>
              
              <div className="space-y-3">
                {journeyData.steps.map((step) => (
                  <JourneyStepItem key={step.id} step={step} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Instructor Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Instrutores</h3>
              <InstructorCard instructor={journeyData.instructor} />
            </div>

            {/* Related Journeys Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Jornadas Relacionadas</h3>
              <div className="space-y-3">
                {journeyData.relatedJourneys.map((journey) => (
                  <RelatedJourneyCard key={journey.id} journey={journey} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
