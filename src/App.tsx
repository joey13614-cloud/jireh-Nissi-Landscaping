/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Instagram, 
  Facebook, 
  Twitter,
  ChevronRight, 
  Leaf, 
  Droplets, 
  Scissors, 
  Trees,
  Star,
  Menu,
  X,
  Loader2,
  Search,
  Quote
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini for search grounding
// ai is now initialized inside the fetch function to ensure fresh API key access

interface BusinessInfo {
  name: string;
  phone: string;
  address: string;
  hours: string;
  services: string[];
  description: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  mapUrl?: string;
}

const defaultInfo: BusinessInfo = {
  name: "Jireh Nissi Landscaping",
  phone: "(956) 724-4444", 
  address: "Laredo, Texas",
  hours: "Mon - Sat: 8:00 AM - 6:00 PM",
  services: [
    "Lawn Maintenance",
    "Tree Trimming",
    "Irrigation Repair",
    "Landscape Design",
    "Sod Installation",
    "Pressure Washing"
  ],
  description: "Transforming Laredo's outdoor spaces with professional care and dedication. We specialize in creating beautiful, sustainable landscapes for residential and commercial properties.",
  facebookUrl: "https://www.facebook.com/jirehnissilandscaping/",
  instagramUrl: "https://www.instagram.com/jirehnissilandscaping/",
  twitterUrl: "https://twitter.com/search?q=Jireh%20Nissi%20Landscaping",
  mapUrl: "https://www.google.com/maps/search/Jireh+Nissi+Landscaping+Laredo+TX"
};

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'testimonials', label: 'Reviews' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' }
];

export default function App() {
  const [info, setInfo] = useState<BusinessInfo>(defaultInfo);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of fixed nav
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setActiveTab(id);
  };

  useEffect(() => {
    async function fetchLatestInfo() {
      // Safety timeout to ensure loading state is cleared even if API hangs
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 8000);

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Run both grounding requests in parallel for better performance
        const [searchResponse, mapResponse] = await Promise.all([
          ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "Find the official Facebook business page URL, Instagram profile, and contact details for 'Jireh Nissi Landscaping' in Laredo, Texas. I need the direct link to their Facebook page (e.g., facebook.com/pagename), not a search result link.",
            config: {
              tools: [{ googleSearch: {} }],
            },
          }).catch(e => {
            console.warn("Search grounding failed:", e);
            return null;
          }),
          ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "What is the exact address and Google Maps link for Jireh Nissi Landscaping in Laredo, Texas?",
            config: {
              tools: [{ googleMaps: {} }],
            },
          }).catch(e => {
            console.warn("Map grounding failed:", e);
            return null;
          })
        ]);

        const text = searchResponse?.text;
        
        if (text) {
          const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
          
          // Extract social media links if found in text, avoiding search result links
          const fbMatch = text.match(/https?:\/\/(www\.)?facebook\.com\/(?!search\/)[^\s,]+/);
          const igMatch = text.match(/https?:\/\/(www\.)?instagram\.com\/(?!explore\/)[^\s,]+/);
          const twMatch = text.match(/https?:\/\/(www\.)?(twitter|x)\.com\/(?!search)[^\s,]+/);

          // Extract map URL from grounding chunks
          const mapChunks = mapResponse?.candidates?.[0]?.groundingMetadata?.groundingChunks;
          const foundMapUrl = mapChunks?.find(chunk => chunk.maps?.uri)?.maps?.uri;
          const foundAddress = mapChunks?.find(chunk => chunk.maps?.title)?.maps?.title;

          setInfo(prev => ({
            ...prev,
            description: text.length > 100 ? text.substring(0, 500) + "..." : prev.description,
            phone: phoneMatch ? phoneMatch[0] : prev.phone,
            mapUrl: foundMapUrl || prev.mapUrl,
            address: foundAddress || prev.address,
            facebookUrl: fbMatch ? fbMatch[0] : prev.facebookUrl,
            instagramUrl: igMatch ? igMatch[0] : prev.instagramUrl,
            twitterUrl: twMatch ? twMatch[0] : prev.twitterUrl
          }));
        }
      } catch (error) {
        console.error("Error fetching business info:", error);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    }

    fetchLatestInfo();
  }, []);

  const services = [
    { 
      title: "Lawn Care", 
      icon: <Leaf className="w-6 h-6" />, 
      desc: "Keep your property looking its best with our comprehensive lawn maintenance programs. We provide precise mowing, professional edging, and seasonal fertilization tailored to Laredo's unique climate. Our team ensures a healthy, vibrant green lawn that enhances your home's curb appeal year-round." 
    },
    { 
      title: "Tree Services", 
      icon: <Trees className="w-6 h-6" />, 
      desc: "Our certified experts handle everything from routine pruning to complex tree removals with the utmost safety and care. We specialize in structural trimming to promote healthy growth and protect your property from storm damage. Whether you need palm tree maintenance or large oak removal, we have the tools and expertise to get the job done right." 
    },
    { 
      title: "Irrigation", 
      icon: <Droplets className="w-6 h-6" />, 
      desc: "Ensure your landscape thrives in the Texas heat with our high-efficiency irrigation solutions. We offer complete system installations, smart controller upgrades, and rapid repair services for leaks or broken heads. Our goal is to maximize water conservation while keeping your plants and turf perfectly hydrated." 
    },
    { 
      title: "Design", 
      icon: <Scissors className="w-6 h-6" />, 
      desc: "Transform your outdoor vision into reality with our custom landscape design and installation services. We combine native Laredo flora with modern hardscaping elements to create sustainable, low-maintenance environments. From initial concept to final planting, we work closely with you to build a functional and beautiful outdoor sanctuary." 
    }
  ];

  const testimonials = [
    {
      quote: "Jireh Nissi transformed our backyard into a beautiful oasis. Their attention to detail is unmatched!",
      author: "Maria G.",
      role: "Homeowner"
    },
    {
      quote: "Reliable, professional, and very knowledgeable about local plants. Highly recommend for any landscaping needs in Laredo.",
      author: "Roberto S.",
      role: "Business Owner"
    },
    {
      quote: "The best tree trimming service I've used. They were quick, safe, and left everything spotless.",
      author: "Elena V.",
      role: "Resident"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#1a1a1a] font-serif selection:bg-[#5A5A40] selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#5A5A40]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-[#5A5A40] p-2 rounded-full">
                <Leaf className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#5A5A40]">Jireh Nissi</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm uppercase tracking-widest font-sans font-semibold transition-colors ${
                    activeTab === item.id ? 'text-[#5A5A40] border-b-2 border-[#5A5A40]' : 'text-gray-500 hover:text-[#5A5A40]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <a 
                href={`tel:${info.phone}`}
                className="bg-[#5A5A40] text-white px-6 py-2 rounded-full font-sans text-sm font-bold hover:bg-[#4a4a34] transition-all flex items-center gap-2"
              >
                <Phone size={16} />
                Call Now
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden bg-white border-t border-[#5A5A40]/10 absolute top-20 left-0 w-full shadow-xl"
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      scrollToSection(item.id);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left text-lg font-sans font-semibold text-gray-700 hover:text-[#5A5A40] transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                <a 
                  href={`tel:${info.phone}`}
                  className="block w-full bg-[#5A5A40] text-white text-center py-4 rounded-xl font-sans font-bold shadow-lg shadow-[#5A5A40]/20"
                >
                  Call {info.phone}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Background Image with Subtle Effects */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            style={{ y }}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="w-full h-full"
          >
            <img 
              src="https://picsum.photos/seed/landscaping-hero/1920/1080" 
              alt="Beautiful Landscaping Background" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          {/* Gradients for readability - Warm off-white to match theme */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#f5f5f0] via-[#f5f5f0]/80 to-transparent z-10"></div>
          
          {/* Subtle animated gradient shift */}
          <div className="absolute inset-0 z-10 opacity-30 mix-blend-overlay animate-gradient-shift bg-gradient-to-br from-[#5A5A40] via-emerald-500 to-[#f5f5f0]"></div>
          
          <div className="absolute inset-0 bg-black/5 z-10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] font-sans text-xs font-bold uppercase tracking-widest mb-6">
                <Star size={12} fill="currentColor" />
                Laredo's Trusted Landscapers
              </div>
              <h1 className="text-5xl lg:text-8xl font-bold leading-tight mb-6 text-[#1a1a1a]">
                Your Dream <span className="italic text-[#5A5A40]">Landscape</span> Brought to Life
              </h1>
              <p className="text-xl text-gray-800 mb-8 leading-relaxed font-medium">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" /> Gathering latest business info...
                  </span>
                ) : (
                  "Professional landscaping services in Laredo, TX. We combine expertise with a passion for nature to create stunning outdoor environments."
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-[#5A5A40] text-white px-8 py-4 rounded-full font-sans font-bold text-lg hover:bg-[#4a4a34] transition-all shadow-lg shadow-[#5A5A40]/20 flex items-center justify-center gap-2">
                  Request a Quote <ChevronRight size={20} />
                </button>
                <a 
                  href={`tel:${info.phone}`}
                  className="border-2 border-[#5A5A40] text-[#5A5A40] px-8 py-4 rounded-full font-sans font-bold text-lg hover:bg-[#5A5A40] hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Phone size={20} /> {info.phone}
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-sans font-bold uppercase tracking-[0.3em] text-[#5A5A40] mb-4">Our Expertise</h2>
            <h3 className="text-4xl lg:text-5xl font-bold mb-6">Comprehensive Care for Your Outdoors</h3>
            <p className="text-gray-600 text-lg">From routine maintenance to complete transformations, we handle every aspect of your landscape with precision.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="p-8 rounded-[40px] bg-[#f5f5f0] border border-transparent hover:border-[#5A5A40]/20 transition-all"
              >
                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center text-[#5A5A40] shadow-sm mb-6">
                  {service.icon}
                </div>
                <h4 className="text-xl font-bold mb-4">{service.title}</h4>
                <p className="text-gray-600 leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-[#f5f5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img 
                    src="https://picsum.photos/seed/lawn-mowing/400/400" 
                    alt="Lawn Mowing" 
                    className="rounded-[32px] w-full aspect-square object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <img 
                    src="https://picsum.photos/seed/garden-design/400/533" 
                    alt="Garden Design" 
                    className="rounded-[32px] w-full aspect-[3/4] object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-4 pt-8">
                  <img 
                    src="https://picsum.photos/seed/plants/400/533" 
                    alt="Plants" 
                    className="rounded-[32px] w-full aspect-[3/4] object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <img 
                    src="https://picsum.photos/seed/landscaping-worker/400/400" 
                    alt="Worker" 
                    className="rounded-[32px] w-full aspect-square object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-sans font-bold uppercase tracking-[0.3em] text-[#5A5A40] mb-4">About Jireh Nissi</h2>
              <h3 className="text-4xl lg:text-5xl font-bold mb-8">Rooted in Laredo, Dedicated to Excellence</h3>
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>
                  At Jireh Nissi Landscaping, we believe that a beautiful yard is more than just grass and trees—it's a sanctuary for your family and a statement for your business.
                </p>
                <p>
                  With years of experience serving the Laredo community, we've built our reputation on reliability, quality craftsmanship, and a deep understanding of the local climate and flora.
                </p>
                <div className="grid grid-cols-2 gap-6 pt-6">
                  <div>
                    <p className="text-3xl font-bold text-[#5A5A40] mb-1">100+</p>
                    <p className="text-sm font-sans font-semibold uppercase tracking-wider">Happy Clients</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#5A5A40] mb-1">5+</p>
                    <p className="text-sm font-sans font-semibold uppercase tracking-wider">Years Exp.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-[#f5f5f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-sans font-bold uppercase tracking-[0.3em] text-[#5A5A40] mb-4">Testimonials</h2>
            <h3 className="text-4xl lg:text-5xl font-bold mb-6">What Our Clients Say</h3>
            <p className="text-gray-600 text-lg">We take pride in our work and the relationships we build with our community in Laredo.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-10 rounded-[40px] shadow-sm relative"
              >
                <div className="absolute -top-4 left-10 bg-[#5A5A40] p-3 rounded-2xl text-white shadow-lg">
                  <Quote size={20} />
                </div>
                <p className="text-gray-600 italic text-lg leading-relaxed mb-8 pt-4">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40] font-bold">
                    {t.author[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1a1a1a]">{t.author}</h4>
                    <p className="text-sm text-gray-500 font-sans uppercase tracking-wider">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1a1a1a] rounded-[60px] p-8 lg:p-16 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#5A5A40]/20 rounded-full blur-3xl"></div>
            
            <div className="grid lg:grid-cols-2 gap-16 relative z-10">
              <div>
                <h2 className="text-sm font-sans font-bold uppercase tracking-[0.3em] text-[#5A5A40] mb-4">Contact Us</h2>
                <h3 className="text-4xl lg:text-5xl font-bold mb-8">Ready to Start Your Project?</h3>
                <p className="text-gray-400 text-lg mb-12">
                  Contact us today for a free estimate. We're ready to help you transform your outdoor space.
                </p>
                
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="bg-white/10 p-4 rounded-2xl">
                      <Phone className="text-[#5A5A40]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-sans">Call or Text</p>
                      <p className="text-xl font-bold">{info.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="bg-white/10 p-4 rounded-2xl">
                      <MapPin className="text-[#5A5A40]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-sans">Service Area</p>
                      <p className="text-xl font-bold">{info.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="bg-white/10 p-4 rounded-2xl">
                      <Clock className="text-[#5A5A40]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-sans">Working Hours</p>
                      <p className="text-xl font-bold">{info.hours}</p>
                    </div>
                  </div>
                </div>

                {/* Map Integration */}
                <div className="mt-12 rounded-[32px] overflow-hidden border border-white/10 h-64 relative group">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(info.address + " Laredo TX")}&output=embed`}
                  ></iframe>
                  <a 
                    href={info.mapUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-sans font-bold gap-2 backdrop-blur-sm"
                  >
                    <MapPin size={20} /> Open in Google Maps
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-[40px] p-8 lg:p-10 text-[#1a1a1a]">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-sans font-bold uppercase tracking-wider">Name</label>
                      <input type="text" className="w-full bg-[#f5f5f0] border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#5A5A40] transition-all" placeholder="Your Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-sans font-bold uppercase tracking-wider">Phone</label>
                      <input type="tel" className="w-full bg-[#f5f5f0] border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#5A5A40] transition-all" placeholder="Your Phone" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-sans font-bold uppercase tracking-wider">Service Needed</label>
                    <select className="w-full bg-[#f5f5f0] border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#5A5A40] transition-all">
                      <option>Lawn Maintenance</option>
                      <option>Tree Trimming</option>
                      <option>Irrigation Repair</option>
                      <option>Landscape Design</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-sans font-bold uppercase tracking-wider">Message</label>
                    <textarea rows={4} className="w-full bg-[#f5f5f0] border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#5A5A40] transition-all" placeholder="Tell us about your project..."></textarea>
                  </div>
                  <button className="w-full bg-[#5A5A40] text-white py-5 rounded-2xl font-sans font-bold text-lg hover:bg-[#4a4a34] transition-all shadow-lg shadow-[#5A5A40]/20">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f5f5f0] py-12 border-t border-[#5A5A40]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-[#5A5A40] p-1.5 rounded-full">
                <Leaf className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#5A5A40]">Jireh Nissi</span>
            </div>
            
            <div className="flex gap-8">
              <a href={info.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#5A5A40] transition-colors" title="Facebook">
                <Facebook />
              </a>
              <a href={info.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#5A5A40] transition-colors" title="Instagram">
                <Instagram />
              </a>
              <a href={info.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#5A5A40] transition-colors" title="Twitter / X">
                <Twitter />
              </a>
            </div>

            <p className="text-gray-500 font-sans text-sm">
              © {new Date().getFullYear()} Jireh Nissi Landscaping. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
