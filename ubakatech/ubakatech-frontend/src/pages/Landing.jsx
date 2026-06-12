import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../context/AuthContext';
import { 
  Sparkles, 
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  Activity, 
  Users, 
  Smartphone, 
  Home, 
  Heart, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Globe,
  Briefcase,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  Calendar,
  X,
  ChevronDown,
  User,
  Building,
  Check
} from 'lucide-react';

const ProjectIcon = ({ name, className }) => {
  switch (name) {
    case 'Smartphone': return <Smartphone className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'Home': return <Home className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    default: return <Layers className={className} />;
  }
};

const RetainerIcon = ({ name, className }) => {
  switch (name) {
    case 'ShieldCheck': return <ShieldCheck className={className} />;
    case 'Activity': return <Activity className={className} />;
    default: return <ShieldCheck className={className} />;
  }
};

const ServiceIcon = ({ name, className }) => {
  switch (name) {
    case 'Cpu': return <Cpu className={className} />;
    case 'Smartphone': return <Smartphone className={className} />;
    case 'ShieldCheck': return <ShieldCheck className={className} />;
    default: return <Cpu className={className} />;
  }
};

const getTeamMemberGradient = (memb, idx) => {
  if (memb.bgGradient) return memb.bgGradient;
  const gradients = [
    'from-purple-500 to-indigo-500',
    'from-rose-500 to-orange-500',
    'from-emerald-500 to-teal-500',
    'from-blue-500 to-cyan-500',
    'from-amber-500 to-pink-500'
  ];
  return gradients[idx % gradients.length];
};

// Static Fallbacks removed to enforce real data
const FAQ_DATA = [];
const SERVICES_LIST = [];
const TEAM_PROFILES = [];
const PRICING_PACKAGES = [];
const RETAINER_PACKAGES = [];

const Landing = ({ onEnterPortal }) => {
  // Navigation State: 'home', 'portfolio', 'services', 'careers', 'contact', 'intake'
  const [activeTab, setActiveTab] = useState('home');
  const [kigaliTime, setKigaliTime] = useState('');
  const [greeting, setGreeting] = useState({ rw: 'Muraho', en: 'Welcome' });
  const [secretCounter, setSecretCounter] = useState(0);

  // Careers state
  const [careersList, setCareersList] = useState([]);
  const [loadingCareers, setLoadingCareers] = useState(true);

  // Projects state
  const [projectsList, setProjectsList] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Dynamic homepage elements state initialized with static fallbacks
  const [teamList, setTeamList] = useState(TEAM_PROFILES);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [servicesList, setServicesList] = useState(SERVICES_LIST);
  const [loadingServices, setLoadingServices] = useState(true);
  const [pricingList, setPricingList] = useState(PRICING_PACKAGES);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [retainersList, setRetainersList] = useState(RETAINER_PACKAGES);
  const [loadingRetainers, setLoadingRetainers] = useState(true);
  const [faqsList, setFaqsList] = useState(FAQ_DATA);
  const [loadingFaqs, setLoadingFaqs] = useState(true);

  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    name: '',
    email: '',
    portfolioUrl: '',
    resumeUrl: '',
    pitch: ''
  });
  const [submittingApply, setSubmittingApply] = useState(false);
  const [applyStatus, setApplyStatus] = useState(null); // { success: boolean, message: string }

  // FAQ State (active index)
  const [activeFaq, setActiveFaq] = useState(null);

  // Client Intake Wizard State
  const [intakeStep, setIntakeStep] = useState(1);
  const [intakeForm, setIntakeForm] = useState({
    name: '',
    email: '',
    org: '',
    phone: '',
    serviceType: '',
    budget: '',
    timeline: '',
    description: '',
    features: []
  });
  const [intakeErrors, setIntakeErrors] = useState({});
  const [submittingIntake, setSubmittingIntake] = useState(false);
  const [intakeSubmitError, setIntakeSubmitError] = useState(null);
  const [intakeSuccessResult, setIntakeSuccessResult] = useState(null); // saved inquiry info

  // Kigali Clock Integration
  useEffect(() => {
    const updateTime = () => {
      const options = {
        timeZone: 'Africa/Kigali',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      
      const timeFormatter = new Intl.DateTimeFormat('en-US', options);
      const timeStr = timeFormatter.format(new Date());
      setKigaliTime(timeStr);

      const hour = parseInt(timeStr.split(':')[0], 10);
      if (hour >= 5 && hour < 12) {
        setGreeting({ rw: 'Mwaramutse', en: 'Good Morning' });
      } else if (hour >= 12 && hour < 18) {
        setGreeting({ rw: 'Mwiriwe', en: 'Good Afternoon' });
      } else if (hour >= 18 && hour < 22) {
        setGreeting({ rw: 'Mwiriwe', en: 'Good Evening' });
      } else {
        setGreeting({ rw: 'Muraho', en: 'Welcome' });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Job Listings from Backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoadingCareers(true);
        const res = await fetch(`${BACKEND_URL}/api/public/careers`);
        if (res.ok) {
          const data = await res.json();
          setCareersList(data);
        } else {
          throw new Error('Failed to fetch positions');
        }
      } catch (err) {
        console.warn('Careers API offline. Real data enforced. Setting careers empty.', err.message);
        setCareersList([]);
      } finally {
        setLoadingCareers(false);
      }
    };
    fetchJobs();
  }, []);

  // Fetch Showcase Projects from Backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const res = await fetch(`${BACKEND_URL}/api/projects/public/showcase`);
        if (res.ok) {
          const data = await res.json();
          setProjectsList(data);
        } else {
          throw new Error('Failed to fetch projects');
        }
      } catch (err) {
        console.warn('Projects API offline. Real data enforced. Setting projects empty.', err.message);
        setProjectsList([]);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch Dynamic Homepage Content from Database API
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoadingTeam(true);
        const res = await fetch(`${BACKEND_URL}/api/public/team`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setTeamList(data);
          }
        }
      } catch (err) {
        console.warn('Team API offline. Using fallback static profiles.', err.message);
      } finally {
        setLoadingTeam(false);
      }
    };

    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const res = await fetch(`${BACKEND_URL}/api/public/services`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setServicesList(data);
          }
        }
      } catch (err) {
        console.warn('Services API offline. Using fallback static services.', err.message);
      } finally {
        setLoadingServices(false);
      }
    };

    const fetchPricing = async () => {
      try {
        setLoadingPricing(true);
        const res = await fetch(`${BACKEND_URL}/api/public/pricing`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPricingList(data);
          }
        }
      } catch (err) {
        console.warn('Pricing API offline. Using fallback static packages.', err.message);
      } finally {
        setLoadingPricing(false);
      }
    };

    const fetchRetainers = async () => {
      try {
        setLoadingRetainers(true);
        const res = await fetch(`${BACKEND_URL}/api/public/retainers`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setRetainersList(data);
          }
        }
      } catch (err) {
        console.warn('Retainers API offline. Using fallback static retainers.', err.message);
      } finally {
        setLoadingRetainers(false);
      }
    };

    const fetchFaqs = async () => {
      try {
        setLoadingFaqs(true);
        const res = await fetch(`${BACKEND_URL}/api/public/faqs`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            // Map the db keys {question, answer} to shape UI expects {q, a}
            const mapped = data.map(faq => ({
              q: faq.question,
              a: faq.answer
            }));
            setFaqsList(mapped);
          }
        }
      } catch (err) {
        console.warn('FAQs API offline. Using fallback static FAQs.', err.message);
      } finally {
        setLoadingFaqs(false);
      }
    };

    fetchTeam();
    fetchServices();
    fetchPricing();
    fetchRetainers();
    fetchFaqs();
  }, []);

  const handleSecretClick = () => {
    // Hidden Easter-egg gateway: clicking the brand logo 5 times opens the portal login
    const newCount = secretCounter + 1;
    if (newCount >= 5) {
      setSecretCounter(0);
      onEnterPortal(); // Toggles the view to Login
    } else {
      setSecretCounter(newCount);
    }
  };

  // Job Application submit
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyForm.name || !applyForm.email || !applyForm.resumeUrl || !applyForm.pitch) {
      setApplyStatus({ success: false, message: 'Please fill in all required fields.' });
      return;
    }

    setSubmittingApply(true);
    setApplyStatus(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/public/careers/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: applyForm.name,
          email: applyForm.email,
          roleId: selectedJob.id,
          portfolioUrl: applyForm.portfolioUrl,
          resumeUrl: applyForm.resumeUrl,
          pitch: applyForm.pitch
        })
      });

      const data = await res.json();
      if (res.ok) {
        setApplyStatus({ success: true, message: data.message || 'Application submitted successfully!' });
        setApplyForm({ name: '', email: '', portfolioUrl: '', resumeUrl: '', pitch: '' });
        setTimeout(() => {
          setShowApplyModal(false);
          setApplyStatus(null);
        }, 3000);
      } else {
        setApplyStatus({ success: false, message: data.error || 'Failed to submit application.' });
      }
    } catch (err) {
      setApplyStatus({ success: false, message: 'Server connection error. Please try again.' });
    } finally {
      setSubmittingApply(false);
    }
  };

  // Client Intake Wizard validation & submit
  const validateIntakeStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!intakeForm.name) errors.name = 'Contact name is required.';
      if (!intakeForm.email) {
        errors.email = 'Email address is required.';
      } else if (!/\S+@\S+\.\S+/.test(intakeForm.email)) {
        errors.email = 'Invalid email address.';
      }
    }
    if (step === 2) {
      if (!intakeForm.serviceType) errors.serviceType = 'Please select a service category.';
      if (!intakeForm.description) errors.description = 'Please describe your project idea.';
    }
    if (step === 3) {
      if (!intakeForm.budget) errors.budget = 'Please select your budget estimation.';
      if (!intakeForm.timeline) errors.timeline = 'Please select your target timeline.';
    }
    setIntakeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateIntakeStep(intakeStep)) {
      setIntakeStep(intakeStep + 1);
    }
  };

  const handlePrevStep = () => {
    setIntakeStep(intakeStep - 1);
  };

  const handleIntakeSubmit = async () => {
    if (!validateIntakeStep(3)) return;
    setIntakeSubmitError(null);
    setSubmittingIntake(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/public/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intakeForm)
      });
      const data = await res.json();
      if (res.ok) {
        setIntakeSuccessResult(data.inquiry);
        setIntakeStep(4); // Success screen
      } else {
        setIntakeSubmitError(data.error || 'Failed to submit project inquiry.');
      }
    } catch (err) {
      setIntakeSubmitError('Error connecting to backend server. Please check your connection.');
    } finally {
      setSubmittingIntake(false);
    }
  };

  const resetIntakeWizard = () => {
    setIntakeForm({
      name: '',
      email: '',
      org: '',
      phone: '',
      serviceType: '',
      budget: '',
      timeline: '',
      description: '',
      features: []
    });
    setIntakeErrors({});
    setIntakeSuccessResult(null);
    setIntakeStep(1);
    setActiveTab('home');
  };

  const toggleFeatureSelection = (feat) => {
    const current = [...intakeForm.features];
    if (current.includes(feat)) {
      setIntakeForm({ ...intakeForm, features: current.filter(f => f !== feat) });
    } else {
      setIntakeForm({ ...intakeForm, features: [...current, feat] });
    }
  };



  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans relative overflow-hidden flex flex-col justify-between selection:bg-purple-600/30">
      
      {/* Decorative Drifting Glow Nodes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-950/15 rounded-full blur-[160px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-950/15 rounded-full blur-[160px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] right-[-5%] w-[35vw] h-[35vw] bg-rose-950/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[30%] left-[-5%] w-[35vw] h-[35vw] bg-emerald-950/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Navigation */}
      <header className="w-full max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 z-20 border-b border-gray-900/40 backdrop-blur-md">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={handleSecretClick}
          className="flex items-center gap-3 cursor-pointer select-none group transition-all"
          title="Ubaka Tech Workspace Gateway"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-950/30 border border-purple-500/20 p-2 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <img 
              src="/ubaka_symbol.png" 
              alt="Ubaka Tech Symbol" 
              className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(168,85,247,0.3)]"
            />
          </div>
          <div>
            <h1 className="text-base font-black text-white leading-none tracking-tight">Ubaka Tech</h1>
            <span className="text-[9px] font-bold text-gray-500 tracking-wider uppercase block mt-1">Software Agency</span>
          </div>
        </div>

        {/* Dynamic Tab Navigation Links */}
        <nav className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 p-1 bg-gray-900/30 border border-gray-900 rounded-full backdrop-blur-md max-w-full">
          {[
            { id: 'home', label: 'Home' },
            { id: 'portfolio', label: 'Projects' },
            { id: 'services', label: 'Services' },
            { id: 'careers', label: 'Careers' },
            { id: 'contact', label: 'Contact' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIntakeStep(1); // reset intake state
              }}
              className={`text-[10px] sm:text-xs font-semibold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full cursor-pointer transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Clock widget & Quick Action Button */}
        <div className="flex items-center gap-4">
          {/* Clock */}
          <div className="hidden lg:flex items-center gap-3 bg-gray-900/40 border border-gray-900 px-4 py-2 rounded-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="text-left shrink-0">
              <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider leading-none">Rwanda Local Time</div>
              <div className="text-xs font-bold text-gray-300 font-mono mt-0.5">{kigaliTime || '--:--:--'}</div>
            </div>
            <div className="border-l border-gray-800 h-6"></div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-purple-400 block uppercase tracking-wide leading-none">{greeting.rw}!</span>
              <span className="text-[10px] text-gray-500 font-medium block mt-0.5">{greeting.en}</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('intake')}
            className={`font-bold py-2.5 px-5 rounded-full text-xs transition-all shadow-md duration-300 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'intake'
                ? 'bg-white text-gray-950 scale-95 shadow-white/5'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/10 hover:shadow-purple-500/20 hover:scale-105 active:scale-[0.98]'
            }`}
          >
            Start a Project
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex-1 z-10 flex flex-col justify-center">
        
        {/* ================= HOME TAB ================= */}
        {activeTab === 'home' && (
          <div className="grid lg:grid-cols-12 gap-12 items-center w-full animate-fade-in-up">
            {/* Hero Left Content */}
            <div className="lg:col-span-6 space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Custom Digital Solutions for Any Challenge
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] text-white">
                  Solving Problems <br />
                  <span className="bg-gradient-to-r from-purple-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">
                    Exactly How You Want It
                  </span>
                </h2>
                <p className="text-gray-400 leading-relaxed text-sm md:text-base max-w-xl font-medium">
                  Ubaka Tech is a premium software development and product design agency. We engineer custom digital solutions that address your unique workflows. Whether you need a web platform, a mobile application, an enterprise system, or a custom API gateway, we solve your business problems digitally.
                </p>
              </div>

              {/* Home Capabilities Teaser */}
              <div className="grid grid-cols-2 gap-4 max-w-lg">
                <div className="p-4 bg-gray-900/30 border border-gray-900 rounded-2xl">
                  <div className="w-8 h-8 rounded-lg bg-purple-950/30 border border-purple-500/20 flex items-center justify-center mb-3">
                    <Cpu className="w-4 h-4 text-purple-400" />
                  </div>
                  <h4 className="text-xs font-bold text-gray-200">Custom Engineering</h4>
                  <p className="text-[10px] text-gray-500 mt-1">We build exactly what you need—web tools, mobile apps, databases, or API integrations.</p>
                </div>

                <div className="p-4 bg-gray-900/30 border border-gray-900 rounded-2xl">
                  <div className="w-8 h-8 rounded-lg bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h4 className="text-xs font-bold text-gray-200">Tailored Problem Solving</h4>
                  <p className="text-[10px] text-gray-500 mt-1">We align closely with your team to simplify complex processes, ensuring technology matches your requirements.</p>
                </div>
              </div>

              {/* Direct Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={() => setActiveTab('portfolio')}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-2xl text-xs transition-all shadow-lg shadow-purple-500/10 hover:scale-102 active:scale-99 flex items-center gap-2 cursor-pointer"
                >
                  Explore Projects
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveTab('intake')}
                  className="bg-gray-900 hover:bg-gray-800 text-gray-300 font-bold py-3 px-6 rounded-2xl text-xs border border-gray-850 hover:border-gray-800 transition-all hover:scale-102 active:scale-99 cursor-pointer"
                >
                  Hire Ubaka Tech
                </button>
              </div>
            </div>

            {/* Hero Right Visuals */}
            <div className="lg:col-span-6 flex justify-center items-center">
              <div className="relative w-full max-w-lg group">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/15 to-blue-500/15 rounded-3xl blur-2xl group-hover:scale-105 transition-all opacity-80 duration-500" />
                
                <div className="bg-gray-900/30 border border-gray-900 backdrop-blur-md rounded-3xl p-5 shadow-2xl relative transition-all duration-500 hover:border-purple-500/20">
                  <div className="relative overflow-hidden rounded-2xl bg-slate-950">
                    <img 
                      src="/workspace_hero.png" 
                      alt="Ubaka Tech Developer Connectivity" 
                      className="w-full h-auto rounded-2xl object-cover mix-blend-lighten aspect-[4/3] select-none pointer-events-none group-hover:scale-101 transition-transform duration-500"
                    />
                    {/* Glowing effect inside image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-90" />
                  </div>
                  
                  {/* Embedded Badge */}
                  <div className="absolute bottom-9 left-9 right-9 p-4 rounded-xl bg-gray-950/80 border border-gray-850 backdrop-blur-md flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Featured Project</div>
                      <div className="text-xs font-black text-white mt-1">Kuri Macye E-Commerce</div>
                    </div>
                    <button
                      onClick={() => setActiveTab('portfolio')}
                      className="w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= PROJECTS TAB ================= */}
        {activeTab === 'portfolio' && (
          <div className="space-y-12 w-full animate-fade-in-up">
            {/* Header info */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-950/30 px-3 py-1 rounded-full border border-purple-500/15">Projects</span>
              <h3 className="text-3xl font-black text-white">Real Software, Real Impact</h3>
              <p className="text-gray-400 text-xs md:text-sm">
                We focus on building software that solves actual challenges. Here are the active and upcoming digital solutions in our pipeline.
              </p>
            </div>

            {loadingProjects ? (
              <div className="text-center py-12">
                <span className="text-xs text-gray-500 uppercase tracking-widest animate-pulse">Loading Projects...</span>
              </div>
            ) : (
              <>
                {/* Active Projects (Flagship Showcase) */}
                {projectsList.filter(p => p.status === 'active').map((prod) => (
                  <div key={prod.id} className="glass-panel rounded-3xl p-6 md:p-8 grid lg:grid-cols-12 gap-8 relative overflow-hidden border border-purple-500/10 shadow-xl shadow-purple-950/5 text-left">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

                    {/* Details Column */}
                    <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        {/* Badge */}
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                            <CheckCircle className="w-3 h-3" /> Deployed & Active
                          </span>
                          <span className="text-xs font-bold text-gray-500 font-mono">Flagship Solution</span>
                        </div>

                        {/* Title */}
                        <div>
                          <h4 className="text-3xl font-black text-white">{prod.name}</h4>
                          <p className="text-xs text-purple-400 font-semibold tracking-wide uppercase mt-1">{prod.tagline}</p>
                        </div>

                        {/* Description */}
                        <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                          {prod.shortDesc}
                        </p>

                        {/* Features List */}
                        {prod.details?.features && (
                          <div className="space-y-3">
                            <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Core Features Built</h5>
                            <div className="grid sm:grid-cols-2 gap-3 text-xs text-gray-400">
                              {prod.details.features.map((feat, fIdx) => (
                                <div key={fIdx} className="flex gap-2.5 items-start bg-gray-950/40 p-3 rounded-xl border border-gray-900">
                                  <ProjectIcon name={prod.iconName} className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                  <span className="leading-snug">{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tech Stack Tags */}
                        {prod.details?.tech && (
                          <div className="flex flex-wrap gap-2 items-center pt-2">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mr-1">Stack:</span>
                            {prod.details.tech.map((t, tIdx) => (
                              <span key={tIdx} className="px-2.5 py-1 bg-gray-950 border border-gray-900 rounded-lg text-[10px] font-bold text-purple-300 font-mono">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom Links / Stats */}
                      <div className="pt-4 border-t border-gray-900/60 flex items-center justify-between gap-4">
                        {prod.stats && (
                          <div className="flex gap-6">
                            {prod.stats.slice(0, 2).map((stat, sIdx) => (
                              <div key={sIdx}>
                                <div className="text-[9px] text-gray-500 uppercase font-bold">{stat.label}</div>
                                <div className="text-base font-black text-white font-mono mt-0.5">{stat.value}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {prod.liveUrl && (
                          <a 
                            href={prod.liveUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-white text-gray-950 font-bold py-2.5 px-5 rounded-xl text-xs transition-all shadow-md hover:scale-102 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            Launch Live Platform
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Visual Panel Column */}
                    <div className="lg:col-span-5 flex flex-col justify-center bg-gray-950/40 border border-gray-900 rounded-2xl p-4 relative overflow-hidden group">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 relative border border-gray-850">
                        <img 
                          src="/workspace_hero.png" 
                          alt={`${prod.name} Mockup`} 
                          className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-102 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/50 to-transparent" />
                      </div>
                      <div className="mt-3 text-left">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Ecosystem View</span>
                        <div className="text-xs font-bold text-gray-300 mt-1">{prod.name} System Dashboard Layout</div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Conceptual Pipeline Grid */}
                <div className="space-y-6">
                  <div className="text-left space-y-2">
                    <h4 className="text-lg font-black text-white">Upcoming Project Pipeline</h4>
                    <p className="text-xs text-gray-500">
                      We actively run community design phases. Below are software systems currently in the active development and planning pipeline.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 text-left">
                    {projectsList.filter(p => p.status !== 'active').map((prod) => (
                      <div key={prod.id} className="bg-gray-900/10 border border-gray-900 rounded-2xl p-5 hover:border-gray-800 transition-all flex flex-col justify-between h-[230px]">
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-start gap-3">
                            <h5 className="font-extrabold text-white text-sm">{prod.name}</h5>
                            <span className="text-[8.5px] font-bold px-2 py-0.5 rounded bg-purple-950/20 text-purple-400 border border-purple-500/10 uppercase tracking-wide">
                              {prod.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{prod.tagline}</div>
                          <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{prod.shortDesc}</p>
                        </div>

                        <div className="pt-3 border-t border-gray-900/40 flex justify-between items-center text-[10px] text-gray-500">
                          <span className="font-mono truncate mr-2">
                            {prod.details?.tech ? prod.details.tech.slice(0, 3).join(' • ') : 'Custom Architecture'}
                          </span>
                          <span className="font-semibold text-gray-400 shrink-0 capitalize">{prod.status} Phase</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= SERVICES TAB ================= */}
        {activeTab === 'services' && (
          <div className="space-y-12 w-full animate-fade-in-up">
            {/* Header info */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-950/30 px-3 py-1 rounded-full border border-purple-500/15">How We Can Help You</span>
              <h3 className="text-3xl font-black text-white">We Build What Fits Your Workflow</h3>
              <p className="text-gray-400 text-xs md:text-sm">
                We design and build systems from scratch, ensuring they look great, load fast, and connect seamlessly with your team's everyday operations.
              </p>
            </div>

            {/* Grid of services */}
            <div className="grid md:grid-cols-3 gap-8">
              {servicesList.map((serv, idx) => {
                return (
                  <div key={idx} className="bg-gray-900/20 hover:bg-gray-900/40 border border-gray-900 rounded-3xl p-6 text-left flex flex-col justify-between transition-all duration-300 relative group hover:-translate-y-1 hover:border-purple-500/20">
                    <div className="space-y-4">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-2xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                        <ServiceIcon name={serv.icon} className="w-6 h-6" />
                      </div>
                      
                      {/* Title */}
                      <h4 className="text-lg font-black text-white">{serv.title}</h4>
                      
                      {/* Description */}
                      <p className="text-xs text-gray-400 leading-relaxed font-medium">
                        {serv.desc}
                      </p>
                    </div>

                    {/* Features list */}
                    <div className="pt-6 mt-6 border-t border-gray-900/60">
                      <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Capabilities</h5>
                      <ul className="space-y-2">
                        {serv.features.map((feat, fidx) => (
                          <li key={fidx} className="flex gap-2 items-center text-xs text-gray-300 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-900/60 my-12" />

            {/* Baseline Service Pricing Section */}
            <div className="space-y-8 text-left">
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-950/30 px-3 py-1 rounded-full border border-purple-500/15">Transparent Pricing</span>
                <h3 className="text-2xl font-black text-white">Flat Fee Service Packages</h3>
                <p className="text-gray-400 text-xs md:text-sm max-w-2xl leading-relaxed">
                  We build custom software with clear, honest upfront pricing. Choose a package that fits your operational stage.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 items-stretch">
                {pricingList.map((pkg, idx) => (
                  <div 
                    key={idx} 
                    className={`bg-gray-900/15 border rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 relative ${
                      pkg.popular 
                        ? 'border-purple-500/40 shadow-xl shadow-purple-950/10 md:scale-[1.03] bg-gray-900/20' 
                        : 'border-gray-900 hover:border-gray-800'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-purple-600 text-white font-bold text-[9px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg shadow-purple-500/20">
                        Most Requested
                      </div>
                    )}
                    
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider block">{pkg.badge}</span>
                        <h4 className="text-lg font-black text-white">{pkg.name}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">{pkg.description}</p>
                      </div>

                      <div className="flex items-baseline gap-1.5 py-2">
                        <span className="text-2xl md:text-3xl font-black text-white font-mono">{pkg.price}</span>
                        {pkg.price !== 'Custom / Contact Us' && <span className="text-[10px] text-gray-500 font-bold uppercase">starting rate</span>}
                      </div>

                      <div className="border-t border-gray-900/60 pt-4">
                        <ul className="space-y-2.5">
                          {pkg.features.map((feat, fidx) => (
                            <li key={fidx} className="flex gap-2 items-start text-xs text-gray-300 font-medium leading-tight">
                              <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button 
                        onClick={() => {
                          setIntakeForm({
                            ...intakeForm,
                            serviceType: pkg.name.includes('MVP') ? 'E-Commerce Marketplace' : pkg.name.includes('Commerce') ? 'Point of Sale (POS) System' : 'ERP / Custom Database',
                            budget: pkg.price === 'Custom / Contact Us' ? 'Above 12M RWF' : pkg.price.includes('2,500,000') ? '1.5M - 3M RWF' : '6M - 12M RWF'
                          });
                          setActiveTab('intake');
                        }}
                        className={`w-full py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                          pkg.popular 
                            ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-md shadow-purple-500/10' 
                            : 'bg-gray-950 border border-gray-850 hover:border-gray-800 text-gray-300 hover:text-white'
                        }`}
                      >
                        Request Scope Draft
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-900/60 my-12" />

            {/* Ongoing Retainers Section */}
            <div className="space-y-8 text-left">
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-950/30 px-3 py-1 rounded-full border border-indigo-500/15">Post-Launch Alignment</span>
                <h3 className="text-2xl font-black text-white">Monthly Maintenance Retainers</h3>
                <p className="text-gray-400 text-xs md:text-sm max-w-2xl leading-relaxed">
                  Avoid downtime and technical debt. Secure dedicated development hours and server monitoring resources on a recurring monthly contract.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-4xl">
                {retainersList.map((pkg, idx) => (
                  <div 
                    key={idx} 
                    className={`bg-gray-900/15 border rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 relative ${
                      pkg.popular 
                        ? 'border-indigo-500/40 shadow-xl shadow-indigo-950/10 bg-gray-900/20' 
                        : 'border-gray-900 hover:border-gray-800'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 text-white font-bold text-[9px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg shadow-indigo-500/20">
                        Best Retainer Value
                      </div>
                    )}
                    
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          pkg.popular 
                            ? 'bg-indigo-950/40 border-indigo-500/20 text-indigo-400' 
                            : 'bg-gray-950 border-gray-850 text-gray-500'
                        }`}>
                          <RetainerIcon name={pkg.icon} className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-white">{pkg.name}</h4>
                          <span className="text-[10px] text-gray-500 font-medium">Ongoing SLA Plan</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 leading-relaxed font-medium">{pkg.description}</p>

                      <div className="text-xl font-black text-white font-mono py-1">
                        {pkg.price}
                      </div>

                      <div className="border-t border-gray-900/60 pt-4">
                        <ul className="space-y-2">
                          {pkg.features.map((feat, fidx) => (
                            <li key={fidx} className="flex gap-2 items-start text-xs text-gray-300 font-medium leading-tight">
                              <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button 
                        onClick={() => {
                          setIntakeForm({
                            ...intakeForm,
                            serviceType: 'Custom API Integrations',
                            description: `Requesting monthly maintenance alignment: ${pkg.name}.`
                          });
                          setActiveTab('intake');
                        }}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                          pkg.popular 
                            ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/10' 
                            : 'bg-gray-950 border border-gray-850 hover:border-gray-800 text-gray-300 hover:text-white'
                        }`}
                      >
                        Subscribe Retainer SLA
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-900/60 my-12" />

            {/* 100% Code Ownership Guarantee Card */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-950/10 via-slate-900 to-indigo-950/10 border border-purple-500/10 rounded-3xl p-6 md:p-8 text-left shadow-lg">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% IP & Source Code Ownership
                  </div>
                  <h4 className="text-lg md:text-xl font-black text-white">No Lock-in. You Own Everything.</h4>
                  <p className="text-gray-400 text-xs leading-relaxed font-medium">
                    We believe that when you pay for software, you should own it. Upon project delivery and milestone completion, <strong>100% of the Intellectual Property (IP), git repositories, databases, and deployment access are transferred directly to your organization</strong>. No monthly platform licensing fees, no vendor lock-in.
                  </p>
                </div>
                <div className="flex flex-col gap-2 bg-gray-950/50 border border-gray-900 rounded-2xl p-4 shrink-0 w-full md:w-auto text-xs text-gray-400 font-medium">
                  <div className="flex items-center gap-2 text-white font-bold mb-1">
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Transfer Checklist
                  </div>
                  <div className="flex items-center gap-2"><Check className="w-3 h-3 text-purple-400" /> Full Git Repository Ownership</div>
                  <div className="flex items-center gap-2"><Check className="w-3 h-3 text-purple-400" /> All Rights to Proprietary Code</div>
                  <div className="flex items-center gap-2"><Check className="w-3 h-3 text-purple-400" /> Direct Database Ownership</div>
                  <div className="flex items-center gap-2"><Check className="w-3 h-3 text-purple-400" /> Direct Hosting & Domain Controls</div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-900/60 my-12" />

            {/* Teaser CTA */}
            <div className="glass-panel rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between border border-gray-900 max-w-3xl mx-auto gap-4">
              <div className="text-left">
                <h4 className="text-sm font-extrabold text-white">Have a project requirements outline?</h4>
                <p className="text-xs text-gray-500 mt-1">Run through our interactive builder wizard to request a secure proposal details draft.</p>
              </div>
              <button 
                onClick={() => setActiveTab('intake')}
                className="bg-white text-gray-950 font-bold py-2.5 px-5 rounded-xl text-xs hover:scale-102 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                Launch Project Builder
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ================= CAREERS TAB ================= */}
        {activeTab === 'careers' && (
          <div className="space-y-12 w-full animate-fade-in-up">
            {/* Header info */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-950/30 px-3 py-1 rounded-full border border-purple-500/15">Come Build With Us</span>
              <h3 className="text-3xl font-black text-white">Code That Solves Real Life Challenges</h3>
              <p className="text-gray-400 text-xs md:text-sm">
                We are always looking for passionate engineers and designers. If you care about writing clean code that helps real people run businesses or simplify daily tasks, we'd love to work with you.
              </p>
            </div>

            {/* Perks grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { title: 'Flexible Working', desc: 'Hybrid and remote setups built around trust.' },
                { title: 'Premium Gear', desc: 'Newest Apple hardware & Figma / Git licenses.' },
                { title: 'Health Insurance', desc: 'Full medical coverage for you and dependents.' },
                { title: 'Learning Stipend', desc: 'Annual budget for courses, books, and certs.' }
              ].map((perk, idx) => (
                <div key={idx} className="p-4 bg-gray-900/10 border border-gray-900 rounded-2xl text-left">
                  <div className="text-xs font-extrabold text-white">{perk.title}</div>
                  <p className="text-[10px] text-gray-500 mt-1">{perk.desc}</p>
                </div>
              ))}
            </div>

            {/* Job Openings listings */}
            <div className="space-y-4 max-w-4xl mx-auto">
              <h4 className="text-lg font-black text-white text-left">Active Job Positions</h4>
              
              {loadingCareers ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-500 text-xs font-bold uppercase tracking-widest">
                  <div className="w-8 h-8 rounded-full border border-t-purple-500 animate-spin mb-3"></div>
                  Loading listings...
                </div>
              ) : (
                <div className="space-y-3">
                  {careersList.map((job) => (
                    <div 
                      key={job.id} 
                      className="bg-gray-900/10 border border-gray-900 hover:border-gray-800 rounded-2xl p-5 text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="font-extrabold text-white text-sm md:text-base">{job.title}</h5>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-950/20 text-purple-400 border border-purple-500/10">
                            {job.type}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-semibold">{job.department} • {job.location}</div>
                        <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">{job.description}</p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setShowApplyModal(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all hover:scale-102 active:scale-98 cursor-pointer self-start md:self-center whitespace-nowrap"
                      >
                        Apply Now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ================= CONTACT & SUPPORT FAQ TAB ================= */}
        {activeTab === 'contact' && (
          <div className="grid lg:grid-cols-12 gap-12 items-start w-full text-left animate-fade-in-up">
            
            {/* Left side: Contact cards & Team */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-950/30 px-3 py-1 rounded-full border border-purple-500/15">Get In Touch</span>
                <h3 className="text-3xl font-black text-white">Say Hello</h3>
                <p className="text-gray-400 text-xs leading-relaxed font-medium">
                  We are always ready to discuss new projects, explain EBM compliance details, or just chat about how we can help your business grow. Reach out anytime.
                </p>
              </div>

              {/* Direct links list */}
              <div className="space-y-3">
                <a href="mailto:byiringirobenitg@gmail.com" className="flex gap-4 p-4 bg-gray-900/10 border border-gray-900 hover:border-purple-500/20 rounded-2xl group transition-all">
                  <div className="w-10 h-10 rounded-xl bg-purple-950/20 border border-purple-900/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wide">Write Email</div>
                    <div className="text-xs font-bold text-gray-300 mt-0.5">byiringirobenitg@gmail.com</div>
                  </div>
                </a>

                <a href="tel:+250790479815" className="flex gap-4 p-4 bg-gray-900/10 border border-gray-900 hover:border-purple-500/20 rounded-2xl group transition-all">
                  <div className="w-10 h-10 rounded-xl bg-indigo-950/20 border border-indigo-900/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wide">Phone Office</div>
                    <div className="text-xs font-bold text-gray-300 mt-0.5">+250 790 479 815</div>
                  </div>
                </a>

                <div className="flex gap-4 p-4 bg-gray-900/10 border border-gray-900 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/20 border border-emerald-900/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wide">Headquarters</div>
                    <div className="text-xs font-bold text-gray-300 mt-0.5">Byumba, Gicumbi District, Rwanda</div>
                  </div>
                </div>
              </div>

              {/* Humanized Team Profiles listing */}
              <div className="space-y-4 pt-6 border-t border-gray-900">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Our Leadership Focus</h4>
                <div className="space-y-3">
                  {teamList.map((memb, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-gray-900/10 p-3.5 rounded-2xl border border-gray-900">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${getTeamMemberGradient(memb, idx)} flex items-center justify-center font-bold text-[10px] text-white shrink-0`}>
                        {memb.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-white">{memb.name}</div>
                        <div className="text-[9px] text-purple-400 font-bold tracking-wider mt-0.5">{memb.role}</div>
                        <p className="text-[10px] text-gray-400 mt-1 font-medium italic">"{memb.focus}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right side: FAQs Accordion */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <h4 className="text-lg font-black text-white">Frequently Answered Queries</h4>
                <p className="text-xs text-gray-500">
                  Providing full transparency. Review details about compliance, timelines, and payment integrations.
                </p>
              </div>

              <div className="space-y-3">
                {faqsList.map((faq, idx) => (
                  <div key={idx} className="bg-gray-900/10 border border-gray-900 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                      className="w-full p-5 text-left flex justify-between items-center gap-4 cursor-pointer hover:bg-gray-900/30 transition-all"
                    >
                      <span className="text-xs md:text-sm font-bold text-gray-200">{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180 text-purple-400' : ''}`} />
                    </button>
                    
                    {activeFaq === idx && (
                      <div className="p-5 pt-0 text-xs text-gray-400 leading-relaxed border-t border-gray-900/40 bg-gray-950/20 font-medium">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================= CLIENT INTAKE WIZARD TAB ================= */}
        {activeTab === 'intake' && (
          <div className="max-w-2xl mx-auto w-full animate-fade-in-up">
            
            {/* Header info */}
            <div className="text-center space-y-3 mb-8">
              <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-950/30 px-3 py-1 rounded-full border border-purple-500/15">Project Builder</span>
              <h3 className="text-3xl font-black text-white">Let's Map Your Project</h3>
              <p className="text-gray-400 text-xs max-w-md mx-auto leading-relaxed">
                Provide specifications about your ideas. We will process this intake log and reach back with a scope draft.
              </p>
            </div>

            {/* Wizard Box */}
            <div className="bg-gray-900/20 border border-gray-900 rounded-3xl p-6 md:p-8 text-left shadow-xl shadow-purple-950/5 relative overflow-hidden">
              
              {/* Steps Progress header */}
              {intakeStep <= 3 && (
                <div className="flex justify-between items-center mb-8 border-b border-gray-900 pb-5">
                  {[
                    { s: 1, label: 'Contact Profile' },
                    { s: 2, label: 'Scope Specs' },
                    { s: 3, label: 'Logistics & Budget' }
                  ].map((stepObj) => (
                    <div key={stepObj.s} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                        intakeStep === stepObj.s 
                          ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/10'
                          : intakeStep > stepObj.s 
                            ? 'bg-purple-950/20 border-purple-500/30 text-purple-300'
                            : 'bg-gray-950 border-gray-900 text-gray-500'
                      }`}>
                        {intakeStep > stepObj.s ? <Check className="w-3.5 h-3.5" /> : stepObj.s}
                      </div>
                      <span className={`text-[10px] font-bold hidden sm:inline ${intakeStep === stepObj.s ? 'text-white' : 'text-gray-500'}`}>
                        {stepObj.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 1: Contact profile details */}
              {intakeStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Step 1: Contact Details</h4>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5"><User className="w-3 h-3 text-purple-400" /> Contact Name *</label>
                      <input 
                        type="text" 
                        placeholder="John Doe" 
                        value={intakeForm.name}
                        onChange={(e) => setIntakeForm({ ...intakeForm, name: e.target.value })}
                        className="w-full bg-gray-950 border border-gray-900 focus:border-purple-500/50 rounded-xl px-4 py-2.5 text-xs text-gray-200 outline-none transition-all"
                      />
                      {intakeErrors.name && <p className="text-[10px] text-rose-400 flex items-center gap-1 mt-0.5"><AlertCircle className="w-3 h-3" /> {intakeErrors.name}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5"><Mail className="w-3 h-3 text-purple-400" /> Business Email *</label>
                      <input 
                        type="email" 
                        placeholder="john@company.rw" 
                        value={intakeForm.email}
                        onChange={(e) => setIntakeForm({ ...intakeForm, email: e.target.value })}
                        className="w-full bg-gray-950 border border-gray-900 focus:border-purple-500/50 rounded-xl px-4 py-2.5 text-xs text-gray-200 outline-none transition-all"
                      />
                      {intakeErrors.email && <p className="text-[10px] text-rose-400 flex items-center gap-1 mt-0.5"><AlertCircle className="w-3 h-3" /> {intakeErrors.email}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5"><Building className="w-3 h-3 text-purple-400" /> Organization / Startup</label>
                      <input 
                        type="text" 
                        placeholder="Inzozi Traders Ltd" 
                        value={intakeForm.org}
                        onChange={(e) => setIntakeForm({ ...intakeForm, org: e.target.value })}
                        className="w-full bg-gray-950 border border-gray-900 focus:border-purple-500/50 rounded-xl px-4 py-2.5 text-xs text-gray-200 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5"><Phone className="w-3 h-3 text-purple-400" /> Phone number</label>
                      <input 
                        type="text" 
                        placeholder="+250 788 000 000" 
                        value={intakeForm.phone}
                        onChange={(e) => setIntakeForm({ ...intakeForm, phone: e.target.value })}
                        className="w-full bg-gray-950 border border-gray-900 focus:border-purple-500/50 rounded-xl px-4 py-2.5 text-xs text-gray-200 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-900 flex justify-end">
                    <button
                      onClick={handleNextStep}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs hover:scale-102 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      Next Step
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Scope specs features */}
              {intakeStep === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Step 2: Project Specifications</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Category of System *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        'E-Commerce Marketplace',
                        'Point of Sale (POS) System',
                        'Mobile App (Android/iOS)',
                        'Company Website',
                        'Custom API Integrations',
                        'ERP / Custom Database'
                      ].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setIntakeForm({ ...intakeForm, serviceType: item })}
                          className={`p-3 rounded-xl border text-[10px] font-bold text-center cursor-pointer transition-all ${
                            intakeForm.serviceType === item 
                              ? 'bg-purple-950/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/5' 
                              : 'bg-gray-950 border-gray-900 text-gray-400 hover:text-white hover:border-gray-850'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    {intakeErrors.serviceType && <p className="text-[10px] text-rose-400 flex items-center gap-1 mt-0.5"><AlertCircle className="w-3 h-3" /> {intakeErrors.serviceType}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Select Required Integration Modules</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'MTN MoMo Checkout',
                        'Airtel Money gateway',
                        'RRA EBM compliance',
                        'Audit PDF Generation',
                        'Real-time WebSockets',
                        'SMS alert triggers',
                        'Offline Cache capability'
                      ].map((feat) => {
                        const active = intakeForm.features.includes(feat);
                        return (
                          <button
                            key={feat}
                            type="button"
                            onClick={() => toggleFeatureSelection(feat)}
                            className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                              active
                                ? 'bg-purple-600/10 border-purple-500/30 text-purple-300'
                                : 'bg-gray-950 border-gray-900 text-gray-500 hover:text-gray-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-purple-400' : 'bg-gray-700'}`} />
                            {feat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Project Description & Core goals *</label>
                    <textarea 
                      placeholder="Outline what transaction workflows or user problems this custom software seeks to simplify..." 
                      rows={4}
                      value={intakeForm.description}
                      onChange={(e) => setIntakeForm({ ...intakeForm, description: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-900 focus:border-purple-500/50 rounded-xl px-4 py-2.5 text-xs text-gray-200 outline-none transition-all resize-none font-medium leading-relaxed"
                    />
                    {intakeErrors.description && <p className="text-[10px] text-rose-400 flex items-center gap-1 mt-0.5"><AlertCircle className="w-3 h-3" /> {intakeErrors.description}</p>}
                  </div>

                  <div className="pt-6 border-t border-gray-900 flex justify-between">
                    <button
                      onClick={handlePrevStep}
                      className="bg-gray-950 border border-gray-900 text-gray-400 hover:text-white font-bold py-2.5 px-6 rounded-xl text-xs hover:bg-gray-900 transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs hover:scale-102 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      Next Step
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Logistics & budget select */}
              {intakeStep === 3 && (
                <div className="space-y-5 animate-fade-in">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Step 3: Logistics & Budget Range</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5"><DollarSign className="w-3 h-3 text-purple-400" /> Estimated Budget Range *</label>
                    <div className="grid sm:grid-cols-3 gap-2">
                      {[
                        'Below 1.5M RWF',
                        '1.5M - 3M RWF',
                        '3M - 6M RWF',
                        '6M - 12M RWF',
                        'Above 12M RWF'
                      ].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setIntakeForm({ ...intakeForm, budget: item })}
                          className={`p-3 rounded-xl border text-[10px] font-bold text-center cursor-pointer transition-all ${
                            intakeForm.budget === item 
                              ? 'bg-purple-950/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/5' 
                              : 'bg-gray-950 border-gray-900 text-gray-400 hover:text-white hover:border-gray-850'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    {intakeErrors.budget && <p className="text-[10px] text-rose-400 flex items-center gap-1 mt-0.5"><AlertCircle className="w-3 h-3" /> {intakeErrors.budget}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5"><Calendar className="w-3 h-3 text-purple-400" /> Expected Timeline *</label>
                    <div className="grid sm:grid-cols-3 gap-2">
                      {[
                        'Less than 1 month',
                        '1 - 2 months',
                        '2 - 4 months',
                        'More than 4 months'
                      ].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setIntakeForm({ ...intakeForm, timeline: item })}
                          className={`p-3 rounded-xl border text-[10px] font-bold text-center cursor-pointer transition-all ${
                            intakeForm.timeline === item 
                              ? 'bg-purple-950/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/5' 
                              : 'bg-gray-950 border-gray-900 text-gray-400 hover:text-white hover:border-gray-850'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    {intakeErrors.timeline && <p className="text-[10px] text-rose-400 flex items-center gap-1 mt-0.5"><AlertCircle className="w-3 h-3" /> {intakeErrors.timeline}</p>}
                  </div>

                  {/* Summary preview */}
                  <div className="p-4 rounded-2xl bg-gray-950 border border-gray-900 text-xs text-gray-400 space-y-1 font-medium">
                    <h5 className="font-bold text-gray-300 uppercase text-[9px] tracking-wider mb-2">Summary Review</h5>
                    <div>Contact: <strong className="text-gray-200">{intakeForm.name} ({intakeForm.email})</strong></div>
                    <div>Type: <strong className="text-gray-200">{intakeForm.serviceType}</strong></div>
                    <div>Budget: <strong className="text-purple-300">{intakeForm.budget}</strong></div>
                  </div>

                  {intakeSubmitError && (
                    <div className="mb-4 flex items-start gap-2.5 px-4 py-3 rounded-xl border border-red-500/30 bg-red-950/40 text-red-300">
                      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-xs leading-relaxed">{intakeSubmitError}</span>
                      <button onClick={() => setIntakeSubmitError(null)} className="ml-auto text-red-400 hover:text-red-200 transition-colors cursor-pointer shrink-0">✕</button>
                    </div>
                  )}
                  <div className="pt-6 border-t border-gray-900 flex justify-between">
                    <button
                      onClick={handlePrevStep}
                      className="bg-gray-950 border border-gray-900 text-gray-400 hover:text-white font-bold py-2.5 px-6 rounded-xl text-xs hover:bg-gray-900 transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    
                    <button
                      onClick={handleIntakeSubmit}
                      disabled={submittingIntake}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs hover:scale-102 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {submittingIntake ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border border-t-transparent border-white animate-spin"></div>
                          Saving Request...
                        </>
                      ) : (
                        <>
                          Submit Project Inquiry
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: SUCCESS VIEW */}
              {intakeStep === 4 && intakeSuccessResult && (
                <div className="py-8 text-center space-y-6 animate-zoom-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-950/30 border border-emerald-500/25 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/20">
                    <Check className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-white">Inquiry Received Successfully!</h4>
                    <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                      Thank you, <strong className="text-gray-200">{intakeSuccessResult.name}</strong>. Your requirement logs have been stored. A member of our design team will write back within 24 hours.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-950 border border-gray-900 rounded-2xl max-w-sm mx-auto">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Proposal Reference ID</div>
                    <div className="text-base font-black text-purple-400 mt-1 font-mono tracking-wider">{intakeSuccessResult.id}</div>
                  </div>

                  <button
                    onClick={resetIntakeWizard}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs hover:scale-102 transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    Back to Home
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* ================= CAREERS APPLICATION MODAL OVERLAY ================= */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-gray-900 border border-gray-850 rounded-3xl p-6 md:p-8 max-w-lg w-full relative shadow-2xl animate-zoom-in text-left space-y-5">
            
            {/* Close */}
            <button 
              onClick={() => {
                setShowApplyModal(false);
                setApplyStatus(null);
              }}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <div>
              <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest bg-purple-950/20 px-2 py-0.5 rounded border border-purple-500/10">Apply Position</span>
              <h3 className="text-xl font-black text-white mt-2">{selectedJob.title}</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">{selectedJob.department} • {selectedJob.location}</p>
            </div>

            {applyStatus ? (
              <div className={`p-4 rounded-xl border text-xs font-semibold leading-relaxed flex items-start gap-2 ${
                applyStatus.success 
                  ? 'bg-emerald-950/15 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-950/15 border-rose-500/20 text-rose-400'
              }`}>
                {applyStatus.success ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <div>{applyStatus.message}</div>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Full Name *</label>
                    <input 
                      type="text" 
                      placeholder="Jane Doe" 
                      required
                      value={applyForm.name}
                      onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-850 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs outline-none text-gray-200 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Email Address *</label>
                    <input 
                      type="email" 
                      placeholder="jane@dev.rw" 
                      required
                      value={applyForm.email}
                      onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-850 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs outline-none text-gray-200 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Resume / CV Link *</label>
                    <input 
                      type="url" 
                      placeholder="https://drive.google.com/cv.pdf" 
                      required
                      value={applyForm.resumeUrl}
                      onChange={(e) => setApplyForm({ ...applyForm, resumeUrl: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-850 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs outline-none text-gray-200 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Portfolio / GitHub Link</label>
                    <input 
                      type="url" 
                      placeholder="https://github.com/jane" 
                      value={applyForm.portfolioUrl}
                      onChange={(e) => setApplyForm({ ...applyForm, portfolioUrl: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-850 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs outline-none text-gray-200 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Cover Pitch / Why Ubaka Tech? *</label>
                  <textarea 
                    placeholder="Briefly state your passion for building community tools and why this role fits your career plans..." 
                    required
                    rows={4}
                    value={applyForm.pitch}
                    onChange={(e) => setApplyForm({ ...applyForm, pitch: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-850 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs outline-none text-gray-200 transition-all resize-none font-medium leading-relaxed"
                  />
                </div>

                <div className="pt-4 border-t border-gray-900 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="bg-gray-950 border border-gray-850 text-gray-400 hover:text-white font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingApply}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-5 rounded-xl text-xs hover:scale-102 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {submittingApply ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border border-t-transparent border-white animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Humanized Premium Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-6 border-t border-gray-900/60 z-20 space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12 text-left">
          
          {/* Brand Info Column */}
          <div className="col-span-2 md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-950/20 border border-purple-500/10 p-1.5 flex items-center justify-center">
                <img 
                  src="/ubaka_symbol.png" 
                  alt="Ubaka Tech Symbol" 
                  className="w-full h-full object-contain filter drop-shadow-[0_0_4px_rgba(168,85,247,0.3)]"
                />
              </div>
              <span className="text-sm font-black text-white tracking-tight">Ubaka Tech</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs font-medium">
              We design digital infrastructure that supports local merchants, maps transit, and breaks accessibility barriers in Rwanda. Built by people, for people.
            </p>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              Byumba, Gisuna, Gicumbi, Rwanda
            </div>
          </div>

          {/* Portfolio Links */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Projects</h5>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <a 
                  href="https://kurimacye.vercel.app" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-1.5"
                >
                  Kuri Macye POS <ExternalLink className="w-3 h-3 text-gray-600" />
                </a>
              </li>
            </ul>
          </div>

          {/* Services Links */}
          <div className="col-span-1 md:col-span-3 space-y-3">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Capabilities</h5>
            <ul className="space-y-2 text-xs font-medium">
              <li><button onClick={() => { setActiveTab('services'); }} className="text-gray-500 hover:text-white transition-colors cursor-pointer text-left">Custom Engineering</button></li>
              <li><button onClick={() => { setActiveTab('services'); }} className="text-gray-500 hover:text-white transition-colors cursor-pointer text-left">UI/UX & Product Design</button></li>
              <li><button onClick={() => { setActiveTab('services'); }} className="text-gray-500 hover:text-white transition-colors cursor-pointer text-left">EBM Invoicing Compliance</button></li>
            </ul>
          </div>

          {/* Careers & Agency Links */}
          <div className="col-span-2 md:col-span-3 space-y-3">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Company</h5>
            <ul className="space-y-2 text-xs font-medium">
              <li><button onClick={() => { setActiveTab('careers'); }} className="text-gray-500 hover:text-white transition-colors cursor-pointer text-left flex items-center gap-2">Careers <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950/20 text-purple-400 border border-purple-500/10">We're hiring</span></button></li>
              <li><button onClick={() => { setActiveTab('contact'); }} className="text-gray-500 hover:text-white transition-colors cursor-pointer text-left">Office Locations</button></li>
              <li><button onClick={() => { setActiveTab('contact'); }} className="text-gray-500 hover:text-white transition-colors cursor-pointer text-left">FAQs Support</button></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-900/60 pt-6 flex justify-between items-center text-[10px] text-gray-600">
          <div className="font-medium">
            © {new Date().getFullYear()} Ubaka Tech Ltd. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
