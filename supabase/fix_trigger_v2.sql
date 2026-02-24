-- FIX V2: Simplified trigger
-- 1. Adds 'email' which is required in the live DB
-- 2. Ensures 'role' is never null (required in live DB)
-- 3. REMOVES the reference to the non-existent 'producers' table

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;