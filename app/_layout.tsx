import { Stack } from "expo-router";
import { AuthProvider } from '../src/context/AuthContext';

export default function AppLayout() {
  return (
    <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="partnerDashboard" />
      <Stack.Screen name="partnerContent" />
    </Stack>
    </AuthProvider>
  );
}
