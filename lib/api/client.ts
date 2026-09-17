export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'USER' | 'ADMIN';
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  venue: string;
  event_date: string;
  eventDate?: string;
  start_time: string;
  startTime?: string;
  end_time: string;
  endTime?: string;
  total_capacity: number;
  capacity?: number;
  price: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  image_url?: string;
  imageUrl?: string;
  bookedSeats?: number;
  availableSeats?: number;
  category?: 'MOVIE' | 'SPORT' | 'CONCERT' | 'TECH' | 'COMEDY' | 'ROADSHOW' | string;
  city?: string;
  genre?: string;
  language?: string;
  duration?: string;
  rating?: string;
  theatre?: string;
  showtimes?: string[];
  format?: string;
  badge?: string;
  teams?: {
    teamA: string;
    teamB: string;
    tournament?: string;
    teamAShort?: string;
    teamBShort?: string;
    teamAColor?: string;
    teamBColor?: string;
  };
}


export interface SeatItem {
  id: string;
  seatNumber: string;
  row: string;
  section: string;
  seatType: 'STANDARD' | 'PREMIUM' | 'VIP';
  status: 'AVAILABLE' | 'BOOKED';
}

export interface BookingItem {
  id: string;
  bookingReference: string;
  eventId: string;
  userId?: string;
  status: 'CONFIRMED' | 'CANCELLED';
  totalSeats: number;
  price: number;
  totalAmount: number;
  seats: string[];
  createdAt: string;
  cancelledAt?: string | null;
  event?: {
    id: string;
    title: string;
    description?: string;
    venue: string;
    eventDate: string;
    startTime: string;
    endTime?: string;
    image_url?: string;
    imageUrl?: string;
  };
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface AdminStats {
  totalEvents: number;
  publishedEvents: number;
  cancelledEvents: number;
  totalBookings: number;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
  bookingRate: string;
}

class ApiClient {
  private getAuthHeader(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...(options.headers || {}),
    };

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    let json: any;
    try {
      json = await res.json();
    } catch {
      // Response body was empty or not valid JSON (e.g. 500 with no body)
      throw Object.assign(new Error(`Server error (${res.status})`), {
        code: 'SERVER_ERROR',
        status: res.status,
      });
    }

    if (!res.ok || !json.success) {
      const errorObj = json.error || { code: 'UNKNOWN_ERROR', message: json.message || 'Request failed' };
      const err = new Error(errorObj.message) as any;
      err.code = errorObj.code;
      err.status = res.status;
      throw err;
    }

    return json;
  }

  // Auth APIs
  async register(data: any) {
    return this.request<{ success: boolean; data: { user: User; token: string } }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: any) {
    return this.request<{ success: boolean; data: { user: User; token: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async loginWithGoogle(data?: { email?: string; fullName?: string }) {
    return this.request<{ success: boolean; data: { user: User; token: string } }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
    return this.request<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
  }

  async getMe() {
    return this.request<{ success: boolean; data: User }>('/api/auth/me');
  }

  // Event APIs
  async getEvents(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    category?: string;
    city?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.city) query.append('city', params.city);

    const url = `/api/events?${query.toString()}`;
    return this.request<{
      success: boolean;
      data: EventItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(url);
  }


  async getEvent(eventId: string) {
    return this.request<{ success: boolean; data: EventItem }>(`/api/events/${eventId}`);
  }

  async getEventSeats(eventId: string) {
    return this.request<{ success: boolean; data: { eventId: string; seats: SeatItem[] } }>(
      `/api/events/${eventId}/seats`
    );
  }

  async createEvent(data: any) {
    return this.request<{ success: boolean; data: EventItem }>('/api/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvent(eventId: string, data: any) {
    return this.request<{ success: boolean; data: EventItem }>(`/api/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async cancelEvent(eventId: string) {
    return this.request<{ success: boolean; data: EventItem }>(`/api/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  // Booking APIs
  async createBooking(eventId: string, seatIds: string[]) {
    return this.request<{ success: boolean; data: { booking: BookingItem } }>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ eventId, seatIds }),
    });
  }

  async getBookings() {
    return this.request<{ success: boolean; data: BookingItem[] }>('/api/bookings');
  }

  async getBooking(bookingId: string) {
    return this.request<{ success: boolean; data: BookingItem }>(`/api/bookings/${bookingId}`);
  }

  async cancelBooking(bookingId: string) {
    return this.request<{ success: boolean; data: { id: string; bookingReference: string; status: string } }>(
      `/api/bookings/${bookingId}/cancel`,
      {
        method: 'PATCH',
      }
    );
  }

  // Admin APIs
  async getAdminDashboard() {
    return this.request<{ success: boolean; data: AdminStats }>('/api/admin/dashboard');
  }

  async getAdminEvents() {
    return this.request<{ success: boolean; data: EventItem[] }>('/api/admin/events');
  }

  async getAdminBookings() {
    return this.request<{ success: boolean; data: BookingItem[] }>('/api/admin/bookings');
  }
}

export const api = new ApiClient();
