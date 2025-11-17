// src/lib/paystack/api.js
import { verifyPayment } from './verify';

export async function POST(req) {
  const { reference, expectedAmount } = await req.json();
  const result = await verifyPayment(reference, expectedAmount);
  return Response.json(result);
}