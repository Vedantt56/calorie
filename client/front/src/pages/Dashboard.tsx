import React, { useState, useEffect } from "react";
import { 
  Home, 
  Utensils, 
  Plus, 
  Activity, 
  TrendingUp, 
  Bell, 
  Search, 
  Droplet, 
  Flame, 
  Scale, 
  Heart,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Lock,
  Loader2,
  Trash2,
  Settings,
  LogOut,
  Calendar
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { format, addDays, subDays } from "date-fns";

// Use the generated images (stored in public folder)
const mealBowlImg = "/assets/img/healthy_meal_bowl.png";
const ingredientsImg = "/assets/img/fresh_ingredients.png";

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import OnboardingModal from "../components/OnboardingModal";

type FoodLog = {
  _id?: string;
  calories?: number;
  carbs?: number;
  protein?: number;
  fat?: number;
  foodName?: string;
  quantity?: number;
  unit?: string;
  size?: string;
};

export default function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Targets from User Profile (Fallbacks if not yet calculated)
  const targets = {
    calories: user?.targetCalories || 2000,
    carbs: user?.targetCarbs || 250,
    protein: user?.targetProtein || 150,
    fat: user?.targetFat || 70,
    water: 2500,
    weight: user?.weight || 70
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
    // Open onboarding if user has no profile stats
    if (!authLoading && user && !user.height) {
      setIsOnboardingOpen(true);
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [currentDate, user]);

  const fetchLogs = async () => {
    if (!user) return;
    try {
      setLoadingLogs(true);
      const res = await fetch('/api/food/log', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok) {
        const message = await res.text();
        throw new Error(`Fetch logs failed: ${res.status} ${res.statusText} - ${message}`);
      }
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Expected JSON response, got: ${text}`);
      }
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSmartLog = async () => {
    if (!inputText.trim() || !user) return;
    setIsLogging(true);
    try {
      const res = await fetch('/api/food/log-text', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ text: inputText })
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok) {
        const message = await res.text();
        throw new Error(`Log meal failed: ${res.status} ${res.statusText} - ${message}`);
      }
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Expected JSON response, got: ${text}`);
      }
      setInputText("");
      setIsModalOpen(false);
      fetchLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLogging(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/food/log/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchLogs();
    } catch (err) {
      console.error(err);
    }
  };

  // Aggregates
  const eatenCalories = Math.round(logs.reduce((acc, log) => acc + (log.calories ?? 0), 0));
  const eatenCarbs = Number(logs.reduce((acc, log) => acc + (log.carbs ?? 0), 0).toFixed(1));
  const eatenProtein = Number(logs.reduce((acc, log) => acc + (log.protein ?? 0), 0).toFixed(1));
  const eatenFat = Number(logs.reduce((acc, log) => acc + (log.fat ?? 0), 0).toFixed(1));

  return (
    <div className="dashboard-scale dashboard-fade-in min-h-screen bg-[#f8f9fd] font-sans pb-24 md:pb-0 md:pl-18 text-zinc-800 transition-all duration-300">
      
      {/* Desktop Sidebar (Hover-to-Expand) */}
      <aside 
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        className={`hidden md:flex flex-col items-start justify-between bg-[#1c1c1e] fixed left-0 top-0 bottom-0 py-8 rounded-r-[2.5rem] text-zinc-400 transition-all duration-300 ease-in-out z-[100] overflow-hidden shadow-2xl ${
          isSidebarExpanded ? 'w-64 px-2' : 'w-20 px-0 items-center'
        }`}
      >
        <div className={`flex items-center gap-4 transition-all duration-300 ${isSidebarExpanded ? 'w-full px-4' : 'px-0'}`}>
           <div className="w-10 h-10 bg-[#adff00] rounded-xl flex items-center justify-center font-bold text-black text-xl shrink-0">
            N
          </div>
          <span className={`font-bold text-white text-xl transition-all duration-300 whitespace-nowrap ${isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 pointer-events-none'}`}>
            NutriFlow
          </span>
        </div>

        <nav className="flex flex-col gap-2 w-full">
          <NavItem icon={<Home />} label="Dashboard" active expanded={isSidebarExpanded} />
          <NavItem icon={<Utensils />} label="My Meals" expanded={isSidebarExpanded} />
          <NavItem icon={<Activity />} label="Health Stats" expanded={isSidebarExpanded} />
          <NavItem icon={<TrendingUp />} label="Progress" expanded={isSidebarExpanded} />
          <NavItem icon={<Calendar />} label="History" expanded={isSidebarExpanded} />
          <div className="h-px bg-zinc-800 my-4 mx-3" />
          <NavItem icon={<Settings />} label="Settings" expanded={isSidebarExpanded} />
        </nav>

        <div className={`mt-auto flex items-center gap-4 w-full transition-all duration-300 ${isSidebarExpanded ? 'px-4' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-zinc-700 border-2 border-zinc-600 overflow-hidden shrink-0">
            <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" />
          </div>
          <div className={`flex flex-col transition-all duration-300 whitespace-nowrap ${isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 pointer-events-none'}`}>
            <span className="text-white font-semibold text-sm leading-tight">{user?.name || 'Guest'}</span>
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Premium</span>
          </div>
          {isSidebarExpanded && <LogOut className="w-4 h-4 ml-auto hover:text-white cursor-pointer transition-colors" onClick={logout} />}
        </div>
      </aside>

      <main className="max-w-[1500px] mx-auto p-4 md:p-7 lg:p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-7">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 mb-1">Welcome back, {user?.name?.split(' ')[0] || 'Guest'}! 👋</h1>
            <p className="text-zinc-500 font-medium">Your nutrition summary for today is looking great.</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="hidden md:flex gap-2 items-center bg-white px-4 py-2 rounded-2xl shadow-sm border border-zinc-100">
              <Calendar className="w-4 h-4 text-[#8e85fd]" />
              <span className="text-sm font-bold text-zinc-600">{format(currentDate, "EEE, MMM do")}</span>
            </div>
            <div className="flex gap-2">
              <button className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-zinc-50 hover:bg-zinc-50 transition-colors">
                <Search className="w-5 h-5 text-zinc-600" />
              </button>
              <button className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm relative border border-zinc-50 hover:bg-zinc-50 transition-colors">
                <Bell className="w-5 h-5 text-zinc-600" />
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full absolute top-3.5 right-3.5 border-2 border-white"></span>
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Main Dashboard Area (Left/Middle) */}
          <div className="xl:col-span-8 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Body Overview Card */}
              <div className="bg-[#1c1c1e] text-white rounded-[2rem] p-6 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
                <div>
                   <div className="flex justify-between items-start mb-6">
                     <div>
                       <h2 className="text-xl font-bold tracking-tight text-zinc-100">Body Overview</h2>
                       <p className="text-sm text-zinc-400 mt-1">Keep crushing your macro goals!</p>
                     </div>
                     <button className="bg-zinc-800 p-2 border border-zinc-700 rounded-xl hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-white">
                       <Pencil className="w-4 h-4" />
                     </button>
                   </div>
                   
                   <div className="text-center my-8">
                     <div className="text-5xl font-black font-mono tracking-tighter text-white mb-2">{Math.max(targets.calories - eatenCalories, 0)}</div>
                     <div className="text-zinc-400 font-bold tracking-widest text-xs uppercase">Calories Remaining</div>
                   </div>
                </div>

                <div className="flex justify-between items-center px-2">
                  <MacroRing label="Protein" eaten={eatenProtein} target={targets.protein} color="#f97316" />
                  <MacroRing label="Carbs" eaten={eatenCarbs} target={targets.carbs} color="#84cc16" />
                  <MacroRing label="Fat" eaten={eatenFat} target={targets.fat} color="#0ea5e9" />
                </div>
              </div>

              {/* Inspiration Card with Image */}
              <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-100 overflow-hidden relative group h-full flex flex-col">
                <img src={mealBowlImg} className="w-full h-40 object-cover transition-transform duration-700 group-hover:scale-110" alt="Healthy Meal" />
                <div className="p-6">
                  <span className="text-[10px] font-bold text-[#8e85fd] uppercase tracking-[0.2em] mb-2 block">Daily Inspiration</span>
                  <h3 className="text-xl font-extrabold text-zinc-900 leading-tight mb-3">Harvest Power Bowl with Quinoa</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-4">High in fiber and Omega-3s. Perfect for sustained energy throughout your afternoon.</p>
                  <button className="text-sm font-bold text-zinc-900 flex items-center gap-2 group/btn">
                    View Recipe <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>

            {/* Daily Target Grid */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl tracking-tight text-zinc-900">Health Matrix</h3>
                <button className="text-[#8e85fd] text-sm font-bold hover:underline">View Analytics</button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Droplet fill="#3b82f6" className="text-blue-500 w-5 h-5" />} title="Water Intake" value="1200 ml" subtitle="Target 2500 ml" color="blue" />
                <StatCard icon={<Flame fill="#f97316" className="text-orange-500 w-5 h-5" />} title="Calories Eaten" value={`${eatenCalories} kcal`} subtitle="Consumed Today" color="orange" />
                <StatCard icon={<Scale fill="#ec4899" className="text-pink-500 w-5 h-5" />} title="Body Weight" value={`${targets.weight} Kg`} subtitle="Stable Trend" color="pink" />
                <StatCard icon={<Heart fill="#ef4444" className="text-red-500 w-5 h-5" />} title="Heart Rate" value="72 BPM" subtitle="Normal Range" color="red" />
              </div>
            </div>

            {/* Feature Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
               <div className="bg-[#cdff7f] rounded-[1.75rem] p-6 relative overflow-hidden h-48 flex flex-col justify-end transition-all hover:translate-y-[-4px] cursor-pointer shadow-sm">
                  <div className="absolute top-6 left-6 bg-white/40 backdrop-blur-md p-3 rounded-2xl">
                    <Droplet className="w-6 h-6 text-lime-900" />
                  </div>
                  <h4 className="font-extrabold text-xl z-10 leading-tight text-lime-950">Water<br/>Tracker</h4>
                  <p className="text-sm font-bold text-lime-900/60 z-10 mt-1 uppercase tracking-wider">Stay Refreshed</p>
                  <img src="https://picsum.photos/seed/water/300/300" className="absolute top-0 right-0 opacity-20 object-cover w-full h-full mix-blend-multiply" alt="" />
               </div>

               <div className="bg-zinc-900 text-white rounded-[1.75rem] p-6 relative overflow-hidden h-48 flex flex-col justify-end transition-all hover:translate-y-[-4px] cursor-pointer shadow-lg group">
                  <div className="absolute top-6 right-6 bg-zinc-800/80 p-3 rounded-2xl backdrop-blur-md border border-zinc-700 z-20">
                    <Lock className="w-5 h-5 text-amber-400" />
                  </div>
                  <h4 className="font-extrabold text-xl z-10 leading-tight">Meal<br/>Prepper</h4>
                  <p className="text-sm font-bold text-zinc-500 z-10 mt-1 uppercase tracking-wider">Pro Feature</p>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10"></div>
                  <img src={ingredientsImg} className="absolute inset-0 object-cover w-full h-full opacity-40 group-hover:scale-105 transition-transform duration-700" alt="" />
               </div>

               <div className="bg-[#8e85fd] text-white rounded-[1.75rem] p-6 relative overflow-hidden h-48 flex flex-col justify-end transition-all hover:translate-y-[-4px] cursor-pointer shadow-sm group">
                  <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-extrabold text-xl z-10 leading-tight">Activity<br/>Insights</h4>
                  <p className="text-sm font-bold text-white/60 z-10 mt-1 uppercase tracking-wider">Burn More</p>
                  <img src="https://picsum.photos/seed/fitness/300/300" className="absolute top-0 right-0 opacity-20 object-cover w-full h-full mix-blend-overlay group-hover:rotate-3 transition-transform duration-700" alt="" />
               </div>
            </div>
          </div>

          {/* Right Panel (Meals & Progress Monitor) */}
          <div className="xl:col-span-4 space-y-8">
            
            {/* Today's Meals Panel */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100 flex flex-col h-full sticky top-8">
               <div className="flex justify-between items-center mb-8">
                 <h3 className="font-bold text-xl tracking-tight text-zinc-900">Today's Meals</h3>
                 <div className="flex gap-2">
                    <button onClick={() => setCurrentDate(subDays(currentDate, 1))} className="p-2 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-2 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                 </div>
               </div>
               
               <div className="bg-[#f8f9fc] rounded-[2rem] p-6 mb-8 border border-zinc-50">
                 <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4 text-center">Macro distribution</p>
                 <div className="flex gap-3">
                   <div className="flex-1 bg-white p-3 rounded-2xl flex flex-col items-center border border-zinc-50 shadow-sm">
                     <span className="text-[10px] uppercase font-bold text-green-600 mb-1">Carbs</span>
                     <span className="text-sm font-extrabold text-zinc-800">{eatenCarbs}g</span>
                   </div>
                   <div className="flex-1 bg-white p-3 rounded-2xl flex flex-col items-center border border-zinc-50 shadow-sm">
                     <span className="text-[10px] uppercase font-bold text-orange-600 mb-1">Prot</span>
                     <span className="text-sm font-extrabold text-zinc-800">{eatenProtein}g</span>
                   </div>
                   <div className="flex-1 bg-white p-3 rounded-2xl flex flex-col items-center border border-zinc-50 shadow-sm">
                     <span className="text-[10px] uppercase font-bold text-blue-600 mb-1">Fats</span>
                     <span className="text-sm font-extrabold text-zinc-800">{eatenFat}g</span>
                   </div>
                 </div>
               </div>

               <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                 {loadingLogs ? (
                    <div className="flex justify-center p-12">
                      <Loader2 className="w-10 h-10 animate-spin text-[#8e85fd]" />
                    </div>
                 ) : logs.length === 0 ? (
                    <div className="text-center p-10 text-zinc-400 bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200">
                      <Utensils className="w-8 h-8 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">No meals logged yet.</p>
                      <p className="text-xs">Start by adding your first meal!</p>
                    </div>
                 ) : (
                   logs.map((log, i) => (
                      <div key={log._id || i} className="flex items-center justify-between p-4 bg-white border border-zinc-100 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-[#f8f9fc] rounded-2xl overflow-hidden flex items-center justify-center shrink-0 group-hover:bg-[#8e85fd]/10 transition-colors">
                            <Utensils className="w-6 h-6 text-zinc-400 group-hover:text-[#8e85fd] transition-colors" />
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-900 capitalize text-base">{log.foodName}</h4>
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{log.quantity} {log.unit} {log.size ? `• ${log.size}` : ""}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-lg font-black text-zinc-900 leading-none">{log.calories}</div>
                            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Kcal</div>
                          </div>
                          <button 
                            onClick={() => log._id && handleDeleteLog(log._id)}
                            className="p-2.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 absolute right-2 bg-white/90 backdrop-blur-sm shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                 )}
               </div>

               <button 
                 onClick={() => setIsModalOpen(true)}
                 className="mt-8 w-full bg-[#1c1c1e] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl hover:shadow-[#8e85fd]/20"
               >
                 <Plus className="w-5 h-5" />
                 Log New Meal
               </button>
            </div>
          </div>

        </div>
      </main>

      {/* Floating Action Button (Only visible on scroll or mobile) */}
      <div className="fixed md:bottom-12 md:right-12 bottom-8 left-1/2 md:left-auto transform -translate-x-1/2 md:translate-x-0 z-[60]">
        <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
          <Dialog.Root>
             <Dialog.Trigger asChild>
                <button className="bg-[#adff00] hover:bg-[#99e600] text-black p-5 rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all md:hidden">
                  <Plus className="w-8 h-8" />
                </button>
             </Dialog.Trigger>
          </Dialog.Root>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <Dialog.Content className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-10 rounded-[3rem] shadow-2xl z-[101] w-[95vw] max-w-lg border border-zinc-100 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-[#adff00] rounded-3xl flex items-center justify-center mb-4 shadow-lg">
                  <Flame className="w-8 h-8 text-black" />
                </div>
                <Dialog.Title className="text-3xl font-black mb-2 tracking-tight text-zinc-900">AI Intelligent Logger</Dialog.Title>
                <Dialog.Description className="text-zinc-500 font-medium">
                  Just describe your meal naturally. <br/>
                  <span className="italic text-zinc-400 text-sm">"I had a large katori of yellow dal and 2 rotis"</span>
                </Dialog.Description>
              </div>
              
              <div className="relative group">
                <textarea
                  autoFocus
                  className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-[2rem] p-6 min-h-[160px] focus:outline-none focus:ring-4 focus:ring-[#adff00]/20 focus:border-[#adff00] transition-all resize-none text-zinc-800 text-lg placeholder-zinc-300 shadow-inner"
                  placeholder="Describe your meal here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <div className="absolute bottom-4 right-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest pointer-events-none">
                  AI Powered Search
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Dialog.Close asChild>
                  <button className="flex-1 py-4 rounded-2xl font-bold text-zinc-500 hover:bg-zinc-100 transition-all">
                    Discard
                  </button>
                </Dialog.Close>
                <button 
                  onClick={handleSmartLog}
                  disabled={isLogging || !inputText.trim()}
                  className="flex-[2] bg-[#1c1c1e] text-white py-4 rounded-2xl font-extrabold flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50 shadow-xl shadow-zinc-200"
                >
                  {isLogging ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6 text-[#adff00]" />}
                  {isLogging ? 'Processing...' : 'Add to Diary'}
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <OnboardingModal open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen} />

    </div>
  );
}

// Subcomponents

function NavItem({ icon, label, active = false, expanded = false }: { icon: React.ReactNode, label: string, active?: boolean, expanded?: boolean }) {
  return (
    <div className={`flex items-center gap-4 transition-all duration-300 group cursor-pointer ${
      active ? 'bg-[#adff00] text-black shadow-lg shadow-[#adff00]/20' : 'hover:bg-zinc-800/50 hover:text-white text-zinc-400'
    } ${expanded ? 'w-full px-4 py-3 rounded-2xl' : 'w-10 h-10 rounded-xl justify-center'}`}>
      <div className={`w-10 h-10 flex items-center justify-center shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" } as any)}
      </div>
      <span className={`font-bold text-sm whitespace-nowrap transition-all duration-300 ${
        expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 pointer-events-none'
      }`}>
        {label}
      </span>
    </div>
  );
}

function MacroRing({ label, eaten, target, color }: { label: string, eaten: number, target: number, color: string }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((eaten / target) * 100, 100) || 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center relative group">
       <div className="relative w-20 h-20 flex items-center justify-center">
         <svg className="transform -rotate-90 w-20 h-20" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="currentColor"
              strokeWidth="7"
              fill="transparent"
              className="text-zinc-800"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={color}
              strokeWidth="7"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
         </svg>
         <div className="absolute flex flex-col items-center">
           <span className="text-[10px] font-black text-white leading-none">{Math.round(percentage)}%</span>
         </div>
       </div>
       <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-3">{label}</span>
       
       <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all bg-white text-zinc-900 px-3 py-1.5 rounded-xl text-[10px] font-black shadow-2xl pointer-events-none whitespace-nowrap border border-zinc-100 scale-90 group-hover:scale-100">
         {eaten} / {target}g
       </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color }: { icon: React.ReactNode, title: string, value: string, subtitle: string, color: string }) {
  const bgColors: Record<string, string> = {
    blue: 'bg-blue-50/50 text-blue-600',
    orange: 'bg-orange-50/50 text-orange-600',
    pink: 'bg-pink-50/50 text-pink-600',
    red: 'bg-red-50/50 text-red-600'
  }

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100 flex flex-col items-start hover:shadow-xl hover:translate-y-[-4px] transition-all group overflow-hidden relative">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${bgColors[color]}`}>
        {icon}
      </div>
      <p className="text-[10px] font-bold text-zinc-400 mb-1 uppercase tracking-widest group-hover:text-zinc-600 transition-colors">{title}</p>
      <h4 className="font-black text-zinc-900 text-xl tracking-tight">{value}</h4>
      <p className="text-[10px] text-zinc-500 font-bold mt-1.5 uppercase tracking-wider">{subtitle}</p>
      
      <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity ${bgColors[color]}`}></div>
    </div>
  );
}
