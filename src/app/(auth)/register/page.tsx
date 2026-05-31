import Link from "next/link";
import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/RegisterForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Daftar - BonKu",
};

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat akun baru</CardTitle>
        <CardDescription>
          Mulai catat keuangan usaha Anda dengan BonKu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Masuk
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
