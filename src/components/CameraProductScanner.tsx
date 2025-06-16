
import { useState, useRef, useCallback, useEffect } from "react";
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
  const [cameraError, setCameraError] = useState<string>("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    console.log('Starting camera...');
    setCameraError("");
    
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      console.log('Camera stream obtained:', mediaStream);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.addEventListener('loadedmetadata', () => {
          console.log('Video metadata loaded, dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              console.log('Video playing successfully');
              setIsScanning(true);
            }).catch(err => {
              console.error('Error playing video:', err);
              setCameraError("Error starting video playback");
            });
          }
        });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError(`Camera access failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions and try again.",
        variant: "destructive",
      });
    }
  }, [stream, toast]);

  const stopCamera = useCallback(() => {
    console.log('Stopping camera...');
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      setStream(null);
    }
    setIsScanning(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const captureImage = () => {
    console.log('Capturing image...');
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Canvas context not available');
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || video.clientWidth;
    canvas.height = video.videoHeight || video.clientHeight;
    
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    
    // Draw the current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image captured, data URL length:', imageDataUrl.length);
    
    setCapturedImage(imageDataUrl);
    stopCamera();
    processImage(imageDataUrl);
  };

  const processImage = async (imageDataUrl: string) => {
    setIsProcessing(true);
    console.log('Processing image for product detection...');
    
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
      
      console.log('Product detected:', randomProduct);
      
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
          console.log('Confirming product:', detectedProduct);
          onProductDetected(detectedProduct, blob);
        });
    }
  };

  const retryCapture = () => {
    console.log('Retrying capture...');
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
        {cameraError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{cameraError}</p>
            <Button onClick={startCamera} className="mt-2" size="sm">
              Retry Camera Access
            </Button>
          </div>
        )}

        {!isScanning && !capturedImage && !cameraError && (
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
              muted
              className="w-full h-80 rounded-lg border-2 border-green-300 object-cover bg-black"
            />
            <div className="absolute inset-4 border-2 border-dashed border-white/70 rounded-lg flex items-center justify-center pointer-events-none">
              <div className="bg-black/60 text-white px-4 py-2 rounded-lg text-sm">
                Position product in frame
              </div>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <Button 
                onClick={captureImage} 
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
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
