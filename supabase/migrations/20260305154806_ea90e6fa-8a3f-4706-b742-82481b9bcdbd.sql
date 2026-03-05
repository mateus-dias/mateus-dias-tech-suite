
-- Fix the overly permissive INSERT policy on site_visits
-- Drop the current policy and create a more specific one
DROP POLICY "Anyone can insert visits" ON public.site_visits;

-- Allow both anonymous and authenticated users to insert visits but restrict columns via the table structure
CREATE POLICY "Track site visits" ON public.site_visits FOR INSERT TO anon, authenticated WITH CHECK (
  page IS NOT NULL
);
