/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Upload, X, CheckCircle, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
    onUploadComplete: (resourceUrl: string) => void;
}

interface UploadedImage {
    id: string;
    resourceUrl: string;
    filename: string;
    size: number;
    preview: string;
    status: 'uploading' | 'completed' | 'error';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadComplete }) => {
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            await uploadFile(file);
        }

        event.target.value = '';
    };

    const uploadFile = async (file: File) => {
        const uploadId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const preview = URL.createObjectURL(file);
        
        const newImage: UploadedImage = {
            id: uploadId,
            resourceUrl: '',
            filename: file.name,
            size: file.size,
            preview,
            status: 'uploading'
        };

        setUploadedImages(prev => [...prev, newImage]);
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/uploads', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al subir el archivo');
            }

            const data = await response.json();

            setUploadedImages(prev => prev.map(img => 
                img.id === uploadId 
                    ? { ...img, resourceUrl: data.resourceUrl, status: 'completed' as const }
                    : img
            ));

            onUploadComplete(data.resourceUrl);
            toast.success(`Imagen "${file.name}" subida exitosamente`);

        } catch (error) {
            setUploadedImages(prev => prev.map(img => 
                img.id === uploadId 
                    ? { ...img, status: 'error' as const }
                    : img
            ));

            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            toast.error(`Error subiendo "${file.name}": ${errorMessage}`);
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = (imageId: string) => {
        setUploadedImages(prev => {
            const imageToRemove = prev.find(img => img.id === imageId);
            if (imageToRemove?.preview) {
                URL.revokeObjectURL(imageToRemove.preview);
            }
            return prev.filter(img => img.id !== imageId);
        });
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isUploading}
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="flex items-center gap-2"
                >
                    {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="h-4 w-4" />
                    )}
                    {isUploading ? 'Subiendo...' : 'Subir Imágenes'}
                </Button>
                
                <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />
                
                <span className="text-sm text-muted-foreground">
                    JPG, PNG, WebP (máx. 10MB cada una)
                </span>
            </div>

            {uploadedImages.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Imágenes para el producto:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {uploadedImages.map((image) => (
                            <div
                                key={image.id}
                                className={`relative group border-2 rounded-lg overflow-hidden transition-all ${
                                    image.status === 'completed' 
                                        ? 'border-green-200 bg-green-50' 
                                        : image.status === 'error'
                                        ? 'border-red-200 bg-red-50'
                                        : 'border-yellow-200 bg-yellow-50'
                                }`}
                            >
                                <div className="aspect-square relative">
                                    <img
                                        src={image.preview}
                                        alt={image.filename}
                                        className="w-full h-full object-cover"
                                    />
                                    
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        {image.status === 'uploading' && (
                                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                                        )}
                                        {image.status === 'completed' && (
                                            <CheckCircle className="h-6 w-6 text-green-400" />
                                        )}
                                        {image.status === 'error' && (
                                            <X className="h-6 w-6 text-red-400" />
                                        )}
                                    </div>

                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeImage(image.id)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>

                                <div className="p-2 space-y-1">
                                    <p className="text-xs font-medium truncate" title={image.filename}>
                                        {image.filename}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(image.size)}
                                    </p>
                                    {image.status === 'completed' && (
                                        <p className="text-xs text-green-600 font-medium">
                                            ✅ Listo para usar
                                        </p>
                                    )}
                                    {image.status === 'error' && (
                                        <p className="text-xs text-red-600 font-medium">
                                            ❌ Error en subida
                                        </p>
                                    )}
                                    {image.status === 'uploading' && (
                                        <p className="text-xs text-yellow-600 font-medium">
                                            ⏳ Subiendo...
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {uploadedImages.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                        Haz clic en &quot;Subir Imágenes&quot; para agregar fotos de tu obra
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Las imágenes se optimizarán automáticamente para la web
                    </p>
                </div>
            )}
        </div>
    );
};