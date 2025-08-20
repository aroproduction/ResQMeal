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

// DELETE /api/provider/upload/[publicId] - Delete a photo from Cloudinary
export async function DELETE(request, { params }) {
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

        const { publicId } = params;

        if (!publicId) {
            return NextResponse.json(
                { error: 'Public ID is required' },
                { status: 400 }
            );
        }

        // Delete from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            return NextResponse.json({
                success: true,
                message: 'Photo deleted successfully'
            });
        } else {
            return NextResponse.json(
                { error: 'Failed to delete photo from Cloudinary' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error deleting photo:', error);
        return NextResponse.json(
            { error: 'Failed to delete photo', details: error.message },
            { status: 500 }
        );
    }
}
