-- NOTE: Please ensure the pg_net extension is enabled in your database:
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- Replace 'YOUR_PROJECT_REF' with your actual Supabase project reference
-- Replace 'send-push-notification' if you named the edge function differently

-- A generic function to trigger the edge function
CREATE OR REPLACE FUNCTION notify_onesignal_edge_function()
RETURNS trigger AS $$
DECLARE
  payload JSONB;
  user_id UUID;
  title TEXT;
  body TEXT;
BEGIN
  -- Determine which event happened and format the message accordingly
  
  -- 1. New Message
  IF TG_TABLE_NAME = 'messages' THEN
    user_id := NEW.receiver_id;
    title := 'New Message';
    body := 'You have received a new message.';
    
  -- 2. New Offer (Homeowner)
  ELSIF TG_TABLE_NAME = 'offers' AND TG_OP = 'INSERT' THEN
    -- Assuming offers point to a project, and you need to join to find homeowner_id
    -- You might need a subquery like: SELECT homeowner_id INTO user_id FROM projects WHERE id = NEW.project_id;
    user_id := NEW.homeowner_id; 
    title := 'New Offer Received';
    body := 'A tradie has submitted a new offer for your project.';
    
  -- 3. Offer Accepted (Tradie)
  ELSIF TG_TABLE_NAME = 'offers' AND TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    user_id := NEW.tradie_id;
    title := 'Offer Accepted!';
    body := 'Your offer has been accepted by the homeowner.';

  -- 4. New Job Request (Tradie)
  ELSIF TG_TABLE_NAME = 'job_requests' THEN
    user_id := NEW.tradie_id;
    title := 'New Job Request';
    body := 'You have received a new background request.';

  -- 5. Milestone Updated (Homeowner)
  ELSIF TG_TABLE_NAME = 'milestones' AND TG_OP = 'UPDATE' THEN
    -- SELECT homeowner_id INTO user_id FROM projects WHERE id = NEW.project_id;
    user_id := NEW.homeowner_id;
    title := 'Project Milestone Updated';
    body := 'A milestone on your project has been updated.';

  -- 6. Payment Received (Tradie)
  ELSIF TG_TABLE_NAME = 'payments' AND TG_OP = 'UPDATE' AND NEW.status = 'paid' AND OLD.status != 'paid' THEN
    user_id := NEW.tradie_id;
    title := 'Payment Received';
    body := 'You have received a payment for your services.';
    
  -- 7. Payment Request (Homeowner)
  ELSIF TG_TABLE_NAME = 'payment_requests' AND TG_OP = 'INSERT' THEN
    user_id := NEW.homeowner_id;
    title := 'New Payment Request';
    body := 'You have received a new payment request from a tradie.';
  END IF;

  -- Build the JSON payload
  payload := jsonb_build_object(
    'user_id', user_id,
    'title', title,
    'body', body,
    'data', jsonb_build_object('table', TG_TABLE_NAME, 'record_id', NEW.id)
  );

  -- Make the HTTP request to the Edge Function async
  PERFORM net.http_post(
      url:='https://erfvdiqeslllqqqebjat.supabase.co/functions/v1/send-push-notification',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZnZkaXFlc2xsbHFxcWViamF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk4ODQ3NiwiZXhwIjoyMDg2NTY0NDc2fQ.itKbQh99tGk5RVRq257MlpUxtZ0UTXQF20jtgbYNcZM"}'::jsonb,
      body:=payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the triggers (Make sure table names match your actual Supabase schema)

-- 1. User receives a new message
DROP TRIGGER IF EXISTS trigger_new_message ON messages;
CREATE TRIGGER trigger_new_message
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION notify_onesignal_edge_function();

-- 2. Homeowner receives a new offer
DROP TRIGGER IF EXISTS trigger_new_offer ON offers;
CREATE TRIGGER trigger_new_offer
AFTER INSERT ON offers
FOR EACH ROW EXECUTE FUNCTION notify_onesignal_edge_function();

-- 3. Tradie offer is accepted
DROP TRIGGER IF EXISTS trigger_offer_accepted ON offers;
CREATE TRIGGER trigger_offer_accepted
AFTER UPDATE OF status ON offers
FOR EACH ROW EXECUTE FUNCTION notify_onesignal_edge_function();

-- 4. Tradie receives a new job request
DROP TRIGGER IF EXISTS trigger_new_job_request ON job_requests;
CREATE TRIGGER trigger_new_job_request
AFTER INSERT ON job_requests
FOR EACH ROW EXECUTE FUNCTION notify_onesignal_edge_function();

-- 5. Homeowner's projects' job milestone has been updated
DROP TRIGGER IF EXISTS trigger_milestone_updated ON milestones;
CREATE TRIGGER trigger_milestone_updated
AFTER UPDATE ON milestones
FOR EACH ROW EXECUTE FUNCTION notify_onesignal_edge_function();

-- 6. Tradie payment has been received
DROP TRIGGER IF EXISTS trigger_payment_received ON payments;
CREATE TRIGGER trigger_payment_received
AFTER UPDATE OF status ON payments
FOR EACH ROW EXECUTE FUNCTION notify_onesignal_edge_function();

-- 7. Homeowner receives a payment request
DROP TRIGGER IF EXISTS trigger_payment_request ON payment_requests;
CREATE TRIGGER trigger_payment_request
AFTER INSERT ON payment_requests
FOR EACH ROW EXECUTE FUNCTION notify_onesignal_edge_function();
