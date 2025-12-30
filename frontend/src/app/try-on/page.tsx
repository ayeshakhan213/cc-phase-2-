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
 * Client Component for Virtual Try-On functionality.
 * 
 * Data Flow:
 * - Fetches lipstick products from backend API via useEffect
 * - Backend endpoint: GET /api/products (filters on frontend for lipsticks)
 * - Falls back to empty list if API unavailable (graceful degradation)
 * - User interactions (image upload, color selection) are client-side only
 * - No Node.js APIs or filesystem writes in this component
 * 
 * Vercel Compatibility:
 * - useEffect runs in browser only (safe for Vercel Edge Functions)
 * - API calls use NEXT_PUBLIC_API_BASE_URL
 */
export default function TryOnPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [modifiedImage, setModifiedImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lipstickProducts, setLipstickProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch lipstick products from backend API on component mount
  useEffect(() => {
    const fetchLipsticks = async () => {
      try {
        const response = await apiGet<Product[]>('/api/products');
        if (response.data) {
          const lipsticks = response.data.filter(p => p.category === 'Lipstick');
          setLipstickProducts(lipsticks);
        } else if (response.error) {
          console.warn('Failed to fetch products:', response.error);
          // Graceful degradation: show empty list, user can still proceed
          setLipstickProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setLipstickProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchLipsticks();
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
      const result = await api.post('/api/tryon/apply', { photoDataUri: uploadedImage, productColorHex: selectedColor.hex });
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'AI Error',
          description: result.error,
        });
      } else if (result.data && result.data.modifiedPhotoDataUri) {
        setModifiedImage(result.data.modifiedPhotoDataUri as string);
      } else {
        toast({
          variant: 'destructive',
          title: 'AI Error',
          description: 'Unexpected response from backend',
        });
      }
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
                ) : lipstickProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No products available. Using local data...</p>
                ) : (
                  lipstickProducts.map(product => (
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
