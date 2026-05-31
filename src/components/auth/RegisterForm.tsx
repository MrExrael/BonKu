"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
// import { CheckCircle2 } from "lucide-react"; // dipakai oleh layar verifikasi email (lihat blok yang dikomentari di bawah)
import { toast } from "sonner";

import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type Strength = { score: 0 | 1 | 2 | 3; label: string; className: string };

function getPasswordStrength(password: string): Strength {
  if (!password) return { score: 0, label: "", className: "" };
  let points = 0;
  if (password.length >= 8) points++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) points++;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) points++;

  if (points <= 1)
    return { score: 1, label: "Lemah", className: "bg-destructive" };
  if (points === 2)
    return { score: 2, label: "Sedang", className: "bg-amber-500" };
  return { score: 3, label: "Kuat", className: "bg-emerald-500" };
}

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  // const [submitted, setSubmitted] = React.useState(false); // dipakai layar verifikasi email (lihat blok yang dikomentari di bawah)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const passwordValue = form.watch("password");
  const strength = getPasswordStrength(passwordValue);

  async function onSubmit(values: RegisterInput) {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.full_name },
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/login`
            : undefined,
      },
    });

    if (error) {
      toast.error("Gagal mendaftar", { description: error.message });
      return;
    }

    // Tanpa verifikasi email: langsung masuk ke dashboard.
    // PENTING: agar ini bekerja, "Confirm email" HARUS DINONAKTIFKAN di
    // Supabase (Authentication -> Providers -> Email), supaya signUp langsung
    // mengembalikan session. Jika "Confirm email" aktif, user akan dialihkan
    // kembali ke /login oleh middleware karena belum ada session.
    toast.success("Pendaftaran berhasil");
    router.push("/dashboard");
    router.refresh();

    // ===========================================================================
    // ALUR LAMA: tampilkan layar "cek email verifikasi".
    // Untuk MENGAKTIFKAN KEMBALI verifikasi email:
    //   1. Aktifkan "Confirm email" di Supabase.
    //   2. Hapus 3 baris (toast + router.push + router.refresh) di atas.
    //   3. Uncomment baris di bawah ini.
    //   4. Uncomment state `submitted` (di atas) + blok `if (submitted)` di bawah.
    //   5. Uncomment import CheckCircle2 di bagian atas file.
    // ---------------------------------------------------------------------------
    // setSubmitted(true);
    // toast.success("Pendaftaran berhasil", {
    //   description: "Cek email Anda untuk verifikasi akun.",
    // });
  }

  // ===========================================================================
  // LAYAR VERIFIKASI EMAIL (dinonaktifkan).
  // Uncomment blok ini untuk menampilkan pesan "cek email" setelah daftar.
  // ---------------------------------------------------------------------------
  // if (submitted) {
  //   return (
  //     <div className="flex flex-col items-center gap-3 py-4 text-center">
  //       <CheckCircle2 className="size-12 text-emerald-500" />
  //       <h3 className="text-lg font-semibold">Pendaftaran berhasil!</h3>
  //       <p className="text-sm text-muted-foreground">
  //         Kami telah mengirim email verifikasi ke{" "}
  //         <span className="font-medium text-foreground">
  //           {form.getValues("email")}
  //         </span>
  //         . Silakan periksa kotak masuk Anda untuk mengaktifkan akun.
  //       </p>
  //     </div>
  //   );
  // }

  const isLoading = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input
                  autoComplete="name"
                  placeholder="Budi Santoso"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Minimal 8 karakter"
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showPassword ? "Sembunyikan password" : "Tampilkan password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              {strength.score > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex h-1.5 flex-1 gap-1">
                    {[1, 2, 3].map((bar) => (
                      <div
                        key={bar}
                        className={cn(
                          "h-full flex-1 rounded-full bg-muted transition-colors",
                          bar <= strength.score && strength.className
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {strength.label}
                  </span>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konfirmasi Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Ulangi password"
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showConfirm ? "Sembunyikan password" : "Tampilkan password"
                    }
                  >
                    {showConfirm ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          Daftar
        </Button>
      </form>
    </Form>
  );
}

export default RegisterForm;
