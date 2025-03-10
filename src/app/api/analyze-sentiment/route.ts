import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { reviews, locationName } = await request.json();

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing reviews' },
        { status: 400 }
      );
    }

    const combinedReviews = reviews.join('\n');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert in analyzing customer reviews for local businesses (mainly restaurants). Provide a concise but comprehensive analysis that includes: 1) Overall sentiment direction 2) Key themes or patterns 3) Notable strengths or areas for improvement. Keep the response to 5-7 sentences maximum and focus on actionable insights. make sure the response flows well and can be read as a paragraph."
        },
        {
          role: "user",
          content: `Please analyze these reviews for ${locationName} and provide a detailed summary of the overall sentiment:\n\n${combinedReviews}`
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const analysis = completion.choices[0]?.message?.content || 'No analysis available';

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return NextResponse.json(
      { error: 'Failed to analyze sentiment' },
      { status: 500 }
    );
  }
} 