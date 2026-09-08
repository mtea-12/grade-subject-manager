CREATE TABLE public.mata_pelajaran (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kode text NOT NULL,
  nama text NOT NULL,
  kelompok text NOT NULL DEFAULT 'Umum',
  jam_per_minggu integer NOT NULL DEFAULT 2,
  pengajar text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mata_pelajaran TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mata_pelajaran TO authenticated;
GRANT ALL ON public.mata_pelajaran TO service_role;

ALTER TABLE public.mata_pelajaran ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Semua bisa melihat mata pelajaran" ON public.mata_pelajaran FOR SELECT USING (true);
CREATE POLICY "Semua bisa menambah mata pelajaran" ON public.mata_pelajaran FOR INSERT WITH CHECK (true);
CREATE POLICY "Semua bisa mengubah mata pelajaran" ON public.mata_pelajaran FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Semua bisa menghapus mata pelajaran" ON public.mata_pelajaran FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_mata_pelajaran_updated_at
BEFORE UPDATE ON public.mata_pelajaran
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.mata_pelajaran (kode, nama, kelompok, jam_per_minggu, pengajar) VALUES
('PAI', 'Pendidikan Agama dan Budi Pekerti', 'Umum', 3, 'Ust. Ahmad Fauzi'),
('PPKN', 'Pendidikan Pancasila dan Kewarganegaraan', 'Umum', 2, 'Dra. Siti Aminah'),
('BIN', 'Bahasa Indonesia', 'Umum', 4, 'Rini Kartika, S.Pd.'),
('MTK', 'Matematika', 'Umum', 4, 'Budi Santoso, S.Pd.'),
('BIG', 'Bahasa Inggris', 'Umum', 3, 'Nur Halimah, S.Pd.'),
('PJOK', 'Pendidikan Jasmani, Olahraga dan Kesehatan', 'Umum', 2, 'Agus Priyono, S.Or.'),
('SEJ', 'Sejarah', 'Umum', 2, 'Dedi Kurniawan, S.Pd.'),
('INF', 'Informatika', 'Kejuruan', 4, 'Rizky Pratama, S.Kom.'),
('PKK', 'Produk Kreatif dan Kewirausahaan', 'Kejuruan', 5, 'Lia Marlina, S.E.'),
('BASUN', 'Bahasa Sunda', 'Muatan Lokal', 2, 'Wawan Setiawan, S.Pd.');