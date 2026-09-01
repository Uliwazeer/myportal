import crypto from "crypto";

// طريقة "stateless": الكود بيتوقّع (HMAC) بدل ما يتخزن في ذاكرة السيرفر.
// السبب: على Vercel كل طلب ممكن يوصل لـ serverless instance مختلفة، فأي تخزين
// في الذاكرة (زي Map عادي) مش مضمون إنه يفضل موجود لحد ما الطلب اللي بعده يوصل.
// هنا كل المعلومات (الإيميل، الكود، وقت الانتهاء) متشفّرة وموقّعة جوه الـ token
// نفسه، فالتحقق بيحصل في نفس اللحظة من غير ما يحتاج يتذكر حاجة من قبل.
//
// مهم: حط متغير بيئة OTP_SECRET (سلسلة عشوائية طويلة) قبل الإطلاق الفعلي.
// من غيره بيستخدم قيمة افتراضية للتجربة بس، وهي مش آمنة للإنتاج.

const SECRET = process.env.OTP_SECRET || "px-dev-secret-change-me";
const OTP_TTL_MS = 60_000; // دقيقة واحدة بالظبط
const TICKET_TTL_MS = 5 * 60_000; // مهلة كافية لإكمال باقي فورم التسجيل

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

function encode(payload: string): string {
  return Buffer.from(payload, "utf8").toString("base64url");
}

function decode(payload: string): string {
  return Buffer.from(payload, "base64url").toString("utf8");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function packToken(payload: object): string {
  const json = JSON.stringify(payload);
  return `${encode(json)}.${sign(json)}`;
}

function unpackToken<T>(token: string): T | null {
  if (!token || !token.includes(".")) return null;
  const [payloadB64, sig] = token.split(".");
  let json: string;
  try {
    json = decode(payloadB64);
  } catch {
    return null;
  }
  if (sign(json) !== sig) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

type OtpPayload = { e: string; c: string; exp: number };
type TicketPayload = { e: string; exp: number };

/** بينشئ كود تحقق جديد وتوكن موقّع بيحمل بياناته. */
export function createOtp(email: string): { code: string; token: string } {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const token = packToken({
    e: normalizeEmail(email),
    c: code,
    exp: Date.now() + OTP_TTL_MS,
  });
  return { code, token };
}

/** بيتحقق من كود الـ OTP، ولو صح بيرجع "تذكرة" موقّعة تُستخدم في خطوة التسجيل. */
export function verifyOtp(
  token: string,
  email: string,
  code: string
): { ok: boolean; reason?: string; ticket?: string } {
  const data = unpackToken<OtpPayload>(token);

  if (!data) {
    return { ok: false, reason: "لازم تطلب كود التحقق الأول" };
  }
  if (Date.now() > data.exp) {
    return { ok: false, reason: "انتهت صلاحية الكود، اطلب كود جديد" };
  }
  if (data.e !== normalizeEmail(email)) {
    return { ok: false, reason: "البريد الإلكتروني مش مطابق لطلب الكود" };
  }
  if (data.c !== code.trim()) {
    return { ok: false, reason: "الكود غلط" };
  }

  const ticket = packToken({
    e: data.e,
    exp: Date.now() + TICKET_TTL_MS,
  });

  return { ok: true, ticket };
}

/** بيتحقق من إن "تذكرة" التسجيل صالحة ومربوطة بنفس الإيميل. */
export function verifyTicket(ticket: string, email: string): boolean {
  const data = unpackToken<TicketPayload>(ticket);
  if (!data) return false;
  if (Date.now() > data.exp) return false;
  return data.e === normalizeEmail(email);
}
