import re

with open("src/components/UserProfile.tsx", "r") as f:
    content = f.read()

# 1. Imports
if 'import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";' not in content:
    content = content.replace(
        'import SubscriptionManager from "./SubscriptionManager";',
        'import SubscriptionManager from "./SubscriptionManager";\nimport { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";'
    )

# 2. Interface
interface_str = """
interface ConsumptionData {
  monthName: string;
  year: string;
  carbonConsumed: number;
  caloriesConsumed: number;
}
"""
if 'interface ConsumptionData' not in content:
    content = content.replace(
        'interface TrackingData {',
        interface_str + '\ninterface TrackingData {'
    )

# 3. State
state_str = """  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [consumptionHistory, setConsumptionHistory] = useState<ConsumptionData[]>([]);"""
content = content.replace(
    '  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);',
    state_str
)

# 4. Fetch
fetch_str = """
    const fetchConsumptionData = async () => {
      try {
        if (authUser?.userId) {
          const response = await axios.get(
            `${API_BASE_URL}/user-profile/${authUser.userId}/consumption?months=6`
          );
          
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const formattedData = response.data.map((item: any) => ({
            monthName: monthNames[parseInt(item.month) - 1] || item.month,
            year: item.year,
            carbonConsumed: item.carbonConsumed || 0,
            caloriesConsumed: item.caloriesConsumed || 0
          })).reverse(); // Reverse so it goes oldest to newest
          
          setConsumptionHistory(formattedData);
        }
      } catch (error) {
        console.error("Error fetching consumption history:", error);
      }
    };

    fetchSubscriptionData();
    fetchTrackingData();
    fetchConsumptionData();"""

content = content.replace(
    '    fetchSubscriptionData();\n    fetchTrackingData();',
    fetch_str
)

# 5. Calories chart
calories_chart = """
                <div className="mt-6">
                  <h4 className="text-base font-medium mb-3">{t("profile.calorieTracking.history") || "6-Month Calorie History"}</h4>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={consumptionHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="monthName" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                        <Tooltip 
                          cursor={{ fill: '#f9f9f9' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="caloriesConsumed" name="Calories" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-base font-medium mb-3">{t("profile.calorieTracking.healthGoalsProgress") || "Health Goals Progress"}</h4>"""

content = content.replace(
    '                <div className="mt-6">\n                  <h4 className="text-base font-medium mb-3">{t("profile.calorieTracking.healthGoalsProgress") || "Health Goals Progress"}</h4>',
    calories_chart
)


# 6. Environmental impact chart
impact_chart = """
                <div className="mt-6">
                  <h4 className="text-base font-medium mb-3">{t("profile.environmental.history") || "6-Month Carbon Footprint History"}</h4>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={consumptionHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="monthName" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line type="monotone" dataKey="carbonConsumed" name="Carbon (kg CO₂)" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: '#16a34a', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
            </CardContent>"""

content = content.replace(
    '            </CardContent>\n          </Card>\n        </TabsContent>\n\n        <TabsContent value="subscription">',
    impact_chart + '\n          </Card>\n        </TabsContent>\n\n        <TabsContent value="subscription">'
)

with open("src/components/UserProfile.tsx", "w") as f:
    f.write(content)

print("Updated charts successfully.")
