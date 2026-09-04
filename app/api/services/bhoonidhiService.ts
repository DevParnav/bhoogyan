export interface BhoonidhiTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export class BhoonidhiService {
  private static accessToken: string | null = null;
  private static refreshToken: string | null = null;
  private static tokenExpiry: number | null = null; // timestamp in ms

  private static getBaseUrl() {
    return process.env.BHOONIDHI_BASE_URL || 'https://bhoonidhi-api.nrsc.gov.in';
  }

  /**
   * Retrieves a valid access token. If the current token is missing or expired,
   * it will attempt to authenticate securely using environment credentials.
   * NEVER exposes credentials or tokens to the frontend.
   */
  public static async getAccessToken(): Promise<string> {
    // Check if we have a valid cached token (with a 60s buffer)
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken;
    }

    // Otherwise, attempt to authenticate
    return await this.authenticate();
  }

  private static async authenticate(): Promise<string> {
    const userId = process.env.BHOONIDHI_USER_ID;
    const password = process.env.BHOONIDHI_PASSWORD;

    if (!userId || !password) {
      throw new Error('Bhoonidhi credentials are not configured in environment variables.');
    }

    try {
      const response = await fetch(`${this.getBaseUrl()}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          password,
          grant_type: 'password'
        }),
      });

      if (!response.ok) {
        throw new Error(`Bhoonidhi authentication failed: ${response.status}`);
      }

      const data: BhoonidhiTokenResponse = await response.json();
      
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      // Convert expires_in (seconds) to a timestamp
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('Bhoonidhi Auth Error: Failed to authenticate.');
      throw new Error('Failed to retrieve satellite data authentication.');
    }
  }
}
