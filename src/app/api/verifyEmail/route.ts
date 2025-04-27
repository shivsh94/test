import { NextResponse } from "next/server";
import dns from "dns/promises";

interface DnsErrorWithCode extends Error {
  code?: string;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate email format
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { valid: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Extract the domain from the email
    const domain = email.split("@")[1];

    try {
      // Additional DNS checks
      const [mxRecords, addresses] = await Promise.all([
        dns.resolveMx(domain).catch(() => []), // Catch MX record errors
        dns.resolve(domain).catch(() => [])    // Additional domain resolution
      ]);

      // More comprehensive validation
      if (mxRecords.length > 0 || addresses.length > 0) {
        return NextResponse.json({ 
          valid: true, 
          details: {
            mxRecords: mxRecords.length,
            resolvedAddresses: addresses.length
          }
        });
      } else {
        return NextResponse.json({
          valid: false,
          error: "Unable to resolve domain",
          details: {
            domain: domain,
            mxRecordsFound: mxRecords.length,
            addressesResolved: addresses.length
          }
        });
      }
    } catch (dnsError: unknown) {
      if (dnsError instanceof Error) {
        const errorWithCode = dnsError as DnsErrorWithCode;
        console.error("Comprehensive DNS lookup failed:", {
          domain,
          errorName: dnsError.name,
          errorCode: errorWithCode.code,
          errorMessage: dnsError.message
        });
      } else {
        console.error("Comprehensive DNS lookup failed with unknown error:", {
          domain,
          errorType: 'UNKNOWN_ERROR'
        });
      }

      return NextResponse.json({
        valid: false,
        error: "DNS resolution failed",
        details: {
          domain,
          errorType: dnsError instanceof Error && 'code' in dnsError 
            ? (dnsError as DnsErrorWithCode).code 
            : 'UNKNOWN_DNS_ERROR'
        }
      });
    }
  } catch (error) {
    console.error("Email verification API error:", error);
    return NextResponse.json(
      { valid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Email validation function
function isValidEmail(email: string): boolean {
  // Split email into local and domain parts
  const parts = email.split("@");

  // Check that there's exactly one "@" and both parts are non-empty
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return false;
  }

  // Ensure the domain has at least one dot
  const domainParts = parts[1].split(".");
  if (domainParts.length < 2 || domainParts.some(part => !part)) {
    return false;
  }

  return true;
}