import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface InstructorCardProps {
  instructor: {
    name: string;
    initials: string;
    specialty: string;
    bio: string;
  };
}

export const InstructorCard = ({ instructor }: InstructorCardProps) => {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {instructor.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm">{instructor.name}</h4>
            <p className="text-xs text-muted-foreground">{instructor.specialty}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {instructor.bio}
        </p>
      </CardContent>
    </Card>
  );
};
