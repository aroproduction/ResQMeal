import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (session.user.role !== 'PROVIDER' && session.user.role !== 'CANTEEN_MANAGER') {
            return NextResponse.json(
                { error: 'Forbidden - Provider access required' },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const files = formData.getAll('photos');

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files uploaded' },
                { status: 400 }
            );
        }

        // Limit to 3 photos maximum
        if (files.length > 3) {
            return NextResponse.json(
                { error: 'Maximum 3 photos allowed per listing' },
                { status: 400 }
            );
        }

        const uploadedFiles = [];

        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit for Cloudinary
                return NextResponse.json(
                    { error: 'File size too large. Maximum 10MB per file.' },
                    { status: 400 }
                );
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json(
                    { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
                    { status: 400 }
                );
            }

            try {
                // Convert file to buffer
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                // Upload to Cloudinary
                const uploadResult = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            resource_type: 'image',
                            folder: 'resqmeal/listings', // Organize uploads in folders
                            format: 'webp', // Convert to WebP for better compression
                            quality: 'auto:good', // Automatic quality optimization
                            fetch_format: 'auto', // Automatic format selection
                            transformation: [
                                { width: 800, height: 600, crop: 'limit' }, // Limit max dimensions
                                { quality: 'auto:good' }
                            ]
                        },
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        }
                    ).end(buffer);
                });

                uploadedFiles.push({
                    publicId: uploadResult.public_id,
                    url: uploadResult.secure_url,
                    originalName: file.name,
                    size: uploadResult.bytes,
                    type: file.type,
                    width: uploadResult.width,
                    height: uploadResult.height,
                    format: uploadResult.format
                });

            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                return NextResponse.json(
                    { error: `Failed to upload ${file.name}: ${uploadError.message}` },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({
            success: true,
            message: `${uploadedFiles.length} file(s) uploaded successfully`,
            files: uploadedFiles
        });

    } catch (error) {
        console.error('Error uploading files:', error);
        return NextResponse.json(
            { error: 'Failed to upload files', details: error.message },
            { status: 500 }
        );
    }
}
