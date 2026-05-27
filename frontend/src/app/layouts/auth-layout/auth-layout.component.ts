import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, MatIconModule],
  template: `
    <div class="auth-bg">
      <div class="auth-brand">
        <!-- Graphic details -->
        <div class="brand-grid-dots"></div>
        <div class="brand-glow-spot-1"></div>
        <div class="brand-glow-spot-2"></div>
        
        <!-- Header -->
        <div class="brand-header">
          <div class="logo-wrapper">
            <div class="brand-logo">
              <span class="logo-icon">N</span>
            </div>
            <span class="company-name">NSQTech</span>
          </div>
          
          <div class="hero-text-container">
            <h1 class="hero-headline">Enterprise Workforce Operations.</h1>
            <p class="hero-subtext">Streamline workforce operations, compliance tracking, and employee verification through a unified enterprise platform.</p>
          </div>
          
          <div class="trust-indicators">
            <div class="trust-badge">
              <mat-icon class="trust-icon text-success">verified</mat-icon>
              <span>99.98% System Uptime</span>
            </div>
            <div class="trust-badge">
              <mat-icon class="trust-icon text-indigo">security</mat-icon>
              <span>Enterprise-grade security</span>
            </div>
          </div>
        </div>

        <!-- Floating Cards Showcase -->
        <div class="floating-cards-container">
          <!-- Card 1: Active Users -->
          <div class="preview-card float-animation-1 card-pos-1">
            <div class="preview-card-header">
              <mat-icon class="card-icon">people</mat-icon>
              <span class="card-label">Active Sessions</span>
            </div>
            <h3 class="card-value">1,482</h3>
            <span class="card-trend text-success">
              <span class="status-pulse-dot"></span> Live monitoring
            </span>
          </div>

          <!-- Card 2: API Gateway Health -->
          <div class="preview-card float-animation-2 card-pos-2">
            <div class="preview-card-header">
              <mat-icon class="card-icon text-emerald">check_circle</mat-icon>
              <span class="card-label">API Gateway</span>
            </div>
            <h3 class="card-value">99.98%</h3>
            <span class="card-trend">System response: 18ms</span>
          </div>

          <!-- Card 3: Throughput chart -->
          <div class="preview-card float-animation-3 card-pos-3">
            <div class="preview-card-header">
              <mat-icon class="card-icon text-indigo">timeline</mat-icon>
              <span class="card-label">Throughput</span>
            </div>
            <h3 class="card-value">8.4k <span class="card-unit">req/s</span></h3>
            <div class="micro-bar-chart">
              <div class="bar" style="height: 12px"></div>
              <div class="bar" style="height: 24px"></div>
              <div class="bar" style="height: 18px"></div>
              <div class="bar" style="height: 28px"></div>
              <div class="bar" style="height: 20px"></div>
              <div class="bar" style="height: 32px"></div>
              <div class="bar" style="height: 24px"></div>
            </div>
          </div>

          <!-- Card 4: AI Guardrails -->
          <div class="preview-card float-animation-4 card-pos-4">
            <div class="preview-card-header">
              <mat-icon class="card-icon text-violet">psychology</mat-icon>
              <span class="card-label">AI Guardrails</span>
            </div>
            <h3 class="card-value">Active</h3>
            <span class="card-trend text-success">0 anomalies detected</span>
          </div>
        </div>
      </div>
      <div class="auth-card-area">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .auth-bg {
      min-height: 100vh;
      display: flex;
      background: var(--bg-primary);
      overflow: hidden;
      position: relative;
    }
    .auth-brand {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      border-right: 1px solid var(--border);
      background: var(--bg-primary);
    }
    
    /* ─── Grid & Glow Accents ─── */
    .brand-grid-dots {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: radial-gradient(var(--text-muted) 1px, transparent 1px);
      background-size: 24px 24px;
      opacity: 0.15;
      z-index: 1;
      
      html.light-theme & {
        opacity: 0.08;
      }
    }
    .brand-glow-spot-1 {
      position: absolute;
      width: 700px;
      height: 700px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
      top: 5%;
      left: 10%;
      z-index: 2;
      pointer-events: none;
      
      html.light-theme & {
        background: radial-gradient(circle, rgba(99, 102, 241, 0.04) 0%, transparent 70%);
      }
    }
    .brand-glow-spot-2 {
      position: absolute;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%);
      bottom: -10%;
      right: 10%;
      z-index: 2;
      pointer-events: none;
      
      html.light-theme & {
        background: radial-gradient(circle, rgba(139, 92, 246, 0.02) 0%, transparent 70%);
      }
    }

    /* ─── Header & Hero Typography ─── */
    .brand-header {
      position: absolute;
      top: 64px;
      left: 64px;
      right: 64px;
      bottom: 64px;
      display: flex;
      flex-direction: column;
      gap: 40px;
      z-index: 20;
    }
    
    .logo-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .company-name {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }
    
    .brand-logo {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--accent), var(--accent-hover));
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(124, 137, 255, 0.2);
    }
    .logo-icon {
      color: white;
      font-size: 20px;
      font-weight: 800;
      font-family: 'Inter', sans-serif;
    }
    
    .hero-text-container {
      max-width: 540px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .hero-headline {
      font-size: 52px;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: -0.03em;
      line-height: 1.1;
    }
    .hero-subtext {
      font-size: 16px;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.5;
      font-weight: 400;
    }
    
    .trust-indicators {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-top: auto;
    }
    .trust-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-muted);
    }
    .trust-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* ─── Floating Preview Cards ─── */
    .floating-cards-container {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 10;
      pointer-events: none; /* Let clicks pass through if needed, though mostly visual */
    }

    .preview-card {
      position: absolute;
      width: 210px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.02);
      backdrop-filter: blur(16px);
      transition: all 0.3s;
      
      html.light-theme & {
        background: rgba(255, 255, 255, 0.7);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255,255,255,0.8);
      }
      
      &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.06), transparent);
      }
    }

    .preview-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--accent);
      &.text-emerald { color: var(--success); }
      &.text-indigo { color: #818cf8; }
      &.text-violet { color: #a78bfa; }
    }
    .card-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary);
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .card-value {
      font-size: 22px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 12px 0 6px 0;
      letter-spacing: -0.5px;
      line-height: 1;
    }
    .card-unit {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
    }
    .card-trend {
      font-size: 11px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      font-weight: 500;
    }
    .text-success { color: var(--success); }

    /* Positions for floating cards */
    .card-pos-1 { top: 15%; right: 10%; }
    .card-pos-2 { top: 40%; right: 20%; }
    .card-pos-3 { bottom: 15%; left: 15%; }
    .card-pos-4 { bottom: 20%; right: 10%; }

    /* Sparkline inside Throughput card */
    .micro-bar-chart {
      display: flex;
      align-items: flex-end;
      gap: 3px;
      height: 24px;
      margin-top: 10px;
      
      .bar {
        flex: 1;
        background: linear-gradient(180deg, var(--accent) 0%, rgba(124, 137, 255, 0.1) 100%);
        border-radius: 2px;
        
        html.light-theme & {
          background: linear-gradient(180deg, var(--accent) 0%, rgba(79, 70, 229, 0.1) 100%);
        }
      }
    }

    /* Live status pulsing dot */
    .status-pulse-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      background-color: var(--success);
      border-radius: 50%;
      margin-right: 6px;
      box-shadow: 0 0 8px var(--success);
      animation: pulse-green 2s infinite;
    }

    @keyframes pulse-green {
      0% { opacity: 0.4; }
      50% { opacity: 1; }
      100% { opacity: 0.4; }
    }

    /* ─── Right Auth Area ─── */
    .auth-card-area {
      width: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background: var(--bg-secondary);
      position: relative;
      z-index: 10;
    }

    @media (max-width: 992px) {
      .auth-brand { display: none; }
      .auth-card-area { width: 100%; }
    }
  `],
})
export class AuthLayoutComponent {}
