"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef(null);
  const { user, logout: contextLogout, isLoading } = useAuth() || {};

  // Safely build dashboard URL (guard when user is null)
  const dashboardUrl = (() => {
    if (!user) return "/dashboard";
    const role = user.role || "traveler";
    const slug = (user.full_name || "user").toString().toLowerCase().replace(/\s+/g, "-");
    return role === "admin" ? "/dashboard/admin" : `/dashboard/${role}/${encodeURIComponent(slug)}`;
  })();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = async () => {
    try {
      if (contextLogout) await contextLogout(); // ensure this clears user in context
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsDropdownOpen(false);
      router.push("/");
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Destinations", href: "/destinations" },
    { label: "Activities", href: "/activities" },
    { label: "Accommodations", href: "/accommodations" },
    { label: "Transportation", href: "/transportation" },
    { label: "Contact", href: "/contact" },
    { label: "About", href: "/about" },
    { label: "Itinerary Planner", href: "/itinerary-planner" },
  ];

  // Loading skeleton
  if (isLoading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3"
              >
                <span className="text-white text-lg">🌴</span>
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WanderWise
              </span>
            </Link>
            <div className="animate-pulse h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  const renderAvatar = (u, size = 40, roundedClass = "rounded-full") => {
    const name = (u?.full_name || u?.name || "User").toString();
    const initial = name.charAt(0).toUpperCase();
    const avatarUrl = u?.avatar_url || null;

    // return an element (div or img) with fallback to initials
    return (
      <div
        className={`w-${Math.round(size / 4)} `} /* placeholder to keep tailwind parsing happy if needed */
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={`${name} avatar`}
            onError={(e) => {
              // if image fails, hide it so fallback initials show
              e.currentTarget.onerror = null;
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = parent.querySelector(".avatar-initials");
                if (fallback) fallback.classList.remove("hidden");
              }
            }}
            className={`${roundedClass} w-[${size}px] h-[${size}px] object-cover border-2 border-white dark:border-gray-800`}
            width={size}
            height={size}
            style={{ width: size, height: size }}
          />
        ) : null}

        {/* initials fallback */}
        <div
          className={`avatar-initials ${avatarUrl ? "hidden" : ""} ${roundedClass} flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold`}
          style={{ width: size, height: size }}
          aria-hidden="true"
        >
          {initial}
        </div>
      </div>
    );
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50"
          : "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
      }`}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group cursor-pointer">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <span className="text-white text-lg">🌴</span>
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              WanderWise
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Auth - Desktop */}
            <div className="hidden md:flex items-center gap-3 relative" ref={dropdownRef}>
              {user && user.full_name ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8">
                      {/* Render avatar image or initials */}
                      {user.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatar_url}
                          alt={`${user.full_name} avatar`}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.style.display = "none";
                            const fallback = e.currentTarget.parentElement?.querySelector(".avatar-initials");
                            if (fallback) fallback.classList.remove("hidden");
                          }}
                          className="rounded-full w-8 h-8 object-cover border-2 border-white dark:border-gray-800"
                          width={32}
                          height={32}
                        />
                      ) : null}
                      <div
                        className={`avatar-initials ${user.avatar_url ? "hidden" : ""} rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold w-8 h-8`}
                        aria-hidden="true"
                      >
                        {(user.full_name || "U").charAt(0).toUpperCase()}
                      </div>
                    </div>

                    <span className="font-medium">{user.full_name}</span>
                  </motion.button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-1"
                      >
                        <Link
                          href={dashboardUrl}
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                        >
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        <hr className="my-1 border-gray-200 dark:border-gray-600" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      Login
                    </motion.button>
                  </Link>
                  <Link href="/auth/signup">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 shadow-md transition-all cursor-pointer"
                    >
                      Sign Up
                    </motion.button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMobileMenu}
              className="lg:hidden w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                {user && user.full_name ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2">
                      <div className="w-8 h-8">
                        {user.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.avatar_url}
                            alt={`${user.full_name} avatar`}
                            className="rounded-full w-8 h-8 object-cover border-2 border-white dark:border-gray-800"
                            width={32}
                            height={32}
                          />
                        ) : (
                          <div className="rounded-full w-8 h-8 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                            {(user.full_name || "U").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {user.full_name}
                      </span>
                    </div>
                    <Link
                      href={dashboardUrl}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href={`/dashboard/${user.role || "traveler"}/${(user.full_name || "user").toLowerCase().replace(/\s+/g, "-")}/profile`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left block px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 text-center transition-all cursor-pointer"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;