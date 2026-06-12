CREATE TABLE IF NOT EXISTS otp_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  otp_type VARCHAR(50) NOT NULL CHECK (otp_type IN ('registration', 'password_reset')),
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_otp_attempts_email_type ON otp_attempts(email, otp_type);
ALTER TABLE otp_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow OTP insert" ON otp_attempts FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY "Allow OTP select" ON otp_attempts FOR SELECT TO anon USING (TRUE);
CREATE POLICY "Allow OTP update" ON otp_attempts FOR UPDATE TO anon USING (TRUE) WITH CHECK (TRUE);
