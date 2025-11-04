import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Clock, BookOpen } from "lucide-react";

interface JourneyStepItemProps {
  step: {
    id: string;
    number: number;
    title: string;
    description: string;
    type: string;
    lessons: number;
    duration: string;
    progress: number;
    stepsCompleted?: number;
    totalSteps?: number;
  };
}

export const JourneyStepItem = ({ step }: JourneyStepItemProps) => {
  const isJourney = step.type === "Jornada";
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Number */}
          <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-semibold">
              {step.number}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-semibold text-sm sm:text-base">
                  {step.title}
                </h4>
                <Badge variant="secondary" className="text-xs">
                  {step.type}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {step.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{step.lessons} Aulas</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{step.duration}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress and Action */}
          <div className="flex items-center gap-3 sm:gap-4">
            {isJourney ? (
              <div className="text-sm font-medium min-w-[3rem] text-center">
                {step.stepsCompleted}/{step.totalSteps}
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-[4rem]">
                <Progress value={step.progress} className="h-2 w-12" />
                <span className="text-sm font-medium">{step.progress}%</span>
              </div>
            )}

            <Button size="sm" className="shrink-0">
              <Play className="h-4 w-4 mr-1" />
              Acessar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
