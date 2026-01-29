import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Bot, Eye, Search, Sun, Shield, Dna, ArrowRight, Sprout } from 'lucide-react';
import { aboutData } from './AboutData';

const iconMap = {
  Leaf, Bot, Eye, Search, Sun, Shield, Dna
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.2 } },
};

export default function About() {
  const { hero, mission, values, stats, team } = aboutData;

  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans text-slate-800">

      {/* Hero Section */}
      <div className="relative bg-[#E8F5E9] rounded-b-[3rem] pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="show" variants={stagger} className="flex flex-col items-center">
            <motion.div variants={fadeUp}>
              <h1 className="text-5xl md:text-7xl font-black text-[#2F6C4E] mb-6 tracking-tight">
                {hero.title}
              </h1>
            </motion.div>

            <motion.div variants={fadeUp}>
              <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10">
                {hero.subtitle}
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              {hero.chips.map((chip, i) => {
                const Icon = iconMap[chip.icon] || Sprout;
                return (
                  <div key={i} className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-sm ${chip.color === 'green' ? 'bg-[#2F6C4E] text-white' :
                      chip.color === 'blue' ? 'bg-blue-600 text-white' :
                        'bg-amber-500 text-white'
                    }`}>
                    <Icon className="w-5 h-5" />
                    <span>{chip.label}</span>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Mission Section */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="mb-32"
        >
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1">
              <motion.div variants={fadeUp}>
                <div className="inline-block px-4 py-1.5 bg-green-100 text-[#2F6C4E] font-bold rounded-full text-sm uppercase tracking-wider mb-6">
                  Our Mission
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">
                  {mission.title}
                </h2>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  {mission.p1}
                </p>
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  {mission.p2}
                </p>
              </motion.div>
            </div>
            <div className="flex-1 w-full">
              <motion.div variants={fadeUp} className="relative">
                <div className="absolute inset-0 bg-[#2F6C4E] rounded-[2.5rem] rotate-3 opacity-20 transform translate-x-4 translate-y-4"></div>
                <img
                  src={mission.image}
                  alt="Our Mission"
                  className="relative w-full h-[400px] md:h-[500px] object-cover rounded-[2.5rem] shadow-2xl"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="mb-32"
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Our Core Values</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Integrity, innovation, and impact are at the heart of everything we do at GreenCart.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = iconMap[value.icon] || Search;
              return (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  className="group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-[#2F6C4E]/10 hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-[#2F6C4E]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{value.title}</h3>
                  <p className="text-slate-500 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Stats Section (Pill Shape) */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-32"
        >
          <div className="bg-[#2F6C4E] rounded-[3rem] px-8 py-16 md:py-20 shadow-2xl shadow-green-900/30 text-white relative overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 relative z-10 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center justify-center">
                  <span className="text-4xl md:text-6xl font-black mb-2">{stat.number}</span>
                  <span className="text-sm md:text-base font-bold uppercase tracking-widest opacity-80">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="mb-32"
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">The Green Team</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Meet the visionaries making sustainable agriculture a reality for everyone.
            </p>
          </motion.div>

          <div className="flex justify-center">
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 max-w-2xl w-full text-center"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-green-50 shadow-lg"
                />
                <h3 className="text-3xl font-black text-slate-900 mb-2">{member.name}</h3>
                <div className="text-[#2F6C4E] font-bold tracking-widest uppercase mb-6">{member.role}</div>
                <p className="text-lg text-slate-600 leading-relaxed">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action Footer */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <div className="bg-[#1B4332] rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
            <div className="relative z-10 max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to Start Your Green Journey?</h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Join thousands of plant enthusiasts who trust GreenCart for their sustainable gardening needs.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="/products" className="px-8 py-4 bg-white text-[#1B4332] rounded-2xl font-black text-lg hover:bg-green-50 transition-colors shadow-lg">
                  Explore Catalog
                </a>
                <a href="/remedies" className="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-colors">
                  Discover Remedies
                </a>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

































