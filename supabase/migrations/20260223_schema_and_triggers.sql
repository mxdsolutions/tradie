-- ==============================================================================
-- 1. SCHEMA DEFINITIONS (Create missing tables based on business logic)
-- ==============================================================================

-- A. OFFERS TABLE (Tradie offering to do a public project)
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    tradie_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, tradie_id)
);

-- B. JOB INVITATIONS TABLE (Homeowner inviting a Tradie to a project)
CREATE TABLE IF NOT EXISTS public.job_invitations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    homeowner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tradie_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, tradie_id)
);

-- C. PAYMENT REQUESTS TABLE (Tradie requesting payment from Homeowner)
CREATE TABLE IF NOT EXISTS public.payment_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    tradie_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    homeowner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    title TEXT NOT NULL, -- e.g., 'Deposit', 'Stage 1', 'Final Payment'
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- D. NOTIFICATIONS TABLE (Centralized inbox, just in case it doesn't exist)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT, -- e.g., 'message', 'project', 'quote', 'payment'
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 2. EVENT TRIGGERS -> POPULATE NOTIFICATIONS TABLE
-- ==============================================================================

-- 1. New Message -> Notification
CREATE OR REPLACE FUNCTION public.handle_new_message() RETURNS TRIGGER AS $$
DECLARE
    v_recipient_id UUID;
    v_sender_name TEXT;
BEGIN
    SELECT user_id INTO v_recipient_id FROM public.chat_participants WHERE chat_id = NEW.chat_id AND user_id != NEW.sender_id LIMIT 1;
    SELECT full_name INTO v_sender_name FROM public.users WHERE id = NEW.sender_id;

    IF v_recipient_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (v_recipient_id, coalesce(v_sender_name, 'New Message'), left(NEW.content, 100), 'message');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_new_message ON public.messages;
CREATE TRIGGER trigger_new_message AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();

-- 2. New Offer -> Notification
CREATE OR REPLACE FUNCTION public.handle_new_offer() RETURNS TRIGGER AS $$
DECLARE
    v_homeowner_id UUID;
    v_project_title TEXT;
    v_sender_name TEXT;
BEGIN
    SELECT homeowner_id, title INTO v_homeowner_id, v_project_title FROM public.projects WHERE id = NEW.project_id;
    SELECT full_name INTO v_sender_name FROM public.users WHERE id = NEW.tradie_id;

    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (v_homeowner_id, 'New Offer Received! 🎉', coalesce(v_sender_name, 'A tradie') || ' made an offer on ' || coalesce(v_project_title, 'your project'), 'quote');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_new_offer ON public.offers;
CREATE TRIGGER trigger_new_offer AFTER INSERT ON public.offers FOR EACH ROW EXECUTE FUNCTION public.handle_new_offer();

-- 3. Offer Accepted -> Notification
CREATE OR REPLACE FUNCTION public.handle_offer_accepted() RETURNS TRIGGER AS $$
DECLARE
    v_project_title TEXT;
BEGIN
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        SELECT title INTO v_project_title FROM public.projects WHERE id = NEW.project_id;
        
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (NEW.tradie_id, 'Offer Accepted! 🤝', 'Your offer for ' || coalesce(v_project_title, 'the project') || ' was accepted.', 'project');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_offer_accepted ON public.offers;
CREATE TRIGGER trigger_offer_accepted AFTER UPDATE OF status ON public.offers FOR EACH ROW EXECUTE FUNCTION public.handle_offer_accepted();

-- 4. New Job Invitation -> Notification
CREATE OR REPLACE FUNCTION public.handle_job_invitation() RETURNS TRIGGER AS $$
DECLARE
    v_project_title TEXT;
    v_sender_name TEXT;
BEGIN
    SELECT title INTO v_project_title FROM public.projects WHERE id = NEW.project_id;
    SELECT full_name INTO v_sender_name FROM public.users WHERE id = NEW.homeowner_id;

    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (NEW.tradie_id, 'New Job Invitation 📋', coalesce(v_sender_name, 'A homeowner') || ' invited you to quote on ' || coalesce(v_project_title, 'a project'), 'project');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_new_job_invitation ON public.job_invitations;
CREATE TRIGGER trigger_new_job_invitation AFTER INSERT ON public.job_invitations FOR EACH ROW EXECUTE FUNCTION public.handle_job_invitation();

-- 5. Milestone Updated -> Notification
CREATE OR REPLACE FUNCTION public.handle_milestone_updated() RETURNS TRIGGER AS $$
DECLARE
    v_homeowner_id UUID;
    v_project_title TEXT;
BEGIN
    IF NEW.status != OLD.status OR NEW.title != OLD.title THEN
        SELECT homeowner_id, title INTO v_homeowner_id, v_project_title FROM public.projects WHERE id = NEW.project_id;

        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (v_homeowner_id, 'Milestone Updated 🚧', 'The milestone "' || NEW.title || '" for ' || coalesce(v_project_title, 'your project') || ' is now ' || NEW.status, 'project');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_milestone_updated ON public.milestones;
CREATE TRIGGER trigger_milestone_updated AFTER UPDATE OF status, title ON public.milestones FOR EACH ROW EXECUTE FUNCTION public.handle_milestone_updated();

-- 6. Payment Received -> Notification
CREATE OR REPLACE FUNCTION public.handle_payment_received() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.amount > 0 THEN
        -- Adjust 'user_id' based on actual transactions schema if it points to tradie
        BEGIN
            INSERT INTO public.notifications (user_id, title, message, type)
            VALUES (NEW.user_id, 'Payment Received! 💰', 'You received a payment of $' || NEW.amount, 'payment');
        EXCEPTION WHEN undefined_column THEN
            RETURN NEW;
        END;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_new_transaction ON public.transactions;
CREATE TRIGGER trigger_new_transaction AFTER INSERT ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.handle_payment_received();

-- 7. Payment Request -> Notification
CREATE OR REPLACE FUNCTION public.handle_payment_request() RETURNS TRIGGER AS $$
DECLARE
    v_project_title TEXT;
    v_sender_name TEXT;
BEGIN
    SELECT title INTO v_project_title FROM public.projects WHERE id = NEW.project_id;
    SELECT full_name INTO v_sender_name FROM public.users WHERE id = NEW.tradie_id;

    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (NEW.homeowner_id, 'Payment Request 💳', coalesce(v_sender_name, 'Your tradie') || ' requested $' || NEW.amount || ' for ' || coalesce(v_project_title, 'your project'), 'payment');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_new_payment_request ON public.payment_requests;
CREATE TRIGGER trigger_new_payment_request AFTER INSERT ON public.payment_requests FOR EACH ROW EXECUTE FUNCTION public.handle_payment_request();

-- ==============================================================================
-- 3. CENTRALIZED PUSH NOTIFICATION TRIGGER (Listens to notifications table)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.trigger_push_from_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- We ONLY send a push if the insert is successful in the notifications table
  PERFORM net.http_post(
    url := 'https://' || current_setting('custom.project_ref') || '.supabase.co/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('custom.service_role_key')
    ),
    body := jsonb_build_object(
      'user_id', NEW.user_id,
      'title', NEW.title,
      'body', NEW.message,
      'data', jsonb_build_object('notification_id', NEW.id, 'type', NEW.type)
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error pushing notification: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Apply the master push notification hook to the unified notifications table
DROP TRIGGER IF EXISTS trigger_send_push ON public.notifications;
CREATE TRIGGER trigger_send_push
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.trigger_push_from_notification();
