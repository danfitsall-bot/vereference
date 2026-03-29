-- VeReference Database Schema
-- AI-Powered Reference Collection & Verification Platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PROFILES (extends Supabase Auth users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  company_domain TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  credits_remaining INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- CANDIDATES
-- ============================================
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position_applied TEXT NOT NULL,
  department TEXT,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  token_expires_at TIMESTAMPTZ DEFAULT (now() + interval '14 days'),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'submitted', 'completed', 'expired')),
  referee_count_required INT DEFAULT 2,
  consent_given BOOLEAN DEFAULT false,
  consent_given_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recruiters manage own candidates" ON candidates FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_candidates_user_id ON candidates(user_id);
CREATE INDEX idx_candidates_token ON candidates(token);
CREATE INDEX idx_candidates_status ON candidates(status);

-- ============================================
-- REFEREES
-- ============================================
CREATE TABLE referees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  relationship TEXT NOT NULL CHECK (relationship IN ('manager', 'colleague', 'direct_report', 'other')),
  company TEXT NOT NULL,
  job_title TEXT,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  token_expires_at TIMESTAMPTZ DEFAULT (now() + interval '14 days'),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'email_sent', 'in_progress', 'completed', 'declined', 'expired')),
  contact_method TEXT DEFAULT 'email' CHECK (contact_method IN ('email', 'voice', 'both')),
  email_sent_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  geolocation JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE referees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recruiters manage own referees" ON referees FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_referees_candidate_id ON referees(candidate_id);
CREATE INDEX idx_referees_token ON referees(token);
CREATE INDEX idx_referees_status ON referees(status);

-- ============================================
-- RESPONSES (questionnaire answers)
-- ============================================
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referee_id UUID NOT NULL REFERENCES referees(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT,
  answer_rating INT CHECK (answer_rating >= 1 AND answer_rating <= 5),
  source TEXT DEFAULT 'form' CHECK (source IN ('form', 'voice_transcript', 'voice_summary')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recruiters read own responses" ON responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role inserts responses" ON responses FOR INSERT WITH CHECK (true);

CREATE INDEX idx_responses_referee_id ON responses(referee_id);

-- ============================================
-- VOICE SESSIONS
-- ============================================
CREATE TABLE voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referee_id UUID NOT NULL REFERENCES referees(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'gemini_live',
  session_type TEXT DEFAULT 'browser' CHECK (session_type IN ('browser', 'phone')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'failed', 'no_answer')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INT,
  recording_url TEXT,
  transcript_raw JSONB,
  transcript_summary TEXT,
  cost_cents INT,
  external_call_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recruiters read own voice sessions" ON voice_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages voice sessions" ON voice_sessions FOR ALL WITH CHECK (true);

CREATE INDEX idx_voice_sessions_referee_id ON voice_sessions(referee_id);

-- ============================================
-- FRAUD SIGNALS
-- ============================================
CREATE TABLE fraud_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES referees(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('ip_match', 'device_match', 'free_email', 'timing_suspicious', 'domain_mismatch', 'geo_mismatch')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  metadata JSONB,
  dismissed BOOLEAN DEFAULT false,
  dismissed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE fraud_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recruiters read own fraud signals" ON fraud_signals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Recruiters dismiss own fraud signals" ON fraud_signals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role inserts fraud signals" ON fraud_signals FOR INSERT WITH CHECK (true);

CREATE INDEX idx_fraud_signals_candidate_id ON fraud_signals(candidate_id);

-- ============================================
-- QUESTIONS TEMPLATE
-- ============================================
CREATE TABLE questions_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'text' CHECK (question_type IN ('text', 'rating', 'yes_no', 'multi_choice')),
  options JSONB,
  sort_order INT DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE questions_template ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read system or own templates" ON questions_template FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Manage own templates" ON questions_template FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- EMAIL LOG
-- ============================================
CREATE TABLE email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  template_name TEXT NOT NULL,
  resend_id TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'bounced', 'failed')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;
-- Only accessible via service role (no user-facing policies)

-- ============================================
-- SEED: Default Questions
-- ============================================
INSERT INTO questions_template (user_id, question_key, question_text, question_type, sort_order, is_required) VALUES
  (NULL, 'relationship', 'What was your working relationship with the candidate?', 'text', 0, true),
  (NULL, 'duration', 'How long did you work together?', 'text', 1, true),
  (NULL, 'role_description', 'Can you describe their role and responsibilities?', 'text', 2, true),
  (NULL, 'strengths', 'What would you say are their key strengths?', 'text', 3, true),
  (NULL, 'improvement', 'What areas could they improve in?', 'text', 4, true),
  (NULL, 'performance_rating', 'How would you rate their overall performance?', 'rating', 5, true),
  (NULL, 'teamwork', 'How well did they work with the team?', 'text', 6, true),
  (NULL, 'reliability', 'How would you describe their reliability and work ethic?', 'text', 7, true),
  (NULL, 'reason_leaving', 'Why did they leave the role?', 'text', 8, false),
  (NULL, 'rehire', 'Would you work with them again?', 'yes_no', 9, true),
  (NULL, 'additional', 'Is there anything else you would like to share?', 'text', 10, false);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referees_updated_at BEFORE UPDATE ON referees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
