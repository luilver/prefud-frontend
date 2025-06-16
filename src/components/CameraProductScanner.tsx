
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, X, RotateCcw, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraProductScannerProps {
  onProductDetected: (productName: string, imageBlob: Blob) => void;
  onClose: () => void;
}

const CameraProductScanner = ({ onProductDetected, onClose }: CameraProductScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedProduct, setDetectedProduct] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    stopCamera();
    processImage(imageDataUrl);
  };

  const processImage = async (imageDataUrl: string) => {
    setIsProcessing(true);
    
    try {
      // Simulate AI product detection (replace with actual AI service)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock product detection - in real implementation, use AI vision API
      const mockProducts = [
        "Bananas", "Chicken Breast", "Greek Yogurt", "Milk", "Bread",
        "Tomatoes", "Onions", "Bell Peppers", "Carrots", "Broccoli",
        "Rice", "Pasta", "Eggs", "Cheese", "Apples"
      ];
      
      const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
      setDetectedProduct(randomProduct);
      
      toast({
        title: "Product Detected!",
        description: `We detected: ${randomProduct}`,
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Processing Error",
        description: "Failed to detect product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmProduct = () => {
    if (capturedImage && detectedProduct) {
      // Convert base64 to blob
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          onProductDetected(detectedProduct, blob);
        });
    }
  };

  const retryCapture = () => {
    setCapturedImage(null);
    setDetectedProduct("");
    startCamera();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-sm border-green-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-green-700 flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Product Scanner
            </CardTitle>
            <CardDescription>
              Scan products to automatically detect their names
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isScanning && !capturedImage && (
          <div className="text-center py-8">
            <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">Start your camera to scan products</p>
            <Button 
              onClick={startCamera}
              className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
            >
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
          </div>
        )}

        {isScanning && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg border-2 border-green-300"
              style={{ maxHeight: '400px' }}
            />
            <div className="absolute inset-0 border-2 border-dashed border-white rounded-lg flex items-center justify-center pointer-events-none">
              <div className="bg-black/50 text-white px-4 py-2 rounded-lg">
                Position product in frame
              </div>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <Button onClick={captureImage} size="lg">
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
              <Button variant="outline" onClick={stopCamera}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={capturedImage} 
                alt="Captured product" 
                className="w-full rounded-lg border-2 border-green-300 max-h-64 object-cover"
              />
            </div>

            {isProcessing && (
              <div className="text-center py-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-green-600" />
                <p className="text-gray-600">Detecting product...</p>
              </div>
            )}

            {detectedProduct && !isProcessing && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Product Detected:</h3>
                <p className="text-lg font-medium text-green-700">{detectedProduct}</p>
                <div className="flex space-x-2 mt-4">
                  <Button 
                    onClick={confirmProduct}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Use This Product
                  </Button>
                  <Button variant="outline" onClick={retryCapture}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </CardContent>
    </Card>
  );
};

export default CameraProductScanner;
