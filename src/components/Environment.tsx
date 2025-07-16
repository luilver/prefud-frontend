
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Video, Award, Upload, Plus, Leaf, Star } from "lucide-react";
import CarbonSavingsTracker from "./CarbonSavingsTracker";
import { useToast } from "@/hooks/use-toast";

interface UserAction {
  id: string;
  type: 'photo' | 'video' | 'text';
  title: string;
  description: string;
  points: number;
  content: string;
  date: string;
}

const Environment = () => {
  const [userActions, setUserActions] = useState<UserAction[]>([
    {
      id: '1',
      type: 'photo',
      title: 'Composting at Home',
      description: 'Started composting kitchen scraps',
      points: 50,
      content: '/placeholder.svg',
      date: '2024-01-15'
    },
    {
      id: '2',
      type: 'text',
      title: 'Bike to Work',
      description: 'Used bicycle instead of car for 3 days this week',
      points: 30,
      content: 'Decided to bike to work this week to reduce my carbon footprint. Saved approximately 12kg of CO2 emissions!',
      date: '2024-01-12'
    }
  ]);
  
  const [newAction, setNewAction] = useState({
    type: 'text' as 'photo' | 'video' | 'text',
    title: '',
    description: '',
    content: '',
    youtubeUrl: ''
  });
  
  const [totalPoints, setTotalPoints] = useState(280);
  const { toast } = useToast();

  const actionTypes = [
    { value: 'text', label: 'Write Action', icon: <Leaf className="h-4 w-4" /> },
    { value: 'photo', label: 'Upload Photo', icon: <Camera className="h-4 w-4" /> },
    { value: 'video', label: 'YouTube Video', icon: <Video className="h-4 w-4" /> }
  ];

  const handleSubmitAction = () => {
    if (!newAction.title || !newAction.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in title and description",
        variant: "destructive"
      });
      return;
    }

    const points = Math.floor(Math.random() * 50) + 20; // Random points between 20-70
    const action: UserAction = {
      id: Date.now().toString(),
      type: newAction.type,
      title: newAction.title,
      description: newAction.description,
      points: points,
      content: newAction.type === 'video' ? newAction.youtubeUrl : newAction.content,
      date: new Date().toISOString().split('T')[0]
    };

    setUserActions(prev => [action, ...prev]);
    setTotalPoints(prev => prev + points);
    setNewAction({
      type: 'text',
      title: '',
      description: '',
      content: '',
      youtubeUrl: ''
    });

    toast({
      title: "Action Added!",
      description: `You earned ${points} points for your eco-friendly action!`,
    });
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'photo': return <Camera className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <Leaf className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center space-x-2">
          <Leaf className="h-6 w-6 text-green-600" />
          <span>Environment Dashboard</span>
        </h2>
        <p className="text-gray-600">
          Track your carbon impact and share your eco-friendly actions
        </p>
      </div>

      <Tabs defaultValue="tracker" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tracker">Carbon Tracker</TabsTrigger>
          <TabsTrigger value="actions">My Actions</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="mt-6">
          <CarbonSavingsTracker />
        </TabsContent>

        <TabsContent value="actions" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Add New Action */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-green-600" />
                  <span>Add Eco Action</span>
                </CardTitle>
                <CardDescription>
                  Share what you're doing to reduce your carbon footprint
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {actionTypes.map((type) => (
                    <Button
                      key={type.value}
                      variant={newAction.type === type.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewAction(prev => ({ ...prev, type: type.value as any }))}
                      className="flex items-center space-x-1"
                    >
                      {type.icon}
                      <span className="hidden sm:inline">{type.label}</span>
                    </Button>
                  ))}
                </div>

                <Input
                  placeholder="Action title"
                  value={newAction.title}
                  onChange={(e) => setNewAction(prev => ({ ...prev, title: e.target.value }))}
                />

                <Input
                  placeholder="Brief description"
                  value={newAction.description}
                  onChange={(e) => setNewAction(prev => ({ ...prev, description: e.target.value }))}
                />

                {newAction.type === 'text' && (
                  <Textarea
                    placeholder="Describe your eco-friendly action in detail..."
                    value={newAction.content}
                    onChange={(e) => setNewAction(prev => ({ ...prev, content: e.target.value }))}
                    rows={3}
                  />
                )}

                {newAction.type === 'photo' && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload a photo</p>
                    <Input type="file" accept="image/*" className="mt-2" />
                  </div>
                )}

                {newAction.type === 'video' && (
                  <Input
                    placeholder="YouTube video URL"
                    value={newAction.youtubeUrl}
                    onChange={(e) => setNewAction(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                  />
                )}

                <Button onClick={handleSubmitAction} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Action & Earn Points
                </Button>
              </CardContent>
            </Card>

            {/* Recent Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Actions</CardTitle>
                <CardDescription>
                  Your latest eco-friendly activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {userActions.map((action) => (
                    <div key={action.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-green-100 rounded-full">
                        {getActionIcon(action.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{action.title}</h4>
                          <Badge variant="secondary" className="ml-2">
                            <Star className="h-3 w-3 mr-1" />
                            {action.points}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{action.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Points Summary */}
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Your Eco Points</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{totalPoints}</div>
                <p className="text-green-100">Total points earned</p>
                <div className="mt-4 p-3 bg-white/10 rounded-lg">
                  <p className="text-sm">Next reward at 500 points</p>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((totalPoints / 500) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Rewards */}
            <Card>
              <CardHeader>
                <CardTitle>Available Rewards</CardTitle>
                <CardDescription>
                  Redeem your points for eco-friendly rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Plant a Tree</p>
                      <p className="text-sm text-gray-600">Help reforest our planet</p>
                    </div>
                    <Badge variant="outline">100 pts</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Eco Badge</p>
                      <p className="text-sm text-gray-600">Special profile badge</p>
                    </div>
                    <Badge variant="outline">250 pts</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Carbon Offset</p>
                      <p className="text-sm text-gray-600">Offset 10kg CO₂</p>
                    </div>
                    <Badge variant="outline">500 pts</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Environment;
