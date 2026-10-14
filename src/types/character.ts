export interface Character {
  id: string;
  memberId?: string;
  memberName?: string;
  characterName: string;
  characterAlias?: string;
  characterImage?: string;
  role: string;
  age?: number | string;
  gender?: string;
  occupation?: string;
  personality?: string;
  background?: string;
  status: 'active' | 'inactive' | 'deceased' | 'archived';
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
