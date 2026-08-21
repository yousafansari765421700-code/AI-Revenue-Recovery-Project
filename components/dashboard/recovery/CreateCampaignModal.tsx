"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

interface CampaignFormData {
  name: string;
  description: string;
  status: string;
}

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CampaignFormData) => Promise<void>;
  isLoading: boolean;
}

export default function CreateCampaignModal({ isOpen, onClose, onSubmit, isLoading }: CreateCampaignModalProps) {
  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    description: "",
    status: "draft",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({ name: "", description: "", status: "draft" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Recovery Campaign" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Campaign Name"
          type="text"
          placeholder="e.g., Q4 Payment Recovery"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-dark mb-1.5">Description</label>
          <textarea
            placeholder="Describe the recovery strategy and target audience..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-1.5">Target Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        <div className="p-4 bg-primary-light rounded-xl">
          <h4 className="text-sm font-semibold text-primary mb-2">Recovery Strategies</h4>
          <ul className="text-xs text-primary/80 space-y-1">
            <li>• Friendly Reminder - Email follow-up for pending invoices</li>
            <li>• Payment Retry - Automatic retry of failed transactions</li>
            <li>• Invoice Follow-up - Structured reminder sequence</li>
            <li>• High Value Recovery - Priority handling for large amounts</li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Campaign
          </Button>
        </div>
      </form>
    </Modal>
  );
}
