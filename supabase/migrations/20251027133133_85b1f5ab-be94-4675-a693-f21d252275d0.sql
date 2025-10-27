-- Create journeys table
CREATE TABLE public.journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER DEFAULT 0,
  number_steps INTEGER DEFAULT 0,
  sub_journeys_journeys JSONB DEFAULT '[]'::jsonb,
  courses JSONB DEFAULT '[]'::jsonb,
  journeys JSONB DEFAULT '[]'::jsonb,
  sub_journeys_courses JSONB DEFAULT '[]'::jsonb,
  cover TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on journeys
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active journeys
CREATE POLICY "Anyone can view active journeys"
ON public.journeys
FOR SELECT
USING (active = true);

-- Create trigger for journeys updated_at
CREATE TRIGGER update_journeys_updated_at
BEFORE UPDATE ON public.journeys
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create student_journeys table
CREATE TABLE public.student_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  duration INTEGER DEFAULT 0,
  number_steps INTEGER DEFAULT 0,
  current_step INTEGER DEFAULT 0,
  sub_journeys_journeys JSONB DEFAULT '[]'::jsonb,
  courses JSONB DEFAULT '[]'::jsonb,
  journeys JSONB DEFAULT '[]'::jsonb,
  sub_journeys_courses JSONB DEFAULT '[]'::jsonb,
  cover TEXT,
  saved_created BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on student_journeys
ALTER TABLE public.student_journeys ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own journeys
CREATE POLICY "Students can view their own journeys"
ON public.student_journeys
FOR SELECT
USING (auth.uid() = student_id);

-- Policy: Students can insert their own journeys
CREATE POLICY "Students can insert their own journeys"
ON public.student_journeys
FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Policy: Students can update their own journeys
CREATE POLICY "Students can update their own journeys"
ON public.student_journeys
FOR UPDATE
USING (auth.uid() = student_id);

-- Policy: Students can delete their own journeys
CREATE POLICY "Students can delete their own journeys"
ON public.student_journeys
FOR DELETE
USING (auth.uid() = student_id);

-- Create trigger for student_journeys updated_at
CREATE TRIGGER update_student_journeys_updated_at
BEFORE UPDATE ON public.student_journeys
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();