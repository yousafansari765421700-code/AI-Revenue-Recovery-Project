import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface OrderSuccessPageProps {
  searchParams: { orderNumber?: string };
}

export default function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  return (
    <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
      <CheckCircle className="w-20 h-20 text-success mx-auto" />
      <h1 className="text-4xl font-bold text-dark">Order Confirmed!</h1>
      <p className="text-muted text-lg">
        Thank you for your purchase. Your order has been placed successfully.
      </p>
      {searchParams.orderNumber && (
        <Card padding="lg">
          <p className="text-sm text-muted">Order Number</p>
          <p className="text-xl font-bold text-dark">{searchParams.orderNumber}</p>
        </Card>
      )}
      <div className="flex items-center justify-center gap-4">
        <Link href="/store/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
