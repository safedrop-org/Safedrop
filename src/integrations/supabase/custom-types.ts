
export interface IProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  birth_date?: string;
  address?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
  user_type: 'customer' | 'driver' | 'admin';
}

export interface IDriver {
  id: string;
  national_id: string;
  license_number: string;
  license_image?: string;
  vehicle_info: {
    make: string;
    model: string;
    year: string;
    plateNumber: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'frozen';
  rejection_reason?: string;
  rating?: number;
  is_available: boolean;
  location?: any;
  documents?: {
    national_id_image?: string;
  };
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: IProfile;
        Insert: Omit<IProfile, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string };
        Update: Partial<Omit<IProfile, 'id'>>;
      };
      drivers: {
        Row: IDriver;
        Insert: Omit<IDriver, 'rating' | 'is_available' | 'status'> & { 
          rating?: number; 
          is_available?: boolean;
          status?: 'pending' | 'approved' | 'rejected' | 'frozen';
        };
        Update: Partial<Omit<IDriver, 'id'>>;
      };
    };
    Functions: {
      is_blacklisted: {
        Args: {
          email: string;
          phone: string;
          national_id: string;
        };
        Returns: boolean;
      };
    };
  };
}
