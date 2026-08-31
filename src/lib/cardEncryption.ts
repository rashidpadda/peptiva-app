"use client";

import { createMessage, encrypt as pgpEncrypt, readKey } from "openpgp";
import { countryToISO2 } from "./countryCodes";
import type { Address } from "./types";

// PGP-encrypts with the session's *public* key, so this is safe to run in
// the browser - only the checkout backend holds the private key that can
// decrypt it. Ported from deposit-onboarding's src/lib/cardEncryption.ts
// (same backend/endpoint), which itself mirrors the reference
// crypto-widget's src/helpers/encryption.ts. Doing this client-side means
// the payload built here is the exact, final shape sent to the backend -
// nothing gets renamed or reshaped after this point, so what you see in the
// Network tab is what the backend actually receives.
async function encryptCardDetails(
  cardNumber: string,
  cvv: string,
  publicKey: { keyId: string; publicKey: string }
): Promise<{ encryptedContent: string; keyId: string }> {
  const armoredKey = publicKey.publicKey.replaceAll(/\\r/gi, "\r").replaceAll(/\\n/gi, "\n");
  const decodedPublicKey = await readKey({ armoredKey });
  const message = await createMessage({
    text: JSON.stringify({ number: cardNumber.replace(/\s/g, ""), cvv }),
  });
  const ciphertext = await pgpEncrypt({
    message,
    encryptionKeys: decodedPublicKey,
    format: "armored",
  });
  return {
    encryptedContent: btoa(ciphertext as string),
    keyId: publicKey.keyId,
  };
}

// This is deposit-onboarding's exact, confirmed-working submitnewcardform
// shape (captured from two live requests, one a confirmed successful
// purchase) - fields it never sends are not here. assetCode/assetAmount/
// walletAddress/NewWalletAddress/walletId/quantityType are structurally
// required by this endpoint (it's the reference crypto-widget's generic
// "buy an asset with a card" call) but carry no real meaning for a
// peptiva product order - same invisible-backend-plumbing pattern already
// established for deposit-onboarding's own no-crypto-exposure rule. None
// of this reaches the UI. There is deliberately no order-reference field -
// the confirmed payload doesn't have one; peptiva reconciles payment <->
// order on their own side using the paymentReference this call returns,
// handed back via returnUrl (see success-step.tsx / checkout-entry.tsx).
export type CardPaymentPayload = {
  encryptedContent: string;
  keyId: string;
  paymentCardsId: number;
  walletAddress: string;
  tagMemoId: string;
  bTermsAndConditionsAccepted: boolean;
  bSaveCard: boolean;
  userSpecifiedWallet: boolean;
  usingNewCard: boolean;
  addressLine1: string;
  addressLine2: string;
  postCode: string;
  townCity: string;
  stateProvince: string;
  countryISO2: string;
  amount: number;
  expiryDate: string;
  cardholderName: string;
  currencyCode: string;
  assetCode: string;
  assetAmount: number;
  bAcceptedTermsAndConditions: boolean;
  currencyAmount: string;
  expMonth: string;
  expYear: string;
  quantityType: string;
  NewWalletAddress: string;
  walletId: null;
  sessionID: string;
};

const PLACEHOLDER_WALLET_ADDRESS = "0x0000000000000000000000000000000000000000";

export async function buildCardPaymentPayload(params: {
  encryption: { keyId: string; publicKey: string };
  sessionID: string;
  amount: number;
  currency: string;
  cardNumber: string;
  cardExpiry: string; // MM/YY
  cardCvv: string;
  cardholderName: string;
  address: Address;
  acceptedTerms: boolean;
}): Promise<CardPaymentPayload> {
  const [expMonth, expYearShort] = params.cardExpiry.split("/");
  if (!expMonth || !expYearShort) {
    throw new Error("Invalid card expiry date");
  }
  const century = new Date().getFullYear().toString().slice(0, -2);
  const expYear = `${century}${expYearShort}`;

  const { encryptedContent, keyId } = await encryptCardDetails(
    params.cardNumber,
    params.cardCvv,
    params.encryption
  );

  return {
    encryptedContent,
    keyId,
    paymentCardsId: -1000,
    walletAddress: PLACEHOLDER_WALLET_ADDRESS,
    tagMemoId: "",
    bTermsAndConditionsAccepted: params.acceptedTerms,
    bSaveCard: false,
    userSpecifiedWallet: true,
    usingNewCard: true,
    addressLine1: params.address.address1,
    addressLine2: params.address.address2 ?? "",
    postCode: params.address.zip,
    townCity: params.address.city,
    stateProvince: params.address.state,
    countryISO2: countryToISO2(params.address.country) ?? "",
    amount: params.amount,
    expiryDate: params.cardExpiry,
    cardholderName: params.cardholderName,
    currencyCode: params.currency,
    assetCode: "USDT",
    assetAmount: params.amount,
    bAcceptedTermsAndConditions: params.acceptedTerms,
    currencyAmount: String(params.amount),
    expMonth,
    expYear,
    quantityType: "Price",
    NewWalletAddress: PLACEHOLDER_WALLET_ADDRESS,
    walletId: null,
    sessionID: params.sessionID,
  };
}
