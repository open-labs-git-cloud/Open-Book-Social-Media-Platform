import { Link } from 'react-router';
import { Home, User, LogOut, Menu, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, ThemeName, ThemeMode } from '../context/ThemeContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';

export function Navbar() {
  const { user, logout } = useAuth();
  const { themeName, setTheme, mode, setMode, eventTheme, userSelectedTheme } = useTheme();

  const themes: { name: ThemeName; label: string; emoji: string }[] = [
    { name: 'light', label: 'Light Mode', emoji: '☀️' },
    { name: 'dark', label: 'Dark Mode', emoji: '🌙' },
    { name: 'valentine', label: "Valentine's", emoji: '💝' },
    { name: 'christmas', label: 'Christmas', emoji: '🎄' },
    { name: 'easter', label: 'Easter', emoji: '🐰' },
    { name: 'summer', label: 'Summer', emoji: '🏖️' },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
      className="sticky top-0 z-50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1
              style={{ color: 'var(--color-primary)' }}
              className="text-2xl font-bold"
            >
              OpenBook
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/">
              <Button
                variant="ghost"
                size="lg"
                style={{ color: 'var(--color-text)' }}
                className="hover:bg-[var(--color-hover)]"
              >
                <Home className="h-6 w-6" />
              </Button>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            {/* Theme Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  style={{ color: 'var(--color-text)' }}
                  className="hover:bg-[var(--color-hover)]"
                >
                  <Palette className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                {/* Mode toggle: Auto or Manual */}
                <div className="px-2 py-1">
                  <div className="text-xs text-[var(--color-text-secondary)] mb-1">Theme Mode</div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant={mode === 'auto' ? 'default' : 'ghost'}
                      onClick={() => setMode('auto')}
                    >
                      Auto
                    </Button>
                    <Button
                      size="sm"
                      variant={mode === 'manual' ? 'default' : 'ghost'}
                      onClick={() => setMode('manual')}
                    >
                      Manual
                    </Button>
                  </div>
                </div>

                <div className="border-t" style={{ borderColor: 'var(--color-border)' }} />

                {/* If an event theme is active, show it */}
                {eventTheme && mode === 'auto' && (
                  <div className="px-3 py-2 text-sm text-[var(--color-text-secondary)]">Active event theme: <span className="font-semibold">{eventTheme}</span></div>
                )}

                {themes.map((theme) => (
                  <DropdownMenuItem
                    key={theme.name}
                    onClick={() => setTheme(theme.name)}
                    style={{ color: 'var(--color-text)' }}
                    className={`cursor-pointer ${themeName === theme.name ? 'font-semibold' : ''}`}
                  >
                    <span className="mr-2">{theme.emoji}</span>
                    {theme.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                  }}
                  className="rounded-full w-10 h-10"
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <DropdownMenuItem asChild>
                  <Link
                    to={`/profile/${user?.id}`}
                    style={{ color: 'var(--color-text)' }}
                    className="cursor-pointer flex items-center"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to={`/account`}
                    style={{ color: 'var(--color-text)' }}
                    className="cursor-pointer flex items-center"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  style={{ color: 'var(--color-text)' }}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                style={{ color: 'var(--color-text)' }}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
