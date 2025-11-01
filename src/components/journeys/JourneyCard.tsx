import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface JourneyCardProps {
  id: string;
  title: string;
  description?: string;
  cover?: string;
  coursesCount?: number;
  journeysCount?: number;
  currentStep?: number;
  totalSteps?: number;
  onAccessJourney: () => void;
  onToggleBookmark?: () => void;
  isBookmarked?: boolean;
  showProgress?: boolean;
}

export const JourneyCard = ({
  title,
  description,
  cover,
  coursesCount = 0,
  journeysCount = 0,
  currentStep = 0,
  totalSteps = 0,
  onAccessJourney,
  onToggleBookmark,
  isBookmarked = false,
  showProgress = false,
}: JourneyCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>('https://www.shutterstock.com/shutterstock/photos/2629945729/display_1500/stock-photo-uk-flag-with-pen-on-english-language-book-2629945729.jpg');
  
  useEffect(() => {
    if (cover) {
      setCoverImage(cover);
    }
  }, [cover])

  useEffect(() => {
    if(imageError){
      setCoverImage('https://www.shutterstock.com/shutterstock/photos/2629945729/display_1500/stock-photo-uk-flag-with-pen-on-english-language-book-2629945729.jpg')
      setImageError(false)
    }
  }, [imageError])

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {coverImage && !imageError && (
        <div className="relative w-full h-48 overflow-hidden bg-muted">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        </div>
      )}
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
            {title}
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

        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex gap-2 flex-wrap">
          {coursesCount > 0 && (
            <Badge variant="secondary">
              {coursesCount === 1 ? '1 curso' : `${coursesCount} cursos`}
            </Badge>
          )}
          {journeysCount > 0 && (
            <Badge variant="secondary">
              {journeysCount === 1 ? '1 jornada' : `${journeysCount} jornadas`}
            </Badge>
          )}
        </div>

        {showProgress && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Progresso: <span className="font-medium">{currentStep}/{totalSteps}</span>
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button onClick={onAccessJourney} className="w-full">
          Acessar jornada
        </Button>
      </CardFooter>
    </Card>
  );
};
