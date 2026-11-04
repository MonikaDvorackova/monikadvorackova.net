import { z } from "zod";
import { state, transaction, putState, appendEvent } from "./store";
import { ApiError } from "./http";
import { inquirySchema } from "./service";
export function notificationConfig() {
  if (
    process.env.AGENT_NOTIFICATIONS_ENABLED !== "true" ||
    !process.env.AGENT_NOTIFICATION_APPROVAL_ID
  )
    throw new ApiError(
      503,
      "delivery_disabled",
      "Notifications require explicit operator approval and configuration",
    );
  const key = z.string().min(16).parse(process.env.AGENT_NOTIFICATION_API_KEY);
  const from = z.email().parse(process.env.AGENT_NOTIFICATION_FROM);
  const to = z.email().parse(process.env.AGENT_NOTIFICATION_TO);
  return {
    key,
    from,
    to,
    approvalId: process.env.AGENT_NOTIFICATION_APPROVAL_ID,
  };
}
export async function approveNotification(
  inquiryId: string,
  approvalId: string,
) {
  const inquiry = await state("inquiries", inquiryId);
  if (!inquiry)
    throw new ApiError(404, "not_found", "Inquiry not found or expired");
  inquirySchema.parse(inquiry);
  await transaction(async (client) => {
    const { rows } = await client.query(
      "SELECT value FROM agent_state WHERE namespace=$1 AND key=$2 FOR UPDATE",
      ["notification-queue", inquiryId],
    );
    if (rows[0]?.value.status === "delivered")
      throw new ApiError(
        409,
        "already_delivered",
        "Inquiry notification already delivered",
      );
    await putState(
      client,
      "notification-queue",
      inquiryId,
      { status: "approved", approvalId },
      30,
    );
    await appendEvent(client, {
      type: "notification.approved",
      inquiryId,
      approvalId,
    });
  });
  return { inquiryId, status: "approved_for_disabled_delivery" };
}
export async function deliverNotification(
  inquiryId: string,
  fetcher: typeof fetch = fetch,
) {
  const config = notificationConfig();
  const claimed = await transaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      "notification:" + inquiryId,
    ]);
    const { rows } = await client.query(
      "SELECT value FROM agent_state WHERE namespace=$1 AND key=$2 AND expires_at>now() FOR UPDATE",
      ["notification-queue", inquiryId],
    );
    const value = rows[0]?.value;
    if (
      !value ||
      value.status !== "approved" ||
      value.approvalId !== config.approvalId
    )
      throw new ApiError(
        409,
        "approval_required",
        "Notification requires matching explicit approval",
      );
    await putState(
      client,
      "notification-queue",
      inquiryId,
      { ...value, status: "delivery_in_progress" },
      30,
    );
    return value;
  });
  const inquiry = inquirySchema.parse(await state("inquiries", inquiryId));
  let status = "delivery_unknown";
  let providerId: string | undefined;
  try {
    const response = await fetcher("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + config.key,
        "Content-Type": "application/json",
        "Idempotency-Key": "inquiry-" + inquiryId,
      },
      body: JSON.stringify({
        from: config.from,
        to: [config.to],
        subject: "Professional inquiry: " + inquiry.type,
        text:
          "Name: " +
          inquiry.name +
          "\nContact: " +
          inquiry.email +
          "\nCategory: " +
          inquiry.type +
          "\n\n" +
          inquiry.message,
      }),
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const result = (await response.json()) as { id?: string };
      if (result.id) {
        providerId = result.id;
        status = "delivered";
      }
    } else if (response.status >= 400 && response.status < 500)
      status = "rejected";
  } catch {}
  await transaction(async (client) => {
    await putState(
      client,
      "notification-queue",
      inquiryId,
      { ...claimed, status, providerId },
      30,
    );
    await appendEvent(client, {
      type: "notification." + status,
      inquiryId,
      providerId,
    });
  });
  return { inquiryId, status, providerId };
}
