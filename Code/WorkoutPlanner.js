import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Dumbbell, Sparkles, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function WorkoutPlanner({ user, onLogout }) {
  const [formData, setFormData] = useState({
    goal: 'Weight Loss',
    experience_level: 'Beginner',
    equipment: 'Full Gym',
    days_per_week: 3,
    duration_per_session: 45,
    additional_notes: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/workout-plans/generate`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Workout plan generated successfully!');
      navigate(`/plan/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl glass rounded-full z-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
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
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <Link to="/dashboard">
            <Button 
              data-testid="back-to-dashboard-btn"
              variant="ghost" 
              className="mb-8 hover:bg-white/5 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="mb-12">
            <h1 data-testid="planner-title" className="text-5xl md:text-7xl font-black font-barlow uppercase tracking-tighter mb-4">
              CREATE YOUR
              <span className="block text-primary">WORKOUT PLAN</span>
            </h1>
            <p className="text-muted-foreground text-lg">Tell us about your fitness goals and we'll create a personalized plan</p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass p-8 rounded-sm"
          >
            <form data-testid="workout-planner-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Goal */}
              <div>
                <Label htmlFor="goal" className="text-sm font-medium uppercase tracking-wide mb-2 block">
                  Fitness Goal
                </Label>
                <Select 
                  value={formData.goal} 
                  onValueChange={(value) => setFormData({ ...formData, goal: value })}
                >
                  <SelectTrigger data-testid="goal-select" className="bg-muted border-input h-12 rounded-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                    <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                    <SelectItem value="Strength Training">Strength Training</SelectItem>
                    <SelectItem value="Endurance">Endurance</SelectItem>
                    <SelectItem value="Flexibility">Flexibility</SelectItem>
                    <SelectItem value="General Fitness">General Fitness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Experience Level */}
              <div>
                <Label htmlFor="experience" className="text-sm font-medium uppercase tracking-wide mb-2 block">
                  Experience Level
                </Label>
                <Select 
                  value={formData.experience_level} 
                  onValueChange={(value) => setFormData({ ...formData, experience_level: value })}
                >
                  <SelectTrigger data-testid="experience-select" className="bg-muted border-input h-12 rounded-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Equipment */}
              <div>
                <Label htmlFor="equipment" className="text-sm font-medium uppercase tracking-wide mb-2 block">
                  Available Equipment
                </Label>
                <Select 
                  value={formData.equipment} 
                  onValueChange={(value) => setFormData({ ...formData, equipment: value })}
                >
                  <SelectTrigger data-testid="equipment-select" className="bg-muted border-input h-12 rounded-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No Equipment">No Equipment</SelectItem>
                    <SelectItem value="Basic (Dumbbells, Resistance Bands)">Basic (Dumbbells, Resistance Bands)</SelectItem>
                    <SelectItem value="Full Gym">Full Gym Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Days Per Week */}
              <div>
                <Label htmlFor="days" className="text-sm font-medium uppercase tracking-wide mb-2 block">
                  Days Per Week: {formData.days_per_week}
                </Label>
                <input
                  data-testid="days-per-week-slider"
                  type="range"
                  min="1"
                  max="7"
                  value={formData.days_per_week}
                  onChange={(e) => setFormData({ ...formData, days_per_week: parseInt(e.target.value) })}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 day</span>
                  <span>7 days</span>
                </div>
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="duration" className="text-sm font-medium uppercase tracking-wide mb-2 block">
                  Session Duration (minutes)
                </Label>
                <Input
                  data-testid="duration-input"
                  id="duration"
                  type="number"
                  min="15"
                  max="120"
                  value={formData.duration_per_session}
                  onChange={(e) => setFormData({ ...formData, duration_per_session: parseInt(e.target.value) })}
                  className="bg-muted border-input h-12 rounded-sm"
                  required
                />
              </div>

              {/* Additional Notes */}
              <div>
                <Label htmlFor="notes" className="text-sm font-medium uppercase tracking-wide mb-2 block">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  data-testid="additional-notes-textarea"
                  id="notes"
                  placeholder="Any injuries, preferences, or specific exercises you want included/excluded..."
                  value={formData.additional_notes}
                  onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                  className="bg-muted border-input rounded-sm min-h-[100px] resize-none"
                />
              </div>

              {/* Submit */}
              <Button
                data-testid="generate-plan-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider h-12 rounded-sm text-lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Generating Your Plan...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Generate AI Workout Plan
                  </span>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
