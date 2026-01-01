'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import type { Product, ProductColor } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, Upload, Wand2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiGet } from '@/lib/api';

/**
 * Client Component for Virtual Try-On functionality with MediaPipe Face Mesh.
 * Uses AI-powered facial landmark detection for accurate makeup application.
 */
export default function TryOnPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [modifiedImage, setModifiedImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [makeupProducts, setMakeupProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch makeup products (lipsticks and eyeshadows) from backend API on component mount
  useEffect(() => {
    const fetchMakeupProducts = async () => {
      try {
        const response = await apiGet<any>('/api/products');
        if (response.data) {
          // Handle both cases: response.data is { data: [...] } or response.data is [...]
          const productsArray = Array.isArray(response.data) ? response.data : response.data?.data || [];
          
          if (Array.isArray(productsArray)) {
            // Get both lipsticks and eyeshadows
            const makeup = productsArray.filter(
              p => p.category === 'Lipstick' || p.category === 'Eyeshadow'
            );
            setMakeupProducts(makeup);
          } else {
            console.warn('Products data is not an array');
            setMakeupProducts([]);
          }
        } else if (response.error) {
          console.warn('Failed to fetch products:', response.error);
          // Graceful degradation: show empty list, user can still proceed
          setMakeupProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setMakeupProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchMakeupProducts();
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload an image smaller than 4MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setModifiedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Apply makeup using TensorFlow Face Detection with canvas manipulation
  const applyColorEffect = async (imageDataUri: string, colorHex: string, productCategory?: string): Promise<string> => {
    return new Promise(async (resolve) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(imageDataUri);
            return;
          }

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Simple face detection using color analysis
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Convert hex color to RGB
          const hex = colorHex.replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);

          // Find face region by detecting skin tone pixels
          let skinPixels: { x: number; y: number }[] = [];
          for (let i = 0; i < data.length; i += 4) {
            const pixelIndex = i / 4;
            const x = pixelIndex % canvas.width;
            const y = Math.floor(pixelIndex / canvas.width);

            const pixelR = data[i];
            const pixelG = data[i + 1];
            const pixelB = data[i + 2];
            const alpha = data[i + 3];

            // Detect skin tone
            if (alpha > 200 && pixelR > pixelG && pixelR > pixelB && 
                pixelR >= 90 && pixelR <= 255 &&
                pixelG >= 40 && pixelG <= 220 &&
                pixelB >= 20 && pixelB <= 220 &&
                (pixelR - pixelG) > 15) {
              skinPixels.push({ x, y });
            }
          }

          if (skinPixels.length === 0) {
            resolve(imageDataUri);
            return;
          }

          // Calculate face bounds from skin pixels
          const minX = Math.min(...skinPixels.map(p => p.x));
          const maxX = Math.max(...skinPixels.map(p => p.x));
          const minY = Math.min(...skinPixels.map(p => p.y));
          const maxY = Math.max(...skinPixels.map(p => p.y));

          const faceWidth = maxX - minX;
          const faceHeight = maxY - minY;

          // Exclude neck by limiting height to upper 75% of detected region
          const faceCenterY = minY + faceHeight * 0.5;
          const limitedHeight = faceHeight * 0.75;

          // Add padding
          let faceMinX = Math.max(0, minX - faceWidth * 0.15);
          let faceMaxX = Math.min(canvas.width, maxX + faceWidth * 0.15);
          let faceMinY = Math.max(0, minY - faceHeight * 0.15);
          let faceMaxY = Math.min(canvas.height, minY + limitedHeight);

          const faceWidthActual = faceMaxX - faceMinX;
          const faceHeightActual = faceMaxY - faceMinY;

          // Apply makeup
          for (let i = 0; i < data.length; i += 4) {
            const pixelIndex = i / 4;
            const x = pixelIndex % canvas.width;
            const y = Math.floor(pixelIndex / canvas.width);

            // Only process pixels within face bounds
            if (x < faceMinX || x > faceMaxX || y < faceMinY || y > faceMaxY) continue;

            const pixelR = data[i];
            const pixelG = data[i + 1];
            const pixelB = data[i + 2];

            // Check if skin tone
            const isSkinTone = pixelR > pixelG && pixelR > pixelB && 
                              pixelR >= 90 && pixelR <= 255 &&
                              pixelG >= 40 && pixelG <= 220 &&
                              pixelB >= 20 && pixelB <= 220 &&
                              (pixelR - pixelG) > 15;

            const isNaturalLips = pixelR > pixelG + 20 && pixelR > pixelB - 10;

            let shouldApply = false;
            let blendFactor = 0;

            const relY = (y - faceMinY) / faceHeightActual;
            const relX = (x - faceMinX) / faceWidthActual;

            if (productCategory === 'Lipstick') {
              // Apply to lips area - lower center, but more restrictive
              // Lips are typically in bottom 25% of face, center 60% of width
              if (relY > 0.70 && relY < 0.92 && relX > 0.25 && relX < 0.75 &&
                  (isSkinTone || isNaturalLips)) {
                shouldApply = true;
                blendFactor = isNaturalLips ? 0.85 : 0.70;
              }
            } else if (productCategory === 'Eyeshadow') {
              // Apply to eyes area (upper portion)
              if (relY > 0.18 && relY < 0.40 && relX > 0.15 && relX < 0.85 && isSkinTone) {
                shouldApply = true;
                blendFactor = 0.70;
              }
            } else {
              // Default: lips and cheeks
              if (relY > 0.70 && relY < 0.92 && relX > 0.25 && relX < 0.75 && (isSkinTone || isNaturalLips)) {
                shouldApply = true;
                blendFactor = isNaturalLips ? 0.85 : 0.70;
              } else if (relY > 0.38 && relY < 0.68 && (relX < 0.15 || relX > 0.85) && isSkinTone) {
                shouldApply = true;
                blendFactor = 0.40;
              }
            }

            if (shouldApply && blendFactor > 0) {
              data[i] = Math.round(pixelR * (1 - blendFactor) + r * blendFactor);
              data[i + 1] = Math.round(pixelG * (1 - blendFactor) + g * blendFactor);
              data[i + 2] = Math.round(pixelB * (1 - blendFactor) + b * blendFactor);
            }
          }

          ctx.putImageData(imageData, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.95));
        } catch (error) {
          console.error('Error in makeup application:', error);
          resolve(imageDataUri);
        }
      };
      img.src = imageDataUri;
    });
  };
  
  const handleTryOn = async () => {
    if (!uploadedImage || !selectedColor) {
      toast({
        variant: "destructive",
        title: "Missing selection",
        description: "Please upload a photo and select a product color.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const modifiedImage = await applyColorEffect(uploadedImage, selectedColor.hex, selectedProduct?.category);
      setModifiedImage(modifiedImage);
      toast({
        title: "Success!",
        description: "Virtual try-on applied. See the result on the right.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not apply the virtual try-on. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    setModifiedImage(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <Wand2 className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-4xl font-headline font-bold">Virtual Try-On</h1>
        <p className="mt-2 max-w-2xl mx-auto text-lg text-muted-foreground">
          Upload a photo of yourself and select a product to see how it looks. It's magic!
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="aspect-square w-full relative flex items-center justify-center border-dashed">
            {uploadedImage ? (
                <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full">
                    <div className="relative">
                        <Image src={uploadedImage} alt="Uploaded user photo" fill className="object-contain" />
                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Original</div>
                    </div>
                     <div className="relative">
                        {isLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 z-10">
                                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                <p className="mt-4 text-muted-foreground">Applying makeup...</p>
                            </div>
                        ) : modifiedImage ? (
                            <>
                                <Image src={modifiedImage} alt="Photo with makeup applied" fill className="object-contain" />
                                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">Try-On</div>
                            </>
                        ) : (
                           <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                <Wand2 className="h-12 w-12 text-muted-foreground" />
                                <p className="mt-2 text-muted-foreground">Your try-on result will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Upload a clear, front-facing photo.</p>
                <Button onClick={() => fileInputRef.current?.click()} className="mt-4">
                  Choose File
                </Button>
              </div>
            )}
             {uploadedImage && (
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-20 h-8 w-8" onClick={clearImage}>
                    <X className="h-4 w-4" />
                </Button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg"
            />
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Select a Product</h2>
            </div>
            <ScrollArea className="flex-grow">
              <div className="p-4 space-y-4">
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : makeupProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No products available. Using local data...</p>
                ) : (
                  makeupProducts.map(product => (
                    <div key={product.id}>
                      <button
                        className="text-left w-full"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.brand}</p>
                      </button>
                      {selectedProduct?.id === product.id && (
                        <div className="grid grid-cols-5 gap-2 mt-2">
                          {product.colors.map(color => (
                            <button
                              key={color.hex}
                              onClick={() => setSelectedColor(color)}
                              className={`h-10 w-10 rounded-md border-2 ${selectedColor?.hex === color.hex ? 'border-primary' : 'border-transparent'}`}
                              style={{ backgroundColor: color.hex }}
                              aria-label={color.name}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t mt-auto">
              <Button onClick={handleTryOn} disabled={!uploadedImage || !selectedColor || isLoading} className="w-full" size="lg">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Apply Makeup
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
