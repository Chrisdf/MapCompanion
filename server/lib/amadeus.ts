import axios, { AxiosError } from "axios";

interface HotelOffer {
  available: boolean;
  offers: Array<{
    id: string;
    checkInDate: string;
    checkOutDate: string;
    roomType: string;
    price: {
      currency: string;
      total: string;
      variations: {
        average: {
          base: string;
        };
      };
    };
  }>;
}

interface HotelOfferResponse {
  data: HotelOffer[];
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

interface AmadeusErrorResponse {
  errors: Array<{
    code: number;
    title: string;
    detail: string;
    status: number;
  }>;
}

class AmadeusService {
  private apiKey: string;
  private apiSecret: string;
  private accessToken = "";
  private tokenExpiry: Date | null = null;

  constructor() {
    const apiKey = process.env.AMADEUS_API_KEY;
    const apiSecret = process.env.AMADEUS_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error(
        "Amadeus API credentials not found in environment variables"
      );
    }

    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      console.log("Getting Amadeus access token...");
      const response = await axios.post<TokenResponse>(
        "https://api.amadeus.com/v1/security/oauth2/token",
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.apiKey,
          client_secret: this.apiSecret,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log("Successfully got access token");
      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);
      return this.accessToken;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        console.error("Amadeus auth error:", error.response.data);
        throw new Error(
          `Amadeus auth failed: ${
            error.response.data.error_description || error.message
          }`
        );
      }
      console.error("Error getting Amadeus access token:", error);
      throw new Error("Failed to authenticate with Amadeus API");
    }
  }

  async searchHotelOffers(params: {
    hotelIds: string[];
    checkInDate: string;
    checkOutDate: string;
    adults?: number;
    roomQuantity?: number;
  }): Promise<HotelOfferResponse> {
    try {
      console.log("Searching hotel offers for:", params);
      const token = await this.getAccessToken();
      const response = await axios.get<HotelOfferResponse>(
        "https://api.amadeus.com/v3/shopping/hotel-offers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            hotelIds: params.hotelIds.join(","),
            checkInDate: params.checkInDate,
            checkOutDate: params.checkOutDate,
            adults: params.adults || 2,
            roomQuantity: params.roomQuantity || 1,
            currency: "USD",
          },
        }
      );

      console.log("Successfully fetched hotel offers");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const amadeusError = error.response.data as AmadeusErrorResponse;
        console.error("Amadeus API error:", amadeusError);
        throw new Error(
          `Amadeus API error: ${
            amadeusError.errors?.[0]?.detail || error.message
          }`
        );
      }
      console.error("Error searching hotel offers:", error);
      throw new Error("Failed to fetch hotel offers");
    }
  }

  async getHotelById(hotelId: string): Promise<any> {
    try {
      console.log("Getting hotel details for:", hotelId);
      const token = await this.getAccessToken();
      const response = await axios.get(
        `https://api.amadeus.com/v1/reference-data/locations/hotels/${hotelId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Successfully fetched hotel details");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const amadeusError = error.response.data as AmadeusErrorResponse;
        console.error("Amadeus API error:", amadeusError);
        throw new Error(
          `Amadeus API error: ${
            amadeusError.errors?.[0]?.detail || error.message
          }`
        );
      }
      console.error("Error getting hotel details:", error);
      throw new Error("Failed to fetch hotel details");
    }
  }
}

export const amadeus = new AmadeusService();
