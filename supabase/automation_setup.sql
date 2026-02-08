-- Contact Automation: Syncing Profiles and Orders to Contacts

-- 1. Sync New Profiles to Contacts
CREATE OR REPLACE FUNCTION public.sync_profile_to_contacts()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.contacts (id, email, first_name, source, owner_id, tags)
  VALUES (
    new.id,
    new.email,
    new.display_name,
    'manual', -- Users created via platform are considered 'internal' but we use manual as the enum supports it
    new.id,   -- In this case, the owner is themselves or they are added to the general pool
    ARRAY[new.role]
  )
  ON CONFLICT (email, owner_id) DO UPDATE SET
    tags = array_distinct(array_cat(contacts.tags, ARRAY[new.role])),
    updated_at = now();
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_sync ON public.profiles;

CREATE TRIGGER on_profile_created_sync
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.sync_profile_to_contacts();

-- 2. Sync New Paid Orders to Contacts
CREATE OR REPLACE FUNCTION public.sync_order_to_contacts()
RETURNS trigger AS $$
DECLARE
  v_owner_id UUID;
BEGIN
  -- Find the profile_id of the producer involved in the order
  SELECT profile_id INTO v_owner_id 
  FROM public.producers 
  WHERE id = NEW.producer_id;

  IF (NEW.payment_status = 'paid') THEN
    INSERT INTO public.contacts (email, source, tags, metadata, owner_id)
    VALUES (
      new.customer_email,
      'manual',
      ARRAY['customer'],
      jsonb_build_object('last_order_id', new.id, 'total_spent', new.total_amount),
      v_owner_id
    )
    ON CONFLICT (email, owner_id) DO UPDATE SET
      tags = array_distinct(array_cat(contacts.tags, ARRAY['customer'])),
      metadata = contacts.metadata || jsonb_build_object('last_order_id', new.id),
      updated_at = now();
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: We might need to handle owner_id for orders if they are tied to a producer
-- For now adding to global contacts pool (where owner_id is NULL or a system admin)

DROP TRIGGER IF EXISTS on_order_paid_sync ON public.orders;

CREATE TRIGGER on_order_paid_sync
  AFTER UPDATE ON public.orders
  FOR EACH ROW 
  WHEN (OLD.payment_status IS DISTINCT FROM NEW.payment_status)
  EXECUTE PROCEDURE public.sync_order_to_contacts();

-- Helper function for array distinct
CREATE OR REPLACE FUNCTION array_distinct(anyarray)
RETURNS anyarray AS $$
  SELECT ARRAY(SELECT DISTINCT unnest($1))
$$ LANGUAGE sql IMMUTABLE;