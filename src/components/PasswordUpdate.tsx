
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordUpdate = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation password do not match.",
        variant: "destructive"
      });
      return;
    }

    if (data.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate password update API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });
      
      form.reset();
      setOpen(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-700">
          <Lock className="h-5 w-5" />
          <span>Password Security</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Keep your account secure by updating your password regularly.
          </p>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Change Password</span>
                </DialogTitle>
                <DialogDescription>
                  Enter your current password and choose a new one to update your account security.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showCurrentPassword ? "text" : "password"}
                              placeholder="Enter current password"
                              className="border-orange-200 focus:border-orange-400 pr-12"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Enter new password"
                              className="border-orange-200 focus:border-orange-400 pr-12"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm new password"
                              className="border-orange-200 focus:border-orange-400 pr-12"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-2 pt-4">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordUpdate;
