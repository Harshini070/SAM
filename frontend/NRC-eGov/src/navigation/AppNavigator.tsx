import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from './types';
import { LandingPage } from '../screens/LandingPage';
import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { OTPVerificationScreen } from '../screens/OTPVerificationScreen';
import { FullRegistrationScreen } from '../screens/FullRegistrationScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { MitaninDashboardScreen } from '../screens/mitanin/MitaninDashboardScreen';
import { ParentDashboardScreen } from '../screens/parent/ParentDashboardScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { ChildRegistrationScreen } from '../screens/ChildRegistrationScreen';
import { ChildrenListScreen } from '../screens/ChildrenListScreen';
import { NRCCentersScreen } from '../screens/NRCCentersScreen';
import { FundManagementScreen } from '../screens/FundManagementScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ChildDetailScreen } from '../screens/ChildDetailScreen';
import { NotificationCenterScreen } from '../screens/NotificationCenterScreen';
import { NRCCenterDetailScreen } from '../screens/NRCCenterDetailScreen';
import { OfflineIndicator } from '../components/OfflineIndicator';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Dashboard: 'grid-outline',
  Children: 'people-outline',
  NRCCenters: 'business-outline',
  Funds: 'bar-chart-outline',
  Profile: 'person-circle-outline',
};

const TAB_ACTIVE: Record<string, string> = {
  Dashboard: 'grid',
  Children: 'people',
  NRCCenters: 'business',
  Funds: 'bar-chart',
  Profile: 'person-circle',
};

function MitaninTabs() {
  return (
    <View style={styles.mainTabsContainer}>
      <OfflineIndicator />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIconStyle: { marginTop: 2 },
          tabBarIcon: ({ focused, color }) => {
            const icon = focused ? TAB_ACTIVE[route.name] : TAB_ICONS[route.name];
            return <Ionicons name={icon as any} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={MitaninDashboardScreen} options={{ title: 'Home' }} />
        <Tab.Screen name="Children" component={ChildrenListScreen} options={{ title: 'Children' }} />
        <Tab.Screen name="Notifications" component={NotificationCenterScreen} options={{ title: 'Alerts' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      </Tab.Navigator>
    </View>
  );
}

function ParentTabs() {
  return (
    <View style={styles.mainTabsContainer}>
      <OfflineIndicator />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIconStyle: { marginTop: 2 },
          tabBarIcon: ({ focused, color }) => {
            const icon = focused ? TAB_ACTIVE[route.name] : TAB_ICONS[route.name];
            return <Ionicons name={icon as any} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={ParentDashboardScreen} options={{ title: 'Home' }} />
        <Tab.Screen name="Children" component={ChildrenListScreen} options={{ title: 'Children' }} />
        <Tab.Screen name="Notifications" component={NotificationCenterScreen} options={{ title: 'Alerts' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      </Tab.Navigator>
    </View>
  );
}

function AdminTabs() {
  return (
    <View style={styles.mainTabsContainer}>
      <OfflineIndicator />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIconStyle: { marginTop: 2 },
          tabBarIcon: ({ focused, color }) => {
            const icon = focused ? TAB_ACTIVE[route.name] : TAB_ICONS[route.name];
            return <Ionicons name={icon as any} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={AdminDashboardScreen} options={{ title: 'Home' }} />
        <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
        <Tab.Screen name="Funds" component={FundManagementScreen} options={{ title: 'Funds' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      </Tab.Navigator>
    </View>
  );
}

function RoleBasedTabs() {
  const auth = useContext(AuthContext);
  const role = auth?.user?.role || auth?.user?.role?.toString() || '';

  // Simple mapping - keep scalable: fall back to default Dashboard
  if (role === 'Mitanin' || role === 'Mitanin Worker' || role === 'Mitanin') {
    return <MitaninTabs />;
  }

  if (role === 'Parent') {
    return <ParentTabs />;
  }

  if (role === 'State Admin' || role === 'State Admin' || role === 'Supervisor') {
    return <AdminTabs />;
  }

  // default
  return (
    <View style={styles.mainTabsContainer}>
      <OfflineIndicator />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIconStyle: { marginTop: 2 },
          tabBarIcon: ({ focused, color }) => {
            const icon = focused ? TAB_ACTIVE[route.name] : TAB_ICONS[route.name];
            return <Ionicons name={icon as any} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Home' }} />
        <Tab.Screen name="Children" component={ChildrenListScreen} options={{ title: 'Children' }} />
        <Tab.Screen name="NRCCenters" component={NRCCentersScreen} options={{ title: 'NRC Centers' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      </Tab.Navigator>
    </View>
  );
}

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Landing" component={LandingPage} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        <Stack.Screen name="FullRegistration" component={FullRegistrationScreen} />
        <Stack.Screen name="MainTabs" component={RoleBasedTabs} />
        <Stack.Screen name="ChildRegistration" component={ChildRegistrationScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="ChildDetail" component={ChildDetailScreen} />
        <Stack.Screen name="Notifications" component={NotificationCenterScreen} />
        <Stack.Screen name="NRCCenterDetail" component={NRCCenterDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  mainTabsContainer: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E5EAF2',
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    shadowColor: 'rgba(0,43,91,0.12)',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 10,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: 2,
  },
});
