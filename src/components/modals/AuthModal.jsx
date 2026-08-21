import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import "./AuthModal.css";

const AnimatedFormField = ({
  type,
  placeholder,
  value,
  onChange,
  icon,
  showToggle,
  onToggle,
  showPassword,
  disabled,
  minLength
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="aff-group">
      <div
        className="aff-container"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="aff-icon">
          {icon}
        </div>

        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="aff-input"
          placeholder=""
          disabled={disabled}
          required
          minLength={minLength}
        />

        <label className={`aff-label ${isFocused || value ? 'active' : 'inactive'}`}>
          {placeholder}
        </label>

        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="aff-toggle"
            disabled={disabled}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {isHovering && (
          <div
            className="aff-hover-glow"
            style={{
              background: `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1) 0%, transparent 70%)`
            }}
          />
        )}
      </div>
    </div>
  );
};

const SocialButton = ({ icon, name, onClick, disabled }) => {
  return (
    <button
      type="button"
      className="social-btn"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="social-btn-gradient" />
      {icon}
      <span>{name}</span>
    </button>
  );
};

const FloatingParticles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.3;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="auth-flo-canvas"
    />
  );
};

export default function AuthModal({ onClose, onSuccess, defaultIsSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState(""); // Optionally track name from the new design
  const [isSignUp, setIsSignUp] = useState(defaultIsSignUp || false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (e) {
      setErrorMsg(e.message);
      setLoading(false);
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        // Name is captured but Supabase auth only requires email/password by default
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name }
          }
        });
        if (error) throw error;

        supabase.functions.invoke('send-email', {
          body: {
            to: email,
            type: 'REGISTERED',
            payload: {
              student_name: name || 'Student'
            }
          }
        }).catch(err => console.error("Failed to send welcome email", err));

        onSuccess(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess(false);
      }
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrorMsg("");
    setConfirmPassword("");
  };

  return (
    <div className="auth-flo-wrapper" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <FloatingParticles />

      <div className="auth-flo-card">
        <button type="button" className="auth-flo-close" onClick={onClose} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="auth-flo-header">
          <div className="auth-flo-icon-wrap">
            <User />
          </div>
          <h1 className="auth-flo-title">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="auth-flo-subtitle">
            {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
          </p>
        </div>

        <form onSubmit={handleEmail}>
          {isSignUp && (
            <AnimatedFormField
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User size={18} />}
              disabled={loading}
            />
          )}

          <AnimatedFormField
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
            disabled={loading}
          />

          <AnimatedFormField
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
            showToggle
            onToggle={() => setShowPassword(!showPassword)}
            showPassword={showPassword}
            disabled={loading}
            minLength={6}
          />

          {isSignUp && (
            <AnimatedFormField
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock size={18} />}
              disabled={loading}
              minLength={6}
            />
          )}

          {!isSignUp && (
            <div className="auth-flo-actions">
              <label className="auth-flo-checkbox">
                <input type="checkbox" disabled={loading} />
                <span>Remember me</span>
              </label>
              <button type="button" className="auth-flo-forgot">
                Forgot password?
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="auth-flo-error">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-flo-submit"
            style={{ marginTop: errorMsg ? 16 : (isSignUp ? 8 : 0) }}
          >
            <span style={{ opacity: loading ? 0 : 1 }}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </span>

            {loading && (
              <div className="auth-flo-spinner">
                <div className="auth-flo-spinner-ring" />
              </div>
            )}

            <div className="auth-flo-submit-glow" />
          </button>
        </form>

        <div>
          <div className="auth-flo-divider">
            <span>Or continue with</span>
          </div>

          <div className="auth-flo-socials">
            <SocialButton
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              }
              name="Google"
              onClick={handleGoogle}
              disabled={loading}
            />
          </div>
        </div>

        <div className="auth-flo-footer">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={toggleMode}
            disabled={loading}
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
}
