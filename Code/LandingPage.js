import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Dumbbell, Zap, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function LandingPage({ isAuthenticated }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl glass rounded-full z-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-primary" />
            <span className="text-xl font-barlow font-bold uppercase tracking-tight">FitPlan</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button data-testid="nav-dashboard-btn" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider rounded-sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button data-testid="nav-get-started-btn" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider rounded-sm">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]"></div>
        </div>

        {/* Hero image */}
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1766389088588-21e13679ffa3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxhdGhsZXRlJTIwc3ByaW50aW5nJTIwZGFyayUyMGJhY2tncm91bmQlMjBuZW9ufGVufDB8fHx8MTc3Mzc5NDk4OHww&ixlib=rb-4.1.0&q=85"
            alt="Hero"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 data-testid="hero-title" className="text-6xl md:text-8xl font-black font-barlow uppercase tracking-tighter leading-none mb-6">
              YOUR PERFECT
              <span className="block text-primary text-shadow-glow">WORKOUT PLAN</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              AI-powered personalized workout plans tailored to your fitness goals, experience level, and available equipment.
            </p>
            <Link to={isAuthenticated ? "/planner" : "/auth"}>
              <Button 
                data-testid="hero-cta-btn"
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider text-lg px-8 py-6 rounded-sm group"
              >
                Create Your Plan
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold font-barlow uppercase tracking-tight mb-4">
              Why Choose <span className="text-primary">FitPlan</span>
            </h2>
            <p className="text-muted-foreground text-lg">Intelligent workout planning designed for real results</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "AI-Powered",
                description: "Advanced AI creates workout plans optimized for your specific goals and constraints"
              },
              {
                icon: Target,
                title: "Personalized",
                description: "Every plan is unique, tailored to your experience level, equipment, and schedule"
              },
              {
                icon: TrendingUp,
                title: "Progressive",
                description: "Smart progression strategies to continuously challenge and improve your fitness"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="glass p-8 rounded-sm hover:glow-border transition-all duration-300"
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold font-barlow uppercase mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center glass p-12 rounded-sm glow-border">
          <h2 className="text-4xl md:text-6xl font-bold font-barlow uppercase tracking-tight mb-6">
            READY TO TRANSFORM?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands achieving their fitness goals with personalized AI workout plans
          </p>
          <Link to={isAuthenticated ? "/planner" : "/auth"}>
            <Button 
              data-testid="cta-start-now-btn"
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider text-lg px-8 py-6 rounded-sm"
            >
              Start Now - It's Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2026 FitPlan. Powered by AI. Built for results.</p>
        </div>
      </footer>
    </div>
  );
}
