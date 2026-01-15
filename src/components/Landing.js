/**
 * VAIB Landing Page - AI Business Assistant
 * Marketing-focused landing for Italian freelancers (forfettari)
 */

import React from 'react';
import {
  Sparkles, Wand2, Target, Users, Receipt, TrendingUp,
  CheckCircle, ArrowRight, MessageCircle, LayoutDashboard,
  Shield, Zap, Clock, AlertTriangle, X, Check, Star,
  ChevronRight, Play, Euro, Calendar, PieChart
} from 'lucide-react';

export default function Landing({ onLogin, onRegister }) {
  const styles = `
    .landing {
      min-height: 100vh;
      background: #ffffff;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      overflow-x: hidden;
    }

    /* Navbar */
    .landing-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 40px;
      max-width: 1200px;
      margin: 0 auto;
      position: sticky;
      top: 0;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(10px);
      z-index: 100;
    }
    .landing-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
    }
    .landing-logo-icon {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .landing-nav-buttons {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .nav-link {
      padding: 10px 16px;
      color: #64748b;
      font-size: 15px;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: color 0.2s;
    }
    .nav-link:hover { color: #0f172a; }
    .btn-ghost {
      padding: 10px 20px;
      border: none;
      background: transparent;
      color: #64748b;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 10px;
      transition: all 0.2s;
    }
    .btn-ghost:hover {
      background: rgba(0,0,0,0.05);
      color: #0f172a;
    }
    .btn-primary {
      padding: 12px 24px;
      border: none;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
    }

    /* Hero Section */
    .landing-hero {
      max-width: 1200px;
      margin: 0 auto;
      padding: 80px 40px 100px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
    }
    .hero-content { }
    .hero-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 100px;
      color: #6366f1;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 24px;
    }
    .hero-title {
      font-size: 52px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.15;
      margin-bottom: 24px;
      letter-spacing: -1px;
    }
    .hero-title .highlight {
      background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-subtitle {
      font-size: 19px;
      color: #64748b;
      line-height: 1.7;
      margin-bottom: 32px;
    }
    .hero-subtitle strong {
      color: #334155;
    }
    .hero-cta {
      display: flex;
      gap: 16px;
      margin-bottom: 40px;
    }
    .btn-large {
      padding: 16px 32px;
      font-size: 16px;
    }
    .btn-secondary {
      padding: 16px 32px;
      border: 2px solid #e2e8f0;
      background: white;
      color: #475569;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .btn-secondary:hover {
      border-color: #6366f1;
      color: #6366f1;
    }
    .hero-social-proof {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .avatars {
      display: flex;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid white;
      margin-left: -10px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: 600;
    }
    .avatar:first-child { margin-left: 0; }
    .social-proof-text {
      font-size: 14px;
      color: #64748b;
    }
    .social-proof-text strong {
      color: #0f172a;
    }
    .hero-visual {
      position: relative;
    }
    .hero-mockup {
      background: linear-gradient(145deg, #f8fafc, #f1f5f9);
      border-radius: 20px;
      padding: 20px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
      border: 1px solid #e2e8f0;
    }
    .mockup-header {
      display: flex;
      gap: 6px;
      margin-bottom: 16px;
    }
    .mockup-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .mockup-dot.red { background: #f87171; }
    .mockup-dot.yellow { background: #fbbf24; }
    .mockup-dot.green { background: #4ade80; }
    .mockup-content {
      background: white;
      border-radius: 12px;
      padding: 24px;
    }
    .mockup-stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .mockup-stat:last-child { border: none; }
    .stat-label { color: #64748b; font-size: 14px; }
    .stat-value { font-weight: 700; color: #0f172a; font-size: 18px; }
    .stat-value.green { color: #10b981; }
    .stat-value.orange { color: #f97316; }
    .progress-bar {
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      margin-top: 8px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #6366f1);
      border-radius: 4px;
      width: 62%;
    }

    /* Problem Section */
    .landing-problem {
      background: #f8fafc;
      padding: 100px 40px;
    }
    .problem-content {
      max-width: 1000px;
      margin: 0 auto;
      text-align: center;
    }
    .section-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 100px;
      color: #dc2626;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .section-eyebrow.purple {
      background: rgba(139, 92, 246, 0.1);
      color: #7c3aed;
    }
    .section-eyebrow.green {
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
    }
    .problem-title {
      font-size: 40px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 24px;
      line-height: 1.2;
    }
    .problem-subtitle {
      font-size: 18px;
      color: #64748b;
      max-width: 700px;
      margin: 0 auto 50px;
      line-height: 1.7;
    }
    .problems-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      text-align: left;
    }
    .problem-card {
      background: white;
      padding: 28px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
    }
    .problem-icon {
      width: 48px;
      height: 48px;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ef4444;
      margin-bottom: 16px;
    }
    .problem-card-title {
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .problem-card-text {
      font-size: 15px;
      color: #64748b;
      line-height: 1.6;
    }

    /* Solution Section */
    .landing-solution {
      padding: 100px 40px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .solution-header {
      text-align: center;
      margin-bottom: 60px;
    }
    .solution-title {
      font-size: 40px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }
    .solution-subtitle {
      font-size: 18px;
      color: #64748b;
      max-width: 600px;
      margin: 0 auto;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    .feature-card {
      background: white;
      border-radius: 20px;
      padding: 32px;
      border: 1px solid #e2e8f0;
      transition: all 0.3s;
    }
    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.08);
      border-color: transparent;
    }
    .feature-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    .feature-icon.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
    .feature-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .feature-icon.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .feature-icon.orange { background: rgba(249, 115, 22, 0.1); color: #f97316; }
    .feature-icon.pink { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
    .feature-icon.indigo { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
    .feature-title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .feature-description {
      font-size: 15px;
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .feature-benefit {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #10b981;
      font-weight: 500;
    }

    /* AI Differentiator */
    .landing-ai {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
      padding: 100px 40px;
      position: relative;
      overflow: hidden;
    }
    .landing-ai::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    .ai-content {
      max-width: 1100px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;
      position: relative;
      z-index: 1;
    }
    .ai-text { color: white; }
    .ai-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(255,255,255,0.15);
      border-radius: 100px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .ai-title {
      font-size: 42px;
      font-weight: 700;
      margin-bottom: 20px;
      line-height: 1.2;
    }
    .ai-subtitle {
      font-size: 18px;
      opacity: 0.9;
      line-height: 1.7;
      margin-bottom: 32px;
    }
    .ai-list {
      list-style: none;
      padding: 0;
      margin: 0 0 32px 0;
    }
    .ai-list li {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
      margin-bottom: 16px;
    }
    .ai-list-icon {
      width: 24px;
      height: 24px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-white {
      padding: 16px 32px;
      border: none;
      background: white;
      color: #6366f1;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .btn-white:hover {
      transform: scale(1.05);
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .ai-demo {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 28px;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .ai-demo-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .ai-demo-avatar {
      width: 40px;
      height: 40px;
      background: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6366f1;
    }
    .ai-demo-title {
      font-weight: 600;
      font-size: 15px;
    }
    .ai-demo-status {
      font-size: 12px;
      opacity: 0.7;
    }
    .ai-messages {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .ai-msg {
      padding: 14px 18px;
      border-radius: 16px;
      font-size: 14px;
      max-width: 85%;
      line-height: 1.5;
    }
    .ai-msg.user {
      background: rgba(255,255,255,0.2);
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .ai-msg.bot {
      background: white;
      color: #334155;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }

    /* Forfettario Section */
    .landing-forfettario {
      padding: 100px 40px;
      background: #f8fafc;
    }
    .forfettario-content {
      max-width: 1100px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;
    }
    .forfettario-visual {
      background: white;
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.06);
    }
    .forfettario-gauge {
      text-align: center;
      margin-bottom: 24px;
    }
    .gauge-circle {
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: conic-gradient(#10b981 0deg 223deg, #e2e8f0 223deg 360deg);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      position: relative;
    }
    .gauge-inner {
      width: 140px;
      height: 140px;
      background: white;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .gauge-value {
      font-size: 32px;
      font-weight: 800;
      color: #0f172a;
    }
    .gauge-label {
      font-size: 13px;
      color: #64748b;
    }
    .forfettario-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .forfettario-stat {
      background: #f8fafc;
      padding: 16px;
      border-radius: 12px;
      text-align: center;
    }
    .forfettario-stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
    }
    .forfettario-stat-label {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }
    .forfettario-text { }
    .forfettario-title {
      font-size: 36px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 20px;
      line-height: 1.2;
    }
    .forfettario-subtitle {
      font-size: 17px;
      color: #64748b;
      line-height: 1.7;
      margin-bottom: 28px;
    }
    .forfettario-features {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .forfettario-features li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;
      font-size: 15px;
      color: #334155;
    }
    .forfettario-features li svg {
      color: #10b981;
      flex-shrink: 0;
      margin-top: 2px;
    }

    /* Pricing Teaser */
    .landing-pricing {
      padding: 100px 40px;
      max-width: 900px;
      margin: 0 auto;
      text-align: center;
    }
    .pricing-title {
      font-size: 40px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }
    .pricing-subtitle {
      font-size: 18px;
      color: #64748b;
      margin-bottom: 48px;
    }
    .pricing-card {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 24px;
      padding: 48px;
      max-width: 480px;
      margin: 0 auto;
      position: relative;
    }
    .pricing-badge {
      position: absolute;
      top: -14px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      padding: 8px 20px;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 600;
    }
    .pricing-amount {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 4px;
      margin-bottom: 8px;
    }
    .pricing-currency {
      font-size: 24px;
      font-weight: 600;
      color: #64748b;
    }
    .pricing-value {
      font-size: 64px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1;
    }
    .pricing-period {
      font-size: 18px;
      color: #64748b;
    }
    .pricing-description {
      font-size: 15px;
      color: #64748b;
      margin-bottom: 32px;
    }
    .pricing-features {
      list-style: none;
      padding: 0;
      margin: 0 0 32px 0;
      text-align: left;
    }
    .pricing-features li {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 15px;
      color: #334155;
    }
    .pricing-features li:last-child { border: none; }
    .pricing-features li svg {
      color: #10b981;
    }

    /* Final CTA */
    .landing-cta {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 100px 40px;
      text-align: center;
    }
    .cta-content {
      max-width: 700px;
      margin: 0 auto;
    }
    .cta-title {
      font-size: 42px;
      font-weight: 700;
      color: white;
      margin-bottom: 20px;
      line-height: 1.2;
    }
    .cta-subtitle {
      font-size: 18px;
      color: #94a3b8;
      margin-bottom: 40px;
      line-height: 1.7;
    }
    .cta-buttons {
      display: flex;
      justify-content: center;
      gap: 16px;
    }
    .btn-cta {
      padding: 18px 36px;
      border: none;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      font-size: 17px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
    }
    .btn-cta:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(99, 102, 241, 0.5);
    }

    /* Footer */
    .landing-footer {
      padding: 40px;
      text-align: center;
      background: #0f172a;
      color: #64748b;
      font-size: 14px;
    }

    /* Responsive */
    @media (max-width: 1000px) {
      .landing-hero { grid-template-columns: 1fr; text-align: center; }
      .hero-visual { display: none; }
      .hero-cta { justify-content: center; }
      .hero-social-proof { justify-content: center; }
      .ai-content { grid-template-columns: 1fr; }
      .ai-demo { display: none; }
      .forfettario-content { grid-template-columns: 1fr; }
      .forfettario-visual { order: -1; max-width: 400px; margin: 0 auto; }
    }
    @media (max-width: 800px) {
      .features-grid { grid-template-columns: repeat(2, 1fr); }
      .problems-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .landing-nav { padding: 16px 20px; }
      .nav-link { display: none; }
      .landing-hero { padding: 40px 20px 60px; }
      .hero-title { font-size: 36px; }
      .hero-cta { flex-direction: column; }
      .features-grid { grid-template-columns: 1fr; }
      .problems-grid { grid-template-columns: 1fr; }
      .landing-ai { padding: 60px 20px; }
      .ai-title { font-size: 32px; }
      .problem-title, .solution-title, .forfettario-title, .pricing-title { font-size: 32px; }
      .cta-title { font-size: 32px; }
      .cta-buttons { flex-direction: column; align-items: center; }
      .pricing-card { padding: 32px 24px; }
    }
  `;

  return (
    <div className="landing">
      <style>{styles}</style>

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="landing-logo-icon">
            <Sparkles size={22} />
          </div>
          VAIB
        </div>
        <div className="landing-nav-buttons">
          <button className="btn-ghost" onClick={onLogin}>Accedi</button>
          <button className="btn-primary" onClick={onRegister}>
            Prova Gratis
            <ArrowRight size={18} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <Sparkles size={16} />
            AI Business Assistant
          </div>
          <h1 className="hero-title">
            Stop al caos.<br />
            <span className="highlight">Parla, organizza, fattura.</span>
          </h1>
          <p className="hero-subtitle">
            VAIB è l'assistente AI che gestisce clienti, progetti e fatture per <strong>freelancer in regime forfettario</strong>.
            Descrivi cosa vuoi, lui si adatta. Chiedi, lui risponde sui tuoi dati.
          </p>
          <div className="hero-cta">
            <button className="btn-primary btn-large" onClick={onRegister}>
              Inizia Gratis - 14 giorni
              <ArrowRight size={20} />
            </button>
            <button className="btn-secondary" onClick={onLogin}>
              <Play size={18} />
              Vedi come funziona
            </button>
          </div>
          <div className="hero-social-proof">
            <div className="avatars">
              <div className="avatar">MR</div>
              <div className="avatar">LC</div>
              <div className="avatar">AG</div>
              <div className="avatar">+</div>
            </div>
            <p className="social-proof-text">
              <strong>200+ freelancer</strong> lo usano ogni giorno
            </p>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-mockup">
            <div className="mockup-header">
              <span className="mockup-dot red"></span>
              <span className="mockup-dot yellow"></span>
              <span className="mockup-dot green"></span>
            </div>
            <div className="mockup-content">
              <div className="mockup-stat">
                <span className="stat-label">Fatturato 2024</span>
                <span className="stat-value">€52.340</span>
              </div>
              <div className="mockup-stat">
                <span className="stat-label">Limite forfettario</span>
                <span className="stat-value green">62% utilizzato</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <div className="mockup-stat">
                <span className="stat-label">Task in scadenza</span>
                <span className="stat-value orange">3 questa settimana</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="landing-problem">
        <div className="problem-content">
          <div className="section-eyebrow">
            <AlertTriangle size={14} />
            Il problema
          </div>
          <h2 className="problem-title">Stai gestendo la tua attività con Excel e post-it?</h2>
          <p className="problem-subtitle">
            La maggior parte dei freelancer perde ore ogni settimana tra fogli sparsi, email,
            e la paura di sforare il limite dei €85.000.
          </p>
          <div className="problems-grid">
            <div className="problem-card">
              <div className="problem-icon">
                <X size={24} />
              </div>
              <h3 className="problem-card-title">Dati sparsi ovunque</h3>
              <p className="problem-card-text">
                Clienti su Excel, fatture su Drive, appunti su Notion. Niente è collegato.
              </p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">
                <Clock size={24} />
              </div>
              <h3 className="problem-card-title">Ore perse a configurare</h3>
              <p className="problem-card-text">
                CRM complessi che richiedono settimane di setup. Tu vuoi lavorare, non configurare.
              </p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">
                <AlertTriangle size={24} />
              </div>
              <h3 className="problem-card-title">Paura del limite €85K</h3>
              <p className="problem-card-text">
                Controlli a mano il fatturato. E se sbagli i conti e superi il limite forfettario?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="landing-solution">
        <div className="solution-header">
          <div className="section-eyebrow purple">
            <Sparkles size={14} />
            La soluzione
          </div>
          <h2 className="solution-title">Un posto per tutto. Che si adatta a te.</h2>
          <p className="solution-subtitle">
            VAIB unisce CRM, project management e tracking forfettario in un'unica app intelligente.
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon purple">
              <Users size={28} />
            </div>
            <h3 className="feature-title">Gestione Clienti</h3>
            <p className="feature-description">
              Tutti i tuoi contatti in un posto. Con storico, note, valore e opportunità associate.
            </p>
            <div className="feature-benefit">
              <Check size={16} />
              Mai più "dove avevo messo quel contatto?"
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon blue">
              <Target size={28} />
            </div>
            <h3 className="feature-title">Pipeline Vendite</h3>
            <p className="feature-description">
              Visualizza opportunità in stile Kanban. Trascina per aggiornare lo stato. Vedi il valore totale.
            </p>
            <div className="feature-benefit">
              <Check size={16} />
              Previsione fatturato sempre aggiornata
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon green">
              <PieChart size={28} />
            </div>
            <h3 className="feature-title">Tracker €85.000</h3>
            <p className="feature-description">
              Monitoraggio in tempo reale del limite forfettario. Alert automatici prima di sforare.
            </p>
            <div className="feature-benefit">
              <Check size={16} />
              Zero sorprese a fine anno
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon orange">
              <Calendar size={28} />
            </div>
            <h3 className="feature-title">Task & Scadenze</h3>
            <p className="feature-description">
              Gestisci attività con scadenze, priorità e collegamento a clienti e progetti.
            </p>
            <div className="feature-benefit">
              <Check size={16} />
              Mai più deadline dimenticate
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon pink">
              <Receipt size={28} />
            </div>
            <h3 className="feature-title">Fatture & Reminder</h3>
            <p className="feature-description">
              Tieni traccia delle fatture emesse, stato pagamento e scadenze. Ricevi promemoria.
            </p>
            <div className="feature-benefit">
              <Check size={16} />
              Cashflow sotto controllo
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon indigo">
              <MessageCircle size={28} />
            </div>
            <h3 className="feature-title">Chatbot AI</h3>
            <p className="feature-description">
              Chiedi al tuo assistente: "Quanto ho fatturato a marzo?" "Quali task scadono domani?"
            </p>
            <div className="feature-benefit">
              <Check size={16} />
              Risposte istantanee sui tuoi dati
            </div>
          </div>
        </div>
      </section>

      {/* AI Differentiator */}
      <section className="landing-ai">
        <div className="ai-content">
          <div className="ai-text">
            <div className="ai-eyebrow">
              <Wand2 size={16} />
              Il superpotere
            </div>
            <h2 className="ai-title">Il primo software che si adatta parlandoci</h2>
            <p className="ai-subtitle">
              Non perdere tempo con menu e impostazioni. Dì a VAIB cosa vuoi e lui cambia.
              Tema scuro? Fatto. Layout compatto? Fatto. Colori del tuo brand? Fatto.
            </p>
            <ul className="ai-list">
              <li>
                <span className="ai-list-icon"><Check size={14} /></span>
                "Metti il tema scuro con accenti viola"
              </li>
              <li>
                <span className="ai-list-icon"><Check size={14} /></span>
                "Nascondi la sezione calendario"
              </li>
              <li>
                <span className="ai-list-icon"><Check size={14} /></span>
                "Rendi tutto più compatto"
              </li>
              <li>
                <span className="ai-list-icon"><Check size={14} /></span>
                "Mostra prima i task in scadenza"
              </li>
            </ul>
            <button className="btn-white" onClick={onRegister}>
              Provalo Ora
              <ArrowRight size={18} />
            </button>
          </div>
          <div className="ai-demo">
            <div className="ai-demo-header">
              <div className="ai-demo-avatar">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="ai-demo-title">VAIB Assistant</div>
                <div className="ai-demo-status">Online</div>
              </div>
            </div>
            <div className="ai-messages">
              <div className="ai-msg user">Voglio un tema scuro con blu elettrico</div>
              <div className="ai-msg bot">Fatto! Ho applicato il tema scuro con accent blu elettrico (#3b82f6). Ti piace? Posso modificarlo.</div>
              <div className="ai-msg user">Quanto ho fatturato questo mese?</div>
              <div className="ai-msg bot">Questo mese hai fatturato €4.850 su 3 fatture. Sei al 62% del limite forfettario annuale.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Forfettario Section */}
      <section className="landing-forfettario">
        <div className="forfettario-content">
          <div className="forfettario-visual">
            <div className="forfettario-gauge">
              <div className="gauge-circle">
                <div className="gauge-inner">
                  <div className="gauge-value">62%</div>
                  <div className="gauge-label">del limite</div>
                </div>
              </div>
            </div>
            <div className="forfettario-stats">
              <div className="forfettario-stat">
                <div className="forfettario-stat-value">€52.340</div>
                <div className="forfettario-stat-label">Fatturato 2024</div>
              </div>
              <div className="forfettario-stat">
                <div className="forfettario-stat-value">€32.660</div>
                <div className="forfettario-stat-label">Disponibile</div>
              </div>
            </div>
          </div>
          <div className="forfettario-text">
            <div className="section-eyebrow green">
              <Target size={14} />
              Per forfettari
            </div>
            <h2 className="forfettario-title">Il limite €85.000 non sarà più un problema</h2>
            <p className="forfettario-subtitle">
              VAIB è costruito specificamente per chi lavora in regime forfettario.
              Monitora automaticamente il tuo fatturato e ti avvisa prima che sia troppo tardi.
            </p>
            <ul className="forfettario-features">
              <li>
                <CheckCircle size={20} />
                <span>Dashboard con percentuale limite sempre visibile</span>
              </li>
              <li>
                <CheckCircle size={20} />
                <span>Alert automatici al 70%, 85% e 95% del limite</span>
              </li>
              <li>
                <CheckCircle size={20} />
                <span>Proiezione a fine anno basata sui trend</span>
              </li>
              <li>
                <CheckCircle size={20} />
                <span>Suggerimenti per ottimizzare il fatturato</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="landing-pricing">
        <h2 className="pricing-title">Semplice, trasparente, accessibile</h2>
        <p className="pricing-subtitle">Un solo piano con tutto incluso. Nessuna sorpresa.</p>
        <div className="pricing-card">
          <div className="pricing-badge">14 giorni gratis</div>
          <div className="pricing-amount">
            <span className="pricing-currency">€</span>
            <span className="pricing-value">15</span>
            <span className="pricing-period">/mese</span>
          </div>
          <p className="pricing-description">Tutto quello che ti serve per gestire la tua attività</p>
          <ul className="pricing-features">
            <li><Check size={18} /> Clienti e contatti illimitati</li>
            <li><Check size={18} /> Pipeline vendite con Kanban</li>
            <li><Check size={18} /> Tracker forfettario €85K</li>
            <li><Check size={18} /> Task e project management</li>
            <li><Check size={18} /> AI Builder per personalizzazione</li>
            <li><Check size={18} /> Chatbot AI per i tuoi dati</li>
            <li><Check size={18} /> Supporto via chat</li>
          </ul>
          <button className="btn-primary btn-large" style={{width: '100%', justifyContent: 'center'}} onClick={onRegister}>
            Inizia la prova gratuita
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-cta">
        <div className="cta-content">
          <h2 className="cta-title">Pronto a semplificare la tua vita da freelancer?</h2>
          <p className="cta-subtitle">
            Unisciti a centinaia di professionisti che hanno scelto VAIB per gestire la loro attività.
            14 giorni gratis, nessuna carta richiesta.
          </p>
          <div className="cta-buttons">
            <button className="btn-cta" onClick={onRegister}>
              Inizia Gratis Ora
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2024 VAIB - AI Business Assistant per Freelancer</p>
      </footer>
    </div>
  );
}
