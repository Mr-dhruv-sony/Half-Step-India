import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: string;
      departmentId?: string;
      stateCode?: string;
      districtCode?: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
    departmentId?: string;
    stateCode?: string;
    districtCode?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    departmentId?: string;
    stateCode?: string;
    districtCode?: string;
  }
}
