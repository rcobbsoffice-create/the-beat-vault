-- FIX V3: Explicit Role Mapping & Email
-- 1. Uses actual valid roles from live DB: ('artist', 'producer', 'admin')
-- 2. Defaults to 'artist' instead of 'customer' (since 'customer' is invalid)
-- 3. Required 'email' included.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    CASE 
      WHEN new.raw_user_meta_data->>'role' IN ('artist', 'producer', 'admin') THEN new.raw_user_meta_data->>'role'
      ELSE 'artist' -- Default to artist as it exists and is safer than a null/invalid role
    END
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;