import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { getMongoDatabase } from '@/lib/server/mongodb';

export const runtime = 'nodejs';

const COLLECTION_NAME = 'user_onboarding';

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const database = await getMongoDatabase();

        if (!database) {
            return NextResponse.json(
                { error: 'Database unavailable' },
                { status: 503 }
            );
        }

        const onboarding = await database
            .collection(COLLECTION_NAME)
            .findOne(
                { userId },
                {
                    projection: {
                        _id: 0,
                        userId: 0,
                    },
                }
            );

        return NextResponse.json({
            completed: onboarding?.completed === true,
            onboarding: onboarding ?? null,
        });
    } catch (error) {
        console.error('Onboarding status check failed:', error);

        return NextResponse.json(
            { error: 'Unable to check onboarding status' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();

        const {
            role,
            goal,
            mathLevel,
            codeLevel,
            quizAnswers,
            recommendedLevel,
            recommendedCourseId,
        } = body;

        if (!role || !goal || !mathLevel || !codeLevel) {
            return NextResponse.json(
                { error: 'Please complete all onboarding questions' },
                { status: 400 }
            );
        }

        const database = await getMongoDatabase();

        if (!database) {
            return NextResponse.json(
                { error: 'Database unavailable' },
                { status: 503 }
            );
        }

        const collection = database.collection(COLLECTION_NAME);

        await collection.createIndex(
            { userId: 1 },
            { unique: true }
        );

        const now = new Date();

        await collection.updateOne(
            { userId },
            {
                $set: {
                    userId,
                    role,
                    goal,
                    mathLevel,
                    codeLevel,
                    quizAnswers: quizAnswers ?? {},
                    recommendedLevel,
                    recommendedCourseId,
                    completed: true,
                    completedAt: now,
                    updatedAt: now,
                },
                $setOnInsert: {
                    createdAt: now,
                },
            },
            { upsert: true }
        );

        return NextResponse.json({
            completed: true,
            message: 'Onboarding completed successfully',
        });
    } catch (error) {
        console.error('Onboarding save failed:', error);

        return NextResponse.json(
            { error: 'Unable to save onboarding' },
            { status: 500 }
        );
    }
}