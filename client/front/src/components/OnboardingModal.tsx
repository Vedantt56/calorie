import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '../context/AuthContext';
import { Scale, Ruler, User as UserIcon, Activity, Target, ChevronRight, X, Loader2 } from 'lucide-react';
import './OnboardingModal.css';

export default function OnboardingModal({
  open,
  onOpenChange,
  mode = 'onboarding',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'onboarding' | 'settings';
}) {
  const { user, updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    gender: 'male',
    activityLevel: 1.2,
    goal: 'maintenance'
  });

  useEffect(() => {
    if (!open) return;

    setStep(1);
    setFormData({
      age: user?.age ? String(user.age) : '',
      height: user?.height ? String(user.height) : '',
      weight: user?.weight ? String(user.weight) : '',
      gender: user?.gender || 'male',
      activityLevel: normalizeActivityLevel(user?.activityLevel),
      goal: user?.goal || 'maintenance'
    });
  }, [open, user]);

  const palOptions = [
    { label: "No Workout", value: 1.2 },
    { label: "Light Workout (1-3 days/week)", value: 1.4 },
    { label: "Moderate Workout (3-5 days/week)", value: 1.6 },
    { label: "Heavy Workout (6+ days/week)", value: 1.75 },
  ];

  const goals = [
    { id: 'maintenance', label: 'Maintain Weight', description: 'Keep your current physique' },
    { id: 'bulking', label: 'Bulking', description: 'Gain muscle mass' },
    { id: 'cutting', label: 'Cutting', description: 'Lose body fat' },
    { id: 'recomp', label: 'Body Recomp', description: 'Lose fat, gain muscle' },
  ];

  const calculateMacros = () => {
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height);
    const a = parseFloat(formData.age);
    const pal = formData.activityLevel;

    if (!w || !h || !a) return null;

    // BMR (Mifflin-St Jeor)
    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    bmr = formData.gender === 'male' ? bmr + 5 : bmr - 161;

    // TDEE
    let tdee = Math.round(bmr * pal);

    // Goal Adjustments
    let targetCals = tdee;
    if (formData.goal === 'bulking') targetCals += 400;
    if (formData.goal === 'cutting') targetCals -= 500;

    const macroFactors = getMacroFactors(pal);
    const protein = Math.round(w * macroFactors.proteinPerKg);
    const fat = Math.round(w * macroFactors.fatPerKg);
    const proteinCalories = protein * 4;
    const fatCalories = fat * 9;
    const remainingCalories = Math.max(0, targetCals - proteinCalories - fatCalories);

    return {
      calories: targetCals,
      protein,
      carbs: Math.round(remainingCalories / 4),
      fat
    };
  };

  const results = calculateMacros();

  const handleSave = async () => {
    if (!results) return;
    setLoading(true);
    try {
      await updateProfile({
        ...formData,
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        targets: results
      });
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <div className="onboarding-portal">
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] onboarding-overlay" />
        <Dialog.Content className="bg-white rounded-[3rem] shadow-2xl z-[101] w-[90vw] max-w-2xl p-8 overflow-hidden onboarding-modal">
          <div className="onboarding-modal-glow onboarding-modal-glow-amber" aria-hidden="true" />
          <div className="onboarding-modal-glow onboarding-modal-glow-blue" aria-hidden="true" />
          <div className="onboarding-modal-grain" aria-hidden="true" />

          {/* Header */}
          <div className="flex justify-between items-center mb-10 onboarding-modal-header">
            <div>
              <span className="text-[10px] font-black text-[#8e85fd] uppercase tracking-[0.2em] mb-1 block onboarding-step-label">Step {step} of 3</span>
              <Dialog.Title className="text-3xl font-black text-zinc-900 tracking-tight onboarding-modal-title">
                {mode === 'settings' ? 'Update Settings' : 'Personalize Your Goal'}
              </Dialog.Title>
            </div>
            <Dialog.Close className="p-2 hover:bg-zinc-100 rounded-full transition-colors onboarding-modal-close">
              <X className="w-6 h-6 text-zinc-400" />
            </Dialog.Close>
          </div>

          <div className="min-h-[400px] onboarding-modal-body">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <Dialog.Description className="text-zinc-500 mb-8 font-medium italic onboarding-modal-description">
                  {mode === 'settings'
                    ? 'Adjust your details to refresh your daily calorie and macro targets.'
                    : 'We need a few details to calculate your perfect macro breakdown.'}
                </Dialog.Description>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase ml-2">Basics</label>
                    <div className="relative group onboarding-input-shell">
                      <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-[#8e85fd] transition-colors" />
                      <input
                        type="number" placeholder="Weight (Kg)"
                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#8e85fd] transition-all"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase ml-2 opacity-0">Height</label>
                    <div className="relative group onboarding-input-shell">
                      <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-[#8e85fd] transition-colors" />
                      <input
                        type="number" placeholder="Height (cm)"
                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#8e85fd] transition-all"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="relative group onboarding-input-shell">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-[#8e85fd] transition-colors" />
                      <input
                        type="number" placeholder="Age"
                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#8e85fd] transition-all"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex p-1 bg-zinc-50 rounded-2xl border-2 border-zinc-100 onboarding-segmented">
                    <button
                      onClick={() => setFormData({ ...formData, gender: 'male' })}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all onboarding-segment ${formData.gender === 'male' ? 'is-active bg-white shadow-sm text-zinc-900' : 'text-zinc-400'}`}
                    >Male</button>
                    <button
                      onClick={() => setFormData({ ...formData, gender: 'female' })}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all onboarding-segment ${formData.gender === 'female' ? 'is-active bg-white shadow-sm text-zinc-900' : 'text-zinc-400'}`}
                    >Female</button>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.weight || !formData.height || !formData.age}
                  className="w-full bg-[#1c1c1e] text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50 mt-8 onboarding-primary-button"
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase ml-2 flex items-center gap-2">
                    <Activity className="w-3 h-3 text-[#8e85fd]" /> Activity Level
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {palOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFormData({ ...formData, activityLevel: opt.value })}
                        className={`p-4 rounded-2xl border-2 transition-all text-left group onboarding-option ${formData.activityLevel === opt.value ? 'is-active border-[#8e85fd] bg-[#8e85fd]/5' : 'border-zinc-100 hover:border-zinc-200 bg-zinc-50'}`}
                      >
                        <span className={`block text-xs font-black uppercase transition-colors ${formData.activityLevel === opt.value ? 'text-[#8e85fd]' : 'text-zinc-400 group-hover:text-zinc-500'}`}>{optLabel(opt.value)}</span>
                        <span className={`text-sm font-bold ${formData.activityLevel === opt.value ? 'text-zinc-900' : 'text-zinc-500'}`}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <label className="text-xs font-bold text-zinc-400 uppercase ml-2 flex items-center gap-2">
                    <Target className="w-3 h-3 text-[#adff00]" /> Primary Goal
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {goals.map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => setFormData({ ...formData, goal: goal.id as any })}
                        className={`p-4 rounded-2xl border-2 transition-all text-left onboarding-option onboarding-goal-option ${formData.goal === goal.id ? 'is-active border-[#adff00] bg-[#adff00]/5' : 'border-zinc-100 hover:border-zinc-200 bg-zinc-50'}`}
                      >
                        <span className="block text-sm font-black text-zinc-900">{goal.label}</span>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">{goal.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 mt-10">
                  <button onClick={() => setStep(1)} className="flex-1 py-5 rounded-2xl font-bold text-zinc-500 hover:bg-zinc-100 transition-all onboarding-secondary-button">Back</button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-[2] bg-[#1c1c1e] text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-black transition-all onboarding-primary-button"
                  >
                    Calculate Plan <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && results && (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center flex flex-col items-center justify-center py-6">
                <div className="w-24 h-24 bg-[#adff00]/10 rounded-full flex items-center justify-center mb-4 relative">
                  <Activity className="w-10 h-10 text-[#adff00]" />
                  <div className="absolute inset-0 bg-[#adff00] rounded-full blur-2xl opacity-20 animate-pulse"></div>
                </div>

                <div>
                  <h3 className="text-4xl font-black text-zinc-900 tracking-tighter mb-2">{results.calories} <span className="text-xl text-zinc-400 font-medium">kcal/day</span></h3>
                  <p className="text-zinc-500 font-medium max-w-[300px] mx-auto">Based on your activity and goals, this is your optimal daily intake.</p>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
                  <div className="bg-zinc-50 p-4 rounded-3xl border border-zinc-100 onboarding-result-card">
                    <span className="block text-[10px] font-black text-orange-500 uppercase mb-1">Protein</span>
                    <span className="text-xl font-bold text-zinc-900">{results.protein}g</span>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-3xl border border-zinc-100 onboarding-result-card">
                    <span className="block text-[10px] font-black text-green-500 uppercase mb-1">Carbs</span>
                    <span className="text-xl font-bold text-zinc-900">{results.carbs}g</span>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-3xl border border-zinc-100 onboarding-result-card">
                    <span className="block text-[10px] font-black text-blue-500 uppercase mb-1">Fat</span>
                    <span className="text-xl font-bold text-zinc-900">{results.fat}g</span>
                  </div>
                </div>

                <div className="flex gap-4 w-full mt-10">
                  <button onClick={() => setStep(2)} className="flex-1 py-5 rounded-2xl font-bold text-zinc-500 hover:bg-zinc-100 transition-all onboarding-secondary-button">Adjust Stats</button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-[2] bg-[#adff00] text-black py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-[#99e600] transition-all shadow-xl shadow-[#adff00]/20 onboarding-primary-button"
                  >
                    {loading ? <Loader2 className="animate-spin w-6 h-6" /> : mode === 'settings' ? 'Save Settings' : 'Start My Journey'}
                  </button>
                </div>
              </div>
            )}
          </div>

        </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function optLabel(val: number) {
  if (val === 1.2) return 'No Workout';
  if (val === 1.4) return 'Light';
  if (val === 1.6) return 'Moderate';
  return 'Heavy';
}

function getMacroFactors(activityLevel: number) {
  const normalizedActivityLevel = normalizeActivityLevel(activityLevel);

  if (normalizedActivityLevel === 1.2) return { proteinPerKg: 1.3, fatPerKg: 0.8 };
  if (normalizedActivityLevel === 1.4) return { proteinPerKg: 1.6, fatPerKg: 0.8 };
  if (normalizedActivityLevel === 1.6) return { proteinPerKg: 1.8, fatPerKg: 0.9 };
  return { proteinPerKg: 2.1, fatPerKg: 1.0 };
}

function normalizeActivityLevel(activityLevel?: number) {
  if (!activityLevel) return 1.2;
  if (activityLevel <= 1.2) return 1.2;
  if (activityLevel <= 1.4) return 1.4;
  if (activityLevel <= 1.6) return 1.6;
  return 1.75;
}
