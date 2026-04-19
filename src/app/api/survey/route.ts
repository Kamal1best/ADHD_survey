import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

type CategoryResultInput = {
  total: number;
  percentage: number;
  severity: string;
};

type ResultPayload = {
  inattentive: CategoryResultInput;
  hyperactive: CategoryResultInput;
  unofficial: CategoryResultInput;
  totalScore: number;
  totalPercentage: number;
  overallSeverity: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sessionId,
      answers,
      completed,
      name,
      age,
      gender,
      result,
    }: {
      sessionId?: string;
      answers?: Array<{
        symptomId: string;
        category: string;
        frequency: string;
        impactAreas: string[];
        duration: string;
      }>;
      completed?: boolean;
      name?: string | null;
      age?: number | null;
      gender?: string | null;
      result?: ResultPayload | null;
    } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const baseData = {
      completed: completed ?? false,
      name: name ?? null,
      age: age ?? null,
      gender: gender ?? null,
      inattentiveScore: result?.inattentive.total ?? null,
      inattentivePercentage: result?.inattentive.percentage ?? null,
      inattentiveSeverity: result?.inattentive.severity ?? null,
      hyperactiveScore: result?.hyperactive.total ?? null,
      hyperactivePercentage: result?.hyperactive.percentage ?? null,
      hyperactiveSeverity: result?.hyperactive.severity ?? null,
      unofficialScore: result?.unofficial.total ?? null,
      unofficialPercentage: result?.unofficial.percentage ?? null,
      unofficialSeverity: result?.unofficial.severity ?? null,
      totalScore: result?.totalScore ?? null,
      totalPercentage: result?.totalPercentage ?? null,
      overallSeverity: result?.overallSeverity ?? null,
    };

    const survey = await db.surveyResponse.upsert({
      where: { sessionId },
      update: baseData,
      create: { sessionId, ...baseData },
    });

    if (answers && Array.isArray(answers)) {
      for (const answer of answers) {
        await db.answer.upsert({
          where: {
            surveyId_symptomId: {
              surveyId: survey.id,
              symptomId: answer.symptomId,
            },
          },
          update: {
            frequency: answer.frequency,
            impactAreas: JSON.stringify(answer.impactAreas),
            duration: answer.duration,
          },
          create: {
            surveyId: survey.id,
            symptomId: answer.symptomId,
            category: answer.category,
            frequency: answer.frequency,
            impactAreas: JSON.stringify(answer.impactAreas),
            duration: answer.duration,
          },
        });
      }
    }

    return NextResponse.json({ success: true, surveyId: survey.id });
  } catch (error) {
    console.error('Survey save error:', error);
    return NextResponse.json({ error: 'Failed to save survey' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const survey = await db.surveyResponse.findUnique({
      where: { sessionId },
      include: { answers: true },
    });

    if (!survey) {
      return NextResponse.json({ exists: false });
    }

    const answers = survey.answers.map(a => ({
      symptomId: a.symptomId,
      category: a.category,
      frequency: a.frequency,
      impactAreas: JSON.parse(a.impactAreas),
      duration: a.duration,
    }));

    return NextResponse.json({
      exists: true,
      completed: survey.completed,
      name: survey.name,
      age: survey.age,
      gender: survey.gender,
      answers,
    });
  } catch (error) {
    console.error('Survey fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch survey' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    await db.surveyResponse.delete({
      where: { sessionId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
