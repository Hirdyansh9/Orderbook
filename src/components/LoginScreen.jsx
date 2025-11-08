import { useState } from "react";
import { Lock, Loader2, Eye, EyeOff, AlertCircle, UserX, ShieldAlert } from "lucide-react";

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
      // Set user-friendly error message
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Determine error icon and styling based on error message
  const getErrorIcon = () => {
    if (!error) return null;
    if (error.includes("not found") || error.includes("User not found")) {
      return <UserX className="w-5 h-5 flex-shrink-0" />;
    }
    if (error.includes("deactivated") || error.includes("account")) {
      return <ShieldAlert className="w-5 h-5 flex-shrink-0" />;
    }
    return <AlertCircle className="w-5 h-5 flex-shrink-0" />;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="p-8 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-gray-800 rounded-lg">
            <Lock className="w-12 h-12 text-gray-300" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-center text-gray-100 mb-2">
          Orderbook
        </h1>
        <p className="text-center text-gray-400 mb-8">Sign in to continue</p>

        {error && (
          <div className="mb-6 p-4 bg-red-950/50 border border-red-900/50 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <div className="text-red-400 mt-0.5">
                {getErrorIcon()}
              </div>
              <div className="flex-1">
                <p className="text-red-300 text-sm font-medium">
                  {error}
                </p>
                {error.includes("not found") && (
                  <p className="text-red-400/80 text-xs mt-1">
                    Double-check your username and try again.
                  </p>
                )}
                {error.includes("password") && (
                  <p className="text-red-400/80 text-xs mt-1">
                    Make sure Caps Lock is off and try again.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 text-gray-100 placeholder-gray-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
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
                className="w-full px-4 py-2.5 pr-12 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 text-gray-100 placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-900 hover:bg-white focus:ring-gray-500 mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
