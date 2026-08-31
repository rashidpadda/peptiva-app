"use client";

import { HubConnectionBuilder } from "@microsoft/signalr";
import { useEffect, useRef } from "react";
import type { JumioAdditionalData } from "@/lib/checkoutApi";

// Ported from deposit-onboarding's proven working src/lib/signalr.ts - same
// backend, same hub. Confirmed against the live UAT backend that polling
// checkuserinfo does NOT work while a submission is "IdFrameSubmitted": it
// just echoes the same cached status indefinitely - that's exactly what
// caused an infinite checkuserinfo request loop in this app's identity
// step before this was added (see checkuserinfo/route.ts callers). This
// push hub is the only mechanism that actually reports when Jumio finishes
// processing asynchronously.
const HUB_URL = `${process.env.NEXT_PUBLIC_CHECKOUT_API_BASE_URL ?? ""}/nm-hub`;

type VerificationPushData = {
  status?: string;
  verificationStatus?: string;
  additionalData?: JumioAdditionalData;
  jumioVerificationStatusObj?: { status?: string; additionalData?: JumioAdditionalData } | null;
};

type PushEnvelope = {
  pushType?: string;
  data?: VerificationPushData;
};

const VERIFICATION_PUSH_TYPE = "UPDATE_VERIFICATION_COMPONENTS";

// Subscribes to the checkout notification hub and calls onJumioUpdate
// whenever it pushes an updated Jumio status. Connects once `accessToken`
// is available and tears the connection down on unmount / token change.
export function useJumioStatusPush(
  accessToken: string | undefined,
  onJumioUpdate: (status: string, additionalData: JumioAdditionalData) => void
) {
  const onJumioUpdateRef = useRef(onJumioUpdate);
  useEffect(() => {
    onJumioUpdateRef.current = onJumioUpdate;
  }, [onJumioUpdate]);

  useEffect(() => {
    if (!accessToken || !process.env.NEXT_PUBLIC_CHECKOUT_API_BASE_URL) return;

    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => accessToken })
      .withAutomaticReconnect()
      .build();

    const handlePush = (notification: PushEnvelope) => {
      if (notification?.pushType !== VERIFICATION_PUSH_TYPE) return;
      const data = notification.data ?? {};
      const status = data.jumioVerificationStatusObj?.status ?? data.verificationStatus ?? data.status;
      if (!status) return;
      const additionalData = data.jumioVerificationStatusObj?.additionalData ?? data.additionalData ?? null;
      onJumioUpdateRef.current(status, additionalData);
    };

    connection.on("ApplicationDataPush", handlePush);
    connection.on("SessionDataPush", handlePush);

    // React 18 StrictMode double-invokes this effect in dev (mount ->
    // cleanup -> mount again), which stops this connection mid-negotiate
    // before the second mount's connection ever starts - producing a
    // spurious "connection was stopped during negotiation" error that
    // isn't a real failure (the second connection succeeds). Guard against
    // logging that specific case as if it were one.
    let stoppedBeforeStart = false;
    connection.start().catch((err) => {
      if (stoppedBeforeStart) return;
      console.error("SignalR connection failed:", err);
    });

    return () => {
      stoppedBeforeStart = true;
      connection.stop();
    };
  }, [accessToken]);
}
