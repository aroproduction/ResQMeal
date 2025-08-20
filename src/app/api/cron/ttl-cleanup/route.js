import { NextResponse } from 'next/server';
import { checkAndUpdateExpiredListings } from '@/lib/ttl-service.js';

// POST /api/cron/ttl-cleanup - Called by external cron service (e.g., GitHub Actions, Vercel Cron)
export async function POST(request) {
    try {
        // Simple authentication check
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET_TOKEN;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('Running TTL cleanup job...');

        const result = await checkAndUpdateExpiredListings();

        console.log(`TTL cleanup completed: ${result.updatedCount} listings processed`);

        return NextResponse.json({
            success: true,
            message: `TTL cleanup completed successfully`,
            processedCount: result.updatedCount,
            results: result.results,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('TTL cleanup job failed:', error);
        return NextResponse.json(
            {
                error: 'TTL cleanup job failed',
                details: error.message,
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}

// GET /api/cron/ttl-cleanup - Health check
export async function GET() {
    try {
        return NextResponse.json({
            success: true,
            message: 'TTL cleanup service is healthy',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Health check failed' },
            { status: 500 }
        );
    }
}
