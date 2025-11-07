import { useState } from "react";
import { Lock, Loader2, Eye, EyeOff, User, Shield } from "lucide-react";

// Logo Component
const Logo = ({ className = "w-12 h-12" }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="10"
      y="25"
      width="80"
      height="60"
      rx="8"
      stroke="currentColor"
      strokeWidth="6"
      fill="none"
    />
    <line
      x1="10"
      y1="45"
      x2="90"
      y2="45"
      stroke="currentColor"
      strokeWidth="6"
    />
    <line
      x1="30"
      y1="25"
      x2="30"
      y2="45"
      stroke="currentColor"
      strokeWidth="6"
    />
    <line
      x1="70"
      y1="25"
      x2="70"
      y2="45"
      stroke="currentColor"
      strokeWidth="6"
    />
    <circle cx="35" cy="65" r="5" fill="currentColor" />
    <circle cx="65" cy="65" r="5" fill="currentColor" />
  </svg>
);

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onLogin(username, password);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Main Card */}
        <div className="p-6 sm:p-8 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl backdrop-blur-sm">
          {/* Logo and Title Section */}
          <div className="text-center mb-8 animate-in fade-in slide-in-from-top-2 duration-700">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg border border-gray-700 hover:scale-105 transition-transform duration-300">
                <Logo className="w-12 h-12 sm:w-14 sm:h-14 text-gray-100" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300 mb-2">
              Orderbook
            </h1>
            <p className="text-sm sm:text-base text-gray-400 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              Secure Sign In
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 sm:p-4 bg-red-950/50 border border-red-900/50 text-red-300 rounded-lg text-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div
              className="animate-in fade-in slide-in-from-left-2 duration-500"
              style={{ animationDelay: "200ms" }}
            >
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoComplete="username"
                className="w-full px-4 py-2.5 sm:py-3 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent text-gray-100 placeholder-gray-500 transition-all duration-200 hover:border-gray-700"
              />
            </div>

            {/* Password Field */}
            <div
              className="animate-in fade-in slide-in-from-left-2 duration-500"
              style={{ animationDelay: "300ms" }}
            >
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 sm:py-3 pr-12 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent text-gray-100 placeholder-gray-500 transition-all duration-200 hover:border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors focus:outline-none p-1 rounded hover:bg-gray-800/50"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-6 py-3 sm:py-3.5 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-white hover:to-gray-100 focus:ring-gray-500 mt-6 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2 duration-500"
              style={{ animationDelay: "400ms" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg
                    className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div
            className="mt-6 text-center text-xs sm:text-sm text-gray-500 animate-in fade-in duration-700"
            style={{ animationDelay: "500ms" }}
          >
            <p>Order Management System</p>
          </div>
        </div>

        {/* Additional Info Card */}
        <div
          className="mt-4 p-4 bg-gray-900/50 border border-gray-800/50 rounded-xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-700"
          style={{ animationDelay: "600ms" }}
        >
          <p className="text-xs sm:text-sm text-gray-400 text-center">
            Manage your orders, customers, and deliveries efficiently
          </p>
        </div>
      </div>
    </div>
  );
}
