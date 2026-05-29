export type RootStackParamList = {
  Splash: undefined;
  Landing: undefined;
  Login: undefined;

  Register: undefined;

  OTPVerification: {
    flow: 'login' | 'register';
    phone?: string;
    role?: string;
  };

  FullRegistration: {
    phone?: string;
    role?: string;
  } | undefined;

  MainTabs: undefined;

  ChildRegistration: undefined;

  ChildDetail: {
    childId: string;
  };

  ChildrenList: undefined;

  NRCCenterDetail: {
    centerId: string;
  };

  NRCCenters: undefined;

  FundManagement: undefined;

  Reports: undefined;

  Notifications: undefined;

  Profile: undefined;
};