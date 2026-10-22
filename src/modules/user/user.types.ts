export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
}

export interface UpdateProfileDTO {
  name?: string;
  phone?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword?: string;
}
