import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Daftar Mata Pelajaran — Sistem Nilai SMK PMI" },
      {
        name: "description",
        content:
          "Kelola daftar mata pelajaran SMK PMI: tambah, ubah, dan hapus mata pelajaran beserta kelompok, jam belajar, dan guru pengajar.",
      },
      { property: "og:title", content: "Daftar Mata Pelajaran — Sistem Nilai SMK PMI" },
      {
        property: "og:description",
        content: "Tambah, ubah, dan hapus mata pelajaran sekolah dengan mudah.",
      },
    ],
  }),
  component: MataPelajaranPage,
});

type MataPelajaran = {
  id: string;
  kode: string;
  nama: string;
  kelompok: string;
  jam_per_minggu: number;
  pengajar: string | null;
};

const KELOMPOK = ["Umum", "Kejuruan", "Muatan Lokal"];

const kosong = {
  kode: "",
  nama: "",
  kelompok: "Umum",
  jam_per_minggu: 2,
  pengajar: "",
};

function MataPelajaranPage() {
  const qc = useQueryClient();
  const [cari, setCari] = useState("");
  const [form, setForm] = useState<typeof kosong>(kosong);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hapusItem, setHapusItem] = useState<MataPelajaran | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["mata_pelajaran"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mata_pelajaran")
        .select("id, kode, nama, kelompok, jam_per_minggu, pengajar")
        .order("kelompok")
        .order("nama");
      if (error) throw error;
      return data as MataPelajaran[];
    },
  });

  const simpan = useMutation({
    mutationFn: async () => {
      const payload = {
        kode: form.kode.trim().toUpperCase(),
        nama: form.nama.trim(),
        kelompok: form.kelompok,
        jam_per_minggu: Number(form.jam_per_minggu) || 0,
        pengajar: form.pengajar.trim() || null,
      };
      if (editId) {
        const { error } = await supabase
          .from("mata_pelajaran")
          .update(payload)
          .eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("mata_pelajaran").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mata_pelajaran"] });
      toast.success(editId ? "Mata pelajaran diperbarui" : "Mata pelajaran ditambahkan");
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error("Gagal menyimpan: " + e.message),
  });

  const hapus = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mata_pelajaran").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mata_pelajaran"] });
      toast.success("Mata pelajaran dihapus");
      setHapusItem(null);
    },
    onError: (e: Error) => toast.error("Gagal menghapus: " + e.message),
  });

  const hasil = useMemo(() => {
    const k = cari.toLowerCase().trim();
    if (!k) return data;
    return data.filter(
      (m) =>
        m.nama.toLowerCase().includes(k) ||
        m.kode.toLowerCase().includes(k) ||
        (m.pengajar ?? "").toLowerCase().includes(k),
    );
  }, [data, cari]);

  const totalJam = hasil.reduce((a, m) => a + m.jam_per_minggu, 0);

  function bukaTambah() {
    setEditId(null);
    setForm(kosong);
    setDialogOpen(true);
  }

  function bukaEdit(m: MataPelajaran) {
    setEditId(m.id);
    setForm({
      kode: m.kode,
      nama: m.nama,
      kelompok: m.kelompok,
      jam_per_minggu: m.jam_per_minggu,
      pengajar: m.pengajar ?? "",
    });
    setDialogOpen(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <header className="border-b bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-8">
          <BookOpen className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mata Pelajaran</h1>
            <p className="text-sm opacity-80">Sistem Nilai SMK PMI</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari mata pelajaran atau guru..."
              className="pl-9"
            />
          </div>
          <Button onClick={bukaTambah}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Mata Pelajaran
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Kode</TableHead>
                  <TableHead>Nama Mata Pelajaran</TableHead>
                  <TableHead>Kelompok</TableHead>
                  <TableHead className="text-center">Jam/Minggu</TableHead>
                  <TableHead>Guru Pengajar</TableHead>
                  <TableHead className="w-24 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && hasil.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Belum ada mata pelajaran.
                    </TableCell>
                  </TableRow>
                )}
                {hasil.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs font-semibold">{m.kode}</TableCell>
                    <TableCell className="font-medium">{m.nama}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{m.kelompok}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{m.jam_per_minggu}</TableCell>
                    <TableCell className="text-muted-foreground">{m.pengajar ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => bukaEdit(m)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setHapusItem(m)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <p className="mt-4 text-sm text-muted-foreground">
          {hasil.length} mata pelajaran · total {totalJam} jam per minggu
        </p>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Ubah Mata Pelajaran" : "Tambah Mata Pelajaran"}</DialogTitle>
            <DialogDescription>Isi data mata pelajaran di bawah ini.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="kode">Kode</Label>
                <Input
                  id="kode"
                  value={form.kode}
                  onChange={(e) => setForm({ ...form, kode: e.target.value })}
                  placeholder="MTK"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="nama">Nama</Label>
                <Input
                  id="nama"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Matematika"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Kelompok</Label>
                <Select
                  value={form.kelompok}
                  onValueChange={(v) => setForm({ ...form, kelompok: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KELOMPOK.map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jam">Jam per minggu</Label>
                <Input
                  id="jam"
                  type="number"
                  min={0}
                  value={form.jam_per_minggu}
                  onChange={(e) =>
                    setForm({ ...form, jam_per_minggu: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pengajar">Guru Pengajar</Label>
              <Input
                id="pengajar"
                value={form.pengajar}
                onChange={(e) => setForm({ ...form, pengajar: e.target.value })}
                placeholder="Nama guru (opsional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                if (!form.kode.trim() || !form.nama.trim()) {
                  toast.error("Kode dan nama wajib diisi");
                  return;
                }
                simpan.mutate();
              }}
              disabled={simpan.isPending}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!hapusItem} onOpenChange={(o) => !o && setHapusItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus mata pelajaran?</AlertDialogTitle>
            <AlertDialogDescription>
              "{hapusItem?.nama}" akan dihapus permanen dari daftar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => hapusItem && hapus.mutate(hapusItem.id)}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
