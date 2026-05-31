"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validations/auth";
import {
  changePassword,
  getProfile,
  updateProfile,
} from "@/lib/services/profiles";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [savingProfile, setSavingProfile] = React.useState(false);

  const [showOld, setShowOld] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);

  React.useEffect(() => {
    getProfile().then(({ data }) => {
      if (data) {
        setFullName(data.full_name ?? "");
        setEmail(data.email ?? "");
      }
      setLoading(false);
    });
  }, []);

  async function handleSaveProfile() {
    if (!fullName.trim()) {
      toast.error("Nama lengkap tidak boleh kosong.");
      return;
    }
    setSavingProfile(true);
    const { error } = await updateProfile({ full_name: fullName.trim() });
    setSavingProfile(false);
    if (error) {
      toast.error("Gagal menyimpan profil", { description: error });
      return;
    }
    toast.success("Profil diperbarui");
    router.refresh();
  }

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { old_password: "", password: "", confirm_password: "" },
  });

  async function handleChangePassword(values: ChangePasswordInput) {
    const { error } = await changePassword(values.old_password, values.password);
    if (error) {
      toast.error("Gagal mengganti password", { description: error });
      return;
    }
    toast.success("Password berhasil diganti");
    passwordForm.reset();
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const passwordSubmitting = passwordForm.formState.isSubmitting;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Akun</h1>
        <p className="text-sm text-muted-foreground">
          Kelola informasi akun dan keamanan Anda.
        </p>
      </div>

      {/* Section 1 - Info Profil */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Profil</CardTitle>
          <CardDescription>Perbarui nama tampilan Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="text-lg">
                {initials(fullName || email || "?")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{fullName || "—"}</p>
              <p className="truncate text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="full-name">Nama Lengkap</Label>
              <Input
                id="full-name"
                value={fullName}
                disabled={loading}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled readOnly />
              <p className="text-xs text-muted-foreground">
                Email tidak dapat diubah dari sini.
              </p>
            </div>
          </div>

          <Button onClick={handleSaveProfile} disabled={savingProfile || loading}>
            {savingProfile && <Loader2 className="size-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </CardContent>
      </Card>

      {/* Section 2 - Keamanan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Keamanan</CardTitle>
          <CardDescription>Ganti password akun Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(handleChangePassword)}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
                name="old_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Lama</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showOld ? "text" : "password"}
                          autoComplete="current-password"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowOld((v) => !v)}
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                          aria-label="Tampilkan/sembunyikan password"
                        >
                          {showOld ? (
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

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password Baru</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showNew ? "text" : "password"}
                            autoComplete="new-password"
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNew((v) => !v)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                            aria-label="Tampilkan/sembunyikan password"
                          >
                            {showNew ? (
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

                <FormField
                  control={passwordForm.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konfirmasi Password Baru</FormLabel>
                      <FormControl>
                        <Input
                          type={showNew ? "text" : "password"}
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={passwordSubmitting}>
                {passwordSubmitting && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Ganti Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Section 3 - Sesi & Keluar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sesi</CardTitle>
          <CardDescription>
            Login sebagai{" "}
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="destructive" />}
            >
              <LogOut className="size-4" />
              Keluar
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Keluar dari akun?</AlertDialogTitle>
                <AlertDialogDescription>
                  Anda akan keluar dan diarahkan ke halaman login.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
                  Keluar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
