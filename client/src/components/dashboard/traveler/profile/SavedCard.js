'use client';

import React from "react";
import { CreditCard, Star, Trash2 } from "lucide-react";

export default function SavedCard({ card = {}, onDelete = () => {}, onSetDefault = () => {} }) {
  const brand = card.brand || card.card_type || "Card";
  const last4 = card.last4 || "----";
  const holder = card.card_holder || "—";
  const expiry_month = card.expiry_month
  ? String(card.expiry_month).padStart(2, "0")
  : "—";

  const expiry_year = card.expiry_year
  ? card.expiry_year.toString().slice(-2)
  : "—";


  return (
    <div className="w-full sm:w-1/2 lg:w-2/4 p-2">
      <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl shadow-lg p-5 min-h-[150px] flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-white/10">
              <CreditCard className="w-5 h-5 text-white/90" />
            </div>
            <div>
              <div className="text-xs opacity-90">Payment method</div>
              <div className="text-lg font-semibold">{brand}</div>
            </div>
          </div>

          {card.is_default && (
            <div className="inline-flex items-center gap-2 bg-white/20 px-2 py-1 rounded-md text-xs font-medium">
              <Star className="w-3 h-3" /> Default
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="text-sm tracking-wider text-white/90">•••• {last4}</div>
          <div className="flex justify-between items-center mt-3 text-sm text-white/90">
            <div>
              <div className="text-[11px] opacity-80">Card holder</div>
              <div className="font-medium">{holder}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] opacity-80">Expiry</div>
              <div className="font-medium">{expiry_month}/{expiry_year}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            onClick={() => onSetDefault(card.id)}
            className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer ${
              card.is_default ? "bg-white/20 text-white cursor-default" : "bg-white text-indigo-700 hover:opacity-90"
            }`}
            disabled={card.is_default}
            aria-disabled={card.is_default}
          >
            {card.is_default ? "Default" : "Set default"}
          </button>

          <button
            onClick={() => onDelete(card.id)}
            className="px-3 py-1 rounded-md text-xs font-medium bg-white/10 hover:bg-white/20 text-red-100 flex items-center gap-2 cursor-pointer"
            aria-label={`Delete card ending ${last4}`}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}