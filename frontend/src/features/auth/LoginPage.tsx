import { useState } from "react";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../shared/ui/dialog";
import { Sparkles, Shield, Mail, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

const API_URL = "http://localhost:3001";

// Mapa de roles BD → roles del frontend
const ROL_MAP: Record<string, 'admin' | 'employee' | 'client'> = {
  "Admin": "admin",           // ← este es el que devuelve tu BD
  "Administrador": "admin",   // ← por si acaso
  "Empleado": "employee",
  "Barbero": "employee",
  "Estilista": "employee",
  "Manicurista": "employee",
  "Cosmetologa": "employee",
  "Masajista": "employee",
  "Cliente": "client",
};

interface LoginPageProps {
  onLogin: (role: 'admin' | 'employee' | 'client') => void;
  onBack: () => void;
}

export function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Por favor ingresa tu correo y contraseña");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, contrasena: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Error al iniciar sesión");
        return;
      }

      // Guardar token y usuario en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      // Mapear rol de BD al rol del frontend
      const rolFrontend = ROL_MAP[data.usuario.rol] || "client";

      toast.success(`¡Bienvenido! Accediendo como ${data.usuario.rol}`);
      onLogin(rolFrontend);

    } catch (error) {
      toast.error("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recoveryEmail) {
      toast.error("Por favor ingresa tu correo electrónico");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recoveryEmail)) {
      toast.error("Por favor ingresa un correo electrónico válido");
      return;
    }

    setTimeout(() => {
      setRecoverySuccess(true);
      toast.success("Correo de recuperación enviado exitosamente");
    }, 1000);
  };

  const handleCloseRecoveryDialog = () => {
    setForgotPasswordOpen(false);
    setRecoveryEmail("");
    setRecoverySuccess(false);
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver al inicio
          </button>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-foreground" />
            </div>
            <h1 className="text-3xl text-foreground">HIGHLIFE SPA & BAR</h1>
          </div>
          <p className="text-muted-foreground">Sistema de Gestión Integral de Spa y Bienestar</p>
        </div>

        {/* Login Card */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Iniciar Sesión
            </CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@highlifespa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end text-sm">
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-foreground"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Iniciando sesión...
                  </span>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Forgot Password Dialog */}
        <Dialog open={forgotPasswordOpen} onOpenChange={handleCloseRecoveryDialog}>
          <DialogContent className="sm:max-w-[480px]">
            {!recoverySuccess ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Recuperar Contraseña
                  </DialogTitle>
                  <DialogDescription>
                    Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recovery-email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="recovery-email"
                        type="email"
                        placeholder="tu_correo@ejemplo.com"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleCloseRecoveryDialog}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-foreground">
                      Enviar Enlace
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Correo Enviado
                  </DialogTitle>
                </DialogHeader>
                <div className="py-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-green-800 mb-1">¡Correo enviado exitosamente!</p>
                        <p className="text-xs text-green-700">
                          Hemos enviado un enlace de recuperación a <span className="font-semibold">{recoveryEmail}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-800">
                      <span className="font-semibold">Nota:</span> Si no recibes el correo, revisa tu carpeta de spam.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleCloseRecoveryDialog} className="bg-primary hover:bg-primary/90 text-foreground">
                    Entendido
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}