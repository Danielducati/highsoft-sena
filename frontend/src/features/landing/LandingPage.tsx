import { Button } from "../../shared/ui/button";
import { Card, CardContent } from "../../shared/ui/card";
import { Sparkles, Users, Star, Award, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import { ImageWithFallback } from "../guidelines/figma/ImageWithFallback";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const services = [
    { name: "Masajes Terapéuticos", description: "Relajación profunda y alivio del estrés", icon: "💆‍♀️" },
    { name: "Tratamientos Faciales", description: "Rejuvenecimiento y cuidado de la piel", icon: "✨" },
    { name: "Aromaterapia", description: "Equilibrio mental y corporal", icon: "🌸" },
    { name: "Spa Bar", description: "Bebidas saludables y cócteles sin alcohol", icon: "🍹" },
    { name: "Sauna & Vapor", description: "Desintoxicación y purificación", icon: "💨" },
    { name: "Manicure & Pedicure", description: "Cuidado completo de manos y pies", icon: "💅" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-foreground" />
              </div>
              <span className="text-foreground">HIGHLIFE SPA & BAR</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#inicio" className="text-foreground hover:text-primary transition-colors">Inicio</a>
              <a href="#servicios" className="text-foreground hover:text-primary transition-colors">Servicios</a>
              <a href="#nosotros" className="text-foreground hover:text-primary transition-colors">Sobre Nosotros</a>
              <a href="#contacto" className="text-foreground hover:text-primary transition-colors">Contacto</a>
            </nav>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => onNavigate('login')}
              >
                Iniciar Sesión
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-foreground"
                onClick={() => onNavigate('register')}
              >
                Registrarse
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl text-foreground leading-tight">
                  Bienvenido a <span className="text-primary">HIGHLIFE</span><br />
                  SPA & BAR
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Descubre un oasis de tranquilidad donde el lujo se encuentra con el bienestar.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-foreground"
                  onClick={() => onNavigate('login')}
                >
                  Reservar Cita
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Ver Servicios
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-2xl text-foreground">100+</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Clientes Satisfechos</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-2xl text-foreground">10+</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Servicios Premium</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    <span className="text-2xl text-foreground">5.0</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Calificación</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1667235195726-a7c440bca9bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcGElMjB3ZWxsbmVzcyUyMHJlbGF4YXRpb258ZW58MXx8fHwxNzYwODk4MDAwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Luxury spa wellness relaxation"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
              </div>
              {/* Floating Card */}
              <Card className="absolute -bottom-6 -left-6 shadow-xl border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Experiencia Premium</p>
                      <p className="text-foreground">Lujo y Bienestar</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl text-foreground">Nuestros Servicios</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubre nuestra amplia gama de tratamientos diseñados para tu bienestar integral
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-border">
                <CardContent className="p-6 space-y-4">
                  <div className="text-4xl">{service.icon}</div>
                  <h3 className="text-foreground">{service.name}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                  <Button variant="link" className="text-primary p-0">
                    Más información →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl text-foreground">Sobre Nosotros</h2>
              <p className="text-lg text-muted-foreground">
                HIGHLIFE SPA & BAR es más que un spa, es un destino de bienestar donde la elegancia 
                se encuentra con la relajación. Nuestro equipo de profesionales altamente capacitados 
                se dedica a proporcionar experiencias transformadoras que nutren el cuerpo, la mente y el espíritu.
              </p>
              <div className="flex gap-4 pt-4">
                <div className="space-y-1">
                  <p className="text-3xl text-primary">2+</p>
                  <p className="text-sm text-muted-foreground">Años de experiencia</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl text-primary">6+</p>
                  <p className="text-sm text-muted-foreground">Especialistas certificados</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1757940113920-69e3686438d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcGElMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjA1MDYyNjV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Luxury spa interior"
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1623282788208-d8b90baf5e74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjByZWxheGF0aW9uJTIwdHJlYXRtZW50fGVufDF8fHx8MTc2MDU3MzYyNHww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Spa treatment"
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
              <div className="pt-8">
                <div className="rounded-2xl overflow-hidden">
                  <ImageWithFallback
                    src="https://st.depositphotos.com/3584053/54659/i/450/depositphotos_546598946-stock-photo-after-shave-irritation-barber-shop.jpg"
                    alt="Wellness center"
                    className="w-full h-80 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl text-foreground">Contáctanos</h2>
            <p className="text-xl text-muted-foreground">
              Estamos aquí para responder todas tus preguntas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-foreground">Teléfono</h3>
                <p className="text-muted-foreground">+57 (604) 123-4567</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-foreground">Email</h3>
                <p className="text-muted-foreground">info@highlifespa.com</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-foreground">Ubicación</h3>
                <p className="text-muted-foreground">Laureles, Unicentro</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-foreground" />
                </div>
                <span>HIGHLIFE SPA & BAR</span>
              </div>
              <p className="text-sm text-gray-400">
                Tu destino de bienestar y lujo
              </p>
            </div>

            <div>
              <h4 className="mb-4">Enlaces Rápidos</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p className="hover:text-primary cursor-pointer transition-colors">Inicio</p>
                <p className="hover:text-primary cursor-pointer transition-colors">Servicios</p>
                <p className="hover:text-primary cursor-pointer transition-colors">Sobre Nosotros</p>
                <p className="hover:text-primary cursor-pointer transition-colors">Contacto</p>
              </div>
            </div>

            <div>
              <h4 className="mb-4">Horarios</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Lunes - Viernes: 9AM - 9PM</p>
                <p>Sábado: 10AM - 8PM</p>
                <p>Domingo: 10AM - 6PM</p>
              </div>
            </div>

            <div>
              <h4 className="mb-4">Síguenos</h4>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary transition-colors flex items-center justify-center cursor-pointer">
                  <Facebook className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary transition-colors flex items-center justify-center cursor-pointer">
                  <Instagram className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary transition-colors flex items-center justify-center cursor-pointer">
                  <Twitter className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 HIGHLIFE SPA & BAR. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}