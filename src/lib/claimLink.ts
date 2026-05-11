import { SignJWT, jwtVerify } from "jose";

export interface ClaimPayload {
  commitment: string;
  note: string;
  amount: number;
  recipient: string;
}

const SECRET_KEY = new TextEncoder().encode(
  import.meta.env.VITE_CLAIM_SECRET || 'veilpay-hackathon-dev-key-change-in-production'
);

export async function generateClaimLink(payload: ClaimPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function parseClaimToken(token: string): Promise<ClaimPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      clockTolerance: 0,
    });
    const result = {
      commitment: payload.commitment as string,
      note: payload.note as string,
      amount: payload.amount as number,
      recipient: payload.recipient as string,
    };
    if (
      typeof result.commitment !== 'string' ||
      typeof result.note !== 'string' ||
      typeof result.amount !== 'number' ||
      typeof result.recipient !== 'string'
    ) {
      console.warn('JWT payload missing required fields');
      return null;
    }
    return result;
  } catch (e) {
    console.warn('Failed to parse claim token:', e);
    return null;
  }
}
