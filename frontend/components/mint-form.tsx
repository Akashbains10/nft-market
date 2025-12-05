"use client";

import type React from "react";

import { useEffect, useState } from "react";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { StepIndicator } from "./mint-form/step-indicator";
import { NFTDetailsStep } from "./mint-form/nft-details-step";
import { PricingStep } from "./mint-form/pricing-step";
import { ReviewStep } from "./mint-form/review-step";
import type { FormData, Attribute, CurrentStep } from "./mint-form/types";
import useNFTStore from "@/store/useNFTStore";
import { useRouter } from "next/navigation";

export default function MintForm() {
  const router = useRouter();
  const { realEstateSigner, account } = useNFTStore();
  const [currentStep, setCurrentStep] = useState<CurrentStep>("details");
  const [isMinting, setIsMinting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    collection: "",
    mediaUrl: "",
    mediaPreview: "",
    attributes: [],
    priceETH: "",
    royaltyRecipient: account ?? "",
    royaltyPercentage: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDetailsValid = (): boolean => {
    const isValid = formData.name.trim() && formData.description.trim();
    return !!isValid;
  };

  const isPricingValid = () => !!formData.priceETH;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const uploadFileToIPFS = async (
    file: File
  ): Promise<{ hash: string; url: string }> => {
    const endpoint = "/pinning/pinFileToIPFS";
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(endpoint, formData);
    const hash = res.data.IpfsHash;

    return {
      hash,
      url: `${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL}/${hash}`,
    };
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      const file = e.target.files?.[0];
      if (file) {
        const { url: ipfsImageUrl } = await uploadFileToIPFS(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            mediaUrl: ipfsImageUrl,
            mediaPreview: reader.result as string,
          }));
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Media upload failed", error);
      setErrors((prev) => ({ ...prev, media: "Failed to upload media" }));
      toast.error("Failed to upload media");
    } finally {
      setLoading(false);
    }
  };

  const addAttribute = () => {
    const newAttribute: Attribute = {
      id: Date.now().toString(),
      traitType: "",
      value: "",
    };
    setFormData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, newAttribute],
    }));
  };

  const updateAttribute = (
    id: string,
    field: "traitType" | "value",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.map((attr) =>
        attr.id === id ? { ...attr, [field]: value } : attr
      ),
    }));
  };

  const removeAttribute = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((attr) => attr.id !== id),
    }));
  };

  const validateDetails = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "NFT name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.mediaUrl) newErrors.media = "Media upload is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePricing = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.priceETH) {
      newErrors.pricing = "Price is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPricing = () => {
    if (validateDetails()) {
      setCurrentStep("pricing");
    }
  };

  const handleReviewNFT = () => {
    if (validatePricing()) {
      setCurrentStep("review");
    }
  };

  const handleSaveDraft = () => {
    if (formData.name || formData.description || formData.mediaUrl) {
      localStorage.setItem("nftDraft", JSON.stringify(formData));
      toast.success("Draft saved");
    } else {
      toast.error("Please add some information before saving");
    }
  };

  const uploadMetadataToIPFS = async (
    metadata: any
  ): Promise<{ hash: string; url: string }> => {
    const endpoint = "/pinning/pinJSONToIPFS";

    const res = await axios.post(endpoint, {
      pinataMetadata: { name: metadata?.name ?? Date.now() },
      pinataContent: metadata,
    });

    const hash = res.data.IpfsHash;

    return {
      hash,
      url: `${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL}/${hash}`,
    };
  };

  const unpinHash = async (hash: string) => {
    try {
      await axios.delete(`/pinning/unpin/${hash}`);
    } catch (err) {
      console.warn("Failed to unpin hash:", hash, err);
    }
  };

  const afterSuccess = () => {
    toast.success("NFT minted successfully!");
    setFormData({
      name: "",
      description: "",
      collection: "",
      mediaUrl: "",
      attributes: [],
      priceETH: "",
      mediaPreview: "",
      royaltyRecipient: "",
      royaltyPercentage: "",
    });
    setCurrentStep("details");
    router.push("/my-nfts");
  };

  const convertPercentageToBPS = (percentage: string = "0"): string => {
    const percentNum = parseFloat(percentage);
    return Math.round(percentNum * 100)?.toString();
  };

  const handleMintNFT = async () => {
    if (!realEstateSigner) {
      toast.error("RealEstate contract is not initialized");
      return;
    }

    let metadataHash: string | null = null;

    try {
      setIsMinting(true);

      const { mediaPreview, royaltyRecipient, royaltyPercentage, ...metadata } =
        formData;

      // Upload metadata
      const metadataRes = await uploadMetadataToIPFS(metadata);
      metadataHash = metadataRes.hash;

      // Mint NFT
      if (realEstateSigner.mintProperty) {
        const tx = await realEstateSigner.mintProperty(
          metadataRes.url,
          royaltyRecipient,
          convertPercentageToBPS(royaltyPercentage)
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          console.log("Minted! TxHash:", receipt.hash);
          afterSuccess();
        } else {
          throw new Error("Mint transaction reverted");
        }
      }
    } catch (err) {
      toast.error("Failed to mint NFT. Cleaning up...");
      console.log("Error in minting:", err);

      // Cleanup: unpin metadata
      if (metadataHash) {
        await unpinHash(metadataHash);
      }
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="space-y-8">
      <StepIndicator
        currentStep={currentStep}
        isDetailsValid={isDetailsValid()}
        isPricingValid={isPricingValid()}
      />

      {currentStep === "details" && (
        <NFTDetailsStep
          formData={formData}
          errors={errors}
          mediaLoading={loading}
          onInputChange={handleInputChange}
          onMediaUpload={handleMediaUpload}
          onAddAttribute={addAttribute}
          onUpdateAttribute={updateAttribute}
          onRemoveAttribute={removeAttribute}
          onSaveDraft={handleSaveDraft}
          onNext={handleAddPricing}
          isDetailsValid={isDetailsValid()}
        />
      )}

      {currentStep === "pricing" && (
        <PricingStep
          formData={formData}
          errors={errors}
          onInputChange={handleInputChange}
          onBack={() => setCurrentStep("details")}
          onNext={handleReviewNFT}
          isPricingValid={isPricingValid()}
        />
      )}

      {currentStep === "review" && (
        <ReviewStep
          formData={formData}
          isMinting={isMinting}
          onEditDetails={() => setCurrentStep("details")}
          onEditPricing={() => setCurrentStep("pricing")}
          onBack={() => setCurrentStep("pricing")}
          onMint={handleMintNFT}
        />
      )}
    </div>
  );
}
