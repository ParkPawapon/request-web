export type SessionUser = Readonly<{
  branch?: string;
  department?: string;
  email?: string;
  faculty?: string;
  firstName?: string;
  id: string;
  isAdmin?: boolean;
  isStaff?: boolean;
  lastName?: string;
  name?: string;
  phone?: string;
  prefix?: string;
  role?: string;
  roleName?: string;
  roles?: readonly unknown[];
  studentID?: string;
}>;

export type AuthRole = "lecturer" | "staff" | "student";

export type CsrfResponse = Readonly<{
  csrfToken?: string;
}>;

export type MeResponse = Readonly<{
  authenticated?: boolean;
  user?: SessionUser | null;
}>;

export type DevAuthOption = Readonly<{
  email?: string;
  id: string;
  key: string;
  label: string;
  role: AuthRole;
  source?: string;
  subtitle?: string;
}>;

export type DevAuthOptionsResponse = Readonly<{
  enabled?: boolean;
  options?: readonly DevAuthOption[];
}>;

export type DevLoginRequest = Readonly<{
  id: string;
  remember: boolean;
  role: AuthRole;
}>;

export type DevLoginResponse = Readonly<{
  localAuth?: boolean;
  message?: string;
  redirect?: string;
  user?: SessionUser;
}>;
