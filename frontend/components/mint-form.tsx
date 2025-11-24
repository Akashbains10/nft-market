"use client";

import type React from "react";

import { useState } from "react";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { StepIndicator } from "./mint-form/step-indicator";
import { NFTDetailsStep } from "./mint-form/nft-details-step";
import { PricingStep } from "./mint-form/pricing-step";
import { ReviewStep } from "./mint-form/review-step";
import type { FormData, Attribute, CurrentStep } from "./mint-form/types";

export default function MintForm() {
  // const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState<CurrentStep>("details");
  const [isMinting, setIsMinting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    collection: "",
    mediaUrl: "",
    mediaPreview:"",
    attributes: [],
    priceETH: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDetailsValid = () => {
    return (
      formData.name.trim() &&
      formData.description.trim()
    )
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

  const uploadFileToIPFS = async (file: File): Promise<string> => {
    const endpoint = "/pinning/pinFileToIPFS";
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(endpoint,formData);
    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      const file = e.target.files?.[0];
      if (file) {
        const ipfsImageUrl = await uploadFileToIPFS(file);
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
    }finally{
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

  const uploadMetadataToIPFS = async (metadata: FormData): Promise<string> => {
    const endpoint = "/pinning/pinJSONToIPFS";
    const formData = new FormData(); 
    formData.append("pinataMetadata", JSON.stringify(metadata))
    const response = await axios.post(endpoint, metadata);
    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  };

  const handleMintNFT = async () => {
    if (!isPricingValid()) {
      return;
    }

    setIsMinting(true);
    try {
      await uploadMetadataToIPFS(formData);
      toast.success("NFT minted successfully!");
      setFormData({
        name: "",
        description: "",
        collection: "",
        mediaUrl: "",
        attributes: [],
        priceETH: "",
        mediaPreview: ""
      });
      setCurrentStep("details");
    } catch (error) {
      toast.error("Failed to mint NFT. Please try again.");
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
