import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { users } from "@/lib/api";
import { useUser } from "@/context/UserContext";

type UserType = "student" | "tutor" | "company";

const DEMO_EMAILS: Record<UserType, { email: string; label: string }> = {
  student: { email: "mateo.rodriguez@example.com", label: "Estudiante" },
  tutor: { email: "alejandro.silva@example.com", label: "Tutor" },
  company: { email: "carlos.ramirez@company.com", label: "Empresa" },
};

const ROLE_PATHS: Record<string, string> = {
  student: "/student",
  tutor: "/tutor",
  company_admin: "/companies",
  admin: "/student",
};

export function Login() {
  const [, navigate] = useLocation();
  const { setCurrentUser } = useUser();
  const [userType, setUserType] = useState<UserType>("student");
  const [email, setEmail] = useState(DEMO_EMAILS.student.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleTypeChange(type: UserType) {
    setUserType(type);
    setEmail(DEMO_EMAILS[type].email);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const allUsers = await users.list();
      const found = allUsers.find((u) => u.email === email.trim());
      if (!found) {
        setError("Usuario no encontrado.");
        return;
      }
      setCurrentUser(found);
      navigate(ROLE_PATHS[found.role] ?? "/student");
    } catch {
      setError("Error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#4F46E5] mb-2 tracking-tight">CapacitaYa</h1>
        <p className="text-slate-500 mb-6">Ingresá para continuar</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Selector de tipo */}
          <div className="flex gap-2">
            {(Object.entries(DEMO_EMAILS) as [UserType, { email: string; label: string }][]).map(
              ([type, { label }]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${userType === type
                    ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-[#4F46E5]"
                    }`}
                >
                  {label}
                </button>
              )
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          {/* Contraseña — ignorada por ahora */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#4F46E5] hover:bg-[#4338CA]"
          >
            {isLoading ? "Verificando..." : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
