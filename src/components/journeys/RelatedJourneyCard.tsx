import { Card, CardContent } from "@/components/ui/card";

interface RelatedJourneyCardProps {
  journey: {
    id: string;
    title: string;
    completedSteps: number;
    totalSteps: number;
  };
}

export const RelatedJourneyCard = ({ journey }: RelatedJourneyCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <h4 className="font-semibold text-sm mb-1">{journey.title}</h4>
        <p className="text-xs text-muted-foreground">
          {journey.completedSteps}/{journey.totalSteps} Passos Finalizados
        </p>
      </CardContent>
    </Card>
  );
};
