"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Copy,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Upload,
  DollarSign,
  Clock,
  Shield,
} from "lucide-react";
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from "@/app/lib/types";

interface PaymentPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

const PIX_KEY = "31434686884";
const PIX_NAME = "CASSIA NASCIMENTO OLIVEIRA";
const PIX_BANK = "NEON Pagamentos S.A";

export default function PaymentPage({ onBack, onSuccess }: PaymentPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [showProof, setShowProof] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUploadProof = () => {
    setProofUploaded(true);
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  if (!selectedPlan) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <h2 className="text-xl font-bold text-gray-900">Escolha seu Plano</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(SUBSCRIPTION_PLANS) as SubscriptionPlan[]).map(
            (plan) => (
              <div
                key={plan}
                className={`p-6 rounded-xl border-2 transition-all ${
                  plan === "premium"
                    ? "border-[#22B391] bg-[#E9F7F4]"
                    : plan === "professional"
                      ? "border-purple-300 bg-purple-50"
                      : "border-gray-200 bg-gray-50"
                }`}
              >
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {SUBSCRIPTION_PLANS[plan].name}
                </h3>
                <p className="text-3xl font-black text-gray-900 mb-4">
                  {SUBSCRIPTION_PLANS[plan].price === 0
                    ? "Grátis"
                    : `R$ ${SUBSCRIPTION_PLANS[plan].price.toFixed(2)}`}
                  {SUBSCRIPTION_PLANS[plan].price > 0 && (
                    <span className="text-sm font-normal text-gray-500">
                      /mês
                    </span>
                  )}
                </p>
                <ul className="space-y-2 mb-6">
                  {SUBSCRIPTION_PLANS[plan].features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full py-3 rounded-xl font-bold ${
                    plan === "free"
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-[#22B391] text-white hover:bg-[#1a9580]"
                  }`}
                >
                  {plan === "free" ? "Continuar Grátis" : "Assinar"}
                </button>
              </div>
            ),
          )}
        </div>
      </div>
    );
  }

  if (selectedPlan === "free") {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Plano Gratuito
        </h2>
        <p className="text-gray-600 mb-6">
          Você terá acesso básico ao sistema. Aproveite!
        </p>
        <button
          onClick={onSuccess}
          className="w-full bg-[#22B391] text-white py-3 rounded-xl font-bold"
        >
          Continuar
        </button>
      </div>
    );
  }

  const plan = SUBSCRIPTION_PLANS[selectedPlan];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <button
        onClick={() => setSelectedPlan(null)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Escolher outro plano
      </button>

      {!showProof ? (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pagamento via PIX
            </h2>
            <p className="text-gray-600">扫描 QR Code ou copie a chave PIX</p>
          </div>

          <div className="bg-gradient-to-r from-[#22B391] to-[#0B2B24] p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/70">Valor</span>
              <span className="text-2xl font-black">
                R$ {plan.price.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/70">Plano</span>
              <span className="font-bold">{plan.name}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-6 h-6 text-[#22B391]" />
              <h3 className="font-bold text-gray-900">Chave PIX</h3>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={PIX_KEY}
                readOnly
                className="flex-1 p-3 bg-white border border-gray-200 rounded-lg text-gray-900 font-mono"
              />
              <button
                onClick={handleCopyPix}
                className="p-3 bg-[#22B391] text-white rounded-lg hover:bg-[#1a9580]"
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Nome:</span> {PIX_NAME}
              </p>
              <p>
                <span className="font-medium">Banco:</span> {PIX_BANK}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 bg-blue-50 p-4 rounded-xl">
            <Clock className="w-5 h-5 text-blue-500" />
            <p>
              O pagamento será aprovado automaticamente em poucos minutos após a
              transferência.
            </p>
          </div>

          <button
            onClick={() => setShowProof(true)}
            className="w-full bg-[#22B391] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Já realizei o pagamento
          </button>
        </div>
      ) : (
        <div className="space-y-6 text-center">
          <Upload className="w-16 h-16 text-gray-300 mx-auto" />

          {!proofUploaded ? (
            <>
              <h2 className="text-xl font-bold text-gray-900">
                Envie o comprovante de pagamento
              </h2>
              <p className="text-gray-600">
                Tire uma foto ou screenshot do seu comprovante PIX
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-[#22B391] transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  id="proof-upload"
                />
                <label htmlFor="proof-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    Clique para selecionar o arquivo
                  </p>
                </label>
              </div>

              <button
                onClick={handleUploadProof}
                className="w-full bg-[#22B391] text-white py-3 rounded-xl font-bold"
              >
                Enviar Comprovante
              </button>
            </>
          ) : (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900">
                Comprovante enviado!
              </h2>
              <p className="text-gray-600">
                Seu acesso será liberado em poucos minutos.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
