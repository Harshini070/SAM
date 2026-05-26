export type RootStackParamList = {
  Splash: undefined;
<<<<<<< HEAD
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  OTPVerification: { flow: 'login' | 'register'; phone?: string };
  FullRegistration: { phone?: string } | undefined;
=======
  Login: undefined;
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
  MainTabs: undefined;
  ChildRegistration: undefined;
  ChildDetail: { childId: string };
  ChildrenList: undefined;
  NRCCenterDetail: { centerId: string };
  NRCCenters: undefined;
  FundManagement: undefined;
  Reports: undefined;
  Notifications: undefined;
  Profile: undefined;
};
