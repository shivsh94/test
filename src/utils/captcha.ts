export async function getCaptchaToken(): Promise<string | null> {
  if (typeof window === "undefined" || !window.grecaptcha) {
    console.error("reCAPTCHA not loaded");
    return null;
  }

  return new Promise<string | null>((resolve) => {
    grecaptcha.ready(async () => {
      const siteKey = process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY;

      if (!siteKey) {
        console.error("reCAPTCHA site key not found");
        resolve(null);
        return;
      }

      try {
        const token = await grecaptcha.execute(siteKey, { action: "submit" });
        resolve(token);
      } catch (error) {
        console.error("reCAPTCHA execution failed:", error);
        resolve(null);
      }
    });
  });
}
