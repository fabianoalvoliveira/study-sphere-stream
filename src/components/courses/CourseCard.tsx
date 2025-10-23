import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  id: string;
  nome: string;
  primeiraAula?: string;
  tempoRestante?: string;
  progresso?: number;
  cover?: string;
  onAccessCourse: () => void;
  onToggleBookmark?: () => void;
  isBookmarked?: boolean;
  showProgress?: boolean;
}

export const CourseCard = ({
  nome,
  primeiraAula,
  tempoRestante,
  progresso = 0,
  cover,
  onAccessCourse,
  onToggleBookmark,
  isBookmarked = false,
  showProgress = false,
}: CourseCardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {cover && !imageError && (
        <div className="relative w-full h-48 overflow-hidden bg-muted">
          <img
            src={cover}
            alt={nome}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        </div>
      )}
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
            {nome}
          </h3>
          {onToggleBookmark && (
            <button
              onClick={onToggleBookmark}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Bookmark
                className={cn("h-5 w-5", isBookmarked && "fill-primary text-primary")}
              />
            </button>
          )}
        </div>

        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{progresso}%</span>
            </div>
            <Progress value={progresso} className="h-2" />
          </div>
        )}

        {primeiraAula && (
          <div className="space-y-1">
            <p className="text-sm text-foreground">
              Próxima aula: <span className="font-medium">{primeiraAula}</span>
            </p>
            {tempoRestante && (
              <p className="text-sm text-muted-foreground">
                Tempo restante: {tempoRestante}
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button onClick={onAccessCourse} className="w-full">
          Acessar curso
        </Button>
      </CardFooter>
    </Card>
  );
};
