import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

export const LogoutButton = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });

      // Redirect to home page
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to logout',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleLogout}
      disabled={isLoading}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isLoading ? 'Logging out...' : 'Logout'}
    </Button>
  );
};

export default LogoutButton;
