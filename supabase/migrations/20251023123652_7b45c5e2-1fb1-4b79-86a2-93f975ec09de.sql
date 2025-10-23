-- Create students table (profile information for users)
CREATE TABLE public.students (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Students can view and update their own profile
CREATE POLICY "Users can view their own student profile"
  ON public.students FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own student profile"
  ON public.students FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own student profile"
  ON public.students FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  nivel TEXT CHECK (nivel IN ('baixo', 'medio', 'alto')),
  duration INTEGER DEFAULT 0,
  primeira_aula TEXT,
  cover TEXT,
  logo_empresa TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Everyone can view active courses
CREATE POLICY "Anyone can view active courses"
  ON public.courses FOR SELECT
  USING (ativo = true);

-- Create student_courses table (junction table with progress tracking)
CREATE TABLE public.student_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT,
  progresso_aluno INTEGER DEFAULT 0 CHECK (progresso_aluno >= 0 AND progresso_aluno <= 100),
  tempo_estudo INTEGER DEFAULT 0,
  alunas_aulas JSONB DEFAULT '[]'::jsonb,
  salvar_favorito BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(aluno_id, curso_id)
);

-- Enable RLS on student_courses
ALTER TABLE public.student_courses ENABLE ROW LEVEL SECURITY;

-- Students can only view their own course enrollments
CREATE POLICY "Students can view their own courses"
  ON public.student_courses FOR SELECT
  USING (auth.uid() = aluno_id);

CREATE POLICY "Students can insert their own courses"
  ON public.student_courses FOR INSERT
  WITH CHECK (auth.uid() = aluno_id);

CREATE POLICY "Students can update their own courses"
  ON public.student_courses FOR UPDATE
  USING (auth.uid() = aluno_id);

CREATE POLICY "Students can delete their own courses"
  ON public.student_courses FOR DELETE
  USING (auth.uid() = aluno_id);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_student_courses_updated_at
  BEFORE UPDATE ON public.student_courses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.students (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'name'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create student profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();