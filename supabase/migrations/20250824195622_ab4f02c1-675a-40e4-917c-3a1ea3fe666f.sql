-- Enable Row Level Security on learning_objectives table
ALTER TABLE public.learning_objectives ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to learning objectives
-- This makes sense for educational standards that should be publicly accessible
CREATE POLICY "Allow public read access to learning objectives" 
ON public.learning_objectives 
FOR SELECT 
USING (true);

-- Create policy to allow authenticated users to manage learning objectives
CREATE POLICY "Allow authenticated users to manage learning objectives" 
ON public.learning_objectives 
FOR ALL 
USING (auth.uid() IS NOT NULL);