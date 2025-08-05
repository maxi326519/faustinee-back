export interface UserTS {
  id?: string;
  name: string;
  role: UserRol;
  status: UserStatus;
  email: string;
  password?: string;
}

export enum UserRol {
  ANY = "",
  Admin = "Admin",
  Asistente = "Asistente",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ANY = "",
}
