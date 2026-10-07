"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { api } from "@/trpc/react";
import { Info, Loader2 } from "lucide-react";
import { useState } from "react";
import Script from "next/script";
import { islandToast } from "@/lib/toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const BillingPage = () => {
  const { data: user, refetch } = api.project.getMyCredits.useQuery();
  const [creditsToBuy, setCreditsToBuy] = useState<number[]>([100]);
  const [loading, setLoading] = useState(false);

  const creditsToBuyAmount = creditsToBuy[0] ?? 100;
  const price = (creditsToBuyAmount * 2).toFixed(2);

  const createOrder = api.project.createCreditOrder.useMutation();
  const verifyOrder = api.project.verifyCreditPayment.useMutation();

  const handleBuyCredits = async () => {
    try {
      setLoading(true);

      const orderData = await createOrder.mutateAsync({
        credits: creditsToBuyAmount,
      });

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Code Indexer",
        description: `Purchase ${creditsToBuyAmount} Indexing Credits`,
        order_id: orderData.orderId,
        theme: {
          color: "#1b63df",
        },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            // Send verification tokens to your backend
            await verifyOrder.mutateAsync({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            // Refresh the user's credits balance on screen
            await refetch();
            islandToast.success(
              `Success! ${creditsToBuyAmount} credits added to your account.`
            );
          } catch (err) {
            console.error("Verification failed:", err);
            islandToast.error(
              "Payment completed, but verification failed. Support has been notified."
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", async function (response: any) {
        console.error("Payment failed reason:", response.error.description);
        islandToast.error(`Payment Failed: ${response.error.description}`);
        setLoading(false);
      });
      razorpayInstance.open();
    } catch (err) {
      console.error(err);
      islandToast.error("Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <h1 className="text-xl">Billing</h1>
      <p className="text-sm text-gray-500">
        You currently have{" "}
        <span className="font-semibold text-grey-900">
          {user?.credits ?? 0}
        </span>{" "}
        credits.
      </p>

      <div className="rounded-md border border-active-primary/30 bg-active-primary/5 p-4 text-active-primary blue-900 shadow-sm">
        <div className="flex items-center gap-2">
          <Info className="size-4" />
          <p className="text-sm font-medium">
            Each credit allows you to index 1 file in a repository.
          </p>
        </div>
        <p className="mt-1 text-xs">
          E.g. If your project has 100 files, you will need 100 credits to index
          it.
        </p>
      </div>

      <div className="pt-2">
        <Slider
          defaultValue={[100]}
          max={1000}
          min={10}
          step={10}
          onValueChange={(value) =>
            setCreditsToBuy(typeof value === "number" ? [value] : [...value])
          }
          value={creditsToBuy}
        />
      </div>

      <Button onClick={handleBuyCredits} disabled={loading} className="w-full">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Buy {creditsToBuyAmount} credits for ₹{price}
      </Button>
    </div>
  );
};

export default BillingPage;