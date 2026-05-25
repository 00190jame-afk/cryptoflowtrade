
-- ===== deposit_wallets =====
CREATE TABLE public.deposit_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coin text NOT NULL,
  network text NOT NULL,
  wallet_address text NOT NULL,
  qr_code_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_deposit_wallets_active ON public.deposit_wallets(coin, network) WHERE is_active = true;

ALTER TABLE public.deposit_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deposit_wallets_select_active_authed"
  ON public.deposit_wallets FOR SELECT
  TO authenticated
  USING (is_active = true OR public.is_any_admin());

CREATE POLICY "deposit_wallets_admin_all"
  ON public.deposit_wallets FOR ALL
  USING (public.is_any_admin())
  WITH CHECK (public.is_any_admin());

CREATE TRIGGER trg_deposit_wallets_updated_at
  BEFORE UPDATE ON public.deposit_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== deposit_requests =====
CREATE TABLE public.deposit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  coin text NOT NULL,
  network text NOT NULL,
  wallet_address text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  screenshot_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_note text,
  processed_by uuid,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_deposit_requests_user ON public.deposit_requests(user_id, created_at DESC);
CREATE INDEX idx_deposit_requests_status ON public.deposit_requests(status, created_at DESC);

ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deposit_requests_user_insert"
  ON public.deposit_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "deposit_requests_select"
  ON public.deposit_requests FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_super_admin()
    OR (public.is_any_admin() AND user_id IN (SELECT u.user_id FROM public.get_admin_assigned_users(auth.uid()) u))
  );

CREATE POLICY "deposit_requests_admin_update"
  ON public.deposit_requests FOR UPDATE
  USING (public.is_any_admin())
  WITH CHECK (public.is_any_admin());

CREATE POLICY "deposit_requests_admin_delete"
  ON public.deposit_requests FOR DELETE
  USING (public.is_super_admin());

CREATE TRIGGER trg_deposit_requests_updated_at
  BEFORE UPDATE ON public.deposit_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Duplicate-submission guard
CREATE OR REPLACE FUNCTION public.deposit_request_dup_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.deposit_requests
    WHERE user_id = NEW.user_id
      AND status = 'pending'
      AND created_at > now() - interval '60 seconds'
  ) THEN
    RAISE EXCEPTION 'Please wait a minute before submitting another deposit request';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_deposit_request_dup_guard
  BEFORE INSERT ON public.deposit_requests
  FOR EACH ROW EXECUTE FUNCTION public.deposit_request_dup_guard();

-- Approval trigger: credit balance + insert transaction (idempotent)
CREATE OR REPLACE FUNCTION public.process_deposit_request_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
    IF NEW.processed_at IS NULL THEN
      NEW.processed_at := now();
    END IF;
    IF NEW.processed_by IS NULL THEN
      NEW.processed_by := auth.uid();
    END IF;

    -- Credit balance
    UPDATE public.user_balances
    SET balance = COALESCE(balance, 0) + NEW.amount, updated_at = now()
    WHERE user_id = NEW.user_id;

    IF NOT FOUND THEN
      INSERT INTO public.user_balances (user_id, balance, currency)
      VALUES (NEW.user_id, NEW.amount, 'USDT');
    END IF;

    -- Insert audit transaction (idempotent on external_transaction_id)
    IF NOT EXISTS (
      SELECT 1 FROM public.transactions
      WHERE external_transaction_id = 'DEP-' || NEW.id::text
    ) THEN
      INSERT INTO public.transactions (
        user_id, type, amount, status, currency, payment_method,
        external_transaction_id, description
      ) VALUES (
        NEW.user_id, 'deposit', NEW.amount, 'completed', 'USDT', 'quick_deposit',
        'DEP-' || NEW.id::text, 'Quick deposit approved (' || NEW.coin || '/' || NEW.network || ')'
      );
    END IF;
  ELSIF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
    IF NEW.processed_at IS NULL THEN
      NEW.processed_at := now();
    END IF;
    IF NEW.processed_by IS NULL THEN
      NEW.processed_by := auth.uid();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_process_deposit_request_status
  BEFORE UPDATE ON public.deposit_requests
  FOR EACH ROW EXECUTE FUNCTION public.process_deposit_request_status();

-- ===== Storage buckets =====
INSERT INTO storage.buckets (id, name, public) VALUES ('deposit-qr', 'deposit-qr', true)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('deposit-proofs', 'deposit-proofs', false)
  ON CONFLICT (id) DO NOTHING;

-- deposit-qr policies (public read, admin write)
CREATE POLICY "deposit_qr_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'deposit-qr');

CREATE POLICY "deposit_qr_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'deposit-qr' AND public.is_any_admin());

CREATE POLICY "deposit_qr_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'deposit-qr' AND public.is_any_admin());

CREATE POLICY "deposit_qr_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'deposit-qr' AND public.is_any_admin());

-- deposit-proofs policies (user uploads own folder, admins read all)
CREATE POLICY "deposit_proofs_user_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'deposit-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "deposit_proofs_user_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'deposit-proofs'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.is_any_admin()
    )
  );

CREATE POLICY "deposit_proofs_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'deposit-proofs' AND public.is_any_admin());
