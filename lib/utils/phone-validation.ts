export interface PhoneValidationResponse {
  phone_number: string;
  phone_format: {
    international: string;
    national: string;
  };
  phone_carrier: {
    name: string;
    line_type: string;
    mcc: string;
    mnc: string;
  };
  phone_location: {
    country_name: string;
    country_code: string;
    country_prefix: string;
    region: string;
    city: string;
    timezone: string;
  };
  phone_validation: {
    is_valid: boolean;
    line_status: string;
    is_voip: boolean;
    minimum_age: number | null;
  };
  phone_risk: {
    risk_level: string;
    is_disposable: boolean;
    is_abuse_detected: boolean;
  };
}

export async function validatePhoneNumber(phoneNumber: string): Promise<PhoneValidationResponse | null> {
  const API_KEY = 'b96fe0996eea4598b63b75415223d8cb';
  const url = `https://phoneintelligence.abstractapi.com/v1/?api_key=${API_KEY}&phone=${encodeURIComponent(phoneNumber)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data as PhoneValidationResponse;
  } catch (error) {
    console.error('Phone validation error:', error);
    return null;
  }
}
