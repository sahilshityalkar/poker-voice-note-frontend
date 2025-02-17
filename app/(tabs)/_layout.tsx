import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Audio Recorder',
          tabBarIcon: ({ color }) => <FontAwesome name="microphone" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}