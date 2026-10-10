import React, { useState, useRef } from 'react';
import { WasteSortingResult } from '../types';
import {
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Info,
  ShieldAlert,
  MapPin,
  FileText,
  HelpCircle,
  X,
} from 'lucide-react';

export const WasteSortingView: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<WasteSortingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample items to quickly test without camera
  const SAMPLE_ITEMS = [
    {
      name: 'PET Water Bottle',
      url: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=500&q=80',
    },
    {
      name: 'Old USB Cable / Charger',
      url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=500&q=80',
    },
    {
      name: 'Fruit Peels / Banana Waste',
      url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=500&q=80',
    },
    {
      name: 'Cardboard Box / Packaging',
      url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=500&q=80',
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setAnalysisResult(null);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = async (url: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      // Fetch sample image and convert to data URL
      const res = await fetch(url);
      const blob = await res.blob();
      setImageMime(blob.type);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setSelectedImage(dataUrl);
        analyzeImage(dataUrl, blob.type);
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      setIsAnalyzing(false);
      setErrorMessage('Could not load sample image. Please upload a photo from your device.');
    }
  };

  const analyzeImage = async (dataUrlToAnalyze?: string, mime?: string) => {
    const dataUrl = dataUrlToAnalyze || selectedImage;
    if (!dataUrl) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ai/sort-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUrl,
          mimeType: mime || imageMime,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${response.status})`);
      }

      const data = await response.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
      } else {
        throw new Error('AI was unable to identify a clear waste item in this photo.');
      }
    } catch (err: any) {
      console.error('Waste analysis error:', err);
      setErrorMessage(err?.message || 'Error communicating with the AI vision classifier. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('recycl')) return 'bg-pastel-sky text-on-pastel-sky border-sky-200';
    if (cat.includes('organic') || cat.includes('compost')) return 'bg-pastel-mint text-on-pastel-mint border-emerald-200';
    if (cat.includes('electronic') || cat.includes('e-waste')) return 'bg-pastel-amber text-on-pastel-amber border-amber-200';
    if (cat.includes('hazard')) return 'bg-pastel-rose text-on-pastel-rose border-rose-300';
    return 'bg-surface-container text-on-surface border-card-border';
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col flex-1">
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-card-border">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pastel-mint text-on-pastel-mint text-xs font-semibold mb-2 border border-emerald-200/50">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini Multimodal Vision · SGU Campus Waste Sorting</span>
        </div>
        <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">
          AI Waste Sorting & Classification
        </h1>
        <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">
          Take a photo or upload an image of any waste material to instantly classify its bin type, receive step-by-step handling instructions, and locate verified collection points across Sanjay Ghodawat University.
        </p>
      </div>

      {/* Safety Notice Warning Banner */}
      <div className="mb-8 p-4 rounded-2xl bg-pastel-amber/40 border border-amber-300/60 flex items-start gap-3 text-xs text-on-surface">
        <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900">Safety & Accuracy Disclaimer</p>
          <p className="mt-0.5 text-on-surface-variant leading-relaxed">
            AI classifications are predictions based on visual analysis and may occasionally be incorrect. For swollen lithium batteries, corrosive lab chemicals, sharp medical needles, or biohazards, do not rely solely on automated suggestions. Always follow verified laboratory protocols and hand them directly to SGU Campus Operations or Chemistry Lab Incharges.
          </p>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Upload / Capture (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-card-border shadow-xs">
            <h3 className="font-headline text-base font-semibold text-primary mb-2">
              Item Photograph
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Upload from your phone or select a camera snapshot for inspection:
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {!selectedImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-card-border hover:border-primary/50 bg-surface-container-low hover:bg-surface-container flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest flex items-center justify-center text-primary mb-3 shadow-xs group-hover:scale-105 transition-transform border border-card-border">
                  <Camera className="w-7 h-7 text-primary" />
                </div>
                <span className="text-sm font-semibold text-primary mb-1">
                  Click to Upload or Snap Photo
                </span>
                <span className="text-xs text-on-surface-variant">
                  Supports JPG, PNG, WEBP from mobile cameras
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-card-border bg-black/5">
                  <img
                    src={selectedImage}
                    alt="Captured waste item"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={handleReset}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 hover:bg-white text-on-surface shadow-xs border border-card-border transition-colors cursor-pointer"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => analyzeImage()}
                    disabled={isAnalyzing}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium text-sm transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analyzing with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{analysisResult ? 'Re-Analyze Item' : 'Identify Waste Category'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface border border-card-border transition-colors cursor-pointer"
                    title="Select different image"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick Demo Samples */}
            <div className="mt-6 pt-5 border-t border-card-border">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-2.5">
                Or Try Sample Campus Items
              </span>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_ITEMS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSample(item.url)}
                    disabled={isAnalyzing}
                    className="text-left p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs text-on-surface border border-card-border transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary/70"></span>
                    <span className="truncate font-medium">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis Result Display (7 cols) */}
        <div className="lg:col-span-7">
          {errorMessage && (
            <div className="p-5 rounded-2xl bg-pastel-rose/80 border border-rose-300 text-xs text-on-pastel-rose mb-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-900">Analysis Notice</p>
                <p className="mt-1">{errorMessage}</p>
                <button
                  onClick={() => analyzeImage()}
                  className="mt-2 font-semibold underline text-rose-800 cursor-pointer"
                >
                  Retry Analysis
                </button>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-surface-container-lowest rounded-2xl p-10 border border-card-border flex flex-col items-center justify-center text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-pastel-mint text-primary flex items-center justify-center mb-4 border border-emerald-200">
                <Sparkles className="w-8 h-8 animate-spin" />
              </div>
              <h3 className="font-headline text-lg font-bold text-primary mb-1">
                Classifying Waste Material...
              </h3>
              <p className="text-xs text-on-surface-variant max-w-sm">
                Evaluating surface texture, packaging contours, polymer markers, and hazard classification for SGU disposal facilities.
              </p>
            </div>
          )}

          {!isAnalyzing && !analysisResult && !errorMessage && (
            <div className="bg-surface-container-lowest rounded-2xl p-10 border border-card-border flex flex-col items-center justify-center text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-low text-secondary flex items-center justify-center mb-4 border border-card-border">
                <FileText className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-headline text-lg font-bold text-primary mb-1">
                Awaiting Waste Image
              </h3>
              <p className="text-xs text-on-surface-variant max-w-md">
                Upload or take a photograph of an item (bottle, food scrap, battery, paper coffee cup, e-waste) to view predicted category, safety steps, and SGU campus collection spots.
              </p>
            </div>
          )}

          {!isAnalyzing && analysisResult && (
            <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-card-border shadow-xs space-y-6">
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-card-border">
                <div>
                  <span className="text-xs text-secondary font-medium uppercase tracking-wider block mb-1">
                    Identified Object
                  </span>
                  <h2 className="font-headline text-2xl font-bold text-primary">
                    {analysisResult.itemIdentification}
                  </h2>
                  <span className="text-xs text-on-surface-variant">
                    Primary Material: <strong className="text-on-surface">{analysisResult.primaryMaterial}</strong>
                  </span>
                </div>

                <div className="flex flex-col sm:items-end">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs border ${getCategoryBadgeColor(
                      analysisResult.category
                    )}`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{analysisResult.category}</span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant mt-1.5">
                    Confidence: <strong>{analysisResult.confidenceScore}% ({analysisResult.confidenceRating})</strong>
                  </span>
                </div>
              </div>

              {/* Step-by-Step Disposal Instructions */}
              <div>
                <h4 className="font-headline text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Recommended Disposal Procedure</span>
                </h4>
                <div className="space-y-2">
                  {analysisResult.disposalInstructions.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-surface-container-low text-xs text-on-surface border border-card-border flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-surface-container-lowest font-bold text-primary flex items-center justify-center flex-shrink-0 text-[11px] border border-card-border">
                        {idx + 1}
                      </span>
                      <p className="mt-0.5 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified SGU Campus Location */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-card-border">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>SGU Campus Collection Guidance</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {analysisResult.campusDisposalLocation}
                </p>
              </div>

              {/* Precautions */}
              {analysisResult.precautions && analysisResult.precautions.length > 0 && (
                <div>
                  <h4 className="font-headline text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Handling Precautions</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {analysisResult.precautions.map((precaution, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-on-surface-variant flex items-start gap-2 bg-pastel-amber/20 p-2.5 rounded-lg border border-amber-200/50"
                      >
                        <span className="text-amber-700 font-bold">•</span>
                        <span>{precaution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Environmental Impact Context */}
              <div className="pt-4 border-t border-card-border text-xs text-on-surface-variant">
                <span className="font-semibold text-primary block mb-1">Environmental Impact:</span>
                <p className="leading-relaxed">{analysisResult.environmentalImpactSummary}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
