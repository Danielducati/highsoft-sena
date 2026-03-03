import { useState } from "react";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Card, CardContent } from "../../shared/ui/card";
import { Sparkles, ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";

const API_URL = "http://localhost:3001";

interface RegisterPageProps {
  onBack: () => void;
  onRegisterSuccess: () => void;
}

export function RegisterPage({ onBack, onRegisterSuccess }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    apellido: "",
    email: "",
    phone: "",
    tipocedula: "",
    cedula: "",
    password: "",
    confirmPassword: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.apellido || !formData.email || !formData.phone || !formData.tipocedula || !formData.cedula || !formData.password || !formData.confirmPassword) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Por favor ingresa un correo electrónico válido");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: formData.email,
          contrasena: formData.password,
          nombre: formData.fullName,
          apellido: formData.apellido,
          telefono: formData.phone,
          tipo_documento: formData.tipocedula,
          numero_documento: formData.cedula,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Error al registrar usuario");
        return;
      }

      setShowSuccess(true);
      setTimeout(() => {
        onRegisterSuccess();
      }, 2500);

    } catch (error) {
      toast.error("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#78D1BD]/10 via-[#60A5FA]/10 to-[#A78BFA]/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-gray-200 shadow-2xl">
          <CardContent className="p-12">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl text-gray-900">¡Registro Exitoso!</h2>
                <p className="text-gray-600">Tu cuenta ha sido creada correctamente. Bienvenido a HIGHLIFE SPA & BAR.</p>
              </div>
              <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                <CheckCircle2 className="w-4 h-4 text-[#78D1BD]" />
                <span>Usuario registrado exitosamente</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#78D1BD]/10 via-[#60A5FA]/10 to-[#A78BFA]/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#78D1BD] to-[#5FBFAA] flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl text-gray-900">HIGHLIFE SPA & BAR</h1>
          </div>
          <div>
            <h2 className="text-xl text-gray-900">Crear Cuenta</h2>
            <p className="text-sm text-gray-600 mt-1">Completa tus datos para registrarte</p>
          </div>
        </div>

        <Card className="border-gray-200 shadow-xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-900">Nombre *</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="Ingresa tu nombre"
                  className="rounded-lg border-gray-200 h-11"
                  disabled={loading}
                />
              </div>

              {/* Apellido */}
              <div className="space-y-2">
                <Label htmlFor="apellido" className="text-gray-900">Apellido *</Label>
                <Input
                  id="apellido"
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => handleChange("apellido", e.target.value)}
                  placeholder="Ingresa tu apellido"
                  className="rounded-lg border-gray-200 h-11"
                  disabled={loading}
                />
              </div>

              {/* Correo */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="rounded-lg border-gray-200 h-11"
                  disabled={loading}
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-900">Teléfono *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+57 300 123 4567"
                  className="rounded-lg border-gray-200 h-11"
                  disabled={loading}
                />
              </div>

              {/* Tipo de documento */}
              <div className="space-y-2">
                <Label className="text-gray-900">Tipo de Documento *</Label>
                <Select
                  value={formData.tipocedula}
                  onValueChange={(value) => handleChange("tipocedula", value)}
                  disabled={loading}
                >
                  <SelectTrigger className="h-11 rounded-lg border-gray-200">
                    <SelectValue placeholder="Seleccione una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                    <SelectItem value="PAS">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Número de documento */}
              <div className="space-y-2">
                <Label htmlFor="cedula" className="text-gray-900">Número de Documento *</Label>
                <Input
                  id="cedula"
                  type="text"
                  value={formData.cedula}
                  onChange={(e) => handleChange("cedula", e.target.value)}
                  placeholder="1234567890"
                  className="rounded-lg border-gray-200 h-11"
                  disabled={loading}
                />
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900">Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="rounded-lg border-gray-200 h-11 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-900">Confirmar Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="rounded-lg border-gray-200 h-11 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Botón registrar */}
              <Button
                type="submit"
                className="w-full h-11 rounded-lg !bg-[#00aae4] hover:!bg-[#0095c7] !text-white"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registrando...
                  </span>
                ) : (
                  "Registrar"
                )}
              </Button>

              {/* Volver */}
              <button
                type="button"
                onClick={onBack}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
              </button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <button onClick={onBack} className="text-[#007BFF] hover:text-[#0056b3] transition-colors">
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
}