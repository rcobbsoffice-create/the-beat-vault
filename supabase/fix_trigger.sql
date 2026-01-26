-- FIX: handle_new_user trigger fails because it misses 'email' in insert
-- but the live database 'profiles' table has 'email' as a required column.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name',
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  );

  -- If producer, create entry
  IF (new.raw_user_meta_data->>'role' = 'producer') THEN
    INSERT INTO public.producers (profile_id, store_slug)
    VALUES (
      new.id,
      LOWER(REPLACE(new.raw_user_meta_data->>'display_name', ' ', '-'))
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;