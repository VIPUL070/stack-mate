import { processMeeting } from "@/lib/assembly";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const meetingSchema = z.object({
    meetingUrl: z.string(),
    meetingId: z.string(),
})

export const maxDuration = 300;

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { message: 'Unauthorized. Please login first.' },
                { status: 401 }
            )
        }

        const payload = await req.json();
        const resolvedPayload = meetingSchema.safeParse(payload);
        if (!resolvedPayload.success) {
            return NextResponse.json(
                { message: 'Incorrect input payload' },
                { status: 400 }
            )
        }

        const { meetingUrl, meetingId } = resolvedPayload.data;

        const meeting = await db.meeting.findFirst({
            where: {
                id: meetingId,
                project: {
                    deletedAt: null,
                    userToProjects: { some: { userId } },
                },
            },
        });

        if (!meeting) {
            return NextResponse.json(
                { message: "Meeting not found" },
                { status: 404 }
            );
        }

         if (meeting.status === "COMPLETED") {
            return NextResponse.json(
                { message: "Meeting already processed" },
                { status: 409 }
            );
        }

        const {summaries} = await processMeeting(meetingUrl);
        if(!summaries){
            return NextResponse.json(
                {message: "Summaries doesn't exist"},
                {status: 400}
            )
        }

         await db.$transaction([
            db.issue.createMany({
                data: summaries.map((s) => ({
                    start: s.start,
                    end: s.end,
                    gist: s.gist,
                    headline: s.headline,
                    summary: s.summary,
                    meetingId,
                })),
            }),
            db.meeting.update({
                where: { id: meetingId },
                data: {
                    status: "COMPLETED",
                    name: summaries[0]!.headline,
                },
            }),
        ]);

        return NextResponse.json(
            {success: true},
            {status: 201}
        )

    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        )
    }
}