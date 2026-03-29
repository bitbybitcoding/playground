import Link from 'next/link';
import { ArrowRight, Code2, Users, Heart, Sparkles, Terminal, BookOpen, Trophy } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#fbf9f5]/80 backdrop-blur-md z-50 px-6 md:px-12 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="font-display text-2xl font-black text-primary italic tracking-tight">
            Bit by Bit Coding
          </span>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="hidden md:block text-slate-600 font-label font-medium hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-label font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-fixed/50 px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-label font-medium text-primary">Free coding education for ages 13-18</span>
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-black text-on-surface leading-tight mb-6">
                Learn to code,<br />
                <span className="text-primary italic">bit by bit.</span>
              </h1>
              <p className="text-lg text-on-surface-variant max-w-lg mb-8 leading-relaxed">
                Democratizing advanced coding education for all Singaporean youth. 
                No fees. No barriers. Just curiosity and commitment.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/signup" 
                  className="bg-primary text-white px-8 py-4 rounded-xl font-label font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  Start Learning Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="#founder-story" 
                  className="bg-surface-container-high text-on-surface px-8 py-4 rounded-xl font-label font-bold hover:bg-surface-container-highest transition-colors"
                >
                  Our Story
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-tertiary/20 rounded-3xl blur-3xl opacity-50"></div>
              <div className="relative bg-surface-container-lowest rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-bit-red"></div>
                  <div className="w-3 h-3 rounded-full bg-bit-green"></div>
                  <div className="w-3 h-3 rounded-full bg-bit-turquoise"></div>
                  <span className="ml-4 text-xs font-label text-slate-400">main.py</span>
                </div>
                <pre className="code-syntax text-sm text-on-surface overflow-x-auto">
                  <code>{`def calculate_journey(distance, speed):
    # Calculate the total time taken
    time = distance / speed
    return f"Travel time: {time} hours"

# Test your function here
distance_input = 150
speed_input = 60

result = calculate_journey(distance_input, speed_input)
print(result)`}</code>
                </pre>
                <div className="mt-4 p-4 bg-[#1b1c1a] rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">$ python main.py</p>
                  <p className="text-tertiary-fixed text-sm">Travel time: 2.5 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="font-display text-4xl font-black text-primary mb-2">28+</p>
              <p className="font-label text-sm text-slate-500 uppercase tracking-wider">Students</p>
            </div>
            <div className="text-center">
              <p className="font-display text-4xl font-black text-tertiary mb-2">11</p>
              <p className="font-label text-sm text-slate-500 uppercase tracking-wider">Tutors</p>
            </div>
            <div className="text-center">
              <p className="font-display text-4xl font-black text-secondary mb-2">12</p>
              <p className="font-label text-sm text-slate-500 uppercase tracking-wider">Week Program</p>
            </div>
            <div className="text-center">
              <p className="font-display text-4xl font-black text-bit-lavender mb-2">100%</p>
              <p className="font-label text-sm text-slate-500 uppercase tracking-wider">Free</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4 block">Why BbB?</span>
            <h2 className="font-display text-4xl md:text-5xl font-black text-on-surface mb-4">
              Built different.
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              We&apos;re not another paid enrichment centre. We&apos;re a community groundup 
              filling the gap between basic government programs and expensive private courses.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-surface-container-lowest p-8 rounded-2xl editorial-shadow hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Code2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Real Python, Real Projects</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Learn industry-grade Python from variables to Flask, SQL, and AI/ML. 
                Build real applications, not toy examples.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-8 rounded-2xl editorial-shadow hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-tertiary/10 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-tertiary" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Code for Community</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Advanced students build real technology solutions for non-profits. 
                Learn by creating impact, not just completing exercises.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-8 rounded-2xl editorial-shadow hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Peer-Powered Learning</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Learn from H2 Computing alumni and NUS CS students who&apos;ve been where you are. 
                Small groups, personal attention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Program Structure */}
      <section className="py-20 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-tertiary mb-4 block">Our Curriculum</span>
            <h2 className="font-display text-4xl md:text-5xl font-black text-on-surface mb-4">
              Your pathway to mastery.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest p-8 rounded-2xl border-l-4 border-primary">
              <div className="flex items-center gap-3 mb-4">
                <Terminal className="w-5 h-5 text-primary" />
                <span className="font-label text-xs font-bold uppercase tracking-wider text-primary">Term 1</span>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Python: Language & Application</h3>
              <p className="text-on-surface-variant text-sm mb-4">
                Variables, data types, control flow, functions, file I/O, and OOP fundamentals.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-label text-slate-500">12 weeks • No prerequisites</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-8 rounded-2xl border-l-4 border-tertiary opacity-75">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-5 h-5 text-tertiary" />
                <span className="font-label text-xs font-bold uppercase tracking-wider text-tertiary">Term 2</span>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Flask & Front-End</h3>
              <p className="text-on-surface-variant text-sm mb-4">
                HTML/CSS, JavaScript, Flask framework, Jinja2 templates, and database integration.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-label text-slate-500">12 weeks • Requires Term 1</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-8 rounded-2xl border-l-4 border-bit-lavender opacity-50">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-5 h-5 text-bit-lavender" />
                <span className="font-label text-xs font-bold uppercase tracking-wider text-bit-lavender">Term 3</span>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">SQL & Databases</h3>
              <p className="text-on-surface-variant text-sm mb-4">
                Relational databases, SQL fundamentals, SQLite integration with Python.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-label text-slate-500">10 weeks • Requires Terms 1-2</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section id="founder-story" className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-surface-container-low p-8 rounded-2xl relative">
                <div className="absolute -top-4 -left-4 text-6xl text-primary opacity-20 font-display">&ldquo;</div>
                <blockquote className="font-display text-2xl md:text-3xl italic text-on-surface leading-relaxed mb-6">
                  I made a promise to myself last year. I will let every kid who wants to learn to code learn to code, regardless of money, regardless of background.
                </blockquote>
                <p className="text-on-surface-variant">
                  Because that door was once closed for me, and now I want to open it for all the kids after me.
                </p>
                <div className="mt-6 pt-6 border-t border-outline-variant/30">
                  <p className="font-label font-bold text-on-surface">Hongpeng Wei</p>
                  <p className="text-sm text-slate-500">Co-Founder & President, Bit by Bit Coding</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-4 block">Our Story</span>
              <h2 className="font-display text-4xl md:text-5xl font-black text-on-surface mb-6">
                Rejected from coding club.
              </h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed">
                <p>
                  Hongpeng grew up in Singapore and was rejected from his secondary school&apos;s coding club — 
                  not for lack of passion, but for lack of prior experience that would have cost his parents 
                  hundreds of dollars monthly to acquire.
                </p>
                <p>
                  He later taught himself to code through free online resources on a cheap laptop received as a 
                  14th birthday present, passed the H2 Computing subject test, and went on to study H2 Computing 
                  at Victoria Junior College.
                </p>
                <p>
                  In 2025, he and co-founder Brian realized many shared the same story: the courses that bridge 
                  Scratch to Python, and Python to real industry tools, were locked behind paywalls.
                </p>
                <p className="font-medium text-on-surface">
                  Bit by Bit Coding was founded in January 2026 to change that.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-6">
            Ready to start your journey?
          </h2>
          <p className="text-primary-fixed text-lg mb-8 max-w-2xl mx-auto">
            Join our community of learners. No fees, no barriers — just curiosity and commitment.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/signup" 
              className="bg-white text-primary px-8 py-4 rounded-xl font-label font-bold hover:bg-primary-fixed transition-colors flex items-center gap-2"
            >
              Get Your Invite Code
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="mailto:info.bbbcoding@gmail.com" 
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-label font-bold hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 bg-surface-container-lowest border-t border-outline-variant/15">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <span className="font-display text-xl font-black text-primary italic">Bit by Bit Coding</span>
              <p className="text-sm text-slate-500 mt-2">A BAGUS Together recognised groundup</p>
            </div>
            <div className="flex gap-8 font-label text-xs uppercase tracking-widest font-bold">
              <Link href="/terms" className="text-slate-500 hover:text-primary transition-colors">Terms</Link>
              <Link href="/privacy" className="text-slate-500 hover:text-primary transition-colors">Privacy</Link>
              <Link href="/conduct" className="text-slate-500 hover:text-primary transition-colors">Code of Conduct</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-outline-variant/10 text-center">
            <p className="font-display italic text-slate-400">
              Bit by Bit Coding © 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
