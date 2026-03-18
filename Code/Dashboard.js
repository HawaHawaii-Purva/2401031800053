import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Dumbbell, Plus, Calendar, Trash2, Eye, LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard({ user, onLogout }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/workout-plans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlans(response.data);
    } catch (error) {
      toast.error('Failed to load workout plans');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this workout plan?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/workout-plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlans(plans.filter(p => p.id !== planId));
      toast.success('Workout plan deleted');
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl glass rounded-full z-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-primary" />
            <span className="text-xl font-barlow font-bold uppercase tracking-tight">FitPlan</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:block">Welcome, {user?.name}</span>
            <Button
              data-testid="logout-btn"
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="hover:bg-white/5 text-gray-300 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-32 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div>
              <h1 data-testid="dashboard-title" className="text-5xl md:text-7xl font-black font-barlow uppercase tracking-tighter mb-2">
                YOUR <span className="text-primary">PLANS</span>
              </h1>
              <p className="text-muted-foreground text-lg">Track and manage your personalized workout plans</p>
            </div>
            <Link to="/planner">
              <Button 
                data-testid="create-new-plan-btn"
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider rounded-sm mt-6 md:mt-0"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Plan
              </Button>
            </Link>
          </div>

          {/* Plans Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : plans.length === 0 ? (
            <div data-testid="no-plans-message" className="text-center py-20">
              <div className="glass p-12 rounded-sm inline-block">
                <Dumbbell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-bold font-barlow uppercase mb-2">No Plans Yet</h3>
                <p className="text-muted-foreground mb-6">Create your first workout plan to get started</p>
                <Link to="/planner">
                  <Button 
                    data-testid="empty-create-plan-btn"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider rounded-sm"
                  >
                    Create Your First Plan
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="glass p-6 rounded-sm hover:glow-border transition-all duration-300"
                  data-testid={`plan-card-${plan.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-sm flex items-center justify-center">
                      <Dumbbell className="w-6 h-6 text-primary" />
                    </div>
                    <button
                      data-testid={`delete-plan-${plan.id}`}
                      onClick={() => handleDelete(plan.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <h3 className="text-xl font-bold font-barlow uppercase mb-2">{plan.goal}</h3>
                  
                  <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{plan.days_per_week} days/week • {plan.duration_per_session} min</span>
                    </div>
                    <div>
                      <span className="inline-block px-2 py-1 bg-muted rounded text-xs uppercase font-medium">
                        {plan.experience_level}
                      </span>
                    </div>
                    <div className="text-xs">
                      Created: {new Date(plan.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <Link to={`/plan/${plan.id}`}>
                    <Button 
                      data-testid={`view-plan-${plan.id}`}
                      className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold uppercase tracking-wider rounded-sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Plan
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
