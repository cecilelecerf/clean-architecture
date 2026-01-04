import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building2, ChartLine, Lock, PiggyBank, Shield, Smartphone, TrendingUp, Users } from "lucide-react";
import { DevSection } from "@/components/homepage/DevSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <Shield className="h-4 w-4" />
            Banque 100% sécurisée
          </div>

          <h1 className="text-6xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Votre argent,
            <br />
            simplement géré
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Une banque moderne qui vous accompagne dans la gestion de votre épargne avec des outils intelligents et un conseil personnalisé.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg" asChild>
              <Link href="/register">
                Ouvrir un compte
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg" asChild>
              <Link href="/login">
                Se connecter
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <DevSection />
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Pourquoi nous choisir ?</h2>
          <p className="text-slate-600 text-lg">
            Des services bancaires pensés pour votre quotidien
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <PiggyBank className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Comptes d'épargne</CardTitle>
              <CardDescription>
                Faites fructifier votre argent avec des taux d'intérêt compétitifs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-cyan-500 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <ChartLine className="h-6 w-6 text-cyan-600" />
              </div>
              <CardTitle>Suivi en temps réel</CardTitle>
              <CardDescription>
                Consultez vos comptes et transactions où que vous soyez
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-purple-500 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Conseillers dédiés</CardTitle>
              <CardDescription>
                Un accompagnement personnalisé pour tous vos projets
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Sécurité maximale</CardTitle>
              <CardDescription>
                Vos données protégées par les dernières technologies
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-orange-500 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Application mobile</CardTitle>
              <CardDescription>
                Gérez vos finances depuis votre smartphone
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-pink-500 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle>Analyses détaillées</CardTitle>
              <CardDescription>
                Comprenez vos habitudes et optimisez votre épargne
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-linear-to-r from-blue-600 to-cyan-600 border-0 text-white max-w-4xl mx-auto">
          <CardHeader className="text-center space-y-4 py-12">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-white/20 rounded-full mx-auto">
              <Building2 className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl">
              Prêt à commencer votre parcours financier ?
            </CardTitle>
            <CardDescription className="text-white/90 text-lg">
              Ouvrez votre compte en quelques minutes et bénéficiez de tous nos services
            </CardDescription>
            <div className="pt-4">
              <Button size="lg" variant="secondary" className="text-lg" asChild>
                <Link href="/register">
                  Ouvrir un compte gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-12">
        <div className="container mx-auto px-4 text-center text-slate-600">
          <p>© 2024 Votre Banque. Tous droits réservés.</p>
          <div className="flex gap-6 justify-center mt-4 text-sm">
            <Link href="/legal/privacy" className="hover:text-blue-600">
              Confidentialité
            </Link>
            <Link href="/legal/terms" className="hover:text-blue-600">
              Conditions générales
            </Link>
            <Link href="/contact" className="hover:text-blue-600">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}