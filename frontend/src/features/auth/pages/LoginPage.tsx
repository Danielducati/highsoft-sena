import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Sparkles, Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { ForgotPasswordDialog } from "../components/Forgotpassworddialog";
import { LoginPageProps } from "../types";
import { useLogin } from "../hooks/Uselogin";

export function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const {
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    loading,
    forgotPasswordOpen, setForgotPasswordOpen,
    recoveryEmail, setRecoveryEmail,
    recoverySuccess,
    handleLogin,
    handleForgotPassword,
    handleCloseRecoveryDialog,
  } = useLogin(onLogin);

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
                ) : "Iniciar Sesión"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <ForgotPasswordDialog
          open={forgotPasswordOpen}
          onClose={handleCloseRecoveryDialog}
          recoveryEmail={recoveryEmail}
          setRecoveryEmail={setRecoveryEmail}
          recoverySuccess={recoverySuccess}
          onSubmit={handleForgotPassword}
        />
      </div>
    </div>
  );
}